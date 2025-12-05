'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Calendar, DollarSign, Users, Building2, Edit, Clock, CheckCircle } from 'lucide-react'

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
  includesMaintenance: boolean
  maintenanceScope: string | null
  slaResponse: number
  slaResolution: number
  pricingTier: string
  specialTerms: string | null
  areaCoverage: string
  status: string
  customer: { id: string; customerId: string; name: string; picName: string | null }
  salesPic: { id: string; name: string; phone: string | null } | null
  operationsPic: { id: string; name: string; phone: string | null } | null
  rentals: Array<{
    id: string
    rentalId: string
    status: string
    deployedLocation: string | null
    unit: { unitCode: string; brand: string; model: string }
    coordinator: { name: string } | null
  }>
  invoices: Array<{
    id: string
    invoiceId: string
    invoiceType: string
    amount: number
    status: string
    dueDate: string
  }>
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  'Waiting Deposit': 'bg-yellow-100 text-yellow-800',
  Draft: 'bg-blue-100 text-blue-800',
  Expiring: 'bg-orange-100 text-orange-800',
  Expired: 'bg-gray-100 text-gray-800',
  Terminated: 'bg-red-100 text-red-800',
}

const invoiceStatusColors: Record<string, string> = {
  Paid: 'bg-green-100 text-green-800',
  Sent: 'bg-blue-100 text-blue-800',
  Overdue: 'bg-red-100 text-red-800',
  Draft: 'bg-gray-100 text-gray-800',
}

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) fetchContract()
  }, [params.id])

  const fetchContract = async () => {
    try {
      const res = await fetch(`/api/contracts/${params.id}`)
      if (!res.ok) throw new Error('Contract not found')
      const data = await res.json()
      setContract(data)
    } catch (error) {
      console.error('Error fetching contract:', error)
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

  if (!contract) {
    return <div className="p-8 text-center py-12"><p className="text-gray-500 text-lg">Contract not found</p><Link href="/contracts" className="text-blue-600 hover:underline mt-2 inline-block">Back to Contracts</Link></div>
  }

  const daysRemaining = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{contract.contractId}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[contract.status]}`}>
              {contract.status}
            </span>
          </div>
          <p className="text-gray-500 mt-1">{contract.contractType} Contract • {contract.customer.name}</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Edit className="w-4 h-4" /> Edit Contract
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> Contract Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><p className="text-sm text-gray-500">Contract Type</p><p className="font-medium">{contract.contractType}</p></div>
              <div><p className="text-sm text-gray-500">Start Date</p><p className="font-medium">{formatDate(contract.startDate)}</p></div>
              <div><p className="text-sm text-gray-500">End Date</p><p className="font-medium">{formatDate(contract.endDate)}</p></div>
              <div><p className="text-sm text-gray-500">Total Units</p><p className="font-medium">{contract.totalUnits}</p></div>
              <div><p className="text-sm text-gray-500">Unit Breakdown</p><p className="font-medium">{contract.unitBreakdown || '-'}</p></div>
              <div><p className="text-sm text-gray-500">Area Coverage</p><p className="font-medium">{contract.areaCoverage}</p></div>
            </div>
          </div>

          {/* Financial */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Financial</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm text-blue-600">Monthly Value</p><p className="text-xl font-bold text-blue-700">{formatCurrency(contract.monthlyValue)}</p></div>
              <div className="p-4 bg-green-50 rounded-lg"><p className="text-sm text-green-600">Contract Value</p><p className="text-xl font-bold text-green-700">{formatCurrency(contract.contractValue)}</p></div>
              <div className="p-4 bg-purple-50 rounded-lg"><p className="text-sm text-purple-600">Deposit</p><p className="text-xl font-bold text-purple-700">{formatCurrency(contract.depositAmount)}</p></div>
              <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600">Deposit Status</p><p className="text-xl font-bold">{contract.depositReceived ? '✓ Received' : '⏳ Pending'}</p></div>
            </div>
          </div>

          {/* SLA & Maintenance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock className="w-5 h-5" /> SLA & Maintenance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-sm text-gray-500">SLA Response</p><p className="font-medium">{contract.slaResponse} hours</p></div>
              <div><p className="text-sm text-gray-500">SLA Resolution</p><p className="font-medium">{contract.slaResolution} hours</p></div>
              <div><p className="text-sm text-gray-500">Maintenance</p><p className="font-medium">{contract.includesMaintenance ? 'Included' : 'Not Included'}</p></div>
              <div><p className="text-sm text-gray-500">Scope</p><p className="font-medium">{contract.maintenanceScope || '-'}</p></div>
            </div>
          </div>

          {/* Rentals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Deployed Units ({contract.rentals.length})</h2>
            {contract.rentals.length > 0 ? (
              <div className="space-y-3">
                {contract.rentals.map((rental) => (
                  <Link key={rental.id} href={`/rentals/${rental.id}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium">{rental.rentalId}</p>
                      <p className="text-sm text-gray-500">{rental.unit.unitCode} • {rental.unit.brand} {rental.unit.model}</p>
                      <p className="text-xs text-gray-400">{rental.deployedLocation || 'Not deployed'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[rental.status] || 'bg-gray-100'}`}>{rental.status}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No units deployed yet</p>
            )}
          </div>

          {/* Invoices */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Invoices</h2>
            {contract.invoices.length > 0 ? (
              <div className="space-y-2">
                {contract.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div><p className="font-medium text-sm">{invoice.invoiceId}</p><p className="text-xs text-gray-500">{invoice.invoiceType} • Due: {formatDate(invoice.dueDate)}</p></div>
                    <div className="text-right"><p className="font-medium">{formatCurrency(invoice.amount)}</p><span className={`text-xs px-2 py-0.5 rounded-full ${invoiceStatusColors[invoice.status]}`}>{invoice.status}</span></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No invoices yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Contract Status</h2>
            <div className={`p-4 rounded-lg ${daysRemaining > 30 ? 'bg-green-50' : daysRemaining > 0 ? 'bg-yellow-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600">Days Remaining</p>
              <p className={`text-3xl font-bold ${daysRemaining > 30 ? 'text-green-700' : daysRemaining > 0 ? 'text-yellow-700' : 'text-red-700'}`}>{daysRemaining > 0 ? daysRemaining : 'Expired'}</p>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Building2 className="w-5 h-5" /> Customer</h2>
            <Link href={`/customers/${contract.customer.id}`} className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg">
              <p className="font-medium text-blue-600">{contract.customer.name}</p>
              <p className="text-sm text-gray-500">{contract.customer.customerId}</p>
              {contract.customer.picName && <p className="text-sm text-gray-400 mt-1">PIC: {contract.customer.picName}</p>}
            </Link>
          </div>

          {/* Team */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Team</h2>
            <div className="space-y-3">
              {contract.salesPic && (
                <div><p className="text-sm text-gray-500">Sales PIC</p><p className="font-medium">{contract.salesPic.name}</p>{contract.salesPic.phone && <p className="text-sm text-blue-600">{contract.salesPic.phone}</p>}</div>
              )}
              {contract.operationsPic && (
                <div className="pt-3 border-t"><p className="text-sm text-gray-500">Operations PIC</p><p className="font-medium">{contract.operationsPic.name}</p>{contract.operationsPic.phone && <p className="text-sm text-blue-600">{contract.operationsPic.phone}</p>}</div>
              )}
            </div>
          </div>

          {/* Special Terms */}
          {contract.specialTerms && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Special Terms</h2>
              <p className="text-gray-600 text-sm">{contract.specialTerms}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
