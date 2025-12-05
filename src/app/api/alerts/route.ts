import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/alerts - Get all alerts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')

    const where: any = {}
    if (status) where.status = status
    if (severity) where.severity = severity

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        unit: {
          include: {
            currentCustomer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

// POST /api/alerts - Create a new alert
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const alert = await prisma.alert.create({
      data: {
        unitId: body.unitId,
        alertType: body.alertType,
        description: body.description,
        severity: body.severity || 'Medium',
        status: 'Open',
      },
      include: {
        unit: true,
      },
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}

// PATCH /api/alerts - Update alert status
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status, resolvedBy } = body

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === 'Resolved' ? new Date() : null,
        resolvedBy: status === 'Resolved' ? resolvedBy : null,
      },
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}
