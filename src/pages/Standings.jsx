import { useParams, useNavigate } from 'react-router-dom'
import { usePlayerStats } from '@/hooks/usePlayerStats'
import { useLeagues } from '@/hooks/useLeagues'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trophy, Medal, BarChart3, Download, Crown } from 'lucide-react'
import { exportStandings } from '@/lib/exportUtils'
import { motion } from 'framer-motion'

const levelOrder = { '3RA': 0, '4TA': 1, '5TA': 2, '6TA': 3 }

export default function Standings() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
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
        <div className="text-center py-16 bg-card rounded-xl shadow-sm border">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Crown className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="text-base font-semibold mb-1">Sin estadísticas</p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl shadow-sm border overflow-hidden mb-6"
            >
              <div className="px-5 py-3 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    {category}
                  </h3>
                  <span className="text-xs text-muted-foreground">{catStats.length} jugadores</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left px-4 py-3 w-10">#</th>
                      <th className="text-left px-4 py-3">Jugador</th>
                      <th className="text-center px-3 py-3">PJ</th>
                      <th className="text-center px-3 py-3">G</th>
                      <th className="text-center px-3 py-3">P</th>
                      <th className="text-center px-3 py-3 hidden sm:table-cell">SF</th>
                      <th className="text-center px-3 py-3 hidden sm:table-cell">SC</th>
                      <th className="text-center px-3 py-3">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catStats.map((s, idx) => (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-muted/50 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/jugadores/${encodeURIComponent(s.player_name)}`)}
                      >
                        <td className="px-4 py-3">
                          {s.position <= 3 ? (
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
                              s.position === 1 ? 'bg-amber-100 text-amber-700' :
                              s.position === 2 ? 'bg-gray-100 text-gray-500' :
                              'bg-amber-50 text-amber-800'
                            }`}>
                              {s.position}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">{s.position}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                              {s.player_name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium text-sm">{s.player_name}</span>
                              {s.partner_name && (
                                <span className="text-xs text-muted-foreground ml-1">c/{s.partner_name}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center px-3 py-3 font-medium tabular-nums">{s.matches_played}</td>
                        <td className="text-center px-3 py-3 text-emerald-600 font-medium tabular-nums">{s.matches_won}</td>
                        <td className="text-center px-3 py-3 text-red-500 font-medium tabular-nums">{s.matches_lost}</td>
                        <td className="text-center px-3 py-3 hidden sm:table-cell tabular-nums">{s.sets_won}</td>
                        <td className="text-center px-3 py-3 hidden sm:table-cell tabular-nums">{s.sets_lost}</td>
                        <td className="text-center px-3 py-3">
                          <span className={`text-xs font-semibold ${s.win_percentage >= 50 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                            {s.win_percentage}%
                          </span>
                        </td>
                      </motion.tr>
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