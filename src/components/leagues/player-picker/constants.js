export const gruposLetras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export const groupColors = {
  A: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', accent: 'text-amber-600' },
  B: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', accent: 'text-blue-600' },
  C: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', accent: 'text-emerald-600' },
  D: { bg: 'bg-purple-500/10', border: 'border-purple-500/40', accent: 'text-purple-600' },
  E: { bg: 'bg-rose-500/10', border: 'border-rose-500/40', accent: 'text-rose-600' },
  F: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', accent: 'text-cyan-600' },
  G: { bg: 'bg-orange-500/10', border: 'border-orange-500/40', accent: 'text-orange-600' },
  H: { bg: 'bg-teal-500/10', border: 'border-teal-500/40', accent: 'text-teal-600' },
}

export const avatarColors = [
  'from-blue-500 to-blue-600', 'from-emerald-500 to-emerald-600',
  'from-violet-500 to-violet-600', 'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600', 'from-cyan-500 to-cyan-600',
  'from-orange-500 to-orange-600', 'from-teal-500 to-teal-600',
]

export const getInitials = (n) => { if (!n) return '?'; return n.charAt(0).toUpperCase() }

export const getAvatarColor = (seed) => {
  if (!seed) return avatarColors[0]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}
