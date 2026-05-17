import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Medal, Trophy, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TopPlayers({ players = [], leagueId }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl shadow-sm border p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Top Jugadores</p>
            <p className="text-xs text-muted-foreground">Mejores rendimientos</p>
          </div>
        </div>
        {leagueId && (
          <button onClick={() => navigate(`/ligas/${leagueId}/standings`)}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
            Ver todo <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {players.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Medal className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">Sin datos de jugadores</p>
        </div>
      ) : (
        <div className="space-y-1">
          {players.slice(0, 5).map((p, i) => (
            <motion.div
              key={p.id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ x: 2 }}
              onClick={() => navigate(`/jugadores/${encodeURIComponent(p.name)}`)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <span className={`w-6 text-center text-sm font-semibold ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                {i + 1}
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                {p.name ? p.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name || 'Jugador'}</p>
                <p className="text-xs text-muted-foreground">{p.puntos || 0} pts</p>
              </div>
              {p.trend && (
                p.trend === 'up'
                  ? <TrendingUp className="w-4 h-4 text-emerald-500" />
                  : <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}