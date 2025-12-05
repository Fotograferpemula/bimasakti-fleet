'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Truck, MapPin, Calendar, User, FileText, Edit, AlertTriangle, Camera, Clipboard } from 'lucide-react'

interface Rental {
  id: string
  rentalId: string
  monthlyRate: number
  startDate: string
  endDate: string
  deployedLocation: string | null
  vehiclePlate: string | null
  vehicleType: string | null
  customerPic: string | null
  status: string
  bastDeployUrl: string | null
  bastDeployDate: string | null
  bastReturnUrl: string | null
  bastReturnDate: string | null
  deployPhotosUrl: string | null
  returnPhotosUrl: string | null
  deployCondition: string | null
  returnCondition: string | null
  damageNotes: string | null
  damageAmount: number
  unit: {
    id: string
    unitId: string
    unitCode: string
    brand: string
    model: string
    capacityClass: string
    coolingCapacity: string
    gpsLatitude: number | null
    gpsLongitude: number | null
    runningHours: number
    alerts: Array<{ id: string; alertType: string; severity: string }>
  }
  contract: {
    id: string
    contractId: string
    contractType: string
    customer: { name: string }
  }
  customer: { id: string; customerId: string; name: string; phone: string | null }
  coordinator: { id: string; name: string; role: string; phone: string | null } | null
}

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Allocated: 'bg-blue-100 text-blue-800',
  Deployed: 'bg-cyan-100 text-cyan-800',
  Active: 'bg-green-100 text-green-800',
  Returning: 'bg-yellow-100 text-yellow-800',
  Returned: 'bg-purple-100 text-purple-800',
  Terminated: 'bg-red-100 text-red-800',
}

const conditionColors: Record<string, string> = {
  Excellent: 'bg-green-100 text-green-800',
  Good: 'bg-blue-100 text-blue-800',
  Fair: 'bg-yellow-100 text-yellow-800',
  Poor: 'bg-red-100 text-red-800',
}

