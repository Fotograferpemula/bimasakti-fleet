import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/units - Get all units with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const capacityClass = searchParams.get('capacityClass')
    const brand = searchParams.get('brand')

    const where: any = {}
    if (status) where.status = status
    if (capacityClass) where.capacityClass = capacityClass
    if (brand) where.brand = brand

    const units = await prisma.unit.findMany({
      where,
      include: {
        currentCustomer: true,
        assignedCoordinator: true,
      },
      orderBy: { unitId: 'asc' },
    })

    return NextResponse.json(units)
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}

// POST /api/units - Create a new unit
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const unit = await prisma.unit.create({
      data: {
        unitId: body.unitId,
        unitCode: body.unitCode,
        brand: body.brand,
        model: body.model,
        serialNumber: body.serialNumber,
        capacityClass: body.capacityClass,
        coolingCapacity: body.coolingCapacity,
        purchaseDate: new Date(body.purchaseDate),
        purchasePrice: body.purchasePrice,
        supplier: body.supplier,
        warrantyEnd: body.warrantyEnd ? new Date(body.warrantyEnd) : null,
        status: body.status || 'Available',
        condition: body.condition || 'Good',
        currentLocation: body.currentLocation,
        gpsDeviceId: body.gpsDeviceId,
        notes: body.notes,
      },
    })

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}
