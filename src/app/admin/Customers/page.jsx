'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Users, Mail, Phone, Download } from 'lucide-react'
import { useRestaurant } from '@/hooks/useRestaurant'

export default function CustomersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { restaurant, loading: restaurantLoading } = useRestaurant()
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function loadOrders() {
      setLoading(true)
      try {
        const res = await fetch('/api/orders')
        if (!res.ok) throw new Error('Failed to fetch orders')
        const data = await res.json()
        if (mounted) setOrders(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to load orders', e)
        if (mounted) setOrders([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadOrders()
    return () => { mounted = false }
  }, [])

  // Extract unique customers from orders
  const customers = useMemo(() => {
    const customerMap = new Map()
    
    orders.forEach(order => {
      // Support both order.customer object and top-level fields (for backward compatibility)
      const customerData = order.customer || {}
      const name = customerData.name || order.name || 'Unknown'
      const email = customerData.email || order.email || ''
      const phone = customerData.phone || order.phone || ''
      
      // Skip if no identifying information
      if (!email && !phone && name === 'Unknown') return
      
      // Use email or phone as the unique identifier
      const identifier = email?.trim().toLowerCase() || phone?.trim() || `order-${order._id}`
      
      if (!customerMap.has(identifier)) {
        customerMap.set(identifier, {
          name: name || 'Unknown',
          email: email || '',
          phone: phone || '',
          orderCount: 0,
          totalSpent: 0,
          lastOrderDate: null
        })
      }
      
      const customer = customerMap.get(identifier)
      customer.orderCount += 1
      customer.totalSpent += (order.total || 0)
      
      const orderDate = order.createdAt ? new Date(order.createdAt) : null
      if (orderDate && (!customer.lastOrderDate || orderDate > customer.lastOrderDate)) {
        customer.lastOrderDate = orderDate
      }
    })
    
    return Array.from(customerMap.values()).sort((a, b) => {
      // Sort by last order date (most recent first)
      if (a.lastOrderDate && b.lastOrderDate) {
        return b.lastOrderDate - a.lastOrderDate
      }
      if (a.lastOrderDate) return -1
      if (b.lastOrderDate) return 1
      return 0
    })
  }, [orders])

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    
    const query = searchQuery.toLowerCase().trim()
    return customers.filter(customer => {
      const nameMatch = customer.name?.toLowerCase().includes(query)
      const emailMatch = customer.email?.toLowerCase().includes(query)
      const phoneMatch = customer.phone?.includes(query)
      return nameMatch || emailMatch || phoneMatch
    })
  }, [customers, searchQuery])

  // Export customers to CSV
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      alert('No customers to export')
      return
    }

    // CSV header
    const headers = ['Name', 'Email', 'Phone', 'Order Count', 'Total Spent (Rs)', 'Last Order Date']
    
    // Helper function to escape CSV fields
    const escapeCSV = (field) => {
      if (field === null || field === undefined) return ''
      const str = String(field)
      // If field contains comma, quote, or newline, wrap in quotes and escape quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    // CSV rows
    const rows = filteredCustomers.map(customer => {
      const lastOrderDate = customer.lastOrderDate 
        ? customer.lastOrderDate.toLocaleDateString() 
        : ''
      
      return [
        escapeCSV(customer.name),
        escapeCSV(customer.email),
        escapeCSV(customer.phone),
        escapeCSV(customer.orderCount),
        escapeCSV(customer.totalSpent.toFixed(2)),
        escapeCSV(lastOrderDate)
      ].join(',')
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows
    ].join('\n')

    // Create blob and download
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      link.download = `customers-${timestamp}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export CSV:', error)
      alert('Failed to export CSV. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-neutral-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
                aria-label="Back to admin"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              {restaurant?.logo ? (
                <div className="relative h-8 w-8 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={restaurant.logo}
                    alt={restaurant.name || 'Restaurant Logo'}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="hidden h-8 w-8 rounded-lg bg-neutral-900 text-white items-center justify-center tracking-tight text-sm font-medium select-none">CS</div>
                </div>
              ) : (
                <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center tracking-tight text-sm font-medium select-none">CS</div>
              )}
              <div className="flex flex-col">
                <h1 className="text-[22px] leading-6 tracking-tight font-semibold">Customers</h1>
                <p className="text-xs text-neutral-500">View and manage customer information</p>
              </div>
            </div>
          </div>

          <div className="py-3">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex-1">
                <label className="relative block">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className="block w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-sm"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Users className="w-4 h-4" />
            <span>{filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'}</span>
          </div>
          {filteredCustomers.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-neutral-500">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500">
              {searchQuery ? 'No customers found matching your search.' : 'No customers found.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 text-xs text-neutral-500 bg-neutral-50 border-b border-neutral-200">
              <div className="col-span-3">Customer</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2">Orders</div>
              <div className="col-span-2">Total Spent</div>
            </div>

            {/* Customer List */}
            <div className="divide-y divide-neutral-200">
              {filteredCustomers.map((customer, index) => (
                <div
                  key={`${customer.email || customer.phone || index}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 px-4 py-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {(customer.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-neutral-900 truncate">
                        {customer.name}
                      </div>
                      {customer.lastOrderDate && (
                        <div className="text-xs text-neutral-500">
                          Last order: {customer.lastOrderDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-3 flex items-center gap-2">
                    {customer.email ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm text-neutral-700 truncate">{customer.email}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-400">—</span>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                    {customer.phone ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm text-neutral-700">{customer.phone}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-400">—</span>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <span className="text-sm text-neutral-700 font-medium">{customer.orderCount}</span>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <span className="text-sm text-neutral-900 font-semibold">
                      Rs {customer.totalSpent.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-neutral-200/80 pt-4 text-xs text-neutral-500">
          Tip: Customers are extracted from orders. Search by name, email, or phone number.
        </div>
      </main>
    </div>
  )
}

