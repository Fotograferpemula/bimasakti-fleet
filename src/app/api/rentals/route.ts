import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/rentals - Get all rentals
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const contractId = searchParams.get('contractId')

    const where: any = {}
    if (status) where.status = status
    if (contractId) where.contractId = contractId

    const rentals = await prisma.rental.findMany({
      where,
      include: {
        unit: true,
        contract: true,
        customer: true,
        coordinator: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(rentals)
  } catch (error) {
    console.error('Error fetching rentals:', error)
    return NextResponse.json({ error: 'Failed to fetch rentals' }, { status: 500 })
  }
}

// POST /api/rentals - Create a new rental (allocate unit to contract)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Generate rental ID
    const year = new Date().getFullYear()
    const count = await prisma.rental.count()
    const rentalId = `RNT-BMS-${year}-${String(count + 1).padStart(5, '0')}`

    // Get contract details
    const contract = await prisma.contract.findUnique({
      where: { id: body.contractId },
      include: { customer: true },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Create rental
    const rental = await prisma.rental.create({
      data: {
        rentalId,
        contractId: body.contractId,
        unitId: body.unitId,
        customerId: contract.customerId,
        monthlyRate: body.monthlyRate,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        deployedLocation: body.deployedLocation,
        vehiclePlate: body.vehiclePlate,
        vehicleType: body.vehicleType,
        customerPic: body.customerPic,
        status: 'Allocated',
        coordinatorId: body.coordinatorId,
      },
      include: {
        unit: true,
        contract: true,
        customer: true,
      },
    })

    // Update unit status to Allocated
    await prisma.unit.update({
      where: { id: body.unitId },
      data: { 
        status: 'Allocated',
        currentCustomerId: contract.customerId,
      },
    })

    return NextResponse.json(rental, { status: 201 })
  } catch (error) {
    console.error('Error creating rental:', error)
    return NextResponse.json({ error: 'Failed to create rental' }, { status: 500 })
  }
}

// PATCH /api/rentals - Update rental status (for deployment, return, etc.)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status, ...updateData } = body

    const rental = await prisma.rental.update({
      where: { id },
      data: {
        status,
        ...updateData,
      },
      include: {
        unit: true,
      },
    })

    // Update unit status based on rental status
    let unitStatus = rental.unit.status
    if (status === 'Active' || status === 'Deployed') {
      unitStatus = 'Rented'
    } else if (status === 'Returned') {
      unitStatus = 'Available'
    }

    await prisma.unit.update({
      where: { id: rental.unitId },
      data: { 
        status: unitStatus,
        currentCustomerId: status === 'Returned' ? null : rental.customerId,
      },
    })

    return NextResponse.json(rental)
  } catch (error) {
    console.error('Error updating rental:', error)
    return NextResponse.json({ error: 'Failed to update rental' }, { status: 500 })
  }
}