export default function RentalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [rental, setRental] = useState<Rental | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) fetchRental()
  }, [params.id])

  const fetchRental = async () => {
    try {
      const res = await fetch(`/api/rentals/${params.id}`)
      if (!res.ok) throw new Error('Rental not found')
      const data = await res.json()
      setRental(data)
    } catch (error) {
      console.error('Error fetching rental:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return <div className="p-8"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div><div className="h-64 bg-gray-200 rounded"></div></div></div>
  }

  if (!rental) {
    return <div className="p-8 text-center py-12"><p className="text-gray-500 text-lg">Rental not found</p><Link href="/rentals" className="text-blue-600 hover:underline mt-2 inline-block">Back to Rentals</Link></div>
  }

  const daysActive = Math.ceil((new Date().getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{rental.rentalId}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[rental.status]}`}>{rental.status}</span>
            {rental.deployCondition && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${conditionColors[rental.deployCondition]}`}>{rental.deployCondition}</span>
            )}
          </div>
          <p className="text-gray-500 mt-1">{rental.unit.unitCode} • {rental.customer.name}</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Edit className="w-4 h-4" /> Edit Rental
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unit Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Truck className="w-5 h-5" /> Unit Information</h2>
            <Link href={`/units/${rental.unit.id}`} className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">{rental.unit.unitCode}</p>
                  <p className="text-gray-600">{rental.unit.brand} {rental.unit.model}</p>
                  <p className="text-sm text-gray-500">{rental.unit.capacityClass} • {rental.unit.coolingCapacity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Running Hours</p>
                  <p className="font-bold text-xl">{rental.unit.runningHours.toLocaleString()}</p>
                </div>
              </div>
              {rental.unit.alerts && rental.unit.alerts.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{rental.unit.alerts.length} active alert(s)</span>
                </div>
              )}
            </Link>
          </div>

          {/* Deployment Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" /> Deployment Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Location</p><p className="font-medium">{rental.deployedLocation || 'Not yet deployed'}</p></div>
              <div><p className="text-sm text-gray-500">Vehicle Plate</p><p className="font-medium">{rental.vehiclePlate || '-'}</p></div>
              <div><p className="text-sm text-gray-500">Vehicle Type</p><p className="font-medium">{rental.vehicleType || '-'}</p></div>
              <div><p className="text-sm text-gray-500">Customer PIC</p><p className="font-medium">{rental.customerPic || '-'}</p></div>
            </div>
          </div>

          {/* Period & Billing */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Period & Billing</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-sm text-gray-500">Start Date</p><p className="font-medium">{formatDate(rental.startDate)}</p></div>
              <div><p className="text-sm text-gray-500">End Date</p><p className="font-medium">{formatDate(rental.endDate)}</p></div>
              <div><p className="text-sm text-gray-500">Days Active</p><p className="font-medium">{daysActive} days</p></div>
              <div className="p-3 bg-green-50 rounded-lg"><p className="text-sm text-green-600">Monthly Rate</p><p className="font-bold text-green-700">{formatCurrency(rental.monthlyRate)}</p></div>
            </div>
          </div>

          {/* BAST Documents */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clipboard className="w-5 h-5" /> BAST Documents</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Deployment BAST</h3>
                {rental.bastDeployDate ? (
                  <>
                    <p className="text-sm text-gray-500">Signed: {formatDate(rental.bastDeployDate)}</p>
                    <p className="text-sm">Condition: <span className={`px-2 py-0.5 rounded ${conditionColors[rental.deployCondition || 'Good']}`}>{rental.deployCondition}</span></p>
                    {rental.bastDeployUrl ? (
                      <button className="mt-2 text-blue-600 text-sm hover:underline">View Document</button>
                    ) : (
                      <button className="mt-2 text-blue-600 text-sm hover:underline">+ Upload Document</button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">Not signed yet</p>
                )}
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Return BAST</h3>
                {rental.bastReturnDate ? (
                  <>
                    <p className="text-sm text-gray-500">Signed: {formatDate(rental.bastReturnDate)}</p>
                    <p className="text-sm">Condition: <span className={`px-2 py-0.5 rounded ${conditionColors[rental.returnCondition || 'Good']}`}>{rental.returnCondition}</span></p>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">Unit not yet returned</p>
                )}
              </div>
            </div>
            {rental.damageNotes && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <h3 className="font-medium text-red-800">Damage Notes</h3>
                <p className="text-sm text-red-700 mt-1">{rental.damageNotes}</p>
                <p className="text-sm font-medium text-red-800 mt-2">Damage Amount: {formatCurrency(rental.damageAmount)}</p>
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Camera className="w-5 h-5" /> Photos</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Deploy Photos</p>
                <button className="text-blue-600 text-sm mt-2 hover:underline">+ Upload Photos</button>
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Return Photos</p>
                <button className="text-blue-600 text-sm mt-2 hover:underline">+ Upload Photos</button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <Link href={`/customers/${rental.customer.id}`} className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg">
              <p className="font-medium text-blue-600">{rental.customer.name}</p>
              <p className="text-sm text-gray-500">{rental.customer.customerId}</p>
              {rental.customer.phone && <p className="text-sm text-gray-400 mt-1">{rental.customer.phone}</p>}
            </Link>
          </div>

          {/* Contract */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> Contract</h2>
            <Link href={`/contracts/${rental.contract.id}`} className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg">
              <p className="font-medium text-blue-600">{rental.contract.contractId}</p>
              <p className="text-sm text-gray-500">{rental.contract.contractType}</p>
            </Link>
          </div>

          {/* Coordinator */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User className="w-5 h-5" /> Coordinator</h2>
            {rental.coordinator ? (
              <div>
                <p className="font-medium">{rental.coordinator.name}</p>
                <p className="text-sm text-gray-500">{rental.coordinator.role}</p>
                {rental.coordinator.phone && <p className="text-sm text-blue-600 mt-1">{rental.coordinator.phone}</p>}
              </div>
            ) : (
              <p className="text-gray-500">Not assigned</p>
            )}
          </div>

          {/* GPS Location */}
          {rental.unit.gpsLatitude && rental.unit.gpsLongitude && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" /> GPS Location</h2>
              <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center mb-2">
                <p className="text-sm text-gray-500">Map Preview</p>
              </div>
              <p className="text-xs text-gray-500">{rental.unit.gpsLatitude.toFixed(6)}, {rental.unit.gpsLongitude.toFixed(6)}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-blue-600">Update Status</button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-blue-600">Upload BAST</button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-blue-600">Add Photos</button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-red-600">Report Damage</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
