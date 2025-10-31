'use client'

import { useState } from 'react'
import { Clock, MapPin, ShoppingBag, Home } from 'lucide-react'
import { STATUS_STYLES } from '@/constants/orderStyles'


export default function OrderCard({ order, onAction }) {
  const [loading, setLoading] = useState(false)
  const style = STATUS_STYLES[order.status]

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatPrice = (price) => {
    return `Rs ${Number(price).toFixed(0)}`
  }

  const handleAction = async (action) => {
    if (loading) return
    setLoading(true)
    try {
      await onAction(order._id, action)
    } finally {
      setLoading(false)
    }
  }

  const getItemsSummary = (items) => {
    return items.map(item => {
      const mainItem = `${item.menuItem}      ${item.quantity}`
      const sides = (item.selectedSides || [])
        .map(side => `    ${side}`)
        .join('\n')
      return sides ? `${mainItem}\n${sides}` : mainItem
    }).join('\n')
  }

  return (
    <article className="order-card rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition" data-status={order.status} data-id={order._id}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-2 w-2 rounded-full ring-1 mt-1 ${style.dot}`} />
          <div>
            <p className="font-medium">Order #{order._id.slice(-4)}</p>
            <p className="text-xs text-neutral-500">{order.name}</p>
          </div>
        </div>
        <p className="text-xs text-neutral-500">{formatTime(order.createdAt)}</p>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-start justify-between text-sm">
          <pre className="text-neutral-700 font-sans whitespace-pre-wrap">{getItemsSummary(order.items)}</pre>
          <p className="font-medium text-neutral-900">{formatPrice(order.total)}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] border border-neutral-200 bg-neutral-50 text-neutral-700">
            <Clock className="w-3 h-3" />
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          {/* Order type badge: pickup | delivery | dinein */}
          <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-neutral-700 bg-white border border-neutral-200">
            {((order.type || order.orderType) || 'delivery') === 'pickup' ? (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                Pickup
              </>
            ) : ((order.type || order.orderType) === 'dinein') ? (
              <>
                <Home className="w-3.5 h-3.5" />
                Dine-in
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5" />
                Delivery
              </>
            )}
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        {style.buttons ? (
          style.buttons.map((btn, i) => (
            <button
              key={i}
              onClick={() => handleAction(btn.action)}
              disabled={loading}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${btn.class}`}
            >
              <btn.icon className="w-3.5 h-3.5" />
              {btn.label}
            </button>
          ))
        ) : style.button ? (
          <button
            onClick={() => handleAction(style.button.action)}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${style.button.class}`}
          >
            <style.button.icon className="w-4 h-4" />
            {style.button.label}
          </button>
        ) : style.completedBadge ? (
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-300">
            <style.completedBadge.icon className="w-4 h-4" />
            {style.completedBadge.label}
          </div>
        ) : null}
      </div>
    </article>
  )
}