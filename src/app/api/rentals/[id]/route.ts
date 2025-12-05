import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rental = await prisma.rental.findUnique({
      where: { id: params.id },
      include: {
        unit: {
          include: {
            alerts: {
              where: { status: 'Open' },
              take: 5,
            },
          },
        },
        contract: {
          include: {
            customer: true,
          },
        },
        customer: true,
        coordinator: true,
      },
    })

    if (!rental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 })
    }

    return NextResponse.json(rental)
  } catch (error) {
    console.error('Error fetching rental:', error)
    return NextResponse.json({ error: 'Failed to fetch rental' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const rental = await prisma.rental.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(rental)
  } catch (error) {
    console.error('Error updating rental:', error)
    return NextResponse.json({ error: 'Failed to update rental' }, { status: 500 })
  }
}
