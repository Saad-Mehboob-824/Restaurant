'use client'

function fmtCurrency(v) {
  return v.toLocaleString(undefined, { style: 'currency', currency: 'PKR', maximumFractionDigits: 2 })
}

export default function DashboardStats({ revenue, orders, aov, deliveredRate, estimatedProfit, isDesktop }) {
  return (
    <section className={isDesktop ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6' : 'grid grid-cols-1 gap-4 mb-6'}>
      <div className="rounded-xl bg-white border border-neutral-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-500 uppercase tracking-wide">Total Earned</div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-semibold text-neutral-900">{fmtCurrency(revenue || 0)}</div>
        <div className="mt-1 text-xs text-neutral-500">Estimated profit {fmtCurrency(estimatedProfit || 0)}</div>
      </div>

      <div className="rounded-xl bg-white border border-neutral-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-500 uppercase tracking-wide">Orders</div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-semibold text-neutral-900">{orders || 0}</div>
        <div className="mt-1 text-xs text-neutral-500">Total orders in selected period</div>
      </div>

      <div className="rounded-xl bg-white border border-neutral-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-500 uppercase tracking-wide">Avg Order Value</div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-semibold text-neutral-900">{fmtCurrency(aov || 0)}</div>
        <div className="mt-1 text-xs text-neutral-500">Avg in selected period</div>
      </div>

      <div className="rounded-xl bg-white border border-neutral-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-500 uppercase tracking-wide">Delivered Rate</div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-semibold text-neutral-900">{Math.round(deliveredRate) || 0}%</div>
        <div className="mt-1 text-xs text-neutral-500">Completed orders / total</div>
      </div>
    </section>
  )
}

