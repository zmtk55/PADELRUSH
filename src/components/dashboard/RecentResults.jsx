import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Trophy, Swords, Calendar } from "lucide-react"

function ResultCard({ match, index }) {
  const navigate = useNavigate()
  const team1Won = match.winner_team_number === 1
  const team2Won = match.winner_team_number === 2
  const isDraw = !match.winner_team_number
  const matchDate = match.played_date ? new Date(match.played_date) : null
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/ligas/${match.league_id}/partidos`)}
      className="group flex items-center gap-4 py-3 px-5 cursor-pointer transition-all duration-200 hover:bg-muted/30 border-b border-border/50 last:border-b-0"
    >
      <div className="w-1 h-10 rounded-full shrink-0 bg-muted" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${team1Won ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{match.team1_name || "Equipo 1"}</span>
          <span className={`text-sm font-bold tabular-nums ${team1Won ? "text-emerald-600" : "text-muted-foreground"}`}>{match.team1_score ?? "-"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${team2Won ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{match.team2_name || "Equipo 2"}</span>
          <span className={`text-sm font-bold tabular-nums ${team2Won ? "text-emerald-600" : "text-muted-foreground"}`}>{match.team2_score ?? "-"}</span>
        </div>
        {match.leagues?.name && <p className="text-[10px] text-muted-foreground mt-0.5">{match.leagues.name}</p>}
      </div>
      <div className="text-right shrink-0">
        {matchDate && <p className="text-[10px] text-muted-foreground">{matchDate.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}</p>}
        {team1Won && <span className="text-[10px] text-emerald-600 font-medium">Gana Eq.1</span>}
        {team2Won && <span className="text-[10px] text-emerald-600 font-medium">Gana Eq.2</span>}
        {isDraw && <span className="text-[10px] text-muted-foreground">Empate</span>}
      </div>
    </motion.div>
  )
}

export function RecentResults({ results, leagueName }) {
  if (!results?.length) {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><Trophy className="w-4 h-4 text-muted-foreground" /></div>
          <div><h3 className="font-heading text-base font-semibold text-foreground">Resultados</h3><p className="text-xs font-body text-muted-foreground">{leagueName || "Ultimos marcadores"}</p></div>
        </div>
        <div className="h-32 flex items-center justify-center"><div className="text-center"><Swords className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" /><p className="text-sm font-body text-muted-foreground">Sin resultados recientes</p></div></div>
      </div>
    )
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card-base p-0">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><Trophy className="w-4 h-4 text-muted-foreground" /></div>
        <div><h3 className="font-heading text-base font-semibold text-foreground">Resultados</h3><p className="text-xs font-body text-muted-foreground">{leagueName ? leagueName : "Ultimos " + results.length + " marcadores"}</p></div>
      </div>
      <div className="divide-y divide-border/50">
        {results.slice(0, 6).map((m, i) => <ResultCard key={m.id} match={m} index={i} />)}
      </div>
    </motion.div>
  )
}
