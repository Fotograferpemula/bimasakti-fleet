import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Check if already seeded
    const existingUsers = await prisma.user.count()
    if (existingUsers > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database already seeded',
        stats: {
          users: existingUsers,
          customers: await prisma.customer.count(),
          units: await prisma.unit.count(),
          contracts: await prisma.contract.count(),
          rentals: await prisma.rental.count(),
          alerts: await prisma.alert.count(),
        }
      })
    }

    console.log('🌱 Seeding database...')

    // Create Users based on document
    const users = await Promise.all([
      prisma.user.upsert({
        where: { code: 'A' },
        update: {},
        create: {
          code: 'A',
          name: 'Edward',
          role: 'CEO/Owner',
          email: 'edward@bimasakti.co.id',
          accessLevel: 'Full Admin',
        },
      }),
      prisma.user.upsert({
        where: { code: 'B' },
        update: {},
        create: {
          code: 'B',
          name: 'Gita',
          role: 'COO',
          email: 'gita@bimasakti.co.id',
          accessLevel: 'Full Admin',
        },
      }),
      prisma.user.upsert({
        where: { code: 'C' },
        update: {},
        create: {
          code: 'C',
          name: 'Ate',
          role: 'Field Coordinator 1',
          email: 'ate@bimasakti.co.id',
          phone: '08123456789',
          accessLevel: 'Edit: UNITS, RENTALS, SERVICE_TICKETS',
        },
      }),
      prisma.user.upsert({
        where: { code: 'D' },
        update: {},
        create: {
          code: 'D',
          name: 'Denny',
          role: 'Field Coordinator 2',
          email: 'denny@bimasakti.co.id',
          phone: '08123456790',
          accessLevel: 'Edit: UNITS, RENTALS, SERVICE_TICKETS',
        },
      }),
      prisma.user.upsert({
        where: { code: 'F' },
        update: {},
        create: {
          code: 'F',
          name: 'Sales Team',
          role: 'Sales BMS',
          email: 'sales@bimasakti.co.id',
          accessLevel: 'Edit: CUSTOMERS, CONTRACTS, QUOTATIONS',
        },
      }),
      prisma.user.upsert({
        where: { code: 'I' },
        update: {},
        create: {
          code: 'I',
          name: 'Pool Manager',
          role: 'Pool & Logistics',
          email: 'pool@bimasakti.co.id',
          accessLevel: 'View: UNITS, RENTALS. Edit: UNIT_MOVEMENTS',
        },
      }),
      prisma.user.upsert({
        where: { code: 'K' },
        update: {},
        create: {
          code: 'K',
          name: 'Senior Technician',
          role: 'Lead Mechanic',
          email: 'technician@bimasakti.co.id',
          accessLevel: 'Edit: SERVICE_TICKETS, INSPECTIONS',
        },
      }),
    ])

    // Create Customers
    const customers = await Promise.all([
      prisma.customer.upsert({
        where: { customerId: 'CUST-BMS-001' },
        update: {},
        create: {
          customerId: 'CUST-BMS-001',
          name: 'PT Indofood Sukses Makmur',
          address: 'Jl. Jenderal Sudirman Kav 76-78',
          city: 'Jakarta',
          phone: '021-5795-8822',
          email: 'procurement@indofood.co.id',
          picName: 'Budi Santoso',
          picPhone: '08123456001',
          tier: 'Premium',
          status: 'Active',
        },
      }),
      prisma.customer.upsert({
        where: { customerId: 'CUST-BMS-002' },
        update: {},
        create: {
          customerId: 'CUST-BMS-002',
          name: 'PT Sumber Alfaria Trijaya',
          address: 'Jl. MH Thamrin No. 9',
          city: 'Tangerang',
          phone: '021-537-0999',
          email: 'logistics@alfamart.co.id',
          picName: 'Ahmad Wijaya',
          picPhone: '08123456002',
          tier: 'Premium',
          status: 'Active',
        },
      }),
      prisma.customer.upsert({
        where: { customerId: 'CUST-BMS-003' },
        update: {},
        create: {
          customerId: 'CUST-BMS-003',
          name: 'PT Charoen Pokphand Indonesia',
          address: 'Jl. Ancol VIII No. 1',
          city: 'Jakarta Utara',
          phone: '021-690-0999',
          email: 'fleet@cp.co.id',
          picName: 'Siti Rahayu',
          picPhone: '08123456003',
          tier: 'Standard',
          status: 'Active',
        },
      }),
    ])

    // Create Units
    const unitData = [
      { unitId: 'BMS-001', unitCode: 'TK-001', brand: 'Thermo King', model: 'V-500 MAX', serialNumber: 'TK2024-V500-00001', capacityClass: 'Medium', coolingCapacity: '-25°C', status: 'Rented' },
      { unitId: 'BMS-002', unitCode: 'TK-002', brand: 'Thermo King', model: 'V-500 MAX', serialNumber: 'TK2024-V500-00002', capacityClass: 'Medium', coolingCapacity: '-25°C', status: 'Rented' },
      { unitId: 'BMS-003', unitCode: 'TK-003', brand: 'Thermo King', model: 'V-300', serialNumber: 'TK2024-V300-00003', capacityClass: 'Small', coolingCapacity: '-20°C', status: 'Available' },
      { unitId: 'BMS-004', unitCode: 'CR-001', brand: 'Carrier', model: 'Supra 750', serialNumber: 'CR2024-S750-00001', capacityClass: 'Large', coolingCapacity: '-30°C', status: 'Rented' },
      { unitId: 'BMS-005', unitCode: 'CR-002', brand: 'Carrier', model: 'Supra 750', serialNumber: 'CR2024-S750-00002', capacityClass: 'Large', coolingCapacity: '-30°C', status: 'Available' },
      { unitId: 'BMS-006', unitCode: 'DN-001', brand: 'Denso', model: 'DCM-400', serialNumber: 'DN2024-DCM-00001', capacityClass: 'Medium', coolingCapacity: '-22°C', status: 'Maintenance' },
      { unitId: 'BMS-007', unitCode: 'TK-004', brand: 'Thermo King', model: 'SLXe-400', serialNumber: 'TK2024-SLX-00001', capacityClass: 'XL', coolingCapacity: '-35°C', status: 'Rented' },
      { unitId: 'BMS-008', unitCode: 'TK-005', brand: 'Thermo King', model: 'V-500 MAX', serialNumber: 'TK2024-V500-00005', capacityClass: 'Medium', coolingCapacity: '-25°C', status: 'Allocated' },
      { unitId: 'BMS-009', unitCode: 'DK-001', brand: 'Daikin', model: 'ZR-500', serialNumber: 'DK2024-ZR5-00001', capacityClass: 'Medium', coolingCapacity: '-25°C', status: 'Available' },
      { unitId: 'BMS-010', unitCode: 'TK-006', brand: 'Thermo King', model: 'V-300', serialNumber: 'TK2024-V300-00006', capacityClass: 'Small', coolingCapacity: '-20°C', status: 'Damaged' },
    ]

    // Price mapping based on capacity class
    const priceByCapacity: Record<string, number> = {
      'Small': 85000000,
      'Medium': 120000000,
      'Large': 180000000,
      'XL': 250000000,
    }

    const units = await Promise.all(
      unitData.map((unit, index) =>
        prisma.unit.upsert({
          where: { unitId: unit.unitId },
          update: {},
          create: {
            ...unit,
            purchasePrice: priceByCapacity[unit.capacityClass] || 100000000,
            supplier: 'PT Traktor Nusantara',
            purchaseDate: new Date('2024-01-15'),
            warrantyEnd: new Date('2026-01-15'),
            condition: unit.status === 'Damaged' ? 'Poor' : 'Good',
            currentLocation: unit.status === 'Rented' ? 'Customer Site' : 'Pool Cibitung',
            gpsDeviceId: `GPS-${unit.unitCode}-001`,
            gpsLatitude: -6.2088 + Math.random() * 0.1,
            gpsLongitude: 106.8456 + Math.random() * 0.1,
            gpsLastUpdate: new Date(),
            runningHours: 1000 + Math.floor(Math.random() * 4000),
            lastServiceDate: new Date('2024-11-01'),
            assignedCoordinatorId: users[index % 2 === 0 ? 2 : 3].id,
          },
        })
      )
    )

    // Create Contracts
    const contracts = await Promise.all([
      prisma.contract.upsert({
        where: { contractId: 'CTR-BMS-2025-001' },
        update: {},
        create: {
          contractId: 'CTR-BMS-2025-001',
          customerId: customers[0].id,
          contractType: '12-Month',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          totalUnits: 3,
          unitBreakdown: '2 Medium, 1 Large',
          monthlyValue: 95000000,
          contractValue: 1140000000,
          depositAmount: 95000000,
          depositReceived: true,
          includesMaintenance: true,
          maintenanceScope: 'Full PM + Emergency',
          slaResponse: 4,
          slaResolution: 24,
          pricingTier: 'Premium',
          areaCoverage: 'Jabodetabek Only',
          status: 'Active',
          salesPicId: users[4].id,
          operationsPicId: users[2].id,
        },
      }),
      prisma.contract.upsert({
        where: { contractId: 'CTR-BMS-2025-002' },
        update: {},
        create: {
          contractId: 'CTR-BMS-2025-002',
          customerId: customers[1].id,
          contractType: '24-Month',
          startDate: new Date('2025-02-01'),
          endDate: new Date('2027-01-31'),
          totalUnits: 1,
          unitBreakdown: '1 XL',
          monthlyValue: 55000000,
          contractValue: 1320000000,
          depositAmount: 55000000,
          depositReceived: true,
          includesMaintenance: true,
          maintenanceScope: 'Full PM',
          pricingTier: 'Premium',
          areaCoverage: 'Jawa',
          status: 'Active',
          salesPicId: users[4].id,
          operationsPicId: users[3].id,
        },
      }),
      prisma.contract.upsert({
        where: { contractId: 'CTR-BMS-2025-003' },
        update: {},
        create: {
          contractId: 'CTR-BMS-2025-003',
          customerId: customers[2].id,
          contractType: '6-Month',
          startDate: new Date('2025-12-01'),
          endDate: new Date('2026-05-31'),
          totalUnits: 1,
          unitBreakdown: '1 Medium',
          monthlyValue: 25000000,
          contractValue: 150000000,
          depositAmount: 25000000,
          depositReceived: false,
          status: 'Waiting Deposit',
          salesPicId: users[4].id,
          operationsPicId: users[2].id,
        },
      }),
    ])

    // Create Rentals
    const rentals = await Promise.all([
      prisma.rental.upsert({
        where: { rentalId: 'RNT-BMS-2025-00001' },
        update: {},
        create: {
          rentalId: 'RNT-BMS-2025-00001',
          contractId: contracts[0].id,
          unitId: units[0].id,
          customerId: customers[0].id,
          monthlyRate: 30000000,
          startDate: new Date('2025-01-05'),
          endDate: new Date('2025-12-31'),
          deployedLocation: 'DC Cibitung, Jl Industri 45',
          vehiclePlate: 'B 1234 CD',
          vehicleType: 'Hino Dutro CDD',
          customerPic: 'Pak Budi - 08123456001',
          status: 'Active',
          bastDeployDate: new Date('2025-01-05'),
          deployCondition: 'Excellent',
          coordinatorId: users[2].id,
        },
      }),
      prisma.rental.upsert({
        where: { rentalId: 'RNT-BMS-2025-00002' },
        update: {},
        create: {
          rentalId: 'RNT-BMS-2025-00002',
          contractId: contracts[0].id,
          unitId: units[1].id,
          customerId: customers[0].id,
          monthlyRate: 30000000,
          startDate: new Date('2025-01-05'),
          endDate: new Date('2025-12-31'),
          deployedLocation: 'DC Cikarang, Jl Raya 12',
          vehiclePlate: 'B 5678 EF',
          vehicleType: 'Hino Dutro CDD',
          customerPic: 'Pak Budi - 08123456001',
          status: 'Active',
          bastDeployDate: new Date('2025-01-05'),
          deployCondition: 'Excellent',
          coordinatorId: users[2].id,
        },
      }),
      prisma.rental.upsert({
        where: { rentalId: 'RNT-BMS-2025-00003' },
        update: {},
        create: {
          rentalId: 'RNT-BMS-2025-00003',
          contractId: contracts[0].id,
          unitId: units[3].id,
          customerId: customers[0].id,
          monthlyRate: 35000000,
          startDate: new Date('2025-01-07'),
          endDate: new Date('2025-12-31'),
          deployedLocation: 'DC Bekasi, Jl Industri 78',
          vehiclePlate: 'B 9012 GH',
          vehicleType: 'Hino Ranger Fuso',
          customerPic: 'Pak Budi - 08123456001',
          status: 'Active',
          bastDeployDate: new Date('2025-01-07'),
          deployCondition: 'Good',
          coordinatorId: users[2].id,
        },
      }),
      prisma.rental.upsert({
        where: { rentalId: 'RNT-BMS-2025-00004' },
        update: {},
        create: {
          rentalId: 'RNT-BMS-2025-00004',
          contractId: contracts[1].id,
          unitId: units[6].id,
          customerId: customers[1].id,
          monthlyRate: 55000000,
          startDate: new Date('2025-02-01'),
          endDate: new Date('2027-01-31'),
          deployedLocation: 'DC Alfamart Tangerang',
          vehiclePlate: 'B 2468 IJ',
          vehicleType: 'Hino Tronton',
          customerPic: 'Ahmad Wijaya - 08123456002',
          status: 'Active',
          bastDeployDate: new Date('2025-02-01'),
          deployCondition: 'Excellent',
          coordinatorId: users[3].id,
        },
      }),
    ])

    // Create some Alerts
    const alerts = await Promise.all([
      prisma.alert.create({
        data: {
          unitId: units[0].id,
          alertType: 'Geofence Breach',
          description: 'Unit BMS-001 detected in Semarang, outside Jabodetabek area',
          severity: 'High',
          status: 'Open',
        },
      }),
      prisma.alert.create({
        data: {
          unitId: units[5].id,
          alertType: 'Maintenance Due',
          description: 'Unit BMS-006 running hours exceeded 500 since last service',
          severity: 'Medium',
          status: 'Acknowledged',
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      stats: {
        users: users.length,
        customers: customers.length,
        units: units.length,
        contracts: contracts.length,
        rentals: rentals.length,
        alerts: alerts.length,
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const stats = {
      users: await prisma.user.count(),
      customers: await prisma.customer.count(),
      units: await prisma.unit.count(),
      contracts: await prisma.contract.count(),
      rentals: await prisma.rental.count(),
      alerts: await prisma.alert.count(),
    }
    
    return NextResponse.json({
      success: true,
      message: stats.users > 0 ? 'Database has data' : 'Database is empty - call POST to seed',
      stats
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
