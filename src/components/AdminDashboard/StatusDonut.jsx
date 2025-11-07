'use client'

export default function StatusDonut({ counts = {}, total = 0 }) {
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
    { val: cDelivered, color: 'rgb(0,0,0)' },
    { val: cPending, color: 'rgb(115,115,115)' },
    { val: cCancelled, color: 'rgb(163,163,163)' }
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
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="${stroke}" />
          ${arcs}
          <text x="${cx}" y="${cy-4}" text-anchor="middle" fill="rgb(0,0,0)" font-size="16" font-weight="500">${Math.round((cDelivered/totalSafe)*100)}%</text>
          <text x="${cx}" y="${cy+14}" text-anchor="middle" fill="rgba(0,0,0,0.6)" font-size="11">Delivered</text>
        </svg>
      ` }} />
      <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-neutral-900" /> <span className="text-neutral-700">Delivered</span> <span className="ml-auto text-neutral-500">{counts.delivered||0}</span></div>
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-neutral-500" /> <span className="text-neutral-700">Pending</span> <span className="ml-auto text-neutral-500">{counts.pending||0}</span></div>
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-neutral-400" /> <span className="text-neutral-700">Pickup</span> <span className="ml-auto text-neutral-500">{counts.pickup||0}</span></div>
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-neutral-300" /> <span className="text-neutral-700">Cancelled</span> <span className="ml-auto text-neutral-500">{(counts.cancelled||0)+(counts.refunded||0)}</span></div>
      </div>
    </div>
  )
}

