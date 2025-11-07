 'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import DashboardStats from './DashboardStats'
import SalesChart from './SalesChart'
import StatusDonut from './StatusDonut'
import TopItems from './TopItems'
import RecentOrdersTable from './RecentOrdersTable'

function getRange(tf) {
  const now = Date.now()
  if (tf === 'daily') return { start: now - 24 * 60 * 60 * 1000, buckets: 24, step: 60 * 60 * 1000, label: 'hour' }
  if (tf === 'monthly') return { start: now - 30 * 24 * 60 * 60 * 1000, buckets: 30, step: 24 * 60 * 60 * 1000, label: 'day' }
  return { start: now - 7 * 24 * 60 * 60 * 1000, buckets: 7, step: 24 * 60 * 60 * 1000, label: 'day' }
}

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState('weekly')
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    function check() {
      try { setIsDesktop(window.innerWidth > 870) } catch (e) { setIsDesktop(true) }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/orders')
        if (!res.ok) throw new Error('Failed to fetch orders')
        const data = await res.json()
        if (mounted) setOrders(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to load orders for admin dashboard', e)
        if (mounted) setOrders([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    async function loadMenuItems() {
      try {
        const res = await fetch('/api/menu-items?admin=true')
        if (!res.ok) throw new Error('Failed to fetch menu items')
        const data = await res.json()
        if (mounted && data.success && data.data) {
          setMenuItems(Array.isArray(data.data) ? data.data : [])
        }
      } catch (e) {
        console.error('Failed to load menu items for admin dashboard', e)
        if (mounted) setMenuItems([])
      }
    }
    loadMenuItems()
    return () => { mounted = false }
  }, [])

  const derived = useMemo(() => {
    // Helper function to resolve menuItemId to menu item name
    const getMenuItemName = (menuItemId) => {
      if (!menuItemId) return 'Unknown'
      
      // Normalize menuItemId to string for comparison
      let normalizedMenuItemId = menuItemId
      if (typeof menuItemId === 'object') {
        if (menuItemId.$oid) {
          normalizedMenuItemId = menuItemId.$oid
        } else {
          normalizedMenuItemId = menuItemId.toString?.() || String(menuItemId)
        }
      } else {
        normalizedMenuItemId = String(menuItemId)
      }
      
      // If it's not a 24-character hex string (ObjectId format), assume it's already a name
      if (!normalizedMenuItemId.match(/^[0-9a-fA-F]{24}$/i)) {
        return normalizedMenuItemId || 'Unknown'
      }
      
      // Look up in menuItems array
      const menuItem = menuItems.find(item => {
        if (!item) return false
        const itemId = item._id
        if (!itemId) return false
        
        let normalizedItemId = itemId
        if (typeof itemId === 'object') {
          if (itemId.$oid) {
            normalizedItemId = itemId.$oid
          } else {
            normalizedItemId = itemId.toString?.() || String(itemId)
          }
        } else {
          normalizedItemId = String(itemId)
        }
        
        return normalizedItemId.toLowerCase() === normalizedMenuItemId.toLowerCase()
      })
      
      return menuItem?.name || 'Unknown'
    }
    const { start, buckets, step, label } = getRange(timeframe)
    const filtered = orders.filter(o => (o.createdAt ? +new Date(o.createdAt) : +o.createdAt || 0) >= start)

    const series = Array.from({ length: buckets }, (_, i) => {
      const t0 = start + i * step
      const t1 = t0 + step
      const bucketOrders = filtered.filter(o => {
        const ts = o.createdAt ? +new Date(o.createdAt) : +o.createdAt || 0
        return ts >= t0 && ts < t1
      })
      const value = bucketOrders.reduce((s, o) => s + (o.total || 0), 0)
      return { t: t0, value }
    })

    const revenue = filtered.reduce((s, o) => s + (o.total || 0), 0)
    const count = filtered.length
    const aov = count ? revenue / count : 0
    const deliveredRate = count ? (filtered.filter(o => o.status === 'delivered').length / count) * 100 : 0
    // estimate profit — repository doesn't have per-item cost, so assume 30% margin
    const estimatedProfit = revenue * 0.3

    // status counts
    const counts = filtered.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {})

    // top items - resolve menuItemId to actual menu item names
    const itemsMap = new Map()
    for (const o of filtered) {
      for (const it of o.items || []) {
        // Try to resolve menuItemId to name, fallback to menuItem (old format) or name
        const menuItemName = getMenuItemName(it.menuItemId) || it.menuItem || it.name || 'Unknown'
        const entry = itemsMap.get(menuItemName) || { qty: 0, revenue: 0 }
        entry.qty += (it.quantity || 1)
        entry.revenue += (it.price || 0) * (it.quantity || 1)
        itemsMap.set(menuItemName, entry)
      }
    }
    const topItems = Array.from(itemsMap.entries()).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 6)

    return { series, revenue, count, aov, deliveredRate, estimatedProfit, counts, topItems }
  }, [orders, timeframe, menuItems])

  return (
    <div id="app" className="min-h-screen flex bg-white text-neutral-900 font-sans antialiased">
      {/* Sidebar */}
  {showSidebar && !isDesktop && <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setShowSidebar(false)} />}
  <Sidebar isOpen={showSidebar} isDesktop={isDesktop} onClose={() => setShowSidebar(false)} />

