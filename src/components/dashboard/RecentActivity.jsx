import { Trophy, CheckCircle2 } from 'lucide-react'

export function RecentActivity({ activities }) {
  if (!activities?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-lg mb-4">Actividad reciente</h2>
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm">Sin actividad reciente</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="font-heading font-semibold text-lg mb-4">Actividad reciente</h2>
      <div className="space-y-3">
        {activities.slice(0, 8).map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.title}</p>
              {activity.league && (
                <p className="text-xs text-muted-foreground">{activity.league}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {new Date(activity.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
