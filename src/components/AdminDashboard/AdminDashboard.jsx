 'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function fmtCurrency(v) {
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

function getRange(tf) {
  const now = Date.now()
  if (tf === 'daily') return { start: now - 24 * 60 * 60 * 1000, buckets: 24, step: 60 * 60 * 1000, label: 'hour' }
  if (tf === 'monthly') return { start: now - 30 * 24 * 60 * 60 * 1000, buckets: 30, step: 24 * 60 * 60 * 1000, label: 'day' }
  return { start: now - 7 * 24 * 60 * 60 * 1000, buckets: 7, step: 24 * 60 * 60 * 1000, label: 'day' }
}

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState('weekly')
  const [orders, setOrders] = useState([])
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

  const derived = useMemo(() => {
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

    // top items
    const itemsMap = new Map()
    for (const o of filtered) {
      for (const it of o.items || []) {
        const key = it.menuItem || it.name || 'Unknown'
        const entry = itemsMap.get(key) || { qty: 0, revenue: 0 }
        entry.qty += (it.quantity || 1)
        entry.revenue += (it.price || 0) * (it.quantity || 1)
        itemsMap.set(key, entry)
      }
    }
    const topItems = Array.from(itemsMap.entries()).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 6)

    return { series, revenue, count, aov, deliveredRate, estimatedProfit, counts, topItems }
  }, [orders, timeframe])

  return (
    <div id="app" className="min-h-screen flex bg-[#0b0d12] text-slate-200 font-sans antialiased">
      {/* Sidebar */}
  {showSidebar && !isDesktop && <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setShowSidebar(false)} />}
  <Sidebar isOpen={showSidebar} isDesktop={isDesktop} onClose={() => setShowSidebar(false)} />

{/* Main content area */}
      <div className={`flex-1 flex flex-col ${isDesktop ? 'ml-72' : ''}`}>
  <TopBar onOpenSidebar={() => setShowSidebar(true)} isDesktop={isDesktop} />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-medium">Dashboard</h1>
                <p className="text-sm text-slate-400 mt-1">Analytics and insights from your store</p>
              </div>
              <div className={`inline-flex items-center bg-white/[0.06] border border-white/10 rounded-lg p-1 ${isDesktop ? '' : 'w-full justify-end'}`}>
                {['daily','weekly','monthly'].map(tf => (
                  <button key={tf} onClick={() => setTimeframe(tf)} data-timeframe={tf} className={`px-3 py-1.5 text-sm rounded-md ${timeframe===tf ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                    {tf[0].toUpperCase()+tf.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <section className={isDesktop ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6' : 'grid grid-cols-1 gap-4 mb-6'}>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">Total Earned</div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-medium">{fmtCurrency(derived.revenue || 0)}</div>
                <div className="mt-1 text-xs text-slate-400">Estimated profit {fmtCurrency(derived.estimatedProfit || 0)}</div>
              </div>

              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">Orders</div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-medium">{derived.count || 0}</div>
                <div className="mt-1 text-xs text-slate-400">Total orders in selected period</div>
              </div>

              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">Avg Order Value</div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-medium">{fmtCurrency(derived.aov || 0)}</div>
                <div className="mt-1 text-xs text-slate-400">Avg in selected period</div>
              </div>

              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">Delivered Rate</div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-medium">{Math.round(derived.deliveredRate) || 0}%</div>
                <div className="mt-1 text-xs text-slate-400">Completed orders / total</div>
              </div>
            </section>

            <section className={isDesktop ? 'grid grid-cols-1 xl:grid-cols-12 gap-4' : 'grid grid-cols-1 gap-4'}>
          <div className={isDesktop ? 'xl:col-span-8 rounded-xl bg-white/[0.04] border border-white/10' : 'col-span-full rounded-xl bg-white/[0.04] border border-white/10'}>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Revenue</div>
                    <div className="text-lg font-medium">Sales over time</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400/80"></span> Revenue</span>
                  </div>
                </div>
                <div className="p-4">
                  <SalesChart series={derived.series} />
                </div>
              </div>

              <div className={isDesktop ? 'xl:col-span-4 rounded-xl bg-white/[0.04] border border-white/10' : 'col-span-full rounded-xl bg-white/[0.04] border border-white/10'}>
                <div className="p-4 border-b border-white/10">
                  <div className="text-sm text-slate-400">Fulfillment</div>
                  <div className="text-lg font-medium">Order status</div>
                </div>
                <div className="p-4">
                  <StatusDonut counts={derived.counts} total={derived.count || 0} />
                </div>
              </div>
            </section>

            <section className={isDesktop ? 'grid grid-cols-1 xl:grid-cols-12 gap-4 mt-4' : 'grid grid-cols-1 gap-4 mt-4'}>
          <div className={isDesktop ? 'xl:col-span-4 rounded-xl bg-white/[0.04] border border-white/10' : 'col-span-full rounded-xl bg-white/[0.04] border border-white/10'}>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Menu Performance</div>
                    <div className="text-lg font-medium">Top items</div>
                  </div>
                </div>
                <div className="p-2">
                  {derived.topItems.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400">No data</div>
                  ) : (
                    derived.topItems.map(([name, v], idx) => (
                      <div key={name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03]">
                        <div className="h-8 w-8 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center text-xs text-slate-300">{idx+1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{name}</div>
                          <div className="text-xs text-slate-400">{String(v.qty)} sold</div>
                        </div>
                        <div className="text-sm text-slate-300">{fmtCurrency(v.revenue)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={isDesktop ? 'xl:col-span-8 rounded-xl bg-white/[0.04] border border-white/10 overflow-hidden' : 'col-span-full rounded-xl bg-white/[0.04] border border-white/10 overflow-hidden'}>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Recent Activity</div>
                    <div className="text-lg font-medium">Latest orders</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/admin/Orders" className="h-9 px-3 rounded-md bg-white/[0.06] border border-white/10 text-sm flex items-center">Orders</Link>
                    <Link href="/admin/MenuManagement" className="h-9 px-3 rounded-md bg-white/[0.06] border border-white/10 text-sm flex items-center">Products</Link>
                  </div>
                </div>
                <div className="overflow-auto">
                  <RecentOrdersTable orders={orders.slice(0, 50)} loading={loading} />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

function SalesChart({ series }) {
  const w = 720
  const h = 240
  const pad = 12
  const maxV = Math.max(1, ...series.map(s => s.value))
  const points = series.map((d, i) => {
    const x = pad + (i / (series.length - 1 || 1)) * (w - pad * 2)
    const y = pad + (1 - d.value / maxV) * (h - pad * 2)
    return [x, y, d.value]
  })
  const linePath = points.map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`)).join(' ')
  const areaPath = `M ${points[0][0]},${h - pad} ` + points.map(p => `L ${p[0]},${p[1]}`).join(' ') + ` L ${points[points.length-1][0]},${h - pad} Z`

  return (
    <div style={{ width: '100%' }} className="h-60 w-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0" />
          </linearGradient>
          <filter id="soft2"><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/></filter>
        </defs>
        {[0,1,2,3].map(i => {
          const y = pad + (i/3) * (h - pad*2)
          return <line key={i} x1={pad} y1={y} x2={w-pad} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        })}
        <path d={areaPath} fill="url(#grad2)" />
        <path d={linePath} stroke="rgb(16,185,129)" strokeWidth="2" fill="none" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2.2" fill="rgb(16,185,129)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5">
            <title>{fmtCurrency(p[2])}</title>
          </circle>
        ))}
      </svg>
    </div>
  )
}

