import { useParams, useNavigate } from 'react-router-dom'
import { usePlayerStats } from '@/hooks/usePlayerStats'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trophy, Medal, TrendingUp, BarChart3, Download } from 'lucide-react'
import { exportStandings } from '@/lib/exportUtils'
import { motion } from 'framer-motion'

const levelOrder = { '3RA': 0, '4TA': 1, '5TA': 2, '6TA': 3 }

export default function Standings() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leagueQuery } = useLeagues()
  const { data: league } = leagueQuery(leagueId)
  const { statsQuery } = usePlayerStats(leagueId)
  const stats = statsQuery.data || []

  const allStandings = stats.map((s) => ({ ...s, name: s.player_name }))

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

  const getMedal = (pos) => {
    if (pos === 1) return <Medal className="w-4 h-4 text-amber-500" />
    if (pos === 2) return <Medal className="w-4 h-4 text-gray-400" />
    if (pos === 3) return <Medal className="w-4 h-4 text-amber-700" />
    return null
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate(`/ligas/${leagueId}`)} className="mb-4">
        <ArrowLeft className="w-4 h-4" />
        Volver a liga
      </Button>

      <PageHeader
        title="Clasificación"
        description={league?.name}
        action={
          stats.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => exportStandings(allStandings, league?.name || 'liga')}>
              <Download className="w-4 h-4" />
              CSV
            </Button>
          )
        }
      />

      {stats.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Sin estadísticas aún</p>
          <p className="text-sm text-muted-foreground">
            Las clasificaciones se generan al registrar resultados de partidos
          </p>
        </div>
      ) : (
        sortedCats.map((category) => {
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
              className="bg-card border border-border rounded-xl overflow-hidden mb-6"
            >
              <div className="px-5 py-4 border-b border-border bg-muted/30">
                <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  {category}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3 w-12">#</th>
                      <th className="text-left px-4 py-3">Jugador</th>
                      <th className="text-center px-3 py-3">PJ</th>
                      <th className="text-center px-3 py-3">G</th>
                      <th className="text-center px-3 py-3">P</th>
                      <th className="text-center px-3 py-3 hidden sm:table-cell">SF</th>
                      <th className="text-center px-3 py-3 hidden sm:table-cell">SC</th>
                      <th className="text-center px-3 py-3 hidden md:table-cell">JF</th>
                      <th className="text-center px-3 py-3 hidden md:table-cell">JC</th>
                      <th className="text-center px-3 py-3">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catStats.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            {getMedal(s.position) || (
                              <span className="text-muted-foreground font-medium">{s.position}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                              {s.player_name.charAt(0)}
                            </div>
                            <span className="font-medium">{s.player_name}</span>
                            {s.partner_name && (
                              <span className="text-xs text-muted-foreground hidden lg:inline">
                                c/{s.partner_name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-center px-3 py-3 font-medium">{s.matches_played}</td>
                        <td className="text-center px-3 py-3 text-emerald-600 font-medium">{s.matches_won}</td>
                        <td className="text-center px-3 py-3 text-red-500 font-medium">{s.matches_lost}</td>
                        <td className="text-center px-3 py-3 hidden sm:table-cell">{s.sets_won}</td>
                        <td className="text-center px-3 py-3 hidden sm:table-cell">{s.sets_lost}</td>
                        <td className="text-center px-3 py-3 hidden md:table-cell">{s.games_won}</td>
                        <td className="text-center px-3 py-3 hidden md:table-cell">{s.games_lost}</td>
                        <td className="text-center px-3 py-3">
                          <Badge variant={s.win_percentage >= 50 ? 'default' : 'secondary'} className="text-xs">
                            {s.win_percentage}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )
        })
      )}
    </div>
  )
}
