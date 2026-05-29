import { motion } from 'framer-motion'
import { Trophy, Users, Calendar, Flag } from 'lucide-react'

const statConfig = [
  { label: 'Ligas activas', icon: Trophy, key: 'activeLeagues' },
  { label: 'Participantes', icon: Users, key: 'totalParticipants' },
  { label: 'Partidos jugados', icon: Calendar, key: 'totalMatches' },
  { label: 'Equipos', icon: Flag, key: 'totalTeams' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function StatsGrid({ stats }) {
  if (!stats) return null
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statConfig.map(({ label, icon: Icon, key }) => (
        <motion.div key={key} variants={item} className="card-base p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-3xl font-bold text-foreground">{stats[key] ?? 0}</span>
            <span className="text-xs text-muted-foreground font-body">total</span>
          </div>
          <div className="mt-3 h-1 rounded-full bg-muted/50 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: Math.min((stats[key] || 0) / 20 * 100, 100) + '%' }} transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full bg-primary" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
