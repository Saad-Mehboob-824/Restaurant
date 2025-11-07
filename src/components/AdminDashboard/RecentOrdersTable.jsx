'use client'

function fmtCurrency(v) {
  return v.toLocaleString(undefined, { style: 'currency', currency: 'PKR', maximumFractionDigits: 2 })
}

export default function RecentOrdersTable({ orders = [], menuItems = [], loading }) {
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

  if (loading) return <div className="p-6 text-center text-neutral-500">Loading...</div>
  if (!orders.length) return <div className="p-6 text-center text-neutral-500">No orders</div>

  return (
    <table className="min-w-full text-sm">
      <thead className="bg-neutral-50"><tr className="text-left text-neutral-500"><th className="px-4 py-2 font-medium">Order</th><th className="px-4 py-2 font-medium">Customer</th><th className="px-4 py-2 font-medium">Items</th><th className="px-4 py-2 font-medium">Type</th><th className="px-4 py-2 font-medium">Status</th><th className="px-4 py-2 text-right font-medium">Total</th></tr></thead>
      <tbody className="divide-y divide-neutral-200">
        {orders.slice(0,50).map(o => (
          <tr key={o._id} className="hover:bg-neutral-50 transition-colors"><td className="px-4 py-2"><div className="flex items-center gap-2"><span className="text-neutral-900 font-medium">{o._id}</span></div><div className="text-xs text-neutral-500">{new Date(o.createdAt).toLocaleString()}</div></td><td className="px-4 py-2"><div className="flex items-center gap-2"><div className="h-8 w-8 rounded-md bg-neutral-900 text-white border border-neutral-900 flex items-center justify-center text-[11px] font-medium">{(o.name||'').split(' ').map(n=>n[0]).slice(0,2).join('')}</div><div className="min-w-0"><div className="truncate text-neutral-900 font-medium">{o.name}</div><div className="text-xs text-neutral-500 truncate">{o.email}</div></div></div></td><td className="px-4 py-2"><div className="text-neutral-700 truncate-w-[280px]">{(o.items||[]).map(i=>`${getMenuItemName(i.menuItemId) || i.menuItem || i.name || 'Unknown'} x${i.quantity||1}`).join(', ')}</div></td><td className="px-4 py-2"><span className={`text-xs px-2 py-1 rounded border ${o.type==='pickup' ? 'bg-neutral-100 text-neutral-900 border-neutral-300':'bg-neutral-100 text-neutral-900 border-neutral-300'}`}>{o.type}</span></td><td className="px-4 py-2"><span className="text-xs px-2 py-1 rounded border bg-neutral-900 text-white border-neutral-900">{o.status}</span></td><td className="px-4 py-2 text-right"><span className="text-neutral-900 font-medium">{fmtCurrency(o.total||0)}</span></td></tr>
        ))}
      </tbody>
    </table>
  )
}

