import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PlayerCard({
  player, stats, variant = 'detailed', showStats = true,
  editable = false, onEdit, onDelete, onClick, className,
}) {
  const [expanded, setExpanded] = useState(false)
  const hasStats = stats && (stats.matches_played > 0 || stats.matches_won > 0)
  const w = stats?.win_percentage || 0

  const levelBadge = {
    '3RA': 'border-l-4 border-l-amber-500',
    '4TA': 'border-l-4 border-l-blue-500',
    '5TA': 'border-l-4 border-l-emerald-500',
    '6TA': 'border-l-4 border-l-purple-500',
  }[player?.level] || 'border-l-4 border-l-primary'

  if (variant === 'compact') {
    return (
      <motion.div
        layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
        whileHover={onClick ? { y: -1 } : {}}
        className={`flex items-center gap-3 bg-white dark:bg-zinc-900 rounded-xl p-3 shadow-sm border ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick ? () => onClick(player) : undefined}
      >
        <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-semibold shrink-0 overflow-hidden">
          {player?.photo_url ? <img src={player.photo_url} alt="" className="w-full h-full object-cover" /> : player?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{player?.name || '—'}</p>
          <p className="text-xs text-zinc-500">{player?.level || '—'}</p>
        </div>
        {hasStats && <span className="text-sm font-semibold tabular-nums text-emerald-600">{w}%</span>}
        {(editable || onDelete) && (
          <div className="flex gap-0.5">
            {onEdit && <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); onEdit(player) }}><Pencil className="w-3 h-3" /></Button>}
            {onDelete && <Button variant="ghost" size="icon" className="w-7 h-7 text-red-500" onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar?`)) onDelete(player?.id) }}><Trash2 className="w-3 h-3" /></Button>}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      whileHover={onClick ? { y: -1 } : {}}
      className={`bg-white dark:bg-zinc-900 rounded-xl shadow-sm border overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick ? () => onClick(player) : undefined}
    >
      <div className={`p-5 ${levelBadge}`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-semibold shrink-0 overflow-hidden">
            {player?.photo_url ? <img src={player.photo_url} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-zinc-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">{player?.name || '—'}</p>
            <p className="text-sm text-zinc-500">{player?.level || '—'}</p>
          </div>
          {hasStats && (
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{w}<span className="text-sm text-zinc-400 font-normal">%</span></p>
              <p className="text-xs text-zinc-400">win rate</p>
            </div>
          )}
        </div>

        {hasStats && (
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'PJ', v: stats.matches_played },
                { l: 'G', v: stats.matches_won, c: 'text-emerald-600' },
                { l: 'P', v: stats.matches_lost, c: 'text-red-500' },
                { l: 'Sets', v: (stats.sets_won||0) - (stats.sets_lost||0), c: 'text-zinc-900 dark:text-zinc-50' },
              ].map(({ l, v, c }) => (
                <div key={l} className="text-center">
                  <p className={`text-lg font-semibold tabular-nums ${c || 'text-zinc-900 dark:text-zinc-50'}`}>{v}</p>
                  <p className="text-xs text-zinc-400">{l}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50"
                  initial={{ width: 0 }} animate={{ width: `${w}%` }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                />
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showStats && expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-500 font-medium mb-1">G/P</p>
                  <p className="text-lg font-semibold tabular-nums">{stats.matches_won || 0}<span className="text-zinc-300 dark:text-zinc-600">/{stats.matches_lost || 0}</span></p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-500 font-medium mb-1">Sets</p>
                  <p className="text-lg font-semibold tabular-nums">{(stats.sets_won||0)-(stats.sets_lost||0)}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-500 font-medium mb-1">Racha</p>
                  <p className="text-lg font-semibold">{w >= 50 ? '🔥' : '💧'}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-500 font-medium mb-1">Partidos</p>
                  <p className="text-lg font-semibold tabular-nums">{stats.matches_played || 0}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showStats && hasStats && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          className="w-full flex items-center justify-center gap-1 py-2.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800 transition-colors"
        >
          <motion.span animate={{ rotate: expanded ? 180 : 0 }}><ChevronDown className="w-3.5 h-3.5" /></motion.span>
          {expanded ? 'Menos' : 'Más detalles'}
        </button>
      )}

      {(editable || onDelete) && (
        <div className="flex gap-2 px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
          {onEdit && <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onEdit(player) }}><Pencil className="w-3 h-3 mr-1" />Editar</Button>}
          {onDelete && <Button variant="outline" size="sm" className="flex-1 text-red-500 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950" onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar?`)) onDelete(player?.id) }}><Trash2 className="w-3 h-3 mr-1" />Eliminar</Button>}
        </div>
      )}
    </motion.div>
  )
}

export function PlayerCardGrid({ children, className }) {
  return (
    <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {children}
    </div>
  )
}