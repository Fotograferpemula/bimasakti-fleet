'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Truck, MapPin, Clock, CheckCircle, User, Edit } from 'lucide-react'

interface Alert {
  id: string
  alertType: string
  description: string
  severity: string
  status: string
  resolvedAt: string | null
  resolvedBy: string | null
  createdAt: string
  unit: {
    id: string
    unitId: string
    unitCode: string
    brand: string
    model: string
    status: string
    currentLocation: string | null
    gpsLatitude: number | null
    gpsLongitude: number | null
    runningHours: number
    currentCustomer: { name: string } | null
    assignedCoordinator: { name: string; phone: string | null } | null
    rentals: Array<{
      id: string
      rentalId: string
      status: string
      customer: { name: string }
    }>
  }
}

const severityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-800 border-gray-300',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  High: 'bg-orange-100 text-orange-800 border-orange-300',
  Critical: 'bg-red-100 text-red-800 border-red-300',
}

const statusColors: Record<string, string> = {
  Open: 'bg-red-100 text-red-800',
  Acknowledged: 'bg-yellow-100 text-yellow-800',
  Resolved: 'bg-green-100 text-green-800',
}

const alertTypeIcons: Record<string, string> = {
  'Geofence Breach': '🚨',
  'GPS Offline': '📡',
  'Running Hours': '⏱️',
  'Maintenance Due': '🔧',
}

export default function AlertDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [alert, setAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) fetchAlert()
  }, [params.id])

  const fetchAlert = async () => {
    try {
      const res = await fetch(`/api/alerts/${params.id}`)
      if (!res.ok) throw new Error('Alert not found')
      const data = await res.json()
      setAlert(data)
    } catch (error) {
      console.error('Error fetching alert:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async () => {
    try {
      await fetch(`/api/alerts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Acknowledged' }),
      })
      fetchAlert()
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  const handleResolve = async () => {
    try {
      await fetch(`/api/alerts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved', resolvedAt: new Date().toISOString() }),
      })
      fetchAlert()
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  if (loading) {
    return <div className="p-8"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div><div className="h-64 bg-gray-200 rounded"></div></div></div>
  }

  if (!alert) {
    return <div className="p-8 text-center py-12"><p className="text-gray-500 text-lg">Alert not found</p><Link href="/alerts" className="text-blue-600 hover:underline mt-2 inline-block">Back to Alerts</Link></div>
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
            <span className="text-2xl">{alertTypeIcons[alert.alertType] || '⚠️'}</span>
            <h1 className="text-3xl font-bold text-gray-900">{alert.alertType}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${severityColors[alert.severity]}`}>{alert.severity}</span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[alert.status]}`}>{alert.status}</span>
          </div>
          <p className="text-gray-500 mt-1">Alert for {alert.unit.unitCode} • Created {timeAgo(alert.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alert Details */}
          <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${alert.severity === 'Critical' ? 'border-red-500' : alert.severity === 'High' ? 'border-orange-500' : alert.severity === 'Medium' ? 'border-yellow-500' : 'border-gray-500'}`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Alert Description</h2>
            <p className="text-gray-700 text-lg">{alert.description}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Created: {formatDate(alert.createdAt)}</span>
              {alert.resolvedAt && <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Resolved: {formatDate(alert.resolvedAt)}</span>}
            </div>
          </div>

          {/* Unit Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Truck className="w-5 h-5" /> Affected Unit</h2>
            <Link href={`/units/${alert.unit.id}`} className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg text-blue-600">{alert.unit.unitCode}</p>
                  <p className="text-gray-600">{alert.unit.brand} {alert.unit.model}</p>
                  <p className="text-sm text-gray-500">{alert.unit.unitId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{alert.unit.status}</p>
                  <p className="text-sm text-gray-400">{alert.unit.runningHours.toLocaleString()} hrs</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{alert.unit.currentLocation || 'Location unknown'}</span>
              </div>
            </Link>
          </div>

          {/* GPS Location */}
          {alert.unit.gpsLatitude && alert.unit.gpsLongitude && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" /> GPS Location</h2>
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-3">
                <div className="text-center">
                  <p className="text-gray-500">Map View</p>
                  <p className="text-sm text-gray-400">Lat: {alert.unit.gpsLatitude.toFixed(6)}</p>
                  <p className="text-sm text-gray-400">Lng: {alert.unit.gpsLongitude.toFixed(6)}</p>
                </div>
              </div>
              <a href={`https://www.google.com/maps?q=${alert.unit.gpsLatitude},${alert.unit.gpsLongitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                Open in Google Maps →
              </a>
            </div>
          )}

          {/* Active Rental */}
          {alert.unit.rentals && alert.unit.rentals.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Current Rental</h2>
              {alert.unit.rentals.map((rental) => (
                <Link key={rental.id} href={`/rentals/${rental.id}`} className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-600">{rental.rentalId}</p>
                      <p className="text-sm text-gray-500">{rental.customer.name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[rental.status] || 'bg-gray-100'}`}>{rental.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              {alert.status === 'Open' && (
                <button onClick={handleAcknowledge} className="w-full bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium">
                  Acknowledge Alert
                </button>
              )}
              {alert.status !== 'Resolved' && (
                <button onClick={handleResolve} className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Mark as Resolved
                </button>
              )}
              <button className="w-full border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Add Comment
              </button>
            </div>
          </div>

          {/* Coordinator */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User className="w-5 h-5" /> Assigned Coordinator</h2>
            {alert.unit.assignedCoordinator ? (
              <div>
                <p className="font-medium">{alert.unit.assignedCoordinator.name}</p>
                {alert.unit.assignedCoordinator.phone && (
                  <a href={`tel:${alert.unit.assignedCoordinator.phone}`} className="text-blue-600 text-sm hover:underline">{alert.unit.assignedCoordinator.phone}</a>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No coordinator assigned</p>
            )}
          </div>

          {/* Customer */}
          {alert.unit.currentCustomer && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Current Customer</h2>
              <p className="font-medium">{alert.unit.currentCustomer.name}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 mt-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Alert Created</p>
                  <p className="text-xs text-gray-500">{formatDate(alert.createdAt)}</p>
                </div>
              </div>
              {alert.status === 'Acknowledged' && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 mt-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Acknowledged</p>
                    <p className="text-xs text-gray-500">Status updated</p>
                  </div>
                </div>
              )}
              {alert.resolvedAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Resolved</p>
                    <p className="text-xs text-gray-500">{formatDate(alert.resolvedAt)}</p>
                    {alert.resolvedBy && <p className="text-xs text-gray-400">By: {alert.resolvedBy}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
