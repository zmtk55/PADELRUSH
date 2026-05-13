import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Trophy, TrendingUp, Activity,
  ChevronDown, ChevronUp, Shield, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MiniChart } from './MiniChart'

/**
 * PlayerCard — Tarjeta reutilizable para jugadores.
 *
 * Props:
 * @param {Object} player
 *   - id, name, level, gender, photo_url, phone
 * @param {Object} stats — opcional { matches_played, matches_won, matches_lost, win_percentage, sets_won, sets_lost }
 * @param {string} variant — 'compact' | 'detailed' (default: 'detailed')
 * @param {boolean} showStats — mostrar mini gráficas (default: true)
 * @param {boolean} editable — mostrar botón editar (default: false)
 * @param {Function} onEdit — callback al editar
 * @param {Function} onDelete — callback al eliminar
 * @param {string} className — clases extra
 */
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
  const setsDiff = (stats?.sets_won || 0) - (stats?.sets_lost || 0)

  /* ── Bar data for mini chart ── */
  const barData = hasStats
    ? [
        { label: 'G', value: stats.matches_won || 0, color: '#22c55e' },
        { label: 'P', value: stats.matches_lost || 0, color: '#ef4444' },
      ]
    : []

  /* ── Radar data ── */
  const radarData = hasStats
    ? [
        { label: 'PG', value: Math.min(stats.matches_won * 10, 100) },
        { label: 'SS', value: Math.min((stats.sets_won || 0) * 15, 100) },
        { label: '%V', value: Math.min(winRate, 100) },
        { label: 'PJ', value: Math.min((stats.matches_played || 0) * 8, 100) },
      ]
    : []

  /* ── Level badge colors ── */
  const levelColors = {
    '3RA': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    '4TA': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    '5TA': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    '6TA': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  }
  const levelClass = levelColors[player?.level] || levelColors['5TA']

  /* ── Compact variant ── */
  if (variant === 'compact') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        whileHover={onClick ? { scale: 1.01 } : {}}
        className={`flex items-center gap-3 bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick ? () => onClick(player) : undefined}
      >
        {/* Photo / Avatar */}
        <div className="relative shrink-0">
          {player?.photo_url ? (
            <img
              src={player.photo_url}
              alt={player.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
              player?.photo_url ? 'hidden' : ''
            }`}
            style={{
              background: player
                ? `linear-gradient(135deg, var(--primary), hsl(var(--primary) / 0.6))`
                : 'var(--muted)',
            }}
          >
            {player?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{player?.name || '—'}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${levelClass}`}>
              {player?.level || '—'}
            </span>
            <span className="text-[10px] text-muted-foreground">{player?.gender === 'varonil' ? '♂' : '♀'}</span>
          </div>
        </div>

        {/* Mini win rate */}
        {hasStats && (
          <div className="text-right shrink-0">
            <motion.p
              className="text-lg font-heading font-bold"
              style={{ color: winRate >= 50 ? 'var(--primary)' : 'var(--muted-foreground)' }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            >
              {winRate}%
            </motion.p>
            <p className="text-[9px] text-muted-foreground">% victoria</p>
          </div>
        )}

        {/* Actions */}
        {(editable || onDelete) && (
          <div className="flex gap-0.5 shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7"
                onClick={(e) => { e.stopPropagation(); onEdit(player) }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
                </svg>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-destructive"
                onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar a ${player?.name}?`)) onDelete(player?.id) }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </Button>
            )}
          </div>
        )}
      </motion.div>
    )
  }

  /* ── Detailed variant ── */
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={onClick ? { y: -2, boxShadow: '0 8px 24px -6px rgba(0,0,0,0.15)' } : {}}
      className={`bg-card border border-border rounded-xl overflow-hidden transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick ? () => onClick(player) : undefined}
    >
      {/* ── Header: photo + info ── */}
      <div className="p-5 flex items-center gap-4">
        {/* Photo */}
        <div className="relative">
          <motion.div
            className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-border shrink-0"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {player?.photo_url ? (
              <img
                src={player.photo_url}
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex items-center justify-center text-white text-xl font-bold ${
                player?.photo_url ? 'hidden' : ''
              }`}
              style={{
                background: player
                  ? `linear-gradient(135deg, var(--primary), hsl(var(--primary) / 0.5))`
                  : 'var(--muted)',
              }}
            >
              <User className="w-6 h-6" />
            </div>
          </motion.div>

        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-base truncate">{player?.name || '—'}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${levelClass}`}>
              {player?.level || '—'}
            </span>
            <span className="text-xs text-muted-foreground">
              {player?.gender === 'varonil' ? 'Varonil ♂' : 'Femenil ♀'}
            </span>
          </div>
          {player?.phone && (
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.854.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {player.phone}
            </p>
          )}
        </div>

        {/* Win rate badge */}
        {hasStats && (
          <motion.div
            className="text-center shrink-0 ml-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
              style={{
                background: `conic-gradient(
                  ${winRate >= 50 ? 'var(--primary)' : 'var(--destructive)'} ${winRate}%,
                  var(--muted) ${winRate}%
                )`,
              }}
            >
              <span className={`text-sm font-heading font-bold ${winRate >= 50 ? 'text-primary' : 'text-destructive'}`}>
                {winRate}
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Win %</p>
          </motion.div>
        )}
      </div>

      {/* ── Stats mini-charts (expandable) ── */}
      {showStats && (
        <AnimatePresence>
          <motion.div
            initial={expanded ? 'open' : 'closed'}
            animate={expanded ? 'open' : 'closed'}
            variants={{
              open: { height: 'auto', opacity: 1 },
              closed: { height: 0, opacity: 0 },
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
              {/* Mini stats grid */}
              {hasStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'PJ', value: stats.matches_played, icon: <Activity className="w-3.5 h-3.5" /> },
                    { label: 'PG', value: stats.matches_won, icon: <Trophy className="w-3.5 h-3.5 text-emerald-500" /> },
                    { label: 'PP', value: stats.matches_lost, icon: <ChevronDown className="w-3.5 h-3.5 text-red-500" /> },
                    { label: 'Sets Dif', value: setsDiff, icon: <TrendingUp className="w-3.5 h-3.5 text-primary" /> },
                  ].map(({ label, value, icon }) => (
                    <motion.div
                      key={label}
                      className="bg-background rounded-xl p-3 border border-border text-center"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] mb-1">
                        {icon}
                        <span>{label}</span>
                      </div>
                      <p className="font-heading font-bold text-sm">{value}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Mini charts row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background rounded-xl p-3 border border-border">
                  <p className="text-[9px] text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                    <BarChart3 className="w-3 h-3 inline mr-1" />
                    Victorias / Derrotas
                  </p>
                  <MiniChart data={barData} type="bar" size={70} />
                </div>

                <div className="bg-background rounded-xl p-3 border border-border">
                  <p className="text-[9px] text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Rendimiento
                  </p>
                  <MiniChart data={radarData} type="radar" size={70} />
                </div>
              </div>

              {/* Progress bar */}
              {hasStats && (
                <div className="bg-background rounded-xl p-3 border border-border">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Nivel de victoria</span>
                    <span>{winRate}%</span>
                  </div>
                  <motion.div
                    className="h-1.5 rounded-full bg-muted overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: 'var(--primary)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${winRate}%` }}
                      transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
                    />
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Expand toggle ── */}
      {showStats && (
        <div className="px-5 py-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
          >
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </motion.span>
            <span className="text-[11px] ml-1">
              {expanded ? 'Ocultar estadísticas' : 'Ver estadísticas'}
            </span>
          </Button>
        </div>
      )}

      {/* ── Actions footer ── */}
      {(editable || onDelete) && (
        <div className="px-5 py-3 flex gap-2 border-t border-border">
          {onEdit && (
            <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onEdit(player) }}>
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar a ${player?.name}?`)) onDelete(player?.id) }}
            >
              Eliminar
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}

/**
 * PlayerCardGrid — Contenedor con layout responsivo para múltiples PlayerCards.
 */
export function PlayerCardGrid({ children, cols = 3, className }) {
  return (
    <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))` }}>
      {children}
    </div>
  )
}