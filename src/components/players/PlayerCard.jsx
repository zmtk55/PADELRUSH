import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, TrendingUp, Activity, ChevronDown, BarChart3, Pencil, Trash2, Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MiniChart } from './MiniChart'
import { levelColors } from '@/lib/constants'

function WinBadge({ rate }) {
  const color = rate >= 70 ? 'bg-emerald-500' : rate >= 40 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="relative w-14 h-14">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted" />
        <motion.circle
          cx="18" cy="18" r="16" fill="none" strokeWidth="2.5" strokeLinecap="round"
          className={color}
          strokeDasharray={`${rate} ${100 - rate}`}
          initial={{ strokeDasharray: '0 100' }}
          animate={{ strokeDasharray: `${rate} ${100 - rate}` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold">{rate}</span>
      </div>
    </div>
  )
}

export function PlayerCard({
  player,
  stats,
  variant = 'detailed',
  showStats = true,
  editable = false,
  onEdit,
  onDelete,
  onClick,
  className,
}) {
  const [expanded, setExpanded] = useState(false)
  const hasStats = stats && (stats.matches_played > 0 || stats.matches_won > 0)
  const winRate = stats?.win_percentage || 0

  if (variant === 'compact') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        whileHover={onClick ? { y: -1 } : {}}
        className={`flex items-center gap-3 bg-card rounded-xl p-3 shadow-sm border ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick ? () => onClick(player) : undefined}
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0 overflow-hidden ring-1 ring-border">
          {player?.photo_url ? (
            <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            player?.name?.charAt(0)?.toUpperCase() || '?'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{player?.name || '—'}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${levelColors[player?.level] || levelColors['5TA']}`}>
              {player?.level || '—'}
            </span>
          </div>
        </div>
        {hasStats && (
          <div className="text-right shrink-0">
            <p className="text-base font-semibold text-primary">{winRate}%</p>
            <p className="text-[9px] text-muted-foreground">WIN %</p>
          </div>
        )}
        {(editable || onDelete) && (
          <div className="flex gap-1 shrink-0">
            {onEdit && <Button variant="ghost" size="icon" className="w-8 h-8" onClick={(e) => { e.stopPropagation(); onEdit(player) }}><Pencil className="w-3.5 h-3.5" /></Button>}
            {onDelete && <Button variant="ghost" size="icon" className="w-8 h-8 text-red-500" onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar a ${player?.name}?`)) onDelete(player?.id) }}><Trash2 className="w-3.5 h-3.5" /></Button>}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={onClick ? { y: -2 } : {}}
      className={`bg-card rounded-xl shadow-sm border overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick ? () => onClick(player) : undefined}
    >
      <div className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold shrink-0 overflow-hidden ring-2 ring-border">
            {player?.photo_url ? (
              <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg truncate">{player?.name || '—'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${levelColors[player?.level] || levelColors['5TA']}`}>
                {player?.level || '—'}
              </span>
            </div>
            {player?.phone && (
              <p className="text-xs text-muted-foreground mt-1">{player.phone}</p>
            )}
          </div>
          {hasStats && <WinBadge rate={winRate} />}
        </div>

        {hasStats && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: 'PJ', value: stats.matches_played, color: '' },
              { label: 'G', value: stats.matches_won, color: 'text-emerald-600' },
              { label: 'P', value: stats.matches_lost, color: 'text-red-500' },
              { label: 'Sets', value: (stats.sets_won || 0) - (stats.sets_lost || 0), color: 'text-primary' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center bg-muted/40 rounded-lg py-2.5">
                <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
              </div>
            ))}
          </div>
        )}

        {hasStats && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Win Rate</span>
              <span className="font-semibold text-foreground">{winRate}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: winRate >= 70 ? '#16a34a' : winRate >= 40 ? '#d97706' : '#ef4444' }}
                initial={{ width: 0 }}
                animate={{ width: `${winRate}%` }}
                transition={{ delay: 0.2, duration: 0.6 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence>
          {showStats && expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[9px] text-muted-foreground font-medium mb-2 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> G/P
                  </p>
                  <MiniChart
                    data={[
                      { label: 'G', value: stats.matches_won || 0, color: '#16a34a' },
                      { label: 'P', value: stats.matches_lost || 0, color: '#ef4444' },
                    ]}
                    type="bar" size={70}
                  />
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[9px] text-muted-foreground font-medium mb-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> REND.
                  </p>
                  <MiniChart
                    data={[
                      { label: 'PG', value: Math.min(stats.matches_won * 10, 100) },
                      { label: '%V', value: Math.min(winRate, 100) },
                      { label: 'PJ', value: Math.min((stats.matches_played || 0) * 8, 100) },
                    ]}
                    type="radar" size={70}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showStats && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          className="w-full flex items-center justify-center gap-1 py-2.5 text-xs text-muted-foreground hover:text-foreground border-t transition-colors bg-muted/20"
        >
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.span>
          {expanded ? 'Ocultar gráficas' : 'Ver gráficas'}
        </button>
      )}

      {(editable || onDelete) && (
        <div className="flex gap-2 px-5 py-3 border-t bg-muted/20">
          {onEdit && <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onEdit(player) }}><Pencil className="w-3.5 h-3.5 mr-1" />Editar</Button>}
          {onDelete && <Button variant="outline" size="sm" className="flex-1 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950" onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar a ${player?.name}?`)) onDelete(player?.id) }}><Trash2 className="w-3.5 h-3.5 mr-1" />Eliminar</Button>}
        </div>
      )}
    </motion.div>
  )
}

export function PlayerCardGrid({ children, className }) {
  return (
    <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
      {children}
    </div>
  )
}