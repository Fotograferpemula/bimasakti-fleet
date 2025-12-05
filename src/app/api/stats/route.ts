import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/stats - Get dashboard statistics
export async function GET() {
  try {
    // Get unit stats by status
    const unitStats = await prisma.unit.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    // Get unit stats by capacity class
    const capacityStats = await prisma.unit.groupBy({
      by: ['capacityClass'],
      _count: { id: true },
    })

    // Get total units
    const totalUnits = await prisma.unit.count()

    // Get active contracts
    const activeContracts = await prisma.contract.count({
      where: { status: 'Active' },
    })

    // Get expiring contracts (within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    const expiringContracts = await prisma.contract.count({
      where: {
        status: 'Active',
        endDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
    })

    // Get active rentals
    const activeRentals = await prisma.rental.count({
      where: { status: 'Active' },
    })

    // Get open alerts
    const openAlerts = await prisma.alert.count({
      where: { status: 'Open' },
    })

    // Get recent alerts
    const recentAlerts = await prisma.alert.findMany({
      where: { status: 'Open' },
      include: { unit: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Calculate monthly revenue (from active rentals)
    const monthlyRevenue = await prisma.rental.aggregate({
      where: { status: 'Active' },
      _sum: { monthlyRate: true },
    })

    // Get contracts waiting for deposit
    const pendingDeposits = await prisma.contract.count({
      where: { status: 'Waiting Deposit' },
    })

    // Calculate utilization rate
    const rentedUnits = await prisma.unit.count({
      where: { status: 'Rented' },
    })
    const utilizationRate = totalUnits > 0 ? (rentedUnits / totalUnits) * 100 : 0

    return NextResponse.json({
      overview: {
        totalUnits,
        activeContracts,
        expiringContracts,
        activeRentals,
        openAlerts,
        pendingDeposits,
        monthlyRevenue: monthlyRevenue._sum.monthlyRate || 0,
        utilizationRate: Math.round(utilizationRate),
      },
      unitsByStatus: unitStats.reduce((acc: any, item) => {
        acc[item.status] = item._count.id
        return acc
      }, {}),
      unitsByCapacity: capacityStats.reduce((acc: any, item) => {
        acc[item.capacityClass] = item._count.id
        return acc
      }, {}),
      recentAlerts,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
