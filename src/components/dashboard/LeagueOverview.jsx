import { useNavigate } from 'react-router-dom'
import { ChevronRight, Trophy } from 'lucide-react'

export function LeagueOverview({ leagues }) {
  const navigate = useNavigate()

  if (!leagues?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-lg mb-4">Ligas</h2>
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm">No hay ligas creadas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="font-heading font-semibold text-lg mb-4">Tus ligas</h2>
      <div className="space-y-2">
        {leagues.slice(0, 8).map((league) => (
          <div
            key={league.id}
            onClick={() => navigate(`/ligas/${league.id}`)}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: league.color || '#c96442' }}
              >
                {league.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm">{league.name}</p>
                <p className="text-xs text-muted-foreground">
                  {league.gender} · {league.season || '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                league.status === 'activa' ? 'bg-emerald-100 text-emerald-700' :
                league.status === 'finalizada' ? 'bg-gray-100 text-gray-600' :
                'bg-amber-100 text-amber-700'
              }`}>
                {league.status}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
