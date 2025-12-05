import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/contracts - Get all contracts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')

    const where: any = {}
    if (status) where.status = status
    if (customerId) where.customerId = customerId

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        customer: true,
        salesPic: true,
        operationsPic: true,
        rentals: {
          include: {
            unit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(contracts)
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
  }
}

// POST /api/contracts - Create a new contract
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Generate contract ID
    const year = new Date().getFullYear()
    const count = await prisma.contract.count()
    const contractId = `CTR-BMS-${year}-${String(count + 1).padStart(3, '0')}`

    const contract = await prisma.contract.create({
      data: {
        contractId,
        customerId: body.customerId,
        contractType: body.contractType,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        totalUnits: body.totalUnits,
        unitBreakdown: body.unitBreakdown,
        monthlyValue: body.monthlyValue,
        contractValue: body.contractValue,
        depositAmount: body.depositAmount,
        includesMaintenance: body.includesMaintenance || false,
        maintenanceScope: body.maintenanceScope,
        pricingTier: body.pricingTier || 'Standard',
        areaCoverage: body.areaCoverage || 'Jabodetabek Only',
        status: 'Draft',
        salesPicId: body.salesPicId,
        operationsPicId: body.operationsPicId,
      },
      include: {
        customer: true,
      },
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('Error creating contract:', error)
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 })
  }
}
