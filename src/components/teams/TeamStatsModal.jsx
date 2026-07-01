import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BarChart3, TrendingUp, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlayerStats } from '@/hooks/usePlayerStats'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'

export function TeamStatsModal({ team, league, open, onClose }) {
  const { statsQuery } = usePlayerStats(league?.id)

  const player1Stats = (statsQuery.data || []).filter((s) => s.player_name === team.player1?.name)
  const player2Stats = (statsQuery.data || []).filter((s) => s.player_name === team.player2?.name)

  const radarData = [
    { stat: 'Ganados', P1: player1Stats[0]?.matches_won || 0, P2: player2Stats[0]?.matches_won || 0 },
    { stat: 'Sets a favor', P1: player1Stats[0]?.sets_won || 0, P2: player2Stats[0]?.sets_won || 0 },
    { stat: 'Juegos a favor', P1: player1Stats[0]?.games_won || 0, P2: player2Stats[0]?.games_won || 0 },
    { stat: '% Victoria', P1: player1Stats[0]?.win_percentage || 0, P2: player2Stats[0]?.win_percentage || 0 },
    { stat: 'Partidos', P1: player1Stats[0]?.matches_played || 0, P2: player2Stats[0]?.matches_played || 0 },
  ]

  const barData = [
    { name: team.player1?.name?.split(' ')[0] || 'P1', Ganados: player1Stats[0]?.matches_won || 0, Perdidos: player1Stats[0]?.matches_lost || 0 },
    { name: team.player2?.name?.split(' ')[0] || 'P2', Ganados: player2Stats[0]?.matches_won || 0, Perdidos: player2Stats[0]?.matches_lost || 0 },
  ]

  const hasStats = player1Stats.length > 0 || player2Stats.length > 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold font-mono">
                  {team.team_number}
                </div>
                <div>
                  <h2 className="font-mono text-xl font-bold">{team.team_name || `Equipo ${team.team_number}`}</h2>
                  <p className="text-sm text-muted-foreground">
                    {team.player1?.name || '?'} / {team.player2?.name || '?'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {!hasStats ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay estadísticas disponibles para este equipo</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Las estadísticas se generan automáticamente al registrar resultados
                  </p>
                </div>
              ) : (
                <>
                  {/* Radar Chart */}
                  <div className="bg-background rounded-xl p-4 border border-border">
                    <h3 className="font-mono font-semibold text-sm mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      Comparativa de jugadores
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="stat" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 10 }} />
                        <Radar name={team.player1?.name?.split(' ')[0] || 'P1'} dataKey="P1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
                        <Radar name={team.player2?.name?.split(' ')[0] || 'P2'} dataKey="P2" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bar Chart */}
                  <div className="bg-background rounded-xl p-4 border border-border">
                    <h3 className="font-mono font-semibold text-sm mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Victorias / Derrotas
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Ganados" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Perdidos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stats cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[player1Stats[0], player2Stats[0]].filter(Boolean).map((stat, i) => (
                      <div key={i} className="bg-background rounded-xl p-4 border border-border">
                        <p className="text-xs text-muted-foreground mb-2">{stat.player_name}</p>
                        <div className="space-y-1 text-sm">
                          <p className="flex justify-between"><span className="text-muted-foreground">PJ</span> <span className="font-medium">{stat.matches_played}</span></p>
                          <p className="flex justify-between"><span className="text-muted-foreground">G</span> <span className="font-medium text-success">{stat.matches_won}</span></p>
                          <p className="flex justify-between"><span className="text-muted-foreground">P</span> <span className="font-medium text-destructive">{stat.matches_lost}</span></p>
                          <p className="flex justify-between"><span className="text-muted-foreground">%</span> <span className="font-medium">{stat.win_percentage}%</span></p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Line chart - progression */}
                  <div className="bg-background rounded-xl p-4 border border-border">
                    <h3 className="font-mono font-semibold text-sm mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Rendimiento histórico
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={[player1Stats[0], player2Stats[0]].filter(Boolean).map((s, i) => ({
                        name: s?.player_name?.split(' ')[0] || `P${i + 1}`,
                        '% victoria': s?.win_percentage || 0,
                        'Sets dif': (s?.sets_won || 0) - (s?.sets_lost || 0),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="% victoria" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Sets dif" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
