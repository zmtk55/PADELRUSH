import { motion } from 'framer-motion'
import { Trophy, Users, Swords, UserPlus, Clock } from 'lucide-react'

const activityIcons = {
  league_created: Trophy,
  match_played: Swords,
  participant_added: UserPlus,
  team_formed: Users,
}

const activityColors = {
  league_created: 'text-primary',
  match_played: 'text-emerald-500',
  participant_added: 'text-blue-500',
  team_formed: 'text-amber-500',
}

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (seconds < 60) return 'Ahora'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `Hace ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}

export default function ActivityFeed({ activities = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <h2 className="font-heading font-semibold text-lg mb-4">Actividad reciente</h2>
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Clock className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-sm">Sin actividad reciente</p>
        </div>
      ) : (
        <div className="space-y-0 max-h-[320px] overflow-y-auto pr-2">
          {activities.slice(0, 8).map((a, i) => {
            const Icon = activityIcons[a.type] || Clock
            const color = activityColors[a.type] || 'text-muted-foreground'
            return (
              <div key={a.id || i} className="flex gap-3 py-3 border-b border-border last:border-0">
                <div className={`p-1.5 rounded-lg bg-background ${color} shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(a.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
