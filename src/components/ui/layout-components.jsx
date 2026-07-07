import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ===== PAGE CONTAINER =====
export function PageContainer({ children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('space-y-6', className)}
    >
      {children}
    </motion.div>
  )
}

// ===== SECTION CARD =====
export function SectionCard({ children, className, hover = false, padding = true }) {
  return (
    <div
      className={cn(
        'card',
        hover && 'card-highlight',
        padding ? 'p-5 sm:p-6' : '',
        className
      )}
    >
      {children}
    </div>
  )
}

// ===== SECTION HEADER =====
export function SectionHeader({ icon: Icon, title, action, className }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ===== STAGGER GRID =====
export function StaggerGrid({ children, className, columns }) {
  const cols = columns || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('grid gap-4', cols, className)}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(onClick && 'cursor-pointer', className)}
      onClick={onClick}
      whileHover={onClick ? { y: -2, transition: { duration: 0.2 } } : {}}
    >
      {children}
    </motion.div>
  )
}

// ===== EMPTY STATE =====
export function EmptyState({ icon: Icon, title, description, action, className }) {
  const DefaultIcon = Icon || Inbox
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('flex flex-col items-center justify-center py-16 sm:py-20 text-center', className)}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted flex items-center justify-center mb-5">
        <DefaultIcon className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg sm:text-xl font-heading font-bold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground font-body max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </motion.div>
  )
}

// ===== LOADING STATE =====
export function LoadingState({ message = 'Cargando...', className }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('flex flex-col items-center justify-center py-16 sm:py-20', className)}
    >
      <div className="w-12 h-12 bg-muted flex items-center justify-center mb-4">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground font-body">{message}</p>
    </motion.div>
  )
}

// ===== ERROR STATE =====
export function ErrorState({ message = 'Ocurrio un error', onRetry, className }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('flex flex-col items-center justify-center py-16 sm:py-20 text-center', className)}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 flex items-center justify-center mb-5">
        <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-heading font-bold text-foreground mb-2">Error</h3>
      <p className="text-sm text-muted-foreground font-body max-w-sm mb-6">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Reintentar</Button>}
    </motion.div>
  )
}

// ===== SKELETON =====
export function SkeletonCard({ className }) {
  return (
    <div className={cn('card p-5 sm:p-6 animate-pulse', className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/[0.06]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-white/[0.06]" />
          <div className="h-2 w-16 bg-white/[0.04]" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-white/[0.04]" />
        <div className="h-2 w-3/4 bg-white/[0.04]" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
