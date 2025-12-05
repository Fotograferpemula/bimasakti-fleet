'use client'

import { useEffect, useState } from 'react'
import { MapPin, Signal, Clock, AlertTriangle, RefreshCw, Truck } from 'lucide-react'

interface UnitLocation {
  id: string
  unitId: string
  unitCode: string
  brand: string
  model: string
  status: string
  gpsLatitude: number | null
  gpsLongitude: number | null
  gpsLastUpdate: string | null
  runningHours: number
  currentLocation: string | null
  currentCustomer?: {
    name: string
  } | null
}

const statusColors: Record<string, string> = {
  Rented: 'bg-green-500',
  Available: 'bg-blue-500',
  Allocated: 'bg-yellow-500',
  Maintenance: 'bg-orange-500',
  Damaged: 'bg-red-500',
}

export default function GPSPage() {
  const [units, setUnits] = useState<UnitLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<UnitLocation | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    fetchUnits()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchUnits, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnits = async () => {
    try {
      const res = await fetch('/api/units')
      const data = await res.json()
      setUnits(data.filter((u: UnitLocation) => u.status === 'Rented' || u.status === 'Allocated'))
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error fetching units:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getGPSStatus = (lastUpdate: string | null) => {
    if (!lastUpdate) return { status: 'offline', color: 'text-gray-400' }
    const diff = Date.now() - new Date(lastUpdate).getTime()
    const hours = diff / (1000 * 60 * 60)
    if (hours < 1) return { status: 'online', color: 'text-green-500' }
    if (hours < 4) return { status: 'delayed', color: 'text-yellow-500' }
    return { status: 'offline', color: 'text-red-500' }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GPS Monitoring</h1>
          <p className="text-gray-500 mt-1">Track unit locations in real-time</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Last refresh: {lastRefresh.toLocaleTimeString('id-ID')}
          </span>
          <button
            onClick={fetchUnits}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Fleet Map</h2>
          </div>
          <div className="relative h-[600px] bg-gray-100 flex items-center justify-center">
            {/* This would be replaced with actual map integration (Google Maps, Mapbox, etc.) */}
            <div className="text-center text-gray-500">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Interactive Map</p>
              <p className="text-sm mt-1">Integrate with Google Maps or Mapbox for live tracking</p>
              
              {/* Simulated unit positions */}
              <div className="mt-8 space-y-2">
                {units.slice(0, 5).map((unit, index) => (
                  <div 
                    key={unit.id}
                    className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm mx-1"
                    style={{
                      position: 'absolute',
                      top: `${20 + (index * 15)}%`,
                      left: `${20 + (index * 12)}%`,
                    }}
                  >
                    <div className={`w-3 h-3 rounded-full ${statusColors[unit.status]}`} />
                    <span className="text-sm font-medium text-gray-700">{unit.unitCode}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Unit List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Active Units ({units.length})</h2>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {units.map((unit) => {
                  const gpsStatus = getGPSStatus(unit.gpsLastUpdate)
                  return (
                    <div
                      key={unit.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedUnit?.id === unit.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedUnit(unit)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            unit.status === 'Rented' ? 'bg-green-100' : 'bg-yellow-100'
                          }`}>
                            <Truck className={`w-5 h-5 ${
                              unit.status === 'Rented' ? 'text-green-600' : 'text-yellow-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{unit.unitCode}</h3>
                            <p className="text-sm text-gray-500">{unit.brand} {unit.model}</p>
                          </div>
                        </div>
                        <Signal className={`w-5 h-5 ${gpsStatus.color}`} />
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 truncate">
                            {unit.currentLocation || 'Location unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Last update: {formatTime(unit.gpsLastUpdate)}
                          </span>
                        </div>
                        {unit.currentCustomer && (
                          <div className="text-sm text-gray-500">
                            Customer: {unit.currentCustomer.name}
                          </div>
                        )}
                      </div>

                      {gpsStatus.status === 'offline' && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          GPS signal lost
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Unit Details */}
      {selectedUnit && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Unit Details: {selectedUnit.unitCode}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Unit ID</p>
              <p className="font-medium text-gray-900">{selectedUnit.unitId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Model</p>
              <p className="font-medium text-gray-900">{selectedUnit.brand} {selectedUnit.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Running Hours</p>
              <p className="font-medium text-gray-900">{selectedUnit.runningHours.toLocaleString()} hrs</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Coordinates</p>
              <p className="font-medium text-gray-900">
                {selectedUnit.gpsLatitude?.toFixed(4)}, {selectedUnit.gpsLongitude?.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
