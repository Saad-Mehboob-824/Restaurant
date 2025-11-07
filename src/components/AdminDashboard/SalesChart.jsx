'use client'

function fmtCurrency(v) {
  return v.toLocaleString(undefined, { style: 'currency', currency: 'PKR', maximumFractionDigits: 2 })
}

export default function SalesChart({ series }) {
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
            <stop offset="0%" stopColor="rgb(0,0,0)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity="0" />
          </linearGradient>
          <filter id="soft2"><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/></filter>
        </defs>
        {[0,1,2,3].map(i => {
          const y = pad + (i/3) * (h - pad*2)
          return <line key={i} x1={pad} y1={y} x2={w-pad} y2={y} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
        })}
        <path d={areaPath} fill="url(#grad2)" />
        <path d={linePath} stroke="rgb(0,0,0)" strokeWidth="2" fill="none" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2.2" fill="rgb(0,0,0)" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5">
            <title>{fmtCurrency(p[2])}</title>
          </circle>
        ))}
      </svg>
    </div>
  )
}

