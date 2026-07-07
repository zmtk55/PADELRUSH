import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-[14px] font-medium tracking-[-0.01em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-develop focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 text-white shadow-vercel-border hover:bg-gray-800 active:scale-[0.98]',
        destructive: 'bg-destructive text-destructive-foreground shadow-vercel-border hover:opacity-90 active:scale-[0.98]',
        outline: 'bg-transparent text-gray-900 shadow-vercel-border hover:shadow-vercel-card',
        secondary: 'bg-gray-50 text-gray-900 shadow-vercel-border hover:bg-gray-100',
        ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
        link: 'text-gray-900 underline-offset-4 hover:underline',
        develop: 'bg-transparent text-develop shadow-vercel-border hover:bg-gray-50',
        preview: 'bg-transparent text-preview shadow-vercel-border hover:bg-gray-50',
        ship: 'bg-transparent text-ship shadow-vercel-border hover:bg-gray-50',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-[12px]',
        lg: 'h-12 px-6 text-[16px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, style, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} style={style} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }