'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Truck, MapPin, Calendar, ArrowRight, CheckCircle, Clock } from 'lucide-react'

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
  deployCondition: string | null
  unit: {
    unitId: string
    unitCode: string
    brand: string
    model: string
  }
  contract: {
    contractId: string
  }
  customer: {
    name: string
    customerId: string
  }
  coordinator?: {
    name: string
  } | null
}

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Allocated: 'bg-yellow-100 text-yellow-800',
  Deployed: 'bg-blue-100 text-blue-800',
  Active: 'bg-green-100 text-green-800',
  Returning: 'bg-orange-100 text-orange-800',
  Returned: 'bg-gray-100 text-gray-800',
  Terminated: 'bg-red-100 text-red-800',
}

const statusFlow = ['Draft', 'Allocated', 'Deployed', 'Active', 'Returning', 'Returned']

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchRentals()
  }, [statusFilter])

  const fetchRentals = async () => {
    try {
      let url = '/api/rentals'
      if (statusFilter) url += `?status=${statusFilter}`
      const res = await fetch(url)
      const data = await res.json()
      setRentals(data)
    } catch (error) {
      console.error('Error fetching rentals:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRentals = rentals.filter(rental =>
    rental.rentalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rental.unit.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rental.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const updateRentalStatus = async (rentalId: string, newStatus: string) => {
    try {
      await fetch('/api/rentals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rentalId, status: newStatus }),
      })
      fetchRentals()
    } catch (error) {
      console.error('Error updating rental:', error)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rentals</h1>
          <p className="text-gray-500 mt-1">Track unit deployments and rental status</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Allocate Unit
        </button>
      </div>

      {/* Workflow Status Summary */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          {statusFlow.map((status, index) => {
            const count = rentals.filter(r => r.status === status).length
            return (
              <div key={status} className="flex items-center">
                <div className="text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                    count > 0 ? statusColors[status] : 'bg-gray-100 text-gray-400'
                  }`}>
                    {count}
                  </div>
                  <span className="text-xs text-gray-500">{status}</span>
                </div>
                {index < statusFlow.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-300 mx-2" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search rentals, units, or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {statusFlow.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Rentals List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))
        ) : filteredRentals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            No rentals found
          </div>
        ) : (
          filteredRentals.map((rental) => (
            <div key={rental.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{rental.unit.unitCode}</h3>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[rental.status]}`}>
                          {rental.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{rental.rentalId}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {rental.unit.brand} {rental.unit.model}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(rental.monthlyRate)}/mo
                    </div>
                    <div className="text-sm text-gray-500">
                      {rental.customer.name}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{rental.deployedLocation || 'Not deployed'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                    </span>
                  </div>
                  {rental.vehiclePlate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{rental.vehiclePlate} ({rental.vehicleType})</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons based on status */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {rental.coordinator && `Coordinator: ${rental.coordinator.name}`}
                  </div>
                  <div className="flex gap-2">
                    {rental.status === 'Allocated' && (
                      <button
                        onClick={() => updateRentalStatus(rental.id, 'Deployed')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Deployed
                      </button>
                    )}
                    {rental.status === 'Deployed' && (
                      <button
                        onClick={() => updateRentalStatus(rental.id, 'Active')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Activate Rental
                      </button>
                    )}
                    {rental.status === 'Active' && (
                      <button
                        onClick={() => updateRentalStatus(rental.id, 'Returning')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                      >
                        <Clock className="w-4 h-4" />
                        Schedule Return
                      </button>
                    )}
                    {rental.status === 'Returning' && (
                      <button
                        onClick={() => updateRentalStatus(rental.id, 'Returned')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete Return
                      </button>
                    )}
                    <button className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 text-sm text-gray-500">
        Showing {filteredRentals.length} of {rentals.length} rentals
      </div>
    </div>
  )
}
