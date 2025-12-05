import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        salesPic: true,
        operationsPic: true,
        rentals: {
          include: {
            unit: true,
            coordinator: true,
          },
          orderBy: { startDate: 'desc' },
        },
        invoices: {
          orderBy: { dueDate: 'desc' },
        },
      },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error fetching contract:', error)
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const contract = await prisma.contract.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error updating contract:', error)
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 })
  }
}
