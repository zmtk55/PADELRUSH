import { Trophy, Swords, UserPlus, CheckCircle2 } from 'lucide-react'

function getTimeAgo(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours}h`
  if (diffDays < 7) return `hace ${diffDays}d`
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

const activityIcons = {
  match_result: Swords,
  league_created: Trophy,
  player_joined: UserPlus,
}

function getIcon(type) {
  return activityIcons[type] || CheckCircle2
}

export function RecentActivity({ activities }) {
  if (!activities?.length) {
    return (
      <div className="bg-card border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-[11px] font-heading font-bold tracking-wider text-fg-secondary uppercase">Actividad Reciente</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-body">Sin actividad reciente</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-[11px] font-heading font-bold tracking-wider text-fg-secondary uppercase">Actividad Reciente</h3>
      </div>

      <div className="border-t border-border mb-1" />

      <div>
        {activities.slice(0, 8).map((activity) => {
          const Icon = getIcon(activity.type)
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 py-2.5 border-b border-border last:border-b-0 group"
            >
              <div className="w-7 h-7 flex items-center justify-center shrink-0 bg-muted">
                <Icon className="w-3 h-3 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-body text-foreground truncate">
                  {activity.title}
                </p>
                {activity.league && (
                  <p className="text-xs text-muted-foreground font-body">{activity.league}</p>
                )}
                {activity.details && activity.details !== activity.title && (
                  <p className="text-xs text-muted-foreground font-body mt-0.5">{activity.details}</p>
                )}
              </div>

              <span className="text-xs text-muted-foreground font-body shrink-0 pt-1 whitespace-nowrap">
                {getTimeAgo(activity.date)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
