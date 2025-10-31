'use client'

import { useState, useEffect } from 'react'
import { Search, RefreshCcw, Plus, LayoutGrid } from 'lucide-react'
import OrderCard from '@/components/Orders/OrderCard'
import { STATUS_STYLES } from '@/constants/orderStyles'

const STATUS_PILLS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Prepared', value: 'prepared' },
  { label: 'Delivering', value: 'delivering' },
  { label: 'Delivered', value: 'delivered' }
]

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleStatusChange = async (orderId, action) => {
    const statusMap = {
      accept: 'accepted',
      prepare: 'preparing',
      prepared: 'prepared',
      deliver: 'delivering',
      delivered: 'delivered',
      decline: 'declined'
    }

    try {
      const newStatus = statusMap[action]
      if (!newStatus) throw new Error('Invalid action')

      const response = await fetch(`/api/orders`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      await loadOrders() // Refresh orders after update
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeStatus === 'all' || order.status === activeStatus
    const matchesSearch = searchQuery === '' || 
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusCounts = () => {
    const counts = { all: orders.length }
    orders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1
    })
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-neutral-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center tracking-tight text-sm font-medium select-none">
                OD
              </div>
              <div className="flex flex-col">
                <h1 className="text-[22px] leading-6 tracking-tight font-semibold">Order Dashboard</h1>
                <p className="text-xs text-neutral-500">Monitor, filter, and manage live orders</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={loadOrders}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>
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
                    placeholder="Search by order #ID or customer name..."
                    className="block w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-sm"
                  />
                </label>
              </div>

              <div className="overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                  {STATUS_PILLS.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setActiveStatus(status.value)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        activeStatus === status.value
                          ? 'bg-neutral-900 text-white border border-neutral-900'
                          : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {status.label}
                      <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                        {statusCounts[status.value] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-neutral-500">All</span>
              <LayoutGrid className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="mt-1 text-2xl tracking-tight font-semibold">
              {statusCounts.all || 0}
            </div>
          </div>
          {STATUS_PILLS.slice(1).map((status) => (
            <div key={status.value} className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-neutral-500">
                  {status.label}
                </span>
                <span className={`h-2 w-2 rounded-full ${
                  STATUS_STYLES[status.value]?.dot || 'bg-neutral-400 ring-neutral-300'
                }`} />
              </div>
              <div className="mt-1 text-2xl tracking-tight font-semibold">
                {statusCounts[status.value] || 0}
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-neutral-500">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-12 text-neutral-500">
              No orders found
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onAction={handleStatusChange}
              />
            ))
          )}
        </section>

        <div className="mt-8 border-t border-neutral-200/80 pt-4 text-xs text-neutral-500">
          Tip: Use the status pills to focus on a stage, and search by #ID or name.
        </div>
      </main>
    </div>
  )
}