import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock } from 'lucide-react'

export function UpcomingMatches({ matches }) {
  const navigate = useNavigate()

  if (!matches?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-lg mb-4">Próximos partidos</h2>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm">No hay partidos programados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="font-heading font-semibold text-lg mb-4">Próximos partidos</h2>
      <div className="space-y-3">
        {matches.slice(0, 5).map((match) => (
          <div
            key={match.id}
            onClick={() => navigate(`/ligas/${match.league_id}/partidos`)}
            className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {match.team1_name || 'Equipo 1'} <span className="text-muted-foreground">vs</span> {match.team2_name || 'Equipo 2'}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {match.scheduled_date && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(match.scheduled_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                {match.scheduled_time && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {match.scheduled_time}
                  </span>
                )}
                {match.court && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {match.court}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
              Programado
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
