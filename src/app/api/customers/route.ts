import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/customers - Get all customers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const tier = searchParams.get('tier')

    const where: any = {}
    if (status) where.status = status
    if (tier) where.tier = tier

    const customers = await prisma.customer.findMany({
      where,
      include: {
        contracts: {
          where: { status: 'Active' },
        },
        _count: {
          select: { contracts: true, rentals: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Generate customer ID
    const count = await prisma.customer.count()
    const customerId = `CUST-BMS-${String(count + 1).padStart(3, '0')}`

    const customer = await prisma.customer.create({
      data: {
        customerId,
        name: body.name,
        address: body.address,
        city: body.city,
        phone: body.phone,
        email: body.email,
        picName: body.picName,
        picPhone: body.picPhone,
        tier: body.tier || 'Standard',
        status: 'Active',
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
