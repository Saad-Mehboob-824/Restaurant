'use client'

import { useState } from 'react'
import { Clock, MapPin, ShoppingBag, Home } from 'lucide-react'
import { STATUS_STYLES } from '@/constants/orderStyles'


export default function OrderCard({ order, onAction, menuItems = [] }) {
  const [loading, setLoading] = useState(false)
  // Defensive: ensure we always have a style object even for unknown statuses
  const style = STATUS_STYLES[order.status] || { dot: 'bg-neutral-400 ring-neutral-300' }

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

  const formatReceiptText = (order) => {
    const lines = []
    const id = order._id?.$oid || order._id || ''
    const created = order.createdAt ? new Date(order.createdAt).toLocaleString() : ''

    lines.push('   *** My Restaurant ***')
    lines.push('')
    lines.push(`Order ID: ${id}`)
    lines.push(`Date: ${created}`)
    lines.push('')
    lines.push(`Name: ${order.name || ''}`)
    lines.push(`Phone: ${order.phone || ''}`)
    if (order.address) lines.push(`Address: ${order.address}`)
    lines.push(`Type: ${order.type || order.orderType || 'delivery'}`)
    lines.push('')
  lines.push('-------------------------------');

  ;(order.items || []).forEach(item => {
      const qty = item.quantity?.$numberInt || item.quantity || 1
      const price = item.price?.$numberInt || item.price || 0
      const name = item.menuItem || getMenuItemName(item.menuItemId)
      const variant = item.variant || ''
      const line = variant 
        ? `${name} (${variant}) x${qty}  ${formatPrice(price * qty)}`
        : `${name} x${qty}  ${formatPrice(price * qty)}`
      lines.push(line)
      // sides (if any)
      if (item.selectedSides && item.selectedSides.length) {
        item.selectedSides.forEach(s => {
          const sideName = s.sideName || s.name || s
          lines.push(`  - ${sideName}`)
        })
      }
    })

    lines.push('-------------------------------')
    lines.push(`TOTAL: ${formatPrice(order.total)}`)
    lines.push(`Status: ${order.status || ''}`)
    lines.push('')
    lines.push('Thank you for your order!')
    lines.push('')
    return lines.join('\n')
  }

  // Try to send the order to a local Node print server (recommended for direct printing).
  // If the local print server is not available, fall back to opening a print-friendly window
  // and calling window.print() (this will show the print dialog).
  const handlePrint = async () => {
    // Ensure menu items are loaded for proper name lookup
    let itemsToUse = menuItems
    if (!itemsToUse || itemsToUse.length === 0) {
      try {
        const response = await fetch('/api/menu-items?admin=true')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            itemsToUse = result.data
          }
        }
      } catch (err) {
        console.error('Failed to fetch menu items for print:', err)
      }
    }

    const payload = order
    // First attempt: POST to local print server at port 4000
    try {
      const res = await fetch('http://localhost:4000/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        // optionally show some UI feedback
        return
      }
      // if server responded with error, fall through to print window
    } catch (err) {
      // network error or server not running — fall back
    }

  // Fallback: try to open a minimal print window with monospace receipt and call window.print()
  // Create a temporary getMenuItemName function that uses the loaded menuItems
  const getMenuItemNameForPrint = (menuItemId) => {
    if (!menuItemId) return 'Unknown Item'
    
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
      return normalizedMenuItemId
    }
    
    // Look up in menuItems array
    const menuItem = itemsToUse.find(item => {
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
    
    return menuItem?.name || 'Unknown Item'
  }

  // Create a version of formatReceiptText that uses the loaded menu items
  const formatReceiptTextForPrint = (orderToPrint) => {
    const lines = []
    const id = orderToPrint._id?.$oid || orderToPrint._id || ''
    const created = orderToPrint.createdAt ? new Date(orderToPrint.createdAt).toLocaleString() : ''

    lines.push('   *** My Restaurant ***')
    lines.push('')
    lines.push(`Order ID: ${id}`)
    lines.push(`Date: ${created}`)
    lines.push('')
    lines.push(`Name: ${orderToPrint.name || ''}`)
    lines.push(`Phone: ${orderToPrint.phone || ''}`)
    if (orderToPrint.address) lines.push(`Address: ${orderToPrint.address}`)
    lines.push(`Type: ${orderToPrint.type || orderToPrint.orderType || 'delivery'}`)
    lines.push('')
    lines.push('-------------------------------')

    ;(orderToPrint.items || []).forEach(item => {
      const qty = item.quantity?.$numberInt || item.quantity || 1
      const price = item.price?.$numberInt || item.price || 0
      const name = item.menuItem || getMenuItemNameForPrint(item.menuItemId)
      const variant = item.variant || ''
      const line = variant 
        ? `${name} (${variant}) x${qty}  ${formatPrice(price * qty)}`
        : `${name} x${qty}  ${formatPrice(price * qty)}`
      lines.push(line)
      // sides (if any)
      if (item.selectedSides && item.selectedSides.length) {
        item.selectedSides.forEach(s => {
          const sideName = s.sideName || s.name || s
          lines.push(`  - ${sideName}`)
        })
      }
    })

    lines.push('-------------------------------')
    lines.push(`TOTAL: ${formatPrice(orderToPrint.total)}`)
    lines.push(`Status: ${orderToPrint.status || ''}`)
    lines.push('')
    lines.push('Thank you for your order!')
    lines.push('')
    return lines.join('\n')
  }

  const receipt = formatReceiptTextForPrint(order)
    const html = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; white-space: pre-wrap; margin: 10px; }
            @media print {
              @page { margin: 5mm; }
              body { font-size: 12px; }
            }
            /* Width hints for 58mm (~203px) and 80mm (~283px) printers */
            .receipt { width: 210px; max-width: 360px; }
          </style>
        </head>
        <body>
          <div class="receipt">${receipt.replace(/\n/g, '<br/>')}</div>
          <script>
            window.onload = function() {
              setTimeout(() => { window.print(); window.close(); }, 300);
            }
          </script>
        </body>
      </html>
    `

    const w = window.open('', '_blank', 'noopener')
    if (!w) {
      // If popup blocked or not allowed, offer automatic download of the receipt as a text file
      try {
        const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const id = order._id?.$oid || order._id || Date.now()
        a.download = `receipt-${id}.txt`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      } catch (e) {
        console.error('Failed to download receipt', e)
      }
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  // Helper to get menu item name from menuItemId
  const getMenuItemName = (menuItemId) => {
    if (!menuItemId) return 'Unknown Item'
    
    // Normalize menuItemId to string for comparison
    let normalizedMenuItemId = menuItemId
    if (typeof menuItemId === 'object') {
      // Handle MongoDB extended JSON format { $oid: "..." }
      if (menuItemId.$oid) {
        normalizedMenuItemId = menuItemId.$oid
      } else {
        // Try to convert to string
        normalizedMenuItemId = menuItemId.toString?.() || String(menuItemId)
      }
    } else {
      normalizedMenuItemId = String(menuItemId)
    }
    
    // If it's not a 24-character hex string (ObjectId format), assume it's already a name
    if (!normalizedMenuItemId.match(/^[0-9a-fA-F]{24}$/i)) {
      return normalizedMenuItemId
    }
    
    // Look up in menuItems array - try multiple comparison methods
    const menuItem = menuItems.find(item => {
      if (!item) return false
      
      // Try different ID formats
      const itemId = item._id
      if (!itemId) return false
      
      // Normalize item ID
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
      
      // Compare normalized IDs (case-insensitive for ObjectId)
      return normalizedItemId.toLowerCase() === normalizedMenuItemId.toLowerCase()
    })
    
    return menuItem?.name || 'Unknown Item'
  }

  const getItemsSummary = (items) => {
    return items.map(item => {
      const qty = item.quantity?.$numberInt || item.quantity || 1
      const menuItemName = item.menuItem || getMenuItemName(item.menuItemId)
      const mainItem = `${menuItemName}      x${qty}`
      const sides = (item.selectedSides || [])
        .map(side => {
          const sideName = side.sideName || side.name || side
          return `    - ${sideName}`
        })
        .join('\n')
      return sides ? `${mainItem}\n${sides}` : mainItem
    }).join('\n')
  }

  return (
    <article className="order-card rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition" data-status={order.status} data-id={order._id}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-2 w-2 rounded-full ring-1 mt-1 ${style.dot || 'bg-neutral-400 ring-neutral-300'}`} />
          <div>
            <p className="font-medium">Order #{String(order._id || '').slice(-4)}</p>
            <p className="text-xs text-neutral-500">{order.name}</p>
          </div>
        </div>
        <p className="text-xs text-neutral-500">{formatTime(order.createdAt)}</p>
      </div>

      <div className="mt-3 space-y-2">
        <div className="space-y-2">
          {(order.items || []).map((item, idx) => {
            const qty = item.quantity?.$numberInt || item.quantity || 1
            // Use item.name (denormalized) as primary, fallback to lookup
            const menuItemName = item.name || item.menuItem || getMenuItemName(item.menuItemId) || 'Unknown Item'
            const variant = item.variant || ''
            const selectedSides = item.selectedSides || []
            const itemPrice = item.price?.$numberInt || item.price || 0
            
            return (
              <div key={idx} className="flex items-start justify-between text-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-neutral-900">{menuItemName}</span>
                    {variant && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-neutral-900 text-white">
                        {variant}
                      </span>
                    )}
                    <span className="text-neutral-500">x{qty}</span>
                  </div>
                  {selectedSides.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedSides.map((side, sideIdx) => {
                        const sideName = side.sideName || side.name || side
                        return (
                          <span
                            key={sideIdx}
                            className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200"
                          >
                            {sideName}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
                <p className="font-medium text-neutral-900 ml-2">
                  {formatPrice(itemPrice * qty)}
                </p>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
          <p className="font-semibold text-neutral-900">Total</p>
          <p className="font-semibold text-lg text-neutral-900">{formatPrice(order.total)}</p>
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
        {/* Print receipt button */}
        <button
          onClick={handlePrint}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50`}
        >
          Print Receipt
        </button>
      </div>
    </article>
  )
}