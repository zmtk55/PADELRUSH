import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function timeUntil(dateStr) {
  const diff = new Date(dateStr) - new Date()
  if (diff < 0) return 'Ya comenzó'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 0) return `En ${days} día${days > 1 ? 's' : ''}`
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours > 0) return `En ${hours}h`
  const mins = Math.floor(diff / (1000 * 60))
  return `En ${mins}min`
}

export default function UpcomingMatches({ matches = [], leagueId }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-lg">Próximos partidos</h2>
        {leagueId && (
          <button
            onClick={() => navigate(`/ligas/${leagueId}/partidos`)}
            className="text-xs text-primary hover:underline"
          >
            Ver todos
          </button>
        )}
      </div>
      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Calendar className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-sm">No hay partidos programados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.slice(0, 5).map((m) => {
            const date = m.scheduled_at || m.date
            return (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {m.team1?.name || m.team1_name || 'Equipo 1'} vs {m.team2?.name || m.team2_name || 'Equipo 2'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeUntil(date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {m.location || '—'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary whitespace-nowrap">
                  {new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
