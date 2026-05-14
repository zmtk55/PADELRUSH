import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, User, Trophy, TrendingUp } from 'lucide-react'

/**
 * MiniChart — Gráfica animada compacta para cards de jugador.
 * Soporta tipo "bar" (Victorias/Derrotas) y "radar" (stats generales).
 */
export function MiniChart({ data, type = 'bar', size = 80 }) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-muted/50"
        style={{ width: size, height: size * 0.6 }}
      >
        <p className="text-[10px] text-muted-foreground">Sin datos</p>
      </div>
    )
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1)
  const barWidth = size * 0.7
  const barGap = 6
  const barCount = data.length
  const totalBarsWidth = barCount * 10 + (barCount - 1) * barGap
  const startX = (barWidth - totalBarsWidth) / 2

  if (type === 'bar') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className="relative rounded-t bg-background"
          style={{ width: barWidth + 16, height: size * 0.5 }}
        >
          {data.map((d, i) => {
            const barHeight = Math.max(((d.value / maxVal) * size * 0.45), 4)
            return (
              <motion.div
                key={d.label}
                className="absolute bottom-0 rounded-t-[2px]"
                style={{
                  left: startX + i * (10 + barGap),
                  width: 10,
                  height: barHeight,
                  backgroundColor: d.color || 'var(--primary)',
                }}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: barHeight, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
              />
            )
          })}
        </div>
        <div className="flex gap-[6px] mt-1">
          {data.map((d) => (
            <span key={d.label} className="text-[8px] text-muted-foreground">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'radar') {
    const center = size / 2
    const radius = size * 0.35
    const levels = 3

    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Grid circles */}
        {Array.from({ length: levels }, (_, l) => {
          const r = ((l + 1) / levels) * radius
          return (
            <div
              key={l}
              className="absolute border border-muted/20 rounded-full"
              style={{
                width: r * 2,
                height: r * 2,
                left: center - r,
                top: center - r,
              }}
            />
          )
        })}

        {/* Axis lines */}
        {data.map((d, i) => {
          const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2
          const x2 = center + Math.cos(angle) * radius
          const y2 = center + Math.sin(angle) * radius
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="var(--border)"
              strokeWidth="0.5"
              className="opacity-30"
            />
          )
        })}

        {/* Data polygon */}
        <motion.svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <polygon
            points={data
              .map((d, i) => {
                const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2
                const r = (d.value / 100) * radius
                return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`
              })
              .join(' ')}
            fill="var(--primary)"
            fillOpacity={0.15}
            stroke="var(--primary)"
            strokeWidth="1.5"
          />
          {data.map((d, i) => {
            const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2
            const r = (d.value / 100) * radius
            return (
              <circle
                key={`dot-${i}`}
                cx={center + Math.cos(angle) * r}
                cy={center + Math.sin(angle) * r}
                r="2.5"
                fill="var(--primary)"
              />
            )
          })}
        </motion.svg>

        {/* Labels */}
        {data.map((d, i) => {
          const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2
          const labelR = radius + 10
          const x = center + Math.cos(angle) * labelR
          const y = center + Math.sin(angle) * labelR
          return (
            <span
              key={`label-${i}`}
              className="absolute text-[7px] text-muted-foreground whitespace-nowrap"
              style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {d.label}
            </span>
          )
        })}
      </div>
    )
  }

  return null
}