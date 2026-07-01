import { motion } from "framer-motion"
import { BarChart3, Activity, Clock, CheckCircle2 } from "lucide-react"

function ProgressItem({ league, index }) {
  const barColor = league.percentage >= 75 ? "bg-emerald-500" : league.percentage >= 40 ? "bg-amber-500" : "bg-primary"
  const isComplete = league.percentage === 100
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="px-6 py-4 border-b border-border/50 last:border-b-0"
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">{league.name}</p>
            {league.remaining > 0 && (
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold">
                {league.remaining} pendientes
              </span>
            )}
            {isComplete && (
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Completa
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{league.gender || "Mixto"}</span>
            <span className={"text-[10px] px-1.5 py-0.5 rounded-full font-medium " + (league.status === "activa" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>{league.status}</span>
            {!isComplete && league.remaining > 0 && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Faltan {league.remaining}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          <p className="font-heading text-lg font-bold text-foreground tabular-nums">{league.percentage}%</p>
          <p className="text-[10px] text-muted-foreground">{league.played}/{league.total} jugados</p>
          {league.remaining > 0 && !isComplete && (
            <p className="text-[10px] text-amber-600 font-medium mt-0.5">restan {league.remaining}</p>
          )}
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: league.percentage + "%" }}
          transition={{ duration: 1, delay: index * 0.08, ease: "easeOut" }}
          className={"h-full rounded-full " + barColor}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] text-muted-foreground">
          {isComplete ? "Todos los partidos jugados" : league.played + " completados"}
        </span>
        {league.remaining > 0 && !isComplete && (
          <span className="text-[10px] font-medium text-amber-600">
            {league.remaining} de {league.total} por jugar
          </span>
        )}
      </div>
    </motion.div>
  )
}

export function LeagueProgress({ leagues, leagueName }) {
  if (!leagues?.length) {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><BarChart3 className="w-4 h-4 text-muted-foreground" /></div>
          <div><h3 className="font-heading text-base font-semibold text-foreground">Progreso</h3><p className="text-xs font-body text-muted-foreground">{leagueName || "Estado de las ligas"}</p></div>
        </div>
        <div className="h-32 flex items-center justify-center"><div className="text-center"><Activity className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" /><p className="text-sm font-body text-muted-foreground">Sin datos de progreso</p></div></div>
      </div>
    )
  }
  const sorted = [...leagues].sort((a, b) => a.percentage - b.percentage)
  const totalRemaining = leagues.reduce((sum, l) => sum + l.remaining, 0)
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card-base p-0">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><BarChart3 className="w-4 h-4 text-muted-foreground" /></div>
          <div><h3 className="font-heading text-base font-semibold text-foreground">Progreso</h3><p className="text-xs font-body text-muted-foreground">{leagueName ? leagueName : sorted.filter(l => l.percentage < 100).length + " ligas en curso"}</p></div>
        </div>
        {totalRemaining > 0 && !leagueName && (
          <div className="text-right">
            <p className="text-xs font-semibold text-amber-600 tabular-nums">{totalRemaining} pendientes</p>
            <p className="text-[10px] text-muted-foreground">en total</p>
          </div>
        )}
      </div>
      <div className="divide-y divide-border/50">
        {sorted.slice(0, 5).map((l, i) => <ProgressItem key={l.id} league={l} index={i} />)}
      </div>
    </motion.div>
  )
}
