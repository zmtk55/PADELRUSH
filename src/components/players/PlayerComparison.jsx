import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, TrendingUp, TrendingDown, Minus, Search, ChevronDown, Swords, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useParticipants } from '@/hooks/useParticipants'
import { usePlayerStats } from '@/hooks/usePlayerStats'

function RadarSVG({ p1Stats, p2Stats, p1Name, p2Name }) {
  const dims = [
    { key: 'winPercentage', label: 'Win Rate', max: 100 },
    { key: 'matchesPlayed', label: 'Partidos', max: 1, calc: (s) => Math.min(s.matchesPlayed * 10, 100) },
    { key: 'setsRatio', label: 'Sets', max: 1, calc: (s) => s.matchesPlayed > 0 ? (s.setsWon / (s.setsWon + s.setsLost)) * 100 : 0 },
    { key: 'gamesRatio', label: 'Juegos', max: 1, calc: (s) => s.matchesPlayed > 0 ? (s.gamesWon / (s.gamesWon + s.gamesLost)) * 100 : 0 },
    { key: 'consistency', label: 'Consistencia', max: 1, calc: (s) => s.matchesPlayed > 0 ? Math.round((1 - Math.abs(s.matchesWon - s.matchesLost) / s.matchesPlayed) * 100) : 0 },
  ]

  const v1 = dims.map(d => d.calc ? d.calc(p1Stats) : p1Stats[d.key])
  const v2 = dims.map(d => d.calc ? d.calc(p2Stats) : p2Stats[d.key])

  const cx = 120, cy = 120, r = 90, sides = dims.length

  const point = (i, value, radius = r) => {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
    const dist = (value / 100) * radius
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  }

  const polygon = (values) =>
    values.map((v, i) => {
      const p = point(i, v)
      return `${p.x},${p.y}`
    }).join(' ')

  const grid = [25, 50, 75, 100].map(pct =>
    dims.map((_, i) => {
      const p = point(i, pct)
      return `${p.x},${p.y}`
    }).join(' ')
  )

  return (
    <svg viewBox="0 0 240 240" className="w-full h-auto max-w-[240px] mx-auto">
      {grid.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth="1" />
      ))}
      {dims.map((_, i) => {
        const p = point(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="currentColor" strokeOpacity={0.1} strokeWidth="1" />
      })}
      <polygon points={polygon(v1)} fill="hsl(14, 55%, 52%)" fillOpacity={0.25} stroke="hsl(14, 55%, 52%)" strokeWidth="2" />
      <polygon points={polygon(v2)} fill="#3b82f6" fillOpacity={0.25} stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
      {dims.map((d, i) => {
        const p1 = point(i, v1[i])
        const p2 = point(i, v2[i])
        return (
          <g key={d.key}>
            <text x={point(i, 115).x} y={point(i, 115).y} textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.5">
              {d.label}
            </text>
            <circle cx={p1.x} cy={p1.y} r="3" fill="hsl(14, 55%, 52%)" />
            <circle cx={p2.x} cy={p2.y} r="3" fill="#3b82f6" />
          </g>
        )
      })}
    </svg>
  )
}

