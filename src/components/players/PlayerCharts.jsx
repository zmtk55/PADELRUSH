import { motion } from 'framer-motion'

export function PerformanceRadar({ stats }) {
  const data = [
    { label: 'Victorias', value: stats.winRate / 100, color: '#c96442' },
    { label: 'Sets', value: stats.setsWon / (stats.setsWon + stats.setsLost || 1), color: '#059669' },
    { label: 'Consistencia', value: 0.7 + Math.random() * 0.3, color: '#7c3aed' },
    { label: 'Rendimiento', value: 0.5 + Math.random() * 0.5, color: '#0891b2' },
    { label: 'Participación', value: Math.min(stats.matches / 10, 1), color: '#dc2626' },
  ]

  const size = 120
  const center = size / 2
  const maxRadius = 45

  const points = data.map((d, i) => {
    const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2
    const radius = d.value * maxRadius
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    }
  })

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="font-heading font-black text-sm uppercase mb-4">Radar de Rendimiento</h3>
      <div className="flex justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {[0.25, 0.5, 0.75, 1].map((r, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={r * maxRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted-foreground/30"
            />
          ))}
          <motion.path
            d={pathData}
            fill="rgba(201, 100, 66, 0.2)"
            stroke="#c96442"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill={data[i].color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            />
          ))}
        </svg>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function WinRateChart({ history }) {
  const data = history || [
    { week: 'Ene 1', winRate: 60 },
    { week: 'Ene 2', winRate: 65 },
    { week: 'Ene 3', winRate: 55 },
    { week: 'Ene 4', winRate: 70 },
    { week: 'Ene 5', winRate: 75 },
    { week: 'Ene 6', winRate: 80 },
  ]

  const max = Math.max(...data.map(d => d.winRate))
  const min = Math.min(...data.map(d => d.winRate))
  const range = max - min || 1

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="font-heading font-black text-sm uppercase mb-4">Tendencia de Victoria</h3>
      <div className="h-24 flex items-end gap-1">
        {data.map((d, i) => {
          const height = ((d.winRate - min) / range) * 80 + 10
          return (
            <motion.div
              key={i}
              className="flex-1 bg-primary/80 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <div className="opacity-0 hover:opacity-100 text-[8px] text-center pt-1 text-primary-foreground">
                {d.winRate}%
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <span key={i} className="text-[8px] text-muted-foreground">{d.week}</span>
        ))}
      </div>
    </div>
  )
}

export function SetsChart({ setsWon, setsLost }) {
  const total = setsWon + setsLost
  const wonPct = total > 0 ? (setsWon / total) * 100 : 50
  const lostPct = 100 - wonPct

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="font-heading font-black text-sm uppercase mb-4">Ratio Sets</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted-foreground/20"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              strokeDasharray={`${wonPct} ${lostPct}`}
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: `${wonPct} ${lostPct}` }}
              transition={{ duration: 0.8 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-heading font-black text-emerald-500">{wonPct.toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-emerald-500">Ganados</span>
            <span className="font-heading font-black">{setsWon}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-400">Perdidos</span>
            <span className="font-heading font-black">{setsLost}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${wonPct}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}