import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Helper para formatear fechas en estilo Vercel
export function formatDate(date) {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

// Helper para números compactos
export function compactNumber(num) {
  return new Intl.NumberFormat('es-AR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num)
}