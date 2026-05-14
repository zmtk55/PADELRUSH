import { motion } from 'framer-motion'

export default function StatCard({ label, value, icon: Icon, color, trend, trendValue, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:shadow-black/5 transition-shadow"
    >
      <div className={`p-2 rounded-lg bg-background w-fit ${color} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-heading font-bold">{value}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-sm text-muted-foreground">{label}</p>
        {trend && (
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
      <div className="w-9 h-9 rounded-lg bg-muted mb-3" />
      <div className="h-6 w-14 bg-muted rounded mb-1" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  )
}