function StatusDonut({ counts = {}, total = 0 }) {
  const cDelivered = counts.delivered || 0
  const cPending = counts.pending || 0
  const cCancelled = (counts.cancelled || 0) + (counts.refunded || 0)
  const size = 144
  const stroke = 12
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const C = 2 * Math.PI * r
  const totalSafe = total || 1
  const segs = [
    { val: cDelivered, color: 'rgb(52,211,153)' },
    { val: cPending, color: 'rgb(251,191,36)' },
    { val: cCancelled, color: 'rgb(244,63,94)' }
  ]
  let offset = 0
  const arcs = segs.map(s => {
    const frac = s.val / totalSafe
    const len = C * frac
    const dash = `${len} ${C - len}`
    const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-dasharray="${dash}" stroke-dashoffset="${offset}" stroke-linecap="round" />`
    offset -= len
    return el
  }).join('')

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-36 w-36" dangerouslySetInnerHTML={{ __html: `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${stroke}" />
          ${arcs}
          <text x="${cx}" y="${cy-4}" text-anchor="middle" fill="white" font-size="16" font-weight="500">${Math.round((cDelivered/totalSafe)*100)}%</text>
          <text x="${cx}" y="${cy+14}" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="11">Delivered</text>
        </svg>
      ` }} />
      <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400/80" /> <span className="text-slate-300">Delivered</span> <span className="ml-auto text-slate-400">{counts.delivered||0}</span></div>
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400/80" /> <span className="text-slate-300">Pending</span> <span className="ml-auto text-slate-400">{counts.pending||0}</span></div>
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-400/80" /> <span className="text-slate-300">Pickup</span> <span className="ml-auto text-slate-400">{counts.pickup||0}</span></div>
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-400/80" /> <span className="text-slate-300">Cancelled</span> <span className="ml-auto text-slate-400">{(counts.cancelled||0)+(counts.refunded||0)}</span></div>
      </div>
    </div>
  )
}

function RecentOrdersTable({ orders = [], loading }) {
  if (loading) return <div className="p-6 text-center text-slate-400">Loading...</div>
  if (!orders.length) return <div className="p-6 text-center text-slate-400">No orders</div>

  return (
    <table className="min-w-full text-sm">
      <thead className="bg-white/[0.03]"><tr className="text-left text-slate-400"><th className="px-4 py-2">Order</th><th className="px-4 py-2">Customer</th><th className="px-4 py-2">Items</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Status</th><th className="px-4 py-2 text-right">Total</th></tr></thead>
      <tbody className="divide-y divide-white/10">
        {orders.slice(0,50).map(o => (
          <tr key={o._id} className="hover:bg-white/[0.03]"><td className="px-4 py-2"><div className="flex items-center gap-2"><span className="text-slate-300">{o._id}</span></div><div className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</div></td><td className="px-4 py-2"><div className="flex items-center gap-2"><div className="h-8 w-8 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center text-[11px]">{(o.name||'').split(' ').map(n=>n[0]).slice(0,2).join('')}</div><div className="min-w-0"><div className="truncate">{o.name}</div><div className="text-xs text-slate-500 truncate">{o.email}</div></div></div></td><td className="px-4 py-2"><div className="truncate-w-[280px]">{(o.items||[]).map(i=>`${i.menuItem||i.name} x${i.quantity||1}`).join(', ')}</div></td><td className="px-4 py-2"><span className={`text-xs px-2 py-1 rounded border ${o.type==='pickup' ? 'bg-sky-500/10 text-sky-300 border-sky-400/20':'bg-indigo-500/10 text-indigo-300 border-indigo-400/20'}`}>{o.type}</span></td><td className="px-4 py-2"><span className="text-xs px-2 py-1 rounded border bg-emerald-500/10 text-emerald-300 border-emerald-400/20">{o.status}</span></td><td className="px-4 py-2 text-right"><span className="text-slate-200">{fmtCurrency(o.total||0)}</span></td></tr>
        ))}
      </tbody>
    </table>
  )
}
