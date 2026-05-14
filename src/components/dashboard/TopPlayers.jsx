import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Medal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const rankColors = ['text-amber-500', 'text-gray-400', 'text-amber-700']

export default function TopPlayers({ players = [], leagueId }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-lg">Top jugadores</h2>
        {leagueId && (
          <button
            onClick={() => navigate(`/ligas/${leagueId}/standings`)}
            className="text-xs text-primary hover:underline"
          >
            Clasificación
          </button>
        )}
      </div>
      {players.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Medal className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-sm">Sin datos de jugadores aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {players.slice(0, 5).map((p, i) => (
            <div
              key={p.id || i}
              onClick={() => navigate(`/jugadores/${p.name}`)}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <span className={`w-6 text-center text-sm font-bold ${rankColors[i] || 'text-muted-foreground'}`}>
                {i + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
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
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
