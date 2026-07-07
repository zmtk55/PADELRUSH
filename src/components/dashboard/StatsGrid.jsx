import { Trophy, Users, Calendar, Target } from 'lucide-react'

const statConfig = [
  { label: 'Ligas activas', icon: Trophy, key: 'activeLeagues' },
  { label: 'Participantes', icon: Users, key: 'totalParticipants' },
  { label: 'Partidos jugados', icon: Calendar, key: 'totalMatches' },
  { label: 'Equipos', icon: Target, key: 'totalTeams' },
]

export function StatsGrid({ stats }) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
      {statConfig.map(({ label, icon: Icon, key }, index) => (
        <div
          key={key}
          className="bg-card p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="sport-label">{label}</span>
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="sport-value">
            {stats[key] ?? 0}
          </div>
        </div>
      ))}
    </div>
  )
}
