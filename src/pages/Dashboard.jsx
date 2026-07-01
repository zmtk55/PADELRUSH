import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Swords, Calendar, Plus, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

function StatCard({ icon: Icon, label, value, color, href }) {
  return (
    <motion.div variants={item}>
      <Link to={href}>
        <Card className="cursor-pointer group hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-8 w-12 bg-muted rounded animate-pulse" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { data: leagues = [], isLoading: leaguesLoading } = useQuery({
    queryKey: ['leagues'],
    queryFn: async () => {
      const { data } = await supabase.from('leagues').select('*').order('created_at', { ascending: false })
      return data || []
    }
  })

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams-count'],
    queryFn: async () => {
      const { data } = await supabase.from('teams').select('id')
      return data || []
    }
  })

  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['matches-count'],
    queryFn: async () => {
      const { data } = await supabase.from('matches').select('*').order('created_at', { ascending: false })
      return data || []
    }
  })

  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ['participants-count'],
    queryFn: async () => {
      const { data } = await supabase.from('participants').select('id')
      return data || []
    }
  })

  const { data: recentMatches = [], isLoading: recentLoading } = useQuery({
    queryKey: ['recent-matches'],
    queryFn: async () => {
      const { data } = await supabase
        .from('matches')
        .select('*, leagues(name)')
        .order('created_at', { ascending: false })
        .limit(5)
      return data || []
    }
  })

  const isLoading = leaguesLoading || teamsLoading || matchesLoading || participantsLoading

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Bienvenido a PadelRush</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              icon={Trophy}
              label="Ligas"
              value={leagues.length}
              color="bg-primary/10 text-primary"
              href="/ligas"
            />
            <StatCard
              icon={Users}
              label="Jugadores"
              value={participants.length}
              color="bg-blue-500/10 text-blue-500"
              href="/participantes"
            />
            <StatCard
              icon={Swords}
              label="Equipos"
              value={teams.length}
              color="bg-green-500/10 text-green-500"
              href="/equipos"
            />
            <StatCard
              icon={Calendar}
              label="Partidos"
              value={matches.length}
              color="bg-amber-500/10 text-amber-500"
              href="/partidos"
            />
          </>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-1">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentMatches.length > 0 ? (
                <div className="space-y-3">
                  {recentMatches.map(match => (
                    <div key={match.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {match.team1_name || 'Equipo 1'} vs {match.team2_name || 'Equipo 2'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {match.leagues?.name || 'Sin liga'}
                          {match.winner_team_number && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Ganador: Eq. {match.winner_team_number}
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay actividad reciente
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Link to="/ligas/nueva">
                  <Button className="w-full justify-start" variant="default">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Liga
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link to="/participantes">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Ver Jugadores
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link to="/partidos">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Partidos
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link to="/equipos">
                  <Button className="w-full justify-start" variant="outline">
                    <Swords className="w-4 h-4 mr-2" />
                    Ver Equipos
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
