import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Users, Swords, TrendingUp, TrendingDown, Minus, BarChart3, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTeams } from '@/hooks/useTeams'
import { useMatches } from '@/hooks/useMatches'
import { usePlayerStats } from '@/hooks/usePlayerStats'

function calcTeamStats(teamId, matches, teams) {
  const teamMatches = matches.filter(
    m => (m.team1_id === teamId || m.team2_id === teamId) && m.status === 'jugado'
  )
  const total = teamMatches.length
  let wins = 0, losses = 0, setsWon = 0, setsLost = 0, gamesWon = 0, gamesLost = 0

  teamMatches.forEach(m => {
    const isTeam1 = m.team1_id === teamId
    const tw = isTeam1 ? m.sets_won_team1 : m.sets_won_team2
    const tl = isTeam1 ? m.sets_won_team2 : m.sets_won_team1
    const gw = isTeam1
      ? (m.set1_team1 || 0) + (m.set2_team1 || 0) + (m.set3_team1 || 0)
      : (m.set1_team2 || 0) + (m.set2_team2 || 0) + (m.set3_team2 || 0)
    const gl = isTeam1
      ? (m.set1_team2 || 0) + (m.set2_team2 || 0) + (m.set3_team2 || 0)
      : (m.set1_team1 || 0) + (m.set2_team1 || 0) + (m.set3_team1 || 0)

    wins += tw > tl ? 1 : 0
    losses += tl > tw ? 1 : 0
    setsWon += tw
    setsLost += tl
    gamesWon += gw
    gamesLost += gl
  })

  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

  return { total, wins, losses, setsWon, setsLost, gamesWon, gamesLost, winRate, matches: teamMatches }
}