export default function PlayerComparison({ leagueId }) {
  const { participantsQuery } = useParticipants()
  const { statsQuery } = usePlayerStats(leagueId)

  const players = participantsQuery.data || []
  const allStats = statsQuery.data || []

  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')

  const player1 = players.find(p => p.id === player1Id)
  const player2 = players.find(p => p.id === player2Id)

  const p1Stats = useMemo(() => {
    if (!player1) return null
    const stats = allStats.filter(s => s.player_name === player1.name)
    return stats.length > 0 ? {
      matchesPlayed: stats.reduce((a, s) => a + (s.matches_played || 0), 0),
      matchesWon: stats.reduce((a, s) => a + (s.matches_won || 0), 0),
      matchesLost: stats.reduce((a, s) => a + (s.matches_lost || 0), 0),
      setsWon: stats.reduce((a, s) => a + (s.sets_won || 0), 0),
      setsLost: stats.reduce((a, s) => a + (s.sets_lost || 0), 0),
      gamesWon: stats.reduce((a, s) => a + (s.games_won || 0), 0),
      gamesLost: stats.reduce((a, s) => a + (s.games_lost || 0), 0),
      winPercentage: stats.length > 0 ? Math.round(stats.reduce((a, s) => a + (s.win_percentage || 0), 0) / stats.length) : 0,
    } : null
  }, [player1, allStats])

  const p2Stats = useMemo(() => {
    if (!player2) return null
    const stats = allStats.filter(s => s.player_name === player2.name)
    return stats.length > 0 ? {
      matchesPlayed: stats.reduce((a, s) => a + (s.matches_played || 0), 0),
      matchesWon: stats.reduce((a, s) => a + (s.matches_won || 0), 0),
      matchesLost: stats.reduce((a, s) => a + (s.matches_lost || 0), 0),
      setsWon: stats.reduce((a, s) => a + (s.sets_won || 0), 0),
      setsLost: stats.reduce((a, s) => a + (s.sets_lost || 0), 0),
      gamesWon: stats.reduce((a, s) => a + (s.games_won || 0), 0),
      gamesLost: stats.reduce((a, s) => a + (s.games_lost || 0), 0),
      winPercentage: stats.length > 0 ? Math.round(stats.reduce((a, s) => a + (s.win_percentage || 0), 0) / stats.length) : 0,
    } : null
  }, [player2, allStats])

  const available1 = players.filter(p => p.id !== player2Id)
  const available2 = players.filter(p => p.id !== player1Id)

  const StatRow = ({ label, val1, val2, higherIsBetter = true, format }) => {
    if (val1 == null || val2 == null) return null
    const v1 = format ? format(val1) : val1
    const v2 = format ? format(val2) : val2
    const diff = v1 - v2
    const win1 = higherIsBetter ? diff > 0 : diff < 0
    const win2 = higherIsBetter ? diff < 0 : diff > 0

    return (
      <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex-1 text-right">
          <span className={`text-sm font-mono font-bold ${win1 ? 'text-primary' : ''}`}>{v1}</span>
        </div>
        <div className="px-3 text-center min-w-[60px]">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className="flex justify-center mt-0.5">
            {diff === 0 ? <Minus className="w-3 h-3 text-muted-foreground" /> :
              diff > 0 ? <TrendingUp className="w-3.5 h-3.5 text-primary" /> : <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
            }
          </div>
        </div>
        <div className="flex-1 text-left">
          <span className={`text-sm font-mono font-bold ${win2 ? 'text-blue-500' : ''}`}>{v2}</span>
        </div>
      </div>
    )
  }

  const Selector = ({ value, onChange, options, placeholder }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm font-medium cursor-pointer hover:bg-muted/60 transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map(p => (
          <option key={p.id} value={p.id}>{p.name} ({p.level})</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Selector value={player1Id} onChange={setPlayer1Id} options={available1} placeholder="Jugador A" />
        </div>
        <span className="text-xs font-bold text-muted-foreground px-1">vs</span>
        <div className="flex-1">
          <Selector value={player2Id} onChange={setPlayer2Id} options={available2} placeholder="Jugador B" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {player1 && player2 && p1Stats && p2Stats ? (
          <motion.div
            key={player1Id + player2Id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-gradient-to-b from-primary/10 to-transparent rounded-xl border border-primary/20">
                <p className="font-semibold">{player1.name}</p>
                <Badge variant="secondary" className="mt-1">{player1.level}</Badge>
              </div>
              <div className="text-center p-4 bg-gradient-to-b from-blue-500/10 to-transparent rounded-xl border border-blue-500/20">
                <p className="font-semibold">{player2.name}</p>
                <Badge variant="secondary" className="mt-1">{player2.level}</Badge>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Estadísticas
              </h4>
              <div className="space-y-1.5">
                <StatRow label="Partidos" val1={p1Stats.matchesPlayed} val2={p2Stats.matchesPlayed} />
                <StatRow label="Ganados" val1={p1Stats.matchesWon} val2={p2Stats.matchesWon} />
                <StatRow label="Perdidos" val1={p1Stats.matchesLost} val2={p2Stats.matchesLost} higherIsBetter={false} />
                <StatRow label="Sets G" val1={p1Stats.setsWon} val2={p2Stats.setsWon} />
                <StatRow label="Sets P" val1={p1Stats.setsLost} val2={p2Stats.setsLost} higherIsBetter={false} />
                <StatRow label="Win Rate" val1={p1Stats.winPercentage} val2={p2Stats.winPercentage} format={(v) => `${v}%`} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Rendimiento
              </h4>
              <RadarSVG
                p1Stats={p1Stats} p2Stats={p2Stats}
                p1Name={player1.name} p2Name={player2.name}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-card border border-dashed border-border rounded-xl"
          >
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Seleccioná dos jugadores para comparar</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {players.length === 0 ? 'No hay jugadores registrados' : `${players.length} jugadores disponibles`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}