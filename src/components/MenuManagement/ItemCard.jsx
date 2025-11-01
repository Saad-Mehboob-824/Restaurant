    'use client'

export default function ItemCard({ item, onEdit, onView, onDelete, onToggle }) {
  const img = item.image && item.image.trim() ? item.image : '/fallback-item.jpg';
  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-1 md:grid-cols-12 md:items-center gap-3">
        <div className="md:col-span-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src={img} className="h-12 w-12 rounded-md object-cover border border-neutral-200 shrink-0"/>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{item.name}</div>
              <div className="text-xs text-neutral-500 line-clamp-1">{item.description || ''}</div>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-neutral-200 bg-neutral-50">{item?.category?.name || '—'}</div>
        </div>
        <div className="md:col-span-1 text-sm">Rs {Number(item.price || 0).toFixed(0)}</div>
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <button onClick={() => onToggle?.(item)} aria-pressed={item.isAvailable} className={`relative inline-flex h-6 w-10 items-center rounded-full ${item.isAvailable ? 'bg-neutral-900' : 'bg-neutral-200'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${item.isAvailable ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
            <span className={`text-xs ${item.isAvailable ? 'text-green-700' : 'text-neutral-500'}`}>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
          </div>
        </div>
        <div className="md:col-span-2 text-sm text-neutral-700">{new Date(item.createdAt).toLocaleDateString()}</div>
        <div className="md:col-span-2">
          <div className="flex md:justify-end gap-1.5 flex-wrap">
            <button onClick={() => onView?.(item)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50">View</button>
            <button onClick={() => onEdit?.(item)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50">Edit</button>
            <button onClick={() => onDelete?.(item)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-red-200 text-red-700 bg-white hover:bg-red-50">Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}
