'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Calendar, Building2, Clock, AlertCircle } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface Contract {
  id: string
  contractId: string
  contractType: string
  startDate: string
  endDate: string
  totalUnits: number
  unitBreakdown: string | null
  monthlyValue: number
  contractValue: number
  depositAmount: number
  depositReceived: boolean
  status: string
  areaCoverage: string
  customer: {
    name: string
    customerId: string
  }
  rentals: any[]
}

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  'Waiting Deposit': 'bg-yellow-100 text-yellow-800',
  Active: 'bg-green-100 text-green-800',
  Expiring: 'bg-orange-100 text-orange-800',
  Expired: 'bg-red-100 text-red-800',
  Terminated: 'bg-red-100 text-red-800',
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchContracts()
  }, [statusFilter])

  const fetchContracts = async () => {
    try {
      let url = '/api/contracts'
      if (statusFilter) url += `?status=${statusFilter}`
      const res = await fetch(url)
      const data = await res.json()
      setContracts(data)
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContracts = contracts.filter(contract =>
    contract.contractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getDaysToExpiry = (endDate: string) => {
    return differenceInDays(new Date(endDate), new Date())
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-500 mt-1">Manage rental contracts</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          New Contract
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts or customers..."
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
            <option value="Draft">Draft</option>
            <option value="Waiting Deposit">Waiting Deposit</option>
            <option value="Active">Active</option>
            <option value="Expiring">Expiring</option>
            <option value="Expired">Expired</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Contract</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Customer</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Units</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Monthly Value</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Expiry</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No contracts found
                </td>
              </tr>
            ) : (
              filteredContracts.map((contract) => {
                const daysToExpiry = getDaysToExpiry(contract.endDate)
                return (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{contract.contractId}</div>
                      <div className="text-sm text-gray-500">{contract.areaCoverage}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{contract.customer.name}</div>
                          <div className="text-sm text-gray-500">{contract.customer.customerId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{contract.contractType}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{contract.totalUnits} units</div>
                      <div className="text-sm text-gray-500">{contract.unitBreakdown}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(contract.monthlyValue)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[contract.status]}`}>
                          {contract.status}
                        </span>
                        {!contract.depositReceived && contract.status === 'Waiting Deposit' && (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {format(new Date(contract.endDate), 'dd MMM yyyy')}
                          </div>
                          {contract.status === 'Active' && (
                            <div className={`text-xs ${daysToExpiry <= 30 ? 'text-orange-600' : 'text-gray-500'}`}>
                              {daysToExpiry > 0 ? `${daysToExpiry} days left` : 'Expired'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 text-sm text-gray-500">
        Showing {filteredContracts.length} of {contracts.length} contracts
      </div>
    </div>
  )
}
