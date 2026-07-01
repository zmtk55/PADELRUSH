import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  Edit,
  BarChart3,
  Plus,
  Medal,
  LayoutGrid,
  ArrowRight,
  ChevronRight,
  Settings,
  Swords,
} from 'lucide-react'
import { useLeagues } from '@/hooks/useLeagues'
import { useTeams } from '@/hooks/useTeams'
import { useMatches } from '@/hooks/useMatches'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TeamStatsModal } from '@/components/teams/TeamStatsModal'
import RoundRobinStandings from '@/components/roundrobin/RoundRobinStandings'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

function statusConfig(status) {
  switch (status) {
    case 'activa':
      return { label: 'Activa', variant: 'success' }
    case 'finalizada':
      return { label: 'Finalizada', variant: 'secondary' }
    case 'inactiva':
      return { label: 'Inactiva', variant: 'warning' }
    default:
      return { label: status || 'Activa', variant: 'default' }
  }
}

function StatBox({ icon: Icon, value, label }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center shadow-card hover:shadow-elevated transition-shadow">
      <Icon className="w-5 h-5 mx-auto mb-2 text-primary" />
      <p className="text-2xl font-heading font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function TeamsTab({ teams, isOrganizer, onManage }) {
  return (
    <div>
      {teams.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm mb-4">Aún no hay equipos registrados</p>
          {isOrganizer && (
            <Button size="sm" className="rounded-lg" onClick={onManage}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Gestionar equipos
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {teams.map((team, i) => (
            <motion.div
              key={team.id}
              variants={item}
              initial="hidden"
              animate="show"
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                  {team.team_number}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {team.team_name || `Equipo ${team.team_number}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{team.category}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {(team.player1_name || team.player1?.name || '?').split(' ')[0]} /{' '}
                {(team.player2_name || team.player2?.name || '?').split(' ')[0]}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function CalendarTab({ matches }) {
  return (
    <div>
      {matches.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aún no hay partidos registrados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((match, i) => (
            <motion.div
              key={match.id}
              variants={item}
              initial="hidden"
              animate="show"
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="text-sm min-w-0 flex-1">
                <p className="font-medium truncate">
                  {match.team1_name || `Equipo ${match.team1_number}`}
                  <span className="text-muted-foreground mx-1.5">vs</span>
                  {match.team2_name || `Equipo ${match.team2_number}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.category}
                  {match.round ? ` · Ronda ${match.round}` : ''}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                {match.status === 'jugado' ? (
                  <p className="text-base font-bold font-mono tabular-nums">
                    {match.sets_won_team1} - {match.sets_won_team2}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground bg-card border border-border px-2 py-1 rounded-md">
                    {match.scheduled_date || 'Programado'}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function StandingsTab({ leagueId }) {
  return (
    <div className="text-center py-12">
      <BarChart3 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-muted-foreground text-sm mb-4">Tabla de posiciones</p>
      <Button variant="outline" size="sm" className="rounded-lg">
        <Medal className="w-3.5 h-3.5 mr-1.5" /> Ver clasificación completa
      </Button>
    </div>
  )
}

function ConfigTab({ league, isOrganizer, onEdit }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
        <div>
          <p className="text-sm font-medium">Editar configuración</p>
          <p className="text-xs text-muted-foreground">Modificar datos generales de la liga</p>
        </div>
        {isOrganizer && (
          <Button variant="outline" size="sm" className="rounded-lg" onClick={onEdit}>
            <Edit className="w-3.5 h-3.5 mr-1.5" /> Editar
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
        <div>
          <p className="text-sm font-medium">Formato de torneo</p>
          <p className="text-xs text-muted-foreground">
            {league.category_formats
              ? Object.values(league.category_formats).join(', ')
              : 'No configurado'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
        <div>
          <p className="text-sm font-medium">Género / Deporte</p>
          <p className="text-xs text-muted-foreground">
            {league.gender} · {league.sport}
          </p>
        </div>
      </div>
      {league.season && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
          <div>
            <p className="text-sm font-medium">Temporada</p>
            <p className="text-xs text-muted-foreground">{league.season}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LeagueDetail() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leagueQuery } = useLeagues()
  const { data: league, isLoading: loadingLeague } = leagueQuery(leagueId)
  const { teamsQuery } = useTeams(leagueId)
  const { matchesQuery } = useMatches(leagueId)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [activeTab, setActiveTab] = useState('teams')

  const isRRExpress =
    league?.category_formats &&
    Object.values(league.category_formats).some((v) => v === 'round-robin-express')

  const matches = matchesQuery.data || []
  const teams = teamsQuery.data || []

  const groups = {}
  teams.forEach((t) => {
    const g = t.group || 'A'
    if (!groups[g]) groups[g] = []
    groups[g].push(t)
  })

  const groupMatches = {}
  Object.keys(groups).forEach((g) => {
    groupMatches[g] = []
  })
  matches.forEach((m) => {
    const team = teams.find((t) => t.id === m.team1_id || t.id === m.team2_id)
    const g = team?.group || 'A'
    if (groupMatches[g]) groupMatches[g].push(m)
  })

  if (loadingLeague) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded-xl animate-pulse" />
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
        </motion.div>
      </div>
    )
  }

  if (!league) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
          <Swords className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-destructive text-lg font-medium mb-4">Liga no encontrada</p>
        <Button variant="outline" className="rounded-lg" onClick={() => navigate('/ligas')}>
          Volver a ligas
        </Button>
      </div>
    )
  }

  const jugados = matches.filter((m) => m.status === 'jugado').length
  const programados = matches.filter((m) => m.status === 'programado').length
  const sc = statusConfig(league.status)

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate('/ligas')}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 mb-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-bold tracking-tight">
                  {league.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={sc.variant} className="text-xs">
                    {sc.label}
                  </Badge>
                  {league.gender && league.sport && (
                    <span className="text-sm text-muted-foreground">
                      {league.gender} · {league.sport}
                    </span>
                  )}
                  {league.season && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {league.season}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isOrganizer && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => navigate(`/ligas/${leagueId}/editar`)}
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" /> Editar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <StatBox icon={Users} value={teams.length} label="Equipos" />
            <StatBox icon={Calendar} value={matches.length} label="Partidos" />
            <StatBox icon={Trophy} value={jugados} label="Jugados" />
            <StatBox icon={Medal} value={programados} label="Programados" />
          </div>

          {isOrganizer && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() => navigate(`/ligas/${leagueId}/partidos`)}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Crear partido
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() => navigate(`/ligas/${leagueId}/clasificacion`)}
              >
                <Medal className="w-3.5 h-3.5 mr-1.5" /> Ver clasificación
              </Button>
            </div>
          )}
        </div>

        {isRRExpress && Object.keys(groups).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-5 mb-6 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-base tracking-tight flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary" /> Round Robin Express
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg"
                onClick={() => navigate(`/ligas/${leagueId}/partidos`)}
              >
                Ir a partidos <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="grid gap-4">
              {Object.entries(groups)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([g, gTeams]) => (
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
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-xl bg-muted p-1 h-auto gap-1">
            <TabsTrigger
              value="teams"
              className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm"
            >
              <Users className="w-4 h-4 mr-1.5" /> Equipos
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm"
            >
              <Calendar className="w-4 h-4 mr-1.5" /> Calendario
            </TabsTrigger>
            <TabsTrigger
              value="standings"
              className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm"
            >
              <BarChart3 className="w-4 h-4 mr-1.5" /> Clasificación
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm"
            >
              <Settings className="w-4 h-4 mr-1.5" /> Config
            </TabsTrigger>
          </TabsList>

          <div className="bg-card border border-border rounded-xl p-5 mt-4 shadow-card min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTab === 'teams' && (
                <TabsContent value="teams" className="mt-0">
                  <motion.div
                    key="teams"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TeamsTab
                      teams={teams}
                      isOrganizer={isOrganizer}
                      onManage={() => navigate(`/ligas/${leagueId}/admin`)}
                    />
                  </motion.div>
                </TabsContent>
              )}
              {activeTab === 'calendar' && (
                <TabsContent value="calendar" className="mt-0">
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CalendarTab matches={matches} />
                  </motion.div>
                </TabsContent>
              )}
              {activeTab === 'standings' && (
                <TabsContent value="standings" className="mt-0">
                  <motion.div
                    key="standings"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <StandingsTab leagueId={leagueId} />
                  </motion.div>
                </TabsContent>
              )}
              {activeTab === 'config' && (
                <TabsContent value="config" className="mt-0">
                  <motion.div
                    key="config"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ConfigTab
                      league={league}
                      isOrganizer={isOrganizer}
                      onEdit={() => navigate(`/ligas/${leagueId}/editar`)}
                    />
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </div>
        </Tabs>

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
