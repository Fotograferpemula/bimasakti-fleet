'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Phone, Mail, MapPin, User, FileText, Edit, TrendingUp } from 'lucide-react'

interface Customer {
  id: string
  customerId: string
  name: string
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  picName: string | null
  picPhone: string | null
  tier: string
  status: string
  contracts: Array<{
    id: string
    contractId: string
    contractType: string
    status: string
    startDate: string
    endDate: string
    monthlyValue: number
    totalUnits: number
  }>
  rentals: Array<{
    id: string
    rentalId: string
    status: string
    unit: { unitCode: string; brand: string }
  }>
}

const tierColors: Record<string, string> = {
  Premium: 'bg-purple-100 text-purple-800',
  Standard: 'bg-blue-100 text-blue-800',
  Economy: 'bg-gray-100 text-gray-800',
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-gray-100 text-gray-800',
  Prospect: 'bg-yellow-100 text-yellow-800',
}

const contractStatusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  'Waiting Deposit': 'bg-yellow-100 text-yellow-800',
  Expired: 'bg-gray-100 text-gray-800',
  Draft: 'bg-blue-100 text-blue-800',
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) fetchCustomer()
  }, [params.id])

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${params.id}`)
      if (!res.ok) throw new Error('Customer not found')
      const data = await res.json()
      setCustomer(data)
    } catch (error) {
      console.error('Error fetching customer:', error)
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
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-8 text-center py-12">
        <p className="text-gray-500 text-lg">Customer not found</p>
        <Link href="/customers" className="text-blue-600 hover:underline mt-2 inline-block">Back to Customers</Link>
      </div>
    )
  }

  const totalMonthlyValue = customer.contracts
    .filter(c => c.status === 'Active')
    .reduce((sum, c) => sum + c.monthlyValue, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${tierColors[customer.tier]}`}>
              {customer.tier}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[customer.status]}`}>
              {customer.status}
            </span>
          </div>
          <p className="text-gray-500 mt-1">{customer.customerId}</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Edit className="w-4 h-4" />
          Edit Customer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Contact Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{customer.address || '-'}</p>
                  <p className="text-sm text-gray-600">{customer.city || ''}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{customer.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{customer.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium">{customer.picName || '-'}</p>
                  {customer.picPhone && <p className="text-sm text-blue-600">{customer.picPhone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Contracts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Contracts
            </h2>
            {customer.contracts.length > 0 ? (
              <div className="space-y-3">
                {customer.contracts.map((contract) => (
                  <Link 
                    key={contract.id}
                    href={`/contracts/${contract.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{contract.contractId}</p>
                      <p className="text-sm text-gray-500">{contract.contractType} • {contract.totalUnits} Units</p>
                      <p className="text-xs text-gray-400">{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${contractStatusColors[contract.status] || 'bg-gray-100'}`}>
                        {contract.status}
                      </span>
                      <p className="text-sm font-medium mt-1">{formatCurrency(contract.monthlyValue)}/mo</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No contracts yet</p>
            )}
          </div>

          {/* Active Rentals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Active Rentals</h2>
            {customer.rentals.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {customer.rentals.map((rental) => (
                  <Link 
                    key={rental.id}
                    href={`/rentals/${rental.id}`}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium text-sm">{rental.rentalId}</p>
                    <p className="text-xs text-gray-500">{rental.unit.unitCode}</p>
                    <p className="text-xs text-gray-400">{rental.unit.brand}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No active rentals</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Summary
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Active Monthly Value</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalMonthlyValue)}</p>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Total Contracts</span>
                <span className="font-medium">{customer.contracts.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Active Contracts</span>
                <span className="font-medium">{customer.contracts.filter(c => c.status === 'Active').length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Active Rentals</span>
                <span className="font-medium">{customer.rentals.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-blue-600">
                + Create New Contract
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-blue-600">
                + Add Rental
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-600">
                View Invoices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
