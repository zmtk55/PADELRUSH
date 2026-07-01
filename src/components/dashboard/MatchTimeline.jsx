import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Calendar, Clock, ChevronRight, Swords } from "lucide-react"

function TimelineCard({ match, index }) {
  const navigate = useNavigate()
  const matchDate = match.scheduled_date ? new Date(match.scheduled_date) : null
  const dayName = matchDate ? matchDate.toLocaleDateString("es-MX", { weekday: "short" }) : ""
  const dayNum = matchDate ? matchDate.getDate() : ""
  const monthName = matchDate ? matchDate.toLocaleDateString("es-MX", { month: "short" }) : ""
  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => navigate(`/ligas/${match.league_id}/partidos`)}
      className="group flex-shrink-0 w-[200px] bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
          <span className="text-[10px] font-medium uppercase leading-tight">{dayName}</span>
          <span className="text-lg font-bold leading-tight">{dayNum}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">{monthName}</p>
          {match.scheduled_time && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Clock className="w-3 h-3" />{match.scheduled_time}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
            {(match.team1_name || "E1").charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium truncate">{match.team1_name || "Equipo 1"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
            {(match.team2_name || "E2").charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium truncate">{match.team2_name || "Equipo 2"}</span>
        </div>
      </div>
      {match.leagues?.name && (
        <p className="mt-2 text-[10px] text-muted-foreground truncate">{match.leagues.name}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Programado</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
      </div>
    </motion.button>
  )
}

export function MatchTimeline({ matches, leagueName }) {
  if (!matches?.length) {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><Swords className="w-4 h-4 text-muted-foreground" /></div>
          <div><h3 className="font-heading text-base font-semibold text-foreground">Calendario</h3><p className="text-xs font-body text-muted-foreground">{leagueName || "Proximos partidos"}</p></div>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="text-center"><Calendar className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" /><p className="text-sm font-body text-muted-foreground">No hay partidos programados</p></div>
        </div>
      </div>
    )
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><Swords className="w-4 h-4 text-muted-foreground" /></div>
          <div><h3 className="font-heading text-base font-semibold text-foreground">Calendario</h3><p className="text-xs font-body text-muted-foreground">{leagueName ? leagueName : matches.length + " proximos partidos"}</p></div>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto overscroll-x-contain pb-2 -mx-1 px-1">
        {matches.slice(0, 10).map((m, i) => <TimelineCard key={m.id} match={m} index={i} />)}
        <div className="flex flex-col items-center justify-center w-[200px] flex-shrink-0 bg-muted/30 border border-dashed border-border rounded-xl p-4 text-center">
          <Calendar className="w-6 h-6 text-muted-foreground/40 mb-1" />
          <p className="text-xs text-muted-foreground">Mas partidos...</p>
        </div>
      </div>
    </motion.div>
  )
}
