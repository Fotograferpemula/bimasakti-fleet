'use client'

import { useEffect, useState } from 'react'
import { 
  Truck, 
  FileText, 
  ClipboardList, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface DashboardStats {
  overview: {
    totalUnits: number
    activeContracts: number
    expiringContracts: number
    activeRentals: number
    openAlerts: number
    pendingDeposits: number
    monthlyRevenue: number
    utilizationRate: number
  }
  unitsByStatus: Record<string, number>
  unitsByCapacity: Record<string, number>
  recentAlerts: any[]
}

const statusColors: Record<string, { bg: string; bar: string }> = {
  Rented: { bg: 'bg-emerald-100', bar: 'bg-emerald-500' },
  Available: { bg: 'bg-blue-100', bar: 'bg-blue-500' },
  Allocated: { bg: 'bg-amber-100', bar: 'bg-amber-500' },
  Maintenance: { bg: 'bg-orange-100', bar: 'bg-orange-500' },
  Damaged: { bg: 'bg-red-100', bar: 'bg-red-500' },
  Retired: { bg: 'bg-gray-100', bar: 'bg-gray-500' },
}

const alertSeverityColors: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-1/4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">Welcome back! Here's your fleet overview.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString('id-ID')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Units"
          value={stats?.overview.totalUnits || 0}
          subtitle={`${stats?.overview.utilizationRate || 0}% utilization`}
          icon={Truck}
          gradient="from-indigo-500 to-purple-600"
          trend={12}
        />
        <StatCard
          title="Active Contracts"
          value={stats?.overview.activeContracts || 0}
          subtitle={`${stats?.overview.expiringContracts || 0} expiring`}
          icon={FileText}
          gradient="from-emerald-500 to-teal-600"
          trend={5}
        />
        <StatCard
          title="Active Rentals"
          value={stats?.overview.activeRentals || 0}
          subtitle="Currently deployed"
          icon={ClipboardList}
          gradient="from-amber-500 to-orange-600"
          trend={-3}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.overview.monthlyRevenue || 0)}
          subtitle="This month"
          icon={DollarSign}
          gradient="from-pink-500 to-rose-600"
          isAmount
          trend={8}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Status */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Fleet Status Overview</h2>
          
          {/* Status breakdown */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Status Distribution</span>
              <span className="text-sm text-gray-500">{stats?.overview.totalUnits} units</span>
            </div>
            <div className="h-3 flex rounded-full overflow-hidden bg-gray-100">
              {stats?.unitsByStatus && Object.entries(stats.unitsByStatus).map(([status, count]) => {
                const percentage = stats.overview.totalUnits > 0 
                  ? (count / stats.overview.totalUnits) * 100 
                  : 0
                return (
                  <div
                    key={status}
                    className={`${statusColors[status]?.bar || 'bg-gray-400'} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                    title={`${status}: ${count}`}
                  />
                )
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {stats?.unitsByStatus && Object.entries(stats.unitsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColors[status]?.bar || 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-600">{status}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Capacity breakdown */}
          <div>
            <span className="text-sm font-medium text-gray-600 mb-4 block">By Capacity Class</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats?.unitsByCapacity && Object.entries(stats.unitsByCapacity).map(([capacity, count]) => (
                <div key={capacity} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{count}</div>
                  <div className="text-xs text-gray-500 mt-1">{capacity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
            {(stats?.overview.openAlerts || 0) > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {stats?.overview.openAlerts} open
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            {stats?.recentAlerts && stats.recentAlerts.length > 0 ? (
              stats.recentAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-xl border ${alertSeverityColors[alert.severity] || 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{alert.alertType}</p>
                      <p className="text-xs mt-1 opacity-80 line-clamp-2">{alert.description}</p>
                      <p className="text-xs mt-2 opacity-60">
                        Unit: {alert.unit?.unitCode || alert.unit?.unitId}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-gray-600 font-medium">All Clear!</p>
                <p className="text-sm text-gray-400 mt-1">No open alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction href="/units" title="View Units" icon={Truck} color="indigo" />
          <QuickAction href="/contracts" title="Contracts" icon={FileText} color="emerald" />
          <QuickAction href="/rentals" title="Rentals" icon={ClipboardList} color="amber" />
          <QuickAction href="/alerts" title="Alerts" icon={AlertTriangle} color="rose" />
        </div>
      </div>

      {/* Pending Items */}
      {(stats?.overview.pendingDeposits || 0) > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="font-semibold text-amber-800">
                {stats?.overview.pendingDeposits} contract(s) waiting for deposit
              </span>
              <p className="text-sm text-amber-600 mt-0.5">Review and follow up with customers</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient,
  isAmount = false,
  trend
}: { 
  title: string
  value: number | string
  subtitle: string
  icon: any
  gradient: string
  isAmount?: boolean
  trend?: number
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className={`${isAmount ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'} font-bold text-gray-900`}>
          {value}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{title}</p>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
    </div>
  )
}

function QuickAction({ href, title, icon: Icon, color }: { href: string; title: string; icon: any; color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    rose: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
  }

  return (
    <a
      href={href}
      className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${colorClasses[color]}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{title}</span>
    </a>
  )
}
