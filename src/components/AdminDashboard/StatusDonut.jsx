'use client'

export default function StatusDonut({ counts = {}, total = 0 }) {
  const statusData = [
    { label: 'Pending', key: 'pending', color: 'rgb(115,115,115)' },
    { label: 'Accepted', key: 'accepted', color: 'rgb(100,100,100)' },
    { label: 'Preparing', key: 'preparing', color: 'rgb(85,85,85)' },
    { label: 'Prepared', key: 'prepared', color: 'rgb(70,70,70)' },
    { label: 'Delivering', key: 'delivering', color: 'rgb(55,55,55)' },
    { label: 'Delivered', key: 'delivered', color: 'rgb(0,0,0)' }
  ]

  const size = 140
  const stroke = 12
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const C = 2 * Math.PI * r
  const totalSafe = total || 1

  const segs = statusData.map(s => ({
    ...s,
    val: counts[s.key] || 0
  }))

  let offset = 0
  const arcs = segs.map(s => {
    const frac = s.val / totalSafe
    const len = C * frac
    const dash = `${len} ${C - len}`
    const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-dasharray="${dash}" stroke-dashoffset="${offset}" stroke-linecap="round" />`
    offset -= len
    return el
  }).join('')

  const deliveredCount = counts.delivered || 0
  const deliveredPercent = Math.round((deliveredCount / totalSafe) * 100)

  return (
    <div className="w-full">
      {/* Chart Container */}
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        {/* Donut Chart */}
        <div className="flex-shrink-0 h-36 w-36 sm:h-40 sm:w-40" dangerouslySetInnerHTML={{ __html: `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="${stroke}" />
            ${arcs}
            <text x="${cx}" y="${cy-4}" text-anchor="middle" fill="rgb(0,0,0)" font-size="16" font-weight="600">${deliveredPercent}%</text>
            <text x="${cx}" y="${cy+10}" text-anchor="middle" fill="rgba(0,0,0,0.6)" font-size="11">Delivered</text>
          </svg>
        ` }} />

        {/* Legend - Vertical Stack */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {statusData.map((status) => (
            <div key={status.key} className="flex items-center gap-2.5 px-2 py-1.5">
              <span 
                className="h-3 w-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: status.color }}
              />
              <span className="text-neutral-700 text-xs sm:text-sm truncate">{status.label}</span>
              <span className="ml-auto text-neutral-600 text-xs sm:text-sm font-semibold">{counts[status.key] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

