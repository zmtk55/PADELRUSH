import { useNavigate } from 'react-router-dom'
import { ChevronRight, Trophy } from 'lucide-react'

export function LeagueOverview({ leagues }) {
  const navigate = useNavigate()

  if (!leagues?.length) {
    return (
      <div className="bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-[11px] font-heading font-bold tracking-wider text-fg-secondary uppercase">Tus Ligas</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-body">No hay ligas creadas</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-[11px] font-heading font-bold tracking-wider text-fg-secondary uppercase">Tus Ligas</h3>
          <span className="text-xs text-muted-foreground font-body">({leagues.length})</span>
        </div>
      </div>

      <div className="border-t border-border mb-1" />

      {leagues.slice(0, 8).map((league, index) => (
        <div
          key={league.id}
          onClick={() => navigate(`/ligas/${league.id}`)}
          className="group flex items-center justify-between py-3 cursor-pointer transition-colors hover:bg-muted -mx-6 px-6"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 flex items-center justify-center bg-foreground text-background text-[11px] font-bold shrink-0">
              {league.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-body font-medium text-foreground truncate">
                {league.name}
              </p>
              <p className="text-xs text-muted-foreground font-body truncate">
                {league.gender} · {league.season || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {league.status && (
              <span className={`text-[10px] px-2 py-0.5 font-medium ${
                league.status === 'activa'
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {league.status}
              </span>
            )}
            <ChevronRight className="w-3 h-3 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5" />
          </div>
        </div>
      ))}
    </div>
  )
}
