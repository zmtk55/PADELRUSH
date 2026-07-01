import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Users, Calendar, Edit, BarChart3, ChevronRight, LayoutGrid, ArrowRight, Plus, Medal } from 'lucide-react'
import { useLeagues } from '@/hooks/useLeagues'
import { useTeams } from '@/hooks/useTeams'
import { useMatches } from '@/hooks/useMatches'
import { usePlayerStats } from '@/hooks/usePlayerStats'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TeamStatsModal } from '@/components/teams/TeamStatsModal'
import RoundRobinStandings from '@/components/roundrobin/RoundRobinStandings'

const quickLinks = [
  { to: 'equipos', label: 'Equipos', icon: Users, desc: 'Ver y gestionar' },
  { to: 'partidos', label: 'Partidos', icon: Calendar, desc: 'Calendario y resultados' },
  { to: 'clasificacion', label: 'Clasificación', icon: BarChart3, desc: 'Tabla de posiciones' },
]

export default function LeagueDetail() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leagueQuery } = useLeagues()
  const { data: league, isLoading: loadingLeague } = leagueQuery(leagueId)
  const { teamsQuery } = useTeams(leagueId)
  const { matchesQuery } = useMatches(leagueId)
  const { statsQuery } = usePlayerStats(leagueId)
  const [selectedTeam, setSelectedTeam] = useState(null)

  // Check if any category uses Round Robin Express
  const isRRExpress = league?.category_formats &&
    Object.values(league.category_formats).some(v => v === 'round-robin-express')
  
  const matches = matchesQuery.data || []
  const teams = teamsQuery.data || []

  // Group teams by their group assignment for RR Express
  const groups = {}
  const teamsArray = teams
  teamsArray.forEach(t => {
    const g = t.group || 'A'
    if (!groups[g]) groups[g] = []
    groups[g].push(t)
  })

  // Group matches by group
  const groupMatches = {}
  Object.keys(groups).forEach(g => { groupMatches[g] = [] })
  const matchesArray = matches
  matchesArray.forEach(m => {
    const team = teamsArray.find(t => t.id === m.team1_id || t.id === m.team2_id)
    const g = team?.group || 'A'
    if (groupMatches[g]) groupMatches[g].push(m)
  })

  if (loadingLeague) return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted w-48" />
        <div className="h-48 bg-muted" />
      </div>
    </motion.div>
    </div>
  )
  if (!league) return (
    <div className="container mx-auto py-6 px-4 max-w-6xl text-center py-20">
      <p className="text-red-600 text-lg font-medium">Liga no encontrada</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate('/ligas')}>Volver a ligas</Button>
    </div>
  )

  const jugados = matches.filter((m) => m.status === 'jugado').length
  const programados = matches.filter((m) => m.status === 'programado').length

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/ligas" className="hover:text-foreground transition-colors">Ligas</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{league.name}</span>
      </div>

      {/* Hero header */}
      <div className="bg-card border border-border p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-foreground flex items-center justify-center text-background font-heading font-bold text-2xl sm:text-3xl shrink-0">
              {league.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">{league.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary">{league.gender} · {league.sport}</Badge>
                <span className="text-sm text-muted-foreground border border-border px-2 py-0.5">{league.status}</span>
                {league.season && <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{league.season}</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isOrganizer && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/ligas/${leagueId}/editar`)}>
                <Edit className="w-3.5 h-3.5" />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <StatBox icon={Trophy} value={teams.length} label="Equipos" />
          <StatBox icon={Calendar} value={matches.length} label="Partidos" />
          <StatBox icon={Trophy} value={jugados} label="Jugados" />
          <StatBox icon={Calendar} value={programados} label="Programados" />
        </div>

        {/* Quick action buttons */}
        {isOrganizer && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => navigate(`/ligas/${leagueId}/partidos`)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Crear partido
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate(`/ligas/${leagueId}/clasificacion`)}>
              <Medal className="w-3.5 h-3.5 mr-1.5" /> Ver clasificación
            </Button>
          </div>
        )}
      </div>

      {/* Quick navigation links */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {quickLinks.map(({ to, label, icon: Icon, desc }) => (
          <motion.div
            key={to}
            whileHover={{ y: -2 }}
            onClick={() => navigate(`/ligas/${leagueId}/${to}`)}
            className="bg-card border border-border p-4 cursor-pointer hover:border-border transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted text-muted-foreground flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm group-hover:text-foreground transition-colors">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-muted-foreground transition-all group-hover:translate-x-0.5" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-4 sm:gap-6">

        {/* Round Robin Express — Group Standings */}
        {isRRExpress && Object.keys(groups).length > 0 && (
          <div className="lg:col-span-2">
            <div className="bg-card border border-border p-4 sm:p-5 mb-6 overflow-x-auto overscroll-x-contain">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-lg tracking-tight flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                  Round Robin Express
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/ligas/${leagueId}/partidos`)}>
                  Ir a partidos <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
              <div className="grid gap-4">
                {Object.entries(groups).sort(([a],[b]) => a.localeCompare(b)).map(([g, gTeams]) => (
                  <RoundRobinStandings
                    key={g}
                    matches={groupMatches[g] || []}
                    teams={gTeams}
                    groupLabel={g}
                    qualifyingSpots={2}
                    compact
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Teams list */}
        <div className="bg-card border border-border p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg tracking-tight">Equipos</h2>
            {teams.length > 8 && (
              <Button variant="ghost" size="sm" onClick={() => navigate(`/ligas/${leagueId}/equipos`)}>
                Ver todos los equipos <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
          {teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Aún no hay equipos registrados</p>
              {isOrganizer && (
                <Button size="sm" className="mt-3" onClick={() => navigate(`/ligas/${leagueId}/admin`)}>
                  Gestionar equipos
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {teams.slice(0, 8).map((team, i) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => isOrganizer && setSelectedTeam(team)}
                  className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                      {team.team_number}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{team.team_name || `Equipo ${team.team_number}`}</p>
                      <p className="text-xs text-muted-foreground">{team.category}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(team.player1_name || team.player1?.name || '?').split(' ')[0]} / {(team.player2_name || team.player2?.name || '?').split(' ')[0]}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent matches */}
        <div className="bg-card border border-border p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg tracking-tight">Últimos partidos</h2>
            {matches.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate(`/ligas/${leagueId}/partidos`)}>
                Ver todos <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Aún no hay partidos registrados</p>
              {isOrganizer && (
                <Button size="sm" className="mt-3" onClick={() => navigate(`/ligas/${leagueId}/partidos`)}>
                  Generar calendario
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {matches.slice(0, 8).map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-3 bg-muted"
                >
                  <div className="text-sm min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {match.team1_name || `Equipo ${match.team1_number}`}
                      <span className="text-muted-foreground mx-1.5">vs</span>
                      {match.team2_name || `Equipo ${match.team2_number}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {match.category}{match.round ? ` · Ronda ${match.round}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    {match.status === 'jugado' ? (
                      <p className="text-base font-bold font-mono tabular-nums">
                        {match.sets_won_team1} - {match.sets_won_team2}
                      </p>
                    ) : (
                      <span className="text-xs text-muted-foreground bg-card border border-border px-2 py-1">
                        {match.scheduled_date || 'Programado'}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTeam && (
        <TeamStatsModal
          team={selectedTeam}
          league={league}
          open={!!selectedTeam}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </motion.div>
    </div>
  )
}

function StatBox({ icon: Icon, value, label }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-muted border border-border p-4 text-center">
      <Icon className="w-5 h-5 mx-auto mb-1.5 text-muted-foreground" />
      <p className="text-2xl font-heading font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  )
}
