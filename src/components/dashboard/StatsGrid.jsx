import { Trophy, Users, Calendar, TrendingUp, Target } from 'lucide-react'

const statConfig = [
  { label: 'Ligas activas', icon: Trophy, color: 'text-primary', bg: 'bg-primary/10', key: 'activeLeagues' },
  { label: 'Participantes', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', key: 'totalParticipants' },
  { label: 'Partidos jugados', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10', key: 'totalMatches' },
  { label: 'Equipos', icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10', key: 'totalTeams' },
]

export function StatsGrid({ stats }) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map(({ label, icon: Icon, color, bg, key }) => (
        <div key={key} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className={`p-2 rounded-lg w-fit mb-3 ${bg} ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-heading font-bold">{stats[key] ?? 0}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  )
}
