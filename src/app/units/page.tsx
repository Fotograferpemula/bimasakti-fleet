'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Filter, MoreVertical, MapPin, Gauge, Calendar } from 'lucide-react'

interface Unit {
  id: string
  unitId: string
  unitCode: string
  brand: string
  model: string
  serialNumber: string
  capacityClass: string
  coolingCapacity: string
  status: string
  condition: string
  currentLocation: string | null
  runningHours: number
  purchasePrice: number
  currentCustomer?: {
    name: string
  } | null
  assignedCoordinator?: {
    name: string
  } | null
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
  Excellent: 'text-green-600',
  Good: 'text-blue-600',
  Fair: 'text-yellow-600',
  Poor: 'text-red-600',
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [capacityFilter, setCapacityFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchUnits()
  }, [statusFilter, capacityFilter])

  const fetchUnits = async () => {
    try {
      let url = '/api/units'
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (capacityFilter) params.append('capacityClass', capacityFilter)
      if (params.toString()) url += `?${params.toString()}`

      const res = await fetch(url)
      const data = await res.json()
      setUnits(data)
    } catch (error) {
      console.error('Error fetching units:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUnits = units.filter(unit =>
    unit.unitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet Units</h1>
          <p className="text-gray-500 mt-1">Manage all cooling units in your fleet</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Unit
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Rented">Rented</option>
            <option value="Allocated">Allocated</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Damaged">Damaged</option>
            <option value="Retired">Retired</option>
          </select>

          {/* Capacity Filter */}
          <select
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Capacity</option>
            <option value="Small">Small (CDE)</option>
            <option value="Medium">Medium (CDD)</option>
            <option value="Large">Large (Fuso)</option>
            <option value="XL">XL (Tronton)</option>
          </select>
        </div>
      </div>

      {/* Units Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => (
            <div key={unit.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{unit.unitCode}</h3>
                    <p className="text-sm text-gray-500">{unit.unitId}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[unit.status]}`}>
                    {unit.status}
                  </span>
                </div>
                
                <div className="mt-3">
                  <p className="font-medium text-gray-900">{unit.brand} {unit.model}</p>
                  <p className="text-sm text-gray-500">{unit.capacityClass} • {unit.coolingCapacity}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{unit.currentLocation || 'Pool Cibitung'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Gauge className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{unit.runningHours.toLocaleString()} hours</span>
                  <span className={`ml-auto text-sm font-medium ${conditionColors[unit.condition]}`}>
                    {unit.condition}
                  </span>
                </div>

                {unit.currentCustomer && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium text-gray-900">{unit.currentCustomer.name}</p>
                  </div>
                )}

                {unit.assignedCoordinator && (
                  <div className="text-sm text-gray-500">
                    Coordinator: {unit.assignedCoordinator.name}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Value: {formatCurrency(unit.purchasePrice)}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUnits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No units found matching your criteria</p>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 text-sm text-gray-500">
        Showing {filteredUnits.length} of {units.length} units
      </div>
    </div>
  )
}
