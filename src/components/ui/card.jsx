import { cn } from '@/lib/utils'

export function Card({ className, children, hover }) {
  return (
    <div className={cn('card', hover && 'card-highlight', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('flex flex-col space-y-1 px-4 py-3 border-b border-border-subtle', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children }) {
  return (
    <h3 className={cn('text-sm font-heading font-bold text-foreground tracking-wider', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children }) {
  return (
    <div className={cn('px-4 py-3', className)}>
      {children}
    </div>
  )
}
