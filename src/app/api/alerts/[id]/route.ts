import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: params.id },
      include: {
        unit: {
          include: {
            currentCustomer: true,
            assignedCoordinator: true,
            rentals: {
              where: { status: 'Active' },
              include: {
                customer: true,
              },
              take: 1,
            },
          },
        },
      },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json({ error: 'Failed to fetch alert' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const alert = await prisma.alert.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}
