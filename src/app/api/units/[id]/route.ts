import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/units/[id] - Get a single unit by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const unit = await prisma.unit.findUnique({
      where: { id: params.id },
      include: {
        currentCustomer: true,
        assignedCoordinator: true,
        rentals: {
          include: {
            contract: true,
            customer: true,
          },
          orderBy: { startDate: 'desc' },
          take: 5,
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        serviceTickets: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error fetching unit:', error)
    return NextResponse.json({ error: 'Failed to fetch unit' }, { status: 500 })
  }
}

// PUT /api/units/[id] - Update a unit
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const unit = await prisma.unit.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error updating unit:', error)
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 })
  }
}
