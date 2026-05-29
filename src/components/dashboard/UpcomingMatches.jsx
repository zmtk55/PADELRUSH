import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, Swords, ChevronRight } from 'lucide-react'

function MatchCard({ match, index }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => navigate(`/ligas/${match.league_id}/partidos`)}
      className="group flex items-center gap-4 py-3.5 px-6 cursor-pointer transition-all duration-200 hover:bg-muted/30 hover:pl-7 border-b border-border/50 last:border-b-0"
    >
      <div className="flex items-center -space-x-2 shrink-0">
        <div className="w-9 h-9 flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground border border-border/50 rounded-lg">
          {(match.team1_name || 'E1').charAt(0).toUpperCase()}
        </div>
        <div className="w-9 h-9 flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground border border-border/50 rounded-lg">
          {(match.team2_name || 'E2').charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body font-medium text-foreground truncate">{match.team1_name || 'Equipo 1'}<span className="mx-1.5 text-muted-foreground">vs</span>{match.team2_name || 'Equipo 2'}</p>
        <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
          {match.scheduled_date && <span className="flex items-center gap-1 text-xs text-muted-foreground font-body"><Calendar className="w-3 h-3" />{new Date(match.scheduled_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>}
          {match.scheduled_time && <span className="flex items-center gap-1 text-xs text-muted-foreground font-body"><Clock className="w-3 h-3" />{match.scheduled_time}</span>}
        </div>
      </div>
      <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold font-body shrink-0">Programado</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-200" />
    </motion.div>
  )
}

export function UpcomingMatches({ matches }) {
  if (!matches?.length) {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><Swords className="w-4 h-4 text-muted-foreground" /></div>
          <h3 className="font-heading text-base font-semibold text-foreground tracking-wider">Proximos Partidos</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <Calendar className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm font-body text-muted-foreground">No hay partidos programados</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-base p-0">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><Swords className="w-4 h-4 text-muted-foreground" /></div>
          <div><h3 className="font-heading text-base font-semibold text-foreground tracking-wider">Proximos Partidos</h3><p className="text-xs font-body text-muted-foreground">{matches.length} programados</p></div>
        </div>
      </div>
      <div className="divide-y divide-border/50">
        {matches.slice(0, 6).map((match, i) => (<MatchCard key={match.id} match={match} index={i} />))}
      </div>
    </motion.div>
  )
}
