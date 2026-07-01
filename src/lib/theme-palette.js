export const GRADIENT_PALETTE = [
  { from: 'from-violet-500', to: 'to-purple-600', name: 'Violet' },
  { from: 'from-emerald-500', to: 'to-teal-600', name: 'Emerald' },
  { from: 'from-amber-500', to: 'to-orange-600', name: 'Amber' },
  { from: 'from-rose-500', to: 'to-pink-600', name: 'Rose' },
  { from: 'from-cyan-500', to: 'to-blue-600', name: 'Cyan' },
  { from: 'from-lime-500', to: 'to-green-600', name: 'Lime' },
  { from: 'from-fuchsia-500', to: 'to-purple-600', name: 'Fuchsia' },
  { from: 'from-sky-500', to: 'to-indigo-600', name: 'Sky' },
]

export const GROUP_COLORS = {
  A: { bg: 'bg-violet-500/10', border: 'border-violet-500/40', accent: 'text-violet-600', dot: 'bg-violet-500' },
  B: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', accent: 'text-emerald-600', dot: 'bg-emerald-500' },
  C: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', accent: 'text-amber-600', dot: 'bg-amber-500' },
  D: { bg: 'bg-rose-500/10', border: 'border-rose-500/40', accent: 'text-rose-600', dot: 'bg-rose-500' },
  E: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', accent: 'text-cyan-600', dot: 'bg-cyan-500' },
  F: { bg: 'bg-lime-500/10', border: 'border-lime-500/40', accent: 'text-lime-600', dot: 'bg-lime-500' },
  G: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/40', accent: 'text-fuchsia-600', dot: 'bg-fuchsia-500' },
  H: { bg: 'bg-sky-500/10', border: 'border-sky-500/40', accent: 'text-sky-600', dot: 'bg-sky-500' },
}

export const CATEGORY_COLORS = {
  '1RA': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  '2DA': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  '3RA': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  '4TA': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  '5TA': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
}

export const LEAGUE_DEFAULT_COLOR = 'hsl(var(--primary))'

export function getGradientClass(index) {
  const gradient = GRADIENT_PALETTE[index % GRADIENT_PALETTE.length]
  return `${gradient.from} ${gradient.to}`
}

export function getGroupColor(group) {
  return GROUP_COLORS[group] || GROUP_COLORS.A
}

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' }
}