function RadarChart({ team1, team2, t1Stats, t2Stats }) {
  const dims = [
    { key: 'winRate', label: '% Victorias', max: 100 },
    { key: 'setsWonRatio', label: 'Sets', max: 1, calc: (s) => s.total > 0 ? s.setsWon / (s.setsWon + s.setsLost) * 100 : 0 },
    { key: 'gamesWonRatio', label: 'Juegos', max: 1, calc: (s) => s.total > 0 ? s.gamesWon / (s.gamesWon + s.gamesLost) * 100 : 0 },
    { key: 'experience', label: 'Experiencia', max: 20, calc: (s) => Math.min(s.total * 10, 100) },
    { key: 'consistency', label: 'Consistencia', max: 1, calc: (s) => s.total > 0 ? Math.round((1 - Math.abs(s.wins - s.losses) / s.total) * 100) : 0 },
  ]

  const v1 = dims.map(d => d.calc ? d.calc(t1Stats) : t1Stats[d.key])
  const v2 = dims.map(d => d.calc ? d.calc(t2Stats) : t2Stats[d.key])

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
            <text x={point(i, 110).x} y={point(i, 110).y} textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.6">
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

function H2HCard({ t1Id, t2Id, matches, team1, team2 }) {
  const h2h = matches.filter(
    m => ((m.team1_id === t1Id && m.team2_id === t2Id) || (m.team1_id === t2Id && m.team2_id === t1Id))
  )

  if (h2h.length === 0) return null

  const t1Wins = h2h.filter(m => {
    const isT1 = m.team1_id === t1Id
    return isT1 ? m.sets_won_team1 > m.sets_won_team2 : m.sets_won_team2 > m.sets_won_team1
  }).length
  const t2Wins = h2h.length - t1Wins

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
        <Swords className="w-3.5 h-3.5" /> Historial cara a cara
      </h4>
      <div className="flex items-center gap-4">
        <div className="flex-1 text-right">
          <span className="text-2xl font-black font-heading text-primary">{t1Wins}</span>
          <p className="text-xs text-muted-foreground">{team1.team_name || `Equipo ${team1.team_number}`}</p>
        </div>
        <div className="text-center">
          <span className="text-xs font-bold uppercase text-muted-foreground">vs</span>
          <p className="text-[10px] text-muted-foreground">{h2h.length} partido{h2h.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 text-left">
          <span className="text-2xl font-black font-heading text-blue-500">{t2Wins}</span>
          <p className="text-xs text-muted-foreground">{team2.team_name || `Equipo ${team2.team_number}`}</p>
        </div>
      </div>
    </div>
  )
}

export default function TeamComparison({ leagueId }) {
  const { teamsQuery } = useTeams(leagueId)
  const { matchesQuery } = useMatches(leagueId)
  const { statsQuery } = usePlayerStats(leagueId)

  const teams = teamsQuery.data || []
  const matches = matchesQuery.data || []
  const playerStats = statsQuery.data || []

  const [team1Id, setTeam1Id] = useState('')
  const [team2Id, setTeam2Id] = useState('')

  const team1 = teams.find(t => t.id === team1Id)
  const team2 = teams.find(t => t.id === team2Id)

  const t1Stats = useMemo(() => team1Id ? calcTeamStats(team1Id, matches, teams) : null, [team1Id, matches, teams])
  const t2Stats = useMemo(() => team2Id ? calcTeamStats(team2Id, matches, teams) : null, [team2Id, matches, teams])

  const categories = [...new Set(teams.map(t => t.category))]

  const selectable1 = teams.filter(t => t.id !== team2Id)
  const selectable2 = teams.filter(t => t.id !== team1Id)

  const StatRow = ({ label, val1, val2, higherIsBetter = true, format }) => {
    const v1 = format ? format(val1) : val1
    const v2 = format ? format(val2) : val2
    if (v1 == null || v2 == null) return null
    const diff = v1 - v2
    const win1 = higherIsBetter ? diff > 0 : diff < 0
    const win2 = higherIsBetter ? diff < 0 : diff > 0

    return (
      <div className="flex items-center justify-between py-2.5 px-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
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

  const Selector = ({ side, value, onChange, options }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm font-medium cursor-pointer hover:bg-muted/60 transition-colors"
      >
        <option value="">Seleccionar equipo</option>
        {categories.map(cat => (
          <optgroup key={cat} label={cat}>
            {options.filter(t => t.category === cat).map(t => (
              <option key={t.id} value={t.id}>
                {t.team_name || `Equipo ${t.team_number}`} — {t.player1?.name || '?'} / {t.player2?.name || '?'}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Selector side="A" value={team1Id} onChange={setTeam1Id} options={selectable1} />
        </div>
        <span className="text-xs font-bold text-muted-foreground px-1">vs</span>
        <div className="flex-1">
          <Selector side="B" value={team2Id} onChange={setTeam2Id} options={selectable2} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {team1 && team2 && t1Stats && t2Stats ? (
          <motion.div
            key={team1Id + team2Id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-gradient-to-b from-primary/10 to-transparent rounded-xl border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">{team1.team_name || `Equipo ${team1.team_number}`}</p>
                <p className="text-xs text-muted-foreground">
                  {team1.player1?.name || '?'} / {team1.player2?.name || '?'}
                </p>
                <Badge variant="secondary" className="mt-2">{team1.category}</Badge>
              </div>
              <div className="text-center p-4 bg-gradient-to-b from-blue-500/10 to-transparent rounded-xl border border-blue-500/20">
                <p className="text-xs text-muted-foreground mb-1">{team2.team_name || `Equipo ${team2.team_number}`}</p>
                <p className="text-xs text-muted-foreground">
                  {team2.player1?.name || '?'} / {team2.player2?.name || '?'}
                </p>
                <Badge variant="secondary" className="mt-2">{team2.category}</Badge>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Estadísticas
              </h4>
              <div className="space-y-1.5">
                <StatRow label="Partidos" val1={t1Stats.total} val2={t2Stats.total} />
                <StatRow label="Ganados" val1={t1Stats.wins} val2={t2Stats.wins} />
                <StatRow label="Perdidos" val1={t1Stats.losses} val2={t2Stats.losses} higherIsBetter={false} />
                <StatRow label="Sets G" val1={t1Stats.setsWon} val2={t2Stats.setsWon} />
                <StatRow label="Sets P" val1={t1Stats.setsLost} val2={t2Stats.setsLost} higherIsBetter={false} />
                <StatRow label="Juegos G" val1={t1Stats.gamesWon} val2={t2Stats.gamesWon} />
                <StatRow label="Juegos P" val1={t1Stats.gamesLost} val2={t2Stats.gamesLost} higherIsBetter={false} />
                <StatRow label="Win Rate" val1={t1Stats.winRate} val2={t2Stats.winRate} format={(v) => `${v}%`} />
              </div>
            </div>

            <H2HCard t1Id={team1Id} t2Id={team2Id} matches={matches} team1={team1} team2={team2} />

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Rendimiento
              </h4>
              <RadarChart team1={team1} team2={team2} t1Stats={t1Stats} t2Stats={t2Stats} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-card border border-dashed border-border rounded-xl"
          >
            <Swords className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Seleccioná dos equipos para comparar</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {teams.length === 0 ? 'No hay equipos registrados en esta liga' : `${teams.length} equipos disponibles`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}