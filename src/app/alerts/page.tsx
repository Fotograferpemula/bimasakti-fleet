'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, Clock, MapPin, Gauge, Wifi, XCircle } from 'lucide-react'

interface Alert {
  id: string
  alertType: string
  description: string
  severity: string
  status: string
  createdAt: string
  resolvedAt: string | null
  unit: {
    unitId: string
    unitCode: string
    currentCustomer?: {
      name: string
    } | null
  }
}

const severityConfig: Record<string, { bg: string; text: string; icon: any }> = {
  Critical: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
  High: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertTriangle },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
  Low: { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertTriangle },
}

const alertTypeIcons: Record<string, any> = {
  'Geofence Breach': MapPin,
  'GPS Offline': Wifi,
  'Running Hours Exceeded': Gauge,
  'Maintenance Due': Clock,
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('Open')
  const [severityFilter, setSeverityFilter] = useState('')

  useEffect(() => {
    fetchAlerts()
  }, [statusFilter, severityFilter])

  const fetchAlerts = async () => {
    try {
      let url = '/api/alerts'
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (severityFilter) params.append('severity', severityFilter)
      if (params.toString()) url += `?${params.toString()}`

      const res = await fetch(url)
      const data = await res.json()
      setAlerts(data)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alertId,
          status: 'Resolved',
          resolvedBy: 'Admin',
        }),
      })
      fetchAlerts()
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alertId,
          status: 'Acknowledged',
        }),
      })
      fetchAlerts()
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-500 mt-1">Monitor and resolve fleet alerts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-600">
              {alerts.filter(a => a.status === 'Open').length} Open
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severity</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium text-gray-900">No alerts</h3>
            <p className="text-gray-500 mt-1">All systems are operating normally</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const severity = severityConfig[alert.severity] || severityConfig.Medium
            const AlertIcon = alertTypeIcons[alert.alertType] || AlertTriangle
            const SeverityIcon = severity.icon

            return (
              <div 
                key={alert.id} 
                className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${
                  alert.status === 'Open' 
                    ? 'border-l-red-500' 
                    : alert.status === 'Acknowledged'
                    ? 'border-l-yellow-500'
                    : 'border-l-green-500'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${severity.bg}`}>
                        <AlertIcon className={`w-6 h-6 ${severity.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{alert.alertType}</h3>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${severity.bg} ${severity.text}`}>
                            {alert.severity}
                          </span>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            alert.status === 'Open' 
                              ? 'bg-red-100 text-red-800'
                              : alert.status === 'Acknowledged'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{alert.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Unit: {alert.unit.unitCode}</span>
                          {alert.unit.currentCustomer && (
                            <span>Customer: {alert.unit.currentCustomer.name}</span>
                          )}
                          <span>{getTimeSince(alert.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {alert.status !== 'Resolved' && (
                      <div className="flex gap-2">
                        {alert.status === 'Open' && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-3 py-1.5 border border-yellow-500 text-yellow-600 text-sm rounded-lg hover:bg-yellow-50"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          Resolve
                        </button>
                        <Link
                          href={`/alerts/${alert.id}`}
                          className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                        >
                          Details →
                        </Link>
                      </div>
                    )}
                    {alert.status === 'Resolved' && (
                      <Link
                        href={`/alerts/${alert.id}`}
                        className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                      >
                        Details →
                      </Link>
                    )}
                  </div>

                  {alert.resolvedAt && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                      Resolved at: {formatTime(alert.resolvedAt)}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 text-sm text-gray-500">
        Showing {alerts.length} alerts
      </div>
    </div>
  )
}
