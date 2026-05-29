import { motion } from 'framer-motion'
import { Activity, Trophy, Users, Swords, Clock } from 'lucide-react'

const activityIcons = {
  league_created: Trophy,
  match_played: Swords,
  participant_added: Users,
  match_scheduled: Clock,
}

function ActivityItem({ activity, index }) {
  const Icon = activityIcons[activity.type] || Activity
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-center gap-4 py-3.5 px-6 border-b border-border/50 last:border-b-0"
    >
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body font-medium text-foreground truncate">{activity.description}</p>
        {activity.timestamp && <p className="text-xs font-body text-muted-foreground mt-0.5">{new Date(activity.timestamp).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>}
      </div>
    </motion.div>
  )
}

export function RecentActivity({ activities }) {
  if (!activities?.length) {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><Activity className="w-4 h-4 text-muted-foreground" /></div>
          <h3 className="font-heading text-base font-semibold text-foreground tracking-wider">Actividad Reciente</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm font-body text-muted-foreground">Sin actividad reciente</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card-base p-0">
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><Activity className="w-4 h-4 text-muted-foreground" /></div>
        <h3 className="font-heading text-base font-semibold text-foreground tracking-wider">Actividad Reciente</h3>
      </div>
      <div className="divide-y divide-border/50">
        {activities.slice(0, 6).map((act, i) => (<ActivityItem key={act.id || i} activity={act} index={i} />))}
      </div>
    </motion.div>
  )
}
