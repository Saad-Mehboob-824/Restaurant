'use client'

function fmtCurrency(v) {
  return v.toLocaleString(undefined, { style: 'currency', currency: 'PKR', maximumFractionDigits: 2 })
}

export default function TopItems({ topItems = [] }) {
  return (
    <div className="p-2">
      {topItems.length === 0 ? (
        <div className="p-4 text-sm text-neutral-500">No data</div>
      ) : (
        topItems.map(([name, v], idx) => (
          <div key={name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
            <div className="h-8 w-8 rounded-md bg-neutral-900 text-white flex items-center justify-center text-xs font-medium">{idx+1}</div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-neutral-900 font-medium">{name}</div>
              <div className="text-xs text-neutral-500">{String(v.qty)} sold</div>
            </div>
            <div className="text-sm text-neutral-900 font-medium">{fmtCurrency(v.revenue)}</div>
          </div>
        ))
      )}
    </div>
  )
}

