'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Building2, Phone, Mail, Star } from 'lucide-react'

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
  contracts: any[]
  _count: {
    contracts: number
    rentals: number
  }
}

const tierColors: Record<string, string> = {
  Premium: 'bg-purple-100 text-purple-800',
  Standard: 'bg-blue-100 text-blue-800',
  Economy: 'bg-gray-100 text-gray-800',
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [tierFilter])

  const fetchCustomers = async () => {
    try {
      let url = '/api/customers'
      if (tierFilter) url += `?tier=${tierFilter}`
      const res = await fetch(url)
      const data = await res.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage customer accounts</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Add Customer
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
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tiers</option>
            <option value="Premium">Premium</option>
            <option value="Standard">Standard</option>
            <option value="Economy">Economy</option>
          </select>
        </div>
      </div>

      {/* Customers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <Building2 className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-500">{customer.customerId}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${tierColors[customer.tier]}`}>
                    {customer.tier}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {customer.city && (
                    <p className="text-sm text-gray-600">{customer.city}</p>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {customer.email}
                    </div>
                  )}
                </div>

                {customer.picName && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-medium text-gray-900">{customer.picName}</p>
                    {customer.picPhone && (
                      <p className="text-sm text-gray-600">{customer.picPhone}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">
                    <span className="font-medium text-gray-900">{customer._count.contracts}</span> contracts
                  </span>
                  <span className="text-gray-500">
                    <span className="font-medium text-gray-900">{customer._count.rentals}</span> rentals
                  </span>
                </div>
                <Link href={`/customers/${customer.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No customers found</p>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 text-sm text-gray-500">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>
    </div>
  )
}
