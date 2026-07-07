import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

export default function ToolbarButton({ 
  icon, 
  label, 
  onClick, 
  variant = 'default', 
  size = 'default',
  disabled = false,
  href,
  ...props
}) {
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`
          inline-flex items-center gap-2 rounded-md border font-medium 
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring 
          focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none
          ${variant === 'default' ? 'border-border hover:border-primary/50' : ''}
          ${variant === 'outline' ? 'border border-hover hover:bg-muted/50' : ''}
          ${variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : ''}
          ${size === 'sm' ? 'h-9 px-3 text-sm' : size === 'lg' ? 'h-11 px-8 text-lg' : 'h-10 px-4'}
        `}
        {...props}
      >
        {icon && <icon className="w-4 h-4" />}
        <span>{label}</span>
        {!href && <ChevronRight className="w-3 h-3 ms-2" />}
      </a>
    )
  }

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      {...props}
    >
      {icon && <icon className="mr-2 h-4 w-4" />}
      {label}
      {!href && <ChevronRight className="ml-2 h-3 w-3" />}
    </Button>
  )
}