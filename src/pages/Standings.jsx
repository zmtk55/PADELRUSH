import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePlayerStats } from '@/hooks/usePlayerStats'
import { useLeagues } from '@/hooks/useLeagues'
import { PageHeader } from '@/components/layout/PageHeader'
import { Medal, TrendingUp, BarChart3, ChevronRight, Swords } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const levelOrder = { '3RA': 0, '4TA': 1, '5TA': 2, '6TA': 3 }

const getStreakText = (wins, losses) => {
  if (wins > losses) return `${wins}G`
  if (losses > wins) return `${losses}P`
  return null
}

export default function Standings() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const { leagueQuery } = useLeagues()
  const { data: league } = leagueQuery(leagueId)
  const { statsQuery } = usePlayerStats(leagueId)
  const stats = statsQuery.data || []

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/ligas" className="hover:text-foreground transition-colors">Ligas</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/ligas/${leagueId}`} className="hover:text-foreground transition-colors truncate max-w-[150px]">{league?.name || '...'}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-bold">Clasificación</span>
      </div>

      <PageHeader title="Clasificación" description={league?.name} />

      {stats.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-card border border-border">
          <div className="w-16 h-16 border border-border flex items-center justify-center mx-auto mb-4">
            <Swords className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-heading font-bold mb-2">Sin estadísticas aún</p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Las clasificaciones se generan al registrar resultados de partidos
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg tracking-tight flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    {category}
                  </h3>
                  <span className="text-sm text-muted-foreground">{catStats.length} jugadores</span>
                </div>

                <div className="overflow-x-auto overscroll-x-contain">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs font-medium">
                        <th className="text-left px-4 py-3 w-10">#</th>
                        <th className="text-left px-4 py-3">Jugador</th>
                        <th className="text-center px-2 py-3">PJ</th>
                        <th className="text-center px-2 py-3">G</th>
                        <th className="text-center px-2 py-3">P</th>
                        <th className="text-center px-2 py-3 hidden sm:table-cell">SF</th>
                        <th className="text-center px-2 py-3 hidden sm:table-cell">SC</th>
                        <th className="text-center px-3 py-3">%</th>
                        <th className="text-center px-2 py-3 hidden md:table-cell">Racha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catStats.map((s, i) => {
                        const streakText = getStreakText(s.current_win_streak || 0, s.current_lose_streak || 0)
                        const isTop3 = s.position <= 3
                        const medalColors = { 1: 'hsl(var(--medal-gold))', 2: 'hsl(var(--medal-silver))', 3: 'hsl(var(--medal-bronze))' }
                        return (
                          <motion.tr
                            key={s.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className={cn(
                              'border-b border-border hover:bg-muted transition-colors',
                              isTop3 && 'bg-muted'
                            )}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center">
                                {isTop3 ? (
                                  <Medal className="w-4 h-4" style={{ color: medalColors[s.position] }} />
                                ) : (
                                  <span className="text-muted-foreground font-mono">{s.position}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0">
                                  {s.player_name.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-semibold text-sm">{s.player_name}</span>
                                  {s.partner_name && (
                                    <span className="text-xs text-muted-foreground block leading-tight">
                                      c/{s.partner_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-center px-2 py-3 font-mono">{s.matches_played}</td>
                            <td className="text-center px-2 py-3 font-mono text-foreground">{s.matches_won}</td>
                            <td className="text-center px-2 py-3 font-mono text-muted-foreground">{s.matches_lost}</td>
                            <td className="text-center px-2 py-3 hidden sm:table-cell text-muted-foreground font-mono">{s.sets_won}</td>
                            <td className="text-center px-2 py-3 hidden sm:table-cell text-muted-foreground font-mono">{s.sets_lost}</td>
                            <td className="text-center px-3 py-3">
                              <span className={cn(
                                'text-xs font-medium px-2 py-0.5',
                                s.win_percentage >= 75 ? 'text-foreground' : s.win_percentage >= 50 ? 'text-muted-foreground' : 'text-muted-foreground'
                              )}>
                                {s.win_percentage}%
                              </span>
                            </td>
                            <td className="text-center px-2 py-3 hidden md:table-cell">
                              {streakText ? (
                                <span className={cn(
                                  'text-xs font-medium',
                                  streakText.includes('G') ? 'text-foreground' : 'text-muted-foreground'
                                )}>
                                  {streakText}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
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
        </div>
      )}
    </motion.div>
  )
}
