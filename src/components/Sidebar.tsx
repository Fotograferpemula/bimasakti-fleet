'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Truck, 
  FileText, 
  Users, 
  ClipboardList, 
  MapPin,
  AlertTriangle,
  Menu,
  X,
  ChevronRight
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Units', href: '/units', icon: Truck },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Rentals', href: '/rentals', icon: ClipboardList },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'GPS Monitor', href: '/gps', icon: MapPin },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1a1d2e] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-white font-semibold">Bimasakti</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 lg:w-64 bg-[#1a1d2e] text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
        pt-16 lg:pt-0
      `}>
        {/* Logo - Desktop only */}
        <div className="hidden lg:flex p-6 border-b border-white/10 items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white font-bold">B</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">BIMASAKTI</h1>
            <p className="text-xs text-gray-400">Fleet & Rental</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs text-gray-500 uppercase tracking-wider px-4 mb-3">Menu</p>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="font-semibold text-sm">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Edward</p>
              <p className="text-xs text-gray-400">CEO</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-14" />
    </>
  )
}
