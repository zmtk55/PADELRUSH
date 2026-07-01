import { useParams, Link } from 'react-router-dom'
import { usePlayerStats } from '@/hooks/usePlayerStats'
import { useLeagues } from '@/hooks/useLeagues'
import { PageHeader } from '@/components/layout/PageHeader'
import { Medal, TrendingUp, BarChart3, ChevronRight, Swords, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const levelOrder = { '3RA': 0, '4TA': 1, '5TA': 2, '6TA': 3 }

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

const PositionBadge = ({ position }) => {
  if (position === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
        <Medal className="w-4 h-4 text-amber-500" />
      </div>
    )
  }
  if (position === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-400/20 border border-slate-400/30 flex items-center justify-center">
        <Medal className="w-4 h-4 text-slate-400" />
      </div>
    )
  }
  if (position === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-orange-700/20 border border-orange-700/30 flex items-center justify-center">
        <Medal className="w-4 h-4 text-orange-700" />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-muted/50 border border-border flex items-center justify-center">
      <span className="text-sm font-mono font-medium text-muted-foreground">{position}</span>
    </div>
  )
}

const StatCell = ({ value, label, highlight }) => (
  <td className="text-center px-3 py-4">
    <div className={cn(
      "font-mono font-semibold",
      highlight ? "text-foreground" : "text-muted-foreground"
    )}>
      {value}
    </div>
    {label && (
      <div className="text-[10px] text-muted-foreground mt-0.5 hidden lg:block">{label}</div>
    )}
  </td>
)

const WinRateBadge = ({ percentage }) => {
  const colorClass = percentage >= 75
    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    : percentage >= 50
    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
    : "bg-rose-500/10 text-rose-500 border-rose-500/20"

  return (
    <span className={cn(
      "text-xs font-medium px-2.5 py-1 rounded-full border",
      colorClass
    )}>
      {percentage}%
    </span>
  )
}

const LoadingSkeleton = () => (
  <div className="space-y-8">
    {[1, 2].map((i) => (
      <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="h-5 bg-muted rounded animate-pulse w-32" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((j) => (
            <div key={j} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded animate-pulse w-24" />
              </div>
              <div className="h-4 bg-muted rounded animate-pulse w-8" />
              <div className="h-4 bg-muted rounded animate-pulse w-8" />
              <div className="h-4 bg-muted rounded animate-pulse w-8" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-20 bg-card rounded-xl border border-border"
  >
    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Swords className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-bold mb-2">Sin estadísticas aún</h3>
    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
      Las clasificaciones se generan automáticamente al registrar resultados de partidos
    </p>
  </motion.div>
)

export default function Standings() {
  const { leagueId } = useParams()
  const { leagueQuery } = useLeagues()
  const { data: league } = leagueQuery(leagueId)
  const { statsQuery } = usePlayerStats(leagueId)
  const stats = statsQuery.data || []
  const isLoading = statsQuery.isLoading

  const grouped = stats.reduce((acc, s) => {
    const cat = s.category || 'Sin categoría'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  const sortedCats = Object.keys(grouped).sort((a, b) => {
    const la = levelOrder[a] ?? 99
    const lb = levelOrder[b] ?? 99
    return la - lb
  })

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/ligas" className="hover:text-foreground transition-colors">Ligas</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/ligas/${leagueId}`} className="hover:text-foreground transition-colors truncate max-w-[150px]">
            {league?.name || '...'}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-bold">Clasificación</span>
        </div>

        <PageHeader
          title="Clasificación"
          description={league?.name}
        />

        {isLoading ? (
          <LoadingSkeleton />
        ) : stats.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {sortedCats.map((category) => {
              const catStats = grouped[category]
                .sort((a, b) => {
                  if (b.win_percentage !== a.win_percentage) return b.win_percentage - a.win_percentage
                  return b.matches_played - a.matches_played
                })
                .map((s, i) => ({ ...s, position: i + 1 }))

              return (
                <motion.div
                  key={category}
                  variants={item}
                  className="bg-card rounded-xl border border-border overflow-hidden shadow-card"
                >
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-lg tracking-tight flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      {category}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {catStats.length} jugadores
                    </span>
                  </div>

                  <div className="overflow-x-auto overscroll-x-contain">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-xs font-medium uppercase tracking-wider">
                          <th className="text-center px-4 py-3 w-16">#</th>
                          <th className="text-left px-4 py-3">Jugador</th>
                          <th className="text-center px-3 py-3">PJ</th>
                          <th className="text-center px-3 py-3">G</th>
                          <th className="text-center px-3 py-3">E</th>
                          <th className="text-center px-3 py-3">P</th>
                          <th className="text-center px-3 py-3">Pts</th>
                          <th className="text-center px-3 py-3">Avg</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catStats.map((s, i) => {
                          const points = (s.matches_won * 3) + (s.matches_drawn || 0)
                          const avgScore = s.matches_played > 0
                            ? ((s.sets_won / s.matches_played) || 0).toFixed(1)
                            : '0.0'

                          return (
                            <motion.tr
                              key={s.id}
                              variants={item}
                              className={cn(
                                'border-b border-border hover:bg-muted/50 transition-colors',
                                s.position <= 3 && 'bg-muted/30'
                              )}
                            >
                              <td className="text-center px-4 py-4">
                                <PositionBadge position={s.position} />
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-bold border border-primary/20 shrink-0">
                                    {s.player_name.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-sm block">{s.player_name}</span>
                                    {s.partner_name && (
                                      <span className="text-xs text-muted-foreground">
                                        c/ {s.partner_name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <StatCell value={s.matches_played} label="Partidos" />
                              <StatCell value={s.matches_won} highlight />
                              <StatCell value={s.matches_drawn || 0} />
                              <StatCell value={s.matches_lost} />
                              <td className="text-center px-3 py-4">
                                <span className="text-sm font-bold text-foreground">{points}</span>
                              </td>
                              <td className="text-center px-3 py-4">
                                <WinRateBadge percentage={s.win_percentage} />
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
