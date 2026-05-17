import { motion } from 'framer-motion'

export default function StatCard({ label, value, icon: Icon, color, trend, trendValue, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      whileHover={{ y: -1 }}
      className="bg-card rounded-xl shadow-sm border p-5"
    >
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mb-3">
        <Icon className={`w-4 h-4 ${color || 'text-muted-foreground'}`} />
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <p className="text-sm text-muted-foreground">{label}</p>
        {trend && (
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl shadow-sm border p-5">
      <div className="w-9 h-9 rounded-lg bg-muted mb-3" />
      <div className="h-6 w-16 bg-muted rounded mb-1" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  )
}
