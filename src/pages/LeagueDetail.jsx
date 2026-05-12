import { useParams, useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, ArrowLeft, Edit } from 'lucide-react'
import { useLeagues } from '@/hooks/useLeagues'
import { useTeams } from '@/hooks/useTeams'
import { useMatches } from '@/hooks/useMatches'
import { usePlayerStats } from '@/hooks/usePlayerStats'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import { TeamStatsModal } from '@/components/teams/TeamStatsModal'
import { useState } from 'react'
import { motion } from 'framer-motion'

const statusBadge = {
  activa: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  finalizada: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  proxima: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

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

  if (loadingLeague) return <p className="text-muted-foreground">Cargando...</p>
  if (!league) return <p className="text-destructive">Liga no encontrada</p>

  const matches = matchesQuery.data || []
  const teams = teamsQuery.data || []
  const jugados = matches.filter((m) => m.status === 'jugado').length
  const programados = matches.filter((m) => m.status === 'programado').length

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/ligas')} className="mb-4">
        <ArrowLeft className="w-4 h-4" />
        Volver a ligas
      </Button>

      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-heading font-bold text-2xl"
              style={{ backgroundColor: league.color || '#c96442' }}
            >
              {league.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">{league.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="secondary">{league.gender} · {league.sport}</Badge>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[league.status]}`}>
                  {league.status}
                </span>
                {league.season && <span className="text-xs text-muted-foreground">{league.season}</span>}
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
            <Button size="sm" onClick={() => navigate(`/ligas/${leagueId}/clasificacion`)}>
              <Trophy className="w-4 h-4" />
              Clasificación
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/ligas/${leagueId}/equipos`)}>
              <Users className="w-4 h-4" />
              Equipos
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/ligas/${leagueId}/partidos`)}>
              <Calendar className="w-4 h-4" />
              Partidos
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <StatBox icon={Trophy} value={teams.length} label="Equipos" />
          <StatBox icon={Calendar} value={matches.length} label="Partidos" />
          <StatBox icon={Trophy} value={jugados} label="Jugados" />
          <StatBox icon={Calendar} value={programados} label="Programados" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-heading font-semibold mb-4">Equipos</h2>
          {teams.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aún no hay equipos registrados</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => isOrganizer && setSelectedTeam(team)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                      {team.team_number}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{team.team_name || `Equipo ${team.team_number}`}</p>
                      <p className="text-xs text-muted-foreground">#{team.team_number} · {team.category}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {team.player1?.name?.split(' ')[0] || '?'} / {team.player2?.name?.split(' ')[0] || '?'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-heading font-semibold mb-4">Últimos partidos</h2>
          {matches.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aún no hay partidos registrados</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {matches.slice(0, 10).map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="text-sm">
                    <p className="font-medium">
                      {match.team1_name || `Team ${match.team1_number}`} vs{' '}
                      {match.team2_name || `Team ${match.team2_number}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {match.category} · {match.round ? `Ronda ${match.round}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    {match.status === 'jugado' ? (
                      <p className="text-sm font-bold">
                        {match.sets_won_team1}-{match.sets_won_team2}
                      </p>
                    ) : (
                      <span className="text-xs text-muted-foreground">{match.scheduled_date || '—'}</span>
                    )}
                  </div>
                </div>
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
    </div>
  )
}

function StatBox({ icon: Icon, value, label }) {
  return (
    <div className="bg-background rounded-lg p-3 text-center">
      <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
      <p className="text-xl font-heading font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
