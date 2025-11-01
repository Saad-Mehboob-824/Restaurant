'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import OrderCard from '@/components/Orders/OrderCard'
import { LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, Search, RefreshCw, Clock, LogOut } from 'lucide-react'

function formatDateLabel(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.toLocaleDateString()} — ${e.toLocaleDateString()}`
}

export default function OrdersPage() {
  const [view, setView] = useState('grid') // 'grid' | 'list'
  const [page, setPage] = useState(0) // 0 = most recent 30 days
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  // Filter UI state
  const [searchQ, setSearchQ] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState(new Set())
  const [dateFromInput, setDateFromInput] = useState('')
  const [dateToInput, setDateToInput] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [sortMode, setSortMode] = useState('newest')
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const STATUS_LIST = ['all','pending','accepted','preparing','prepared','delivering','delivered','declined','paid','processing','shipped','cancelled','refunded']

  // compute start/end dates for current page window (30-day windows)
  const { startDateISO, endDateISO, label } = useMemo(() => {
    const now = new Date()
    // normalize to local date boundaries
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    // subtract page*30 days to move window back
    end.setDate(end.getDate() - (page * 30))
    const start = new Date(end)
    start.setDate(end.getDate() - 29) // 30-day window inclusive

    // Create a YYYY-MM-DD string using local date components to avoid
    // timezone shifts caused by toISOString() converting local midnight to UTC day.
    const toISO = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    return {
      startDateISO: toISO(start),
      endDateISO: toISO(end),
      label: formatDateLabel(start, end)
    }
  }, [page])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const startParam = encodeURIComponent(`${startDateISO}T00:00:00`)
      const endParam = encodeURIComponent(`${endDateISO}T23:59:59.999`)
      const url = `/api/orders/history?startDate=${startParam}&endDate=${endParam}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [startDateISO, endDateISO])

  useEffect(() => {
    let mounted = true
    if (mounted) loadOrders()
    return () => { mounted = false }
  }, [loadOrders])

  const handlePrev = () => setPage(p => p + 1)
  const handleNext = () => setPage(p => Math.max(0, p - 1))

  const onAction = async (orderId, action) => {
    // delegate to existing API to update order status
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: action })
      })
      // refresh
      await loadOrders()
    } catch (e) {
      console.error('Action failed', e)
    }
  }

  const handleRefresh = () => loadOrders()

  // Toggle status selection
  const toggleStatus = (s) => {
    setSelectedStatuses(prev => {
      const copy = new Set(prev)
      if (s === 'all') {
        return new Set()
      }
      if (copy.has(s)) copy.delete(s)
      else copy.add(s)
      return copy
    })
  }

  const resetFilters = () => {
    setSearchQ('')
    setSelectedStatuses(new Set())
    setDateFromInput('')
    setDateToInput('')
    setAmountMin('')
    setAmountMax('')
    setSortMode('newest')
  }

  // Derived filtered + sorted orders
  const filteredOrders = useMemo(() => {
    const q = (searchQ || '').trim().toLowerCase()
    const min = amountMin === '' ? null : Number(amountMin)
    const max = amountMax === '' ? null : Number(amountMax)
    const from = dateFromInput ? new Date(dateFromInput + 'T00:00:00') : null
    const to = dateToInput ? new Date(dateToInput + 'T23:59:59.999') : null

    let list = (orders || []).filter(o => {
      // status
      if (selectedStatuses.size > 0) {
        if (!selectedStatuses.has((o.status || '').toLowerCase())) return false
      }
      // date
      const created = o.createdAt ? new Date(o.createdAt) : null
      if (from && created && created < from) return false
      if (to && created && created > to) return false
      // amount
      const amt = Number(o.total || 0)
      if (min !== null && amt < min) return false
      if (max !== null && amt > max) return false
      // search
      if (q) {
        const id = (o._id || '').toString().toLowerCase()
        const name = (o.name || '').toLowerCase()
        if (!id.includes(q) && !name.includes(q)) return false
      }
      return true
    })

    // sorting
    list.sort((a, b) => {
      switch (sortMode) {
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt)
        case 'amount-high': return (b.total || 0) - (a.total || 0)
        case 'amount-low': return (a.total || 0) - (b.total || 0)
        case 'name-az': return (a.name || '').localeCompare(b.name || '')
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

    return list
  }, [orders, searchQ, selectedStatuses, dateFromInput, dateToInput, amountMin, amountMax, sortMode])

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4">
          <div className="mx-auto max-w-7xl px-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center tracking-tight text-sm font-medium select-none">OD</div>
                <div className="flex flex-col">
                  <h1 className="text-[22px] leading-6 tracking-tight font-semibold">Order Dashboard</h1>
                  <p className="text-xs text-neutral-500">Monitor, filter, and manage live orders</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-colors"><RefreshCw className="w-4 h-4"/> Refresh</button>
                <button className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-colors"><Clock className="w-4 h-4"/> History</button>
                <button onClick={async ()=>{ try { await fetch('/api/auth/logout', {method:'POST', credentials: 'same-origin'}); } catch(e){ console.error('Logout request failed', e) } finally { window.location.href='/login' } }} className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-red-700 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors"><LogOut className="w-4 h-4"/> Logout</button>
              </div>

              <div className="md:hidden relative">
                <button onClick={() => setShowMobileMenu(v => !v)} className="inline-flex items-center gap-2 rounded-lg p-2 text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50"><i className="w-5 h-5">≡</i></button>
                {showMobileMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-neutral-200 rounded-md shadow-lg z-50">
                    <button onClick={handleRefresh} className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50">Refresh</button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50">History</button>
                    <button onClick={async ()=>{ try { await fetch('/api/auth/logout', {method:'POST', credentials: 'same-origin'}); } catch(e){ console.error('Logout request failed', e) } finally { window.location.href='/login' } }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            </div>

            <div className="py-3">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex-1">
                  <label className="relative block">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 pointer-events-none"><Search className="w-4 h-4"/></span>
                    <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} id="global-search" type="text" placeholder="Search by order #ID or customer name..." className="block w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-sm" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div className="inline-flex items-center gap-2">
                <span className="text-sm text-neutral-500">View</span>
                <div className="inline-flex rounded-lg border border-neutral-200 overflow-hidden">
                  <button onClick={()=>setView('grid')} id="btn-grid" className={`px-3 py-1.5 text-sm inline-flex items-center gap-1.5 ${view==='grid' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700'}`}><LayoutGrid className="w-4 h-4"/> Grid</button>
                  <button onClick={()=>setView('list')} id="btn-list" className={`px-3 py-1.5 text-sm inline-flex items-center gap-1.5 ${view==='list' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700'}`}><ListIcon className="w-4 h-4"/> List</button>
                </div>
              </div>

              <div className="inline-flex items-center gap-2">
                <span className="text-sm text-neutral-500">Sort</span>
                <label className="relative">
                  <select value={sortMode} onChange={e=>setSortMode(e.target.value)} id="sort-select" className="appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-1.5 pr-8 text-sm text-neutral-700 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="amount-high">Amount: High to Low</option>
                    <option value="amount-low">Amount: Low to High</option>
                    <option value="name-az">Customer: A → Z</option>
                  </select>
                  <i className="pointer-events-none w-4 h-4 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2">▾</i>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-neutral-500"><span id="results-count" className="font-medium text-neutral-800">{loading ? '...' : filteredOrders ? filteredOrders.length : 0}</span> results</div>
                <button onClick={resetFilters} id="reset-filters" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200">Reset</button>
              </div>
            </div>

            <div className="h-px bg-neutral-200/80"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5">
                <div className="text-sm text-neutral-500 mb-2">Status</div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_LIST.map(s => (
                    <button key={s} data-status={s} onClick={() => toggleStatus(s)} className={`status-chip text-sm ${s==='all' ? (selectedStatuses.size===0 ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700') : (selectedStatuses.has(s) ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700')} px-3 py-1.5 rounded-lg border border-neutral-200`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="text-sm text-neutral-500 mb-2">Date range</div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block"><input value={dateFromInput} onChange={e=>setDateFromInput(e.target.value)} id="date-from" type="date" className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700"/></label>
                  <label className="block"><input value={dateToInput} onChange={e=>setDateToInput(e.target.value)} id="date-to" type="date" className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700"/></label>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="text-sm text-neutral-500 mb-2">Amount</div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Rs</span><input value={amountMin} onChange={e=>setAmountMin(e.target.value)} id="amount-min" type="number" min="0" step="0.01" placeholder="Min" className="w-full rounded-lg border border-neutral-200 bg-white pl-6 pr-3 py-1.5 text-sm text-neutral-700"/></label>
                  <label className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">Rs</span><input value={amountMax} onChange={e=>setAmountMax(e.target.value)} id="amount-max" type="number" min="0" step="0.01" placeholder="Max" className="w-full rounded-lg border border-neutral-200 bg-white pl-6 pr-3 py-1.5 text-sm text-neutral-700"/></label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        {/* Grid view */}
        <div className={`${view !== 'grid' ? 'hidden' : ''} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`}>
          {filteredOrders.map(o => (
            <OrderCard key={o._id} order={o} onAction={onAction} />
          ))}
        </div>

        {/* List view */}
        <div className={`${view !== 'list' ? 'hidden' : ''} divide-y divide-neutral-200 bg-white rounded-xl border border-neutral-200 overflow-hidden`}>
          {/* header row */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-neutral-50 text-xs text-neutral-500">
            <div className="col-span-4">Customer</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {filteredOrders.map(o => (
            <div key={o._id} className="grid grid-cols-12 gap-3 items-center px-4 py-3">
              <div className="col-span-12 md:col-span-4">
                <div className="font-medium text-neutral-900 truncate">{o.name || '—'}</div>
                <div className="text-xs text-neutral-500">#{o._id?.toString().slice(-8)}</div>
                {/* linear tab showing products (collapsed by default) */}
                <details className="mt-2">
                  <summary className="text-sm text-neutral-600 cursor-pointer">Products ({(o.items || []).length})</summary>
                  <div className="mt-2 text-sm text-neutral-700">
                    <ul className="list-disc pl-5">
                      {(o.items || []).map((it, i) => (
                        <li key={i} className="truncate">{it.menuItem} × {it.quantity} — Rs {Number(it.price || 0).toFixed(0)}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              </div>

              <div className="col-span-6 md:col-span-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-50 text-neutral-700 border border-neutral-200">{(o.status || '').charAt(0).toUpperCase() + (o.status || '').slice(1)}</span>
              </div>

              <div className="col-span-6 md:col-span-2 font-medium text-neutral-900">Rs {Number(o.total || 0).toFixed(0)}</div>

              <div className="col-span-8 md:col-span-3 text-sm text-neutral-600">{new Date(o.createdAt).toLocaleString()}</div>

              <div className="col-span-4 md:col-span-1 flex justify-end">
                <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-700">Print</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-neutral-500">Showing {filteredOrders.length} orders</div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setPage(0) }} className="text-sm text-neutral-600 underline">Go to most recent</button>
            <div className="text-sm text-neutral-500">Page {page + 1}</div>
          </div>
        </div>
      </div>
    </div>
  )
}