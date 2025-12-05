'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Gauge, Calendar, Thermometer, User, AlertTriangle, Wrench, FileText, Edit, Truck } from 'lucide-react'

interface Unit {
  id: string
  unitId: string
  unitCode: string
  brand: string
  model: string
  serialNumber: string
  capacityClass: string
  coolingCapacity: string
  purchaseDate: string
  purchasePrice: number
  supplier: string | null
  warrantyEnd: string | null
  status: string
  condition: string
  currentLocation: string | null
  gpsDeviceId: string | null
  gpsLatitude: number | null
  gpsLongitude: number | null
  gpsLastUpdate: string | null
  runningHours: number
  lastServiceDate: string | null
  nextServiceDue: string | null
  totalRentals: number
  totalRevenue: number
  notes: string | null
  currentCustomer: { id: string; name: string; customerId: string } | null
  assignedCoordinator: { id: string; name: string; role: string; phone: string | null } | null
  rentals: Array<{
    id: string
    rentalId: string
    status: string
    startDate: string
    endDate: string
    customer: { name: string }
    contract: { contractId: string }
  }>
  alerts: Array<{
    id: string
    alertType: string
    description: string
    severity: string
    status: string
    createdAt: string
  }>
  serviceTickets: Array<{
    id: string
    ticketId: string
    ticketType: string
    description: string
    status: string
    createdAt: string
  }>
}

const statusColors: Record<string, string> = {
  Rented: 'bg-green-100 text-green-800',
  Available: 'bg-blue-100 text-blue-800',
  Allocated: 'bg-yellow-100 text-yellow-800',
  Maintenance: 'bg-orange-100 text-orange-800',
  Damaged: 'bg-red-100 text-red-800',
  Retired: 'bg-gray-100 text-gray-800',
}

const conditionColors: Record<string, string> = {
  Excellent: 'bg-green-100 text-green-800',
  Good: 'bg-blue-100 text-blue-800',
  Fair: 'bg-yellow-100 text-yellow-800',
  Poor: 'bg-red-100 text-red-800',
}

const severityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800',
}

export default function UnitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchUnit()
    }
  }, [params.id])

  const fetchUnit = async () => {
    try {
      const res = await fetch(`/api/units/${params.id}`)
      if (!res.ok) throw new Error('Unit not found')
      const data = await res.json()
      setUnit(data)
    } catch (error) {
      console.error('Error fetching unit:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!unit) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Unit not found</p>
          <Link href="/units" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Units
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{unit.unitCode}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[unit.status]}`}>
              {unit.status}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${conditionColors[unit.condition]}`}>
              {unit.condition}
            </span>
          </div>
          <p className="text-gray-500 mt-1">{unit.unitId} • {unit.brand} {unit.model}</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Edit className="w-4 h-4" />
          Edit Unit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specifications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="font-medium">{unit.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Brand & Model</p>
                <p className="font-medium">{unit.brand} {unit.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacity Class</p>
                <p className="font-medium">{unit.capacityClass}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Thermometer className="w-4 h-4" /> Cooling Capacity
                </p>
                <p className="font-medium">{unit.coolingCapacity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Gauge className="w-4 h-4" /> Running Hours
                </p>
                <p className="font-medium">{unit.runningHours.toLocaleString()} hrs</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Location
                </p>
                <p className="font-medium">{unit.currentLocation || 'Pool Cibitung'}</p>
              </div>
            </div>
          </div>

          {/* Purchase & Warranty */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Purchase & Warranty</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Purchase Date</p>
                <p className="font-medium">{formatDate(unit.purchaseDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Purchase Price</p>
                <p className="font-medium">{formatCurrency(unit.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium">{unit.supplier || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Warranty End</p>
                <p className="font-medium">{unit.warrantyEnd ? formatDate(unit.warrantyEnd) : '-'}</p>
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5" /> Maintenance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Last Service</p>
                <p className="font-medium">{unit.lastServiceDate ? formatDate(unit.lastServiceDate) : 'Never'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Service Due</p>
                <p className="font-medium">{unit.nextServiceDue ? formatDate(unit.nextServiceDue) : 'Not scheduled'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">GPS Device</p>
                <p className="font-medium">{unit.gpsDeviceId || 'Not installed'}</p>
              </div>
            </div>

            {unit.serviceTickets && unit.serviceTickets.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Service Tickets</h3>
                <div className="space-y-2">
                  {unit.serviceTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{ticket.ticketId}</p>
                        <p className="text-sm text-gray-500">{ticket.description}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-200 rounded">{ticket.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rental History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" /> Rental History
            </h2>
            {unit.rentals && unit.rentals.length > 0 ? (
              <div className="space-y-3">
                {unit.rentals.map((rental) => (
                  <Link 
                    key={rental.id} 
                    href={`/rentals/${rental.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{rental.rentalId}</p>
                      <p className="text-sm text-gray-500">{rental.customer.name}</p>
                      <p className="text-xs text-gray-400">{formatDate(rental.startDate)} - {formatDate(rental.endDate)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[rental.status] || 'bg-gray-100'}`}>
                      {rental.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No rental history</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Coordinator */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Assigned Coordinator
            </h2>
            {unit.assignedCoordinator ? (
              <div>
                <p className="font-medium text-lg">{unit.assignedCoordinator.name}</p>
                <p className="text-sm text-gray-500">{unit.assignedCoordinator.role}</p>
                {unit.assignedCoordinator.phone && (
                  <p className="text-sm text-blue-600 mt-2">{unit.assignedCoordinator.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Not assigned</p>
            )}
          </div>

          {/* Current Customer */}
          {unit.currentCustomer && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Current Customer</h2>
              <Link href={`/customers/${unit.currentCustomer.id}`} className="hover:text-blue-600">
                <p className="font-medium">{unit.currentCustomer.name}</p>
                <p className="text-sm text-gray-500">{unit.currentCustomer.customerId}</p>
              </Link>
            </div>
          )}

          {/* GPS Location */}
          {unit.gpsLatitude && unit.gpsLongitude && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> GPS Location
              </h2>
              <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center mb-3">
                <p className="text-sm text-gray-500">Map Preview</p>
              </div>
              <p className="text-sm text-gray-600">
                {unit.gpsLatitude.toFixed(6)}, {unit.gpsLongitude.toFixed(6)}
              </p>
              {unit.gpsLastUpdate && (
                <p className="text-xs text-gray-400 mt-1">
                  Last updated: {formatDate(unit.gpsLastUpdate)}
                </p>
              )}
            </div>
          )}

          {/* Active Alerts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Alerts
            </h2>
            {unit.alerts && unit.alerts.length > 0 ? (
              <div className="space-y-3">
                {unit.alerts.map((alert) => (
                  <Link 
                    key={alert.id}
                    href={`/alerts/${alert.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${severityColors[alert.severity]}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-400">{alert.status}</span>
                    </div>
                    <p className="text-sm font-medium">{alert.alertType}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{alert.description}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No active alerts</p>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Statistics
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Rentals</span>
                <span className="font-medium">{unit.totalRentals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Revenue</span>
                <span className="font-medium">{formatCurrency(unit.totalRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {unit.notes && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Notes</h2>
              <p className="text-gray-600 text-sm">{unit.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