{/* Main content area */}
      <div className={`flex-1 flex flex-col ${isDesktop ? 'ml-72' : ''}`}>
  <TopBar onOpenSidebar={() => setShowSidebar(true)} isDesktop={isDesktop} />
        <main className="flex-1 p-4 md:p-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">Dashboard</h1>
                <p className="text-sm text-neutral-500 mt-1">Analytics and insights from your store</p>
              </div>
              <div className={`inline-flex items-center bg-white border border-neutral-200 rounded-lg p-1 shadow-sm ${isDesktop ? '' : 'w-full justify-end'}`}>
                {['daily','weekly','monthly'].map(tf => (
                  <button key={tf} onClick={() => setTimeframe(tf)} data-timeframe={tf} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${timeframe===tf ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                    {tf[0].toUpperCase()+tf.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <DashboardStats
              revenue={derived.revenue}
              orders={derived.count}
              aov={derived.aov}
              deliveredRate={derived.deliveredRate}
              estimatedProfit={derived.estimatedProfit}
              isDesktop={isDesktop}
            />

            <section className={isDesktop ? 'grid grid-cols-1 xl:grid-cols-12 gap-4' : 'grid grid-cols-1 gap-4'}>
          <div className={isDesktop ? 'xl:col-span-8 rounded-xl bg-white border border-neutral-200 shadow-sm' : 'col-span-full rounded-xl bg-white border border-neutral-200 shadow-sm'}>
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-neutral-500 uppercase tracking-wide">Revenue</div>
                    <div className="text-lg font-semibold text-neutral-900">Sales over time</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-neutral-900"></span> Revenue</span>
                  </div>
                </div>
                <div className="p-4">
                  <SalesChart series={derived.series} />
                </div>
              </div>

              <div className={isDesktop ? 'xl:col-span-4 rounded-xl bg-white border border-neutral-200 shadow-sm' : 'col-span-full rounded-xl bg-white border border-neutral-200 shadow-sm'}>
                <div className="p-4 border-b border-neutral-200">
                  <div className="text-sm text-neutral-500 uppercase tracking-wide">Fulfillment</div>
                  <div className="text-lg font-semibold text-neutral-900">Order status</div>
                </div>
                <div className="p-4">
                  <StatusDonut counts={derived.counts} total={derived.count || 0} />
                </div>
              </div>
            </section>

            <section className={isDesktop ? 'grid grid-cols-1 xl:grid-cols-12 gap-4 mt-4' : 'grid grid-cols-1 gap-4 mt-4'}>
          <div className={isDesktop ? 'xl:col-span-4 rounded-xl bg-white border border-neutral-200 shadow-sm' : 'col-span-full rounded-xl bg-white border border-neutral-200 shadow-sm'}>
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-neutral-500 uppercase tracking-wide">Menu Performance</div>
                    <div className="text-lg font-semibold text-neutral-900">Top items</div>
                  </div>
                </div>
                <TopItems topItems={derived.topItems} />
              </div>

              <div className={isDesktop ? 'xl:col-span-8 rounded-xl bg-white border border-neutral-200 overflow-hidden shadow-sm' : 'col-span-full rounded-xl bg-white border border-neutral-200 overflow-hidden shadow-sm'}>
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-neutral-500 uppercase tracking-wide">Recent Activity</div>
                    <div className="text-lg font-semibold text-neutral-900">Latest orders</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/admin/Orders" className="h-9 px-3 rounded-md bg-white border border-neutral-200 text-sm flex items-center text-neutral-700 hover:bg-neutral-50 transition-colors">Orders</Link>
                    <Link href="/admin/MenuManagement" className="h-9 px-3 rounded-md bg-white border border-neutral-200 text-sm flex items-center text-neutral-700 hover:bg-neutral-50 transition-colors">Products</Link>
                  </div>
                </div>
                <div className="overflow-auto">
                  <RecentOrdersTable orders={orders.slice(0, 50)} menuItems={menuItems} loading={loading} />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
