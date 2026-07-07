import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Swords } from 'lucide-react'

function MatchCard({ match }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/ligas/${match.league_id}/partidos`)}
      className="group flex items-center gap-3 py-3 cursor-pointer transition-colors hover:bg-muted -mx-6 px-6 border-b border-border last:border-b-0 first:border-t-0"
    >
      <div className="flex items-center -space-x-1.5 shrink-0">
        <div className="w-8 h-8 flex items-center justify-center text-[10px] font-bold bg-muted text-muted-foreground border border-border">
          {(match.team1_name || 'E1').charAt(0).toUpperCase()}
        </div>
        <div className="w-8 h-8 flex items-center justify-center text-[10px] font-bold bg-card text-muted-foreground border border-border">
          {(match.team2_name || 'E2').charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-body text-foreground truncate">
          {match.team1_name || 'Equipo 1'}
          <span className="mx-1.5 text-muted-foreground">vs</span>
          {match.team2_name || 'Equipo 2'}
        </p>
        <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
          {match.scheduled_date && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
              <Calendar className="w-3 h-3" />
              {new Date(match.scheduled_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {match.scheduled_time && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
              <Clock className="w-3 h-3" />
              {match.scheduled_time}
            </span>
          )}
        </div>
      </div>

      <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground font-medium shrink-0">
        Programado
      </span>
    </div>
  )
}

export function UpcomingMatches({ matches }) {
  if (!matches?.length) {
    return (
      <div className="bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Swords className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-[11px] font-heading font-bold tracking-wider text-fg-secondary uppercase">Próximos Partidos</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-body">No hay partidos programados</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <Swords className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-[11px] font-heading font-bold tracking-wider text-fg-secondary uppercase">Próximos Partidos</h3>
        <span className="text-xs text-muted-foreground font-body">({matches.length})</span>
      </div>

      <div className="border-t border-border mb-1" />

      <div>
        {matches.slice(0, 6).map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  )
}
