import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function computeStandings(players) {
  return [...players]
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      const aSetDiff = (a.sf - a.sa) - (b.sf - b.sa)
      if (aSetDiff !== 0) return aSetDiff
      const aGameDiff = (b.gf - b.ga) - (a.gf - a.ga)
      if (aGameDiff !== 0) return aGameDiff
      return b.pg - a.pg
    })
    .map((p, i) => ({ ...p, position: i + 1 }))
}

const PODIUM = [
  { border: 'border-yellow-500/50', icon: Crown, rank: 'CAMPEON', color: 'text-yellow-400', delay: 0.1 },
  { border: 'border-gray-400/30', icon: Medal, rank: 'SUBCAMPEON', color: 'text-gray-300', delay: 0.2 },
  { border: 'border-amber-700/30', icon: Medal, rank: 'TERCERO', color: 'text-amber-500', delay: 0.3 },
]

function PodiumCard({ player, index }) {
  const p = PODIUM[index]
  const Icon = p.icon
  const setDiff = player.sf - player.sa
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: p.delay, type: 'spring', stiffness: 150, damping: 15 }}
      className={cn('relative flex flex-col items-center p-4 sm:p-6 rounded-lg border transition-colors', p.border, 'bg-card hover:bg-muted/30')}
    >
      {index === 0 && (
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.4, type: 'spring', stiffness: 200 }} className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2">
          <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400" />
        </motion.div>
      )}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: p.delay + 0.2, type: 'spring', stiffness: 200 }}>
        <Icon className={cn('w-6 h-6 sm:w-7 sm:h-7 mb-1', p.color)} />
      </motion.div>
      <span className={cn('text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest', p.color)}>{p.rank}</span>
      <p className="text-sm sm:text-base font-bold text-foreground mt-1 text-center leading-tight">{player.team_name || player.name || `Jugador ${player.team_id || player.id}`}</p>
      <div className="flex items-center gap-2 sm:gap-3 mt-2 text-xs text-muted-foreground">
        <span className="font-score text-foreground text-base sm:text-lg">{player.pts}</span>
        <span>pts</span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        {setDiff > 0 ? <TrendingUp className="w-3 h-3 text-success" /> : setDiff < 0 ? <TrendingDown className="w-3 h-3 text-destructive" /> : null}
        <span className={cn('text-[10px] font-score', setDiff > 0 ? 'text-success' : setDiff < 0 ? 'text-destructive' : 'text-muted-foreground')}>{setDiff > 0 ? '+' : ''}{setDiff}</span>
      </div>
    </motion.div>
  )
}

function TableRow({ player, index, qualifyingSpots }) {
  const setDiff = player.sf - player.sa
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
      <div className={cn('flex items-center gap-2 px-3 py-2.5 text-sm border-b border-border/30 last:border-b-0 min-w-[500px]', qualifyingSpots && player.position <= qualifyingSpots && 'bg-primary/5 border-l-2 border-l-primary')}>
        <span className={cn('font-score text-xs w-6', player.position === 1 ? 'text-yellow-400' : player.position === 2 ? 'text-gray-300' : player.position === 3 ? 'text-amber-500' : 'text-muted-foreground')}>#{player.position}</span>
        <span className="flex-1 truncate font-medium text-foreground">
          {player.team_name || player.name || `Jugador ${player.team_id || player.id}`}
          {qualifyingSpots && player.position <= qualifyingSpots && <Zap className="w-3 h-3 inline ml-1.5 text-success" />}
        </span>
        <span className="text-center font-score text-xs text-muted-foreground w-6">{player.pg || 0}</span>
        <span className="text-center font-score text-xs text-success w-6">{player.pw || 0}</span>
        <span className="text-center font-score text-xs text-destructive w-6">{player.pl || 0}</span>
        <span className="text-center font-score text-xs w-12">{player.sf || 0}:{player.sa || 0}</span>
        <span className={cn('text-center font-score text-xs w-8', setDiff > 0 ? 'text-success' : setDiff < 0 ? 'text-destructive' : 'text-muted-foreground')}>{setDiff > 0 ? '+' : ''}{setDiff}</span>
        <span className="text-center font-score text-sm font-bold text-foreground w-8">{player.pts || 0}</span>
      </div>
    </motion.div>
  )
}

const TABLE_HEADERS = ['#', 'Jugador', 'PJ', 'G', 'P', 'Sets', 'D.S', 'Pts']

export default function RoundRobinStandings({ players = [], qualifyingSpots, title, groupLabel }) {
  const sorted = computeStandings(players)
  const top3 = sorted.slice(0, 3)
  if (sorted.length === 0) {
    return (
      <div className="card-base py-8 sm:py-14 text-center">
        <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center mx-auto mb-3">
        <Trophy className="w-6 h-6 text-muted-foreground" />
      </div>
        <p className="text-base font-bold text-foreground/60">Sin datos</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">No hay jugadores para mostrar</p>
      </div>
    )
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      {title && <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" />{title}</h3>}
      {groupLabel && <div className="flex items-center gap-2 px-1 sm:px-0"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grupo {groupLabel}</span><div className="flex-1 h-px bg-border" /></div>}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-1 sm:gap-4 items-end px-1 sm:px-0">
          <div className={top3.length >= 2 ? '' : 'invisible'}>{top3.length >= 2 && <PodiumCard player={top3[1]} index={1} />}</div>
          <div className={top3.length >= 1 ? '-mb-4 sm:-mb-6' : 'invisible'}>{top3.length >= 1 && <PodiumCard player={top3[0]} index={0} />}</div>
          <div className={top3.length >= 3 ? '' : 'invisible'}>{top3.length >= 3 && <PodiumCard player={top3[2]} index={2} />}</div>
        </div>
      )}
      {sorted.length > 3 && (
        <div className="card-base overflow-x-auto scroll-momentum scrollbar-none overscroll-x-contain">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 border-b border-border min-w-[460px] sm:min-w-[500px]">
            {TABLE_HEADERS.map(h => <span key={h} className={h === '#' ? 'w-6' : h === 'Jugador' ? 'flex-1' : h === 'Sets' ? 'w-12 text-center' : h === 'D.S' ? 'w-8 text-center' : 'w-6 text-center'}>{h}</span>)}
          </div>
          <div className="divide-y divide-border/30">
            {sorted.map((player, i) => <TableRow key={player.team_id || player.id || i} player={player} index={i} qualifyingSpots={qualifyingSpots} />)}
          </div>
        </div>
      )}
    </div>
  )
}
