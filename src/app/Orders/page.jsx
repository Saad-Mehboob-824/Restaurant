'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Search, RefreshCcw, Plus, LayoutGrid, Clock, Menu } from 'lucide-react'
import OrderCard from '@/components/Orders/OrderCard'
import { STATUS_STYLES } from '@/constants/orderStyles'
import { useWebSocket } from '@/hooks/useWebSocket'

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
      const data = await fetchOrdersRaw()
      if (data) {
        setOrders(data)
        // update last ids snapshot
        lastIdsRef.current = new Set(data.map(o => o._id))
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // low-level fetch used by polling/broadcast handlers
  const fetchOrdersRaw = useCallback(async () => {
    try {
      const response = await fetch('/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      return data
    } catch (e) {
      console.error('fetchOrdersRaw error', e)
      return null
    }
  }, [])

  // Setup BroadcastChannel + polling to receive live updates from server and other tabs
  // Tab instance id so we can ignore our own broadcasts when appropriate
  const tabId = useMemo(() => {
    try { return crypto.randomUUID() } catch (e) { return `${Date.now()}-${Math.random()}` }
  }, [])

  // BroadcastChannel to sync between tabs
  const bcRef = useRef(null)
  // Keep last known ids to detect newly added orders
  const lastIdsRef = useRef(new Set())
  // Poll interval ref so we can clear it
  const pollRef = useRef(null)

  // Play a short beep via WebAudio (more likely to play without being blocked)
  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      g.gain.value = 0.001
      o.connect(g)
      g.connect(ctx.destination)
      const now = ctx.currentTime
      g.gain.setValueAtTime(0.001, now)
      g.gain.exponentialRampToValueAtTime(0.2, now + 0.02)
      o.start(now)
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      o.stop(now + 0.36)
      // close context shortly after
      setTimeout(() => { try { ctx.close() } catch (e) {} }, 500)
    } catch (e) {
      // fallback: try simple Audio with short base64 beep (optional)
    }
  }, [])
  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback(async (data) => {
    if (!data || !data.type) return

    try {
      switch (data.type) {
        case 'order:added':
          if (data.order) {
            setOrders(prev => {
              // avoid duplicates
              if (prev.some(o => o._id === data.order._id)) return prev
              const newOrders = [...prev, data.order]
              lastIdsRef.current = new Set(newOrders.map(o => o._id))
              if (activeStatus === 'all' || data.order.status === activeStatus) {
                playNotificationSound()
              }
              return newOrders
            })
            // broadcast to other tabs
            try { if (bcRef.current) bcRef.current.postMessage({ type: 'order:added', order: data.order, sourceTab: tabId }) } catch (e) {}
          }
          break

        case 'order:status-changed': {
          const { orderId, status } = data
          setOrders(prev => {
            const newOrders = prev.map(o => o._id === orderId ? { ...o, status } : o)
            lastIdsRef.current = new Set(newOrders.map(o => o._id))
            if (activeStatus === 'all' || status === activeStatus) {
              playNotificationSound()
            }
            return newOrders
          })
          try { if (bcRef.current) bcRef.current.postMessage({ type: 'order:status-changed', orderId, status, sourceTab: tabId }) } catch (e) {}
          break
        }

        default:
          break
      }
    } catch (e) {
      console.error('Error handling WebSocket message:', e)
    }
  }, [activeStatus, playNotificationSound, tabId])

  // Handle messages from other tabs (via BroadcastChannel)
  useEffect(() => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bcRef.current = new BroadcastChannel('orders-channel')
        bcRef.current.onmessage = (ev) => {
          const msg = ev.data
          if (!msg || msg.sourceTab === tabId) return // ignore our own broadcasts

          switch (msg.type) {
            case 'order:added':
              if (msg.order) {
                setOrders(prev => {
                  if (prev.some(o => o._id === msg.order._id)) return prev
                  const newOrders = [...prev, msg.order]
                  lastIdsRef.current = new Set(newOrders.map(o => o._id))
                  if (activeStatus === 'all' || msg.order.status === activeStatus) playNotificationSound()
                  return newOrders
                })
              }
              break

            case 'order:status-changed':
              setOrders(prev => {
                const newOrders = prev.map(o => o._id === msg.orderId ? { ...o, status: msg.status } : o)
                lastIdsRef.current = new Set(newOrders.map(o => o._id))
                if (activeStatus === 'all' || msg.status === activeStatus) playNotificationSound()
                return newOrders
              })
              break

            default:
              break
          }
        }
      }
    } catch (e) {
      console.warn('BroadcastChannel not available:', e)
    }

    return () => {
      try { if (bcRef.current) bcRef.current.close() } catch (e) {}
      bcRef.current = null
    }
  }, [tabId, activeStatus, playNotificationSound])

  // Initialize WebSocket connection with increased retry attempts
  const { send } = useWebSocket(handleWebSocketMessage, {
    onOpen: () => {
      console.log('WebSocket connected')
      loadOrders() // Load initial data when connected
    },
    onClose: () => console.log('WebSocket disconnected'),
    onError: (error) => console.error('WebSocket error:', error),
    autoReconnect: true,
    maxReconnectAttempts: 20,
    reconnectInterval: 1000
  })

  // Store send function in a ref so handleStatusChange can access latest version
  const sendRef = useRef(send)
  useEffect(() => {
    sendRef.current = send
  }, [send])

  // Load initial data
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

      // Notify server about status change via WebSocket
      try {
        sendRef.current({
          type: 'order:status-changed',
          orderId,
          status: newStatus,
          token: 'your-auth-token', // Replace with actual auth token
          timestamp: Date.now()
        })
      } catch (e) {
        console.error('Failed to send WebSocket message:', e)
      }
      // Also broadcast locally to other tabs so they update immediately
      try {
        if (bcRef.current) {
          bcRef.current.postMessage({ type: 'order:status-changed', orderId, status: newStatus, sourceTab: tabId })
        }
      } catch (e) {
        // ignore
      }
      // HTTP fallback: notify WS server via its absolute URL so it broadcasts to all connected clients
      try {
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
        const wsBroadcastUrl = `${protocol}//localhost:3002/internal/ws/broadcast`
        fetch(wsBroadcastUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'order:status-changed', orderId, status: newStatus, sourceTab: tabId })
        }).then(res => {
          if (!res.ok) console.warn('HTTP broadcast to WS server failed')
        }).catch(err => console.warn('HTTP broadcast error', err))
      } catch (e) {
        console.warn('Failed to POST broadcast to WS server:', e)
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
    if (!matchesStatus || !matchesSearch) return false

    // If viewing Delivered orders, only show orders from today
    if (activeStatus === 'delivered') {
      try {
        const created = new Date(order.createdAt)
        const now = new Date()
        if (
          created.getFullYear() !== now.getFullYear() ||
          created.getMonth() !== now.getMonth() ||
          created.getDate() !== now.getDate()
        ) {
          return false
        }
      } catch (e) {
        // If createdAt is invalid, skip the order from delivered list
        return false
      }
    }

    return true
  })

  const getStatusCounts = () => {
    const counts = { all: orders.length }
    orders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1
    })
    return counts
  }

  const statusCounts = getStatusCounts()
  const [showCardIcons, setShowCardIcons] = useState(true)

  // Mobile menu component defined inside OrdersPage so it can access handlers
  function MobileMenu() {
    const [open, setOpen] = useState(false)
    return (
      <div className="relative">
        <button
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className="inline-flex items-center gap-2 rounded-lg p-2 text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50"
        >
          <Menu className="w-5 h-5" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-white border border-neutral-200 rounded-md shadow-lg z-50">
            <button
              onClick={() => { setOpen(false); loadOrders() }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Refresh
            </button>
            <button
              onClick={() => { setOpen(false); window.location.href = '/Orders/history' }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
            >
              History
            </button>
            <button
              onClick={async () => {
                setOpen(false)
                try {
                  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
                } catch (e) {
                  console.error('Logout request failed', e)
                } finally {
                  window.location.href = '/84588878l00o00g00i00n76580982'
                }
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
                    
        )}
      </div>
    )
  }

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

              {/* History placeholder button - navigates to /Orders/history when route is added */}
              <button
                onClick={() => { window.location.href = '/Orders/history' }}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-colors"
              >
                <Clock className="w-4 h-4" />
                History
              </button>
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
                  } catch (e) {
                    console.error('Logout request failed', e)
                  } finally {
                    // Force navigation to login page which will require fresh auth
                    window.location.href = '/84588878l00o00g00i00n76580982'
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-red-700 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors"
              >
                Logout
              </button>
            </div>
            <div className="md:hidden relative">
              <MobileMenu />
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
              <span className="w-4 h-4" />
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