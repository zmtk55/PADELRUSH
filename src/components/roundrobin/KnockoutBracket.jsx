import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Swords, ChevronRight, Crown, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

function ScoreCell({ value, onChange, winner, disabled }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(value ?? '')
  const handleBlur = () => {
    setEditing(false)
    const parsed = parseInt(local, 10)
    const clamped = isNaN(parsed) ? null : Math.max(0, Math.min(99, parsed))
    onChange(clamped)
    setLocal(clamped ?? '')
  }
  return editing ? (
    <input autoFocus value={local} onChange={(e) => setLocal(e.target.value.replace(/[^0-9]/g, '').slice(0,2))} onBlur={handleBlur} className="w-10 h-12 sm:w-12 sm:h-12 text-center font-score bg-background border-2 border-primary/50 rounded-lg text-foreground outline-none text-sm sm:text-base" />
  ) : (
    <button onClick={() => { if (!disabled) { setLocal(value ?? ''); setEditing(true) } }} disabled={disabled} className={cn("w-10 h-12 sm:w-12 sm:h-12 flex items-center justify-center font-score text-sm sm:text-base rounded-lg border-2 transition-all", winner ? "bg-primary/20 border-primary/50 text-primary shadow-sm" : value != null ? "bg-card border-border text-foreground" : "bg-muted/30 border-dashed text-muted-foreground/40")}>{value != null ? value : '-'}</button>
  )
}

function PlayerTag({ player, winner }) {
  if (!player) return null

  return (
    <div className={cn("flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm", winner ? "bg-primary/10 ring-1 ring-primary/20" : "bg-muted/50 hover:bg-muted/70")}>
      <div className={"w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[9px] sm:text-xs font-semibold text-muted-foreground shrink-0"}>
        {player.name ? player.name.charAt(0).toUpperCase() : '?'}
      </div>
      <span className={cn("truncate font-semibold", winner ? "text-primary" : "text-foreground")}>{player.name || 'TBD'}</span>
      
    </div>
  )
}

function MatchDisplay({ match, matchLabel, onResult }) {
  if (!match) return null
  const s1 = match.score?.a ?? null
  const s2 = match.score?.b ?? null
  const t1Won = match.winner === 1
  const t2Won = match.winner === 2
  const updateScore = (team, val) => {
    const na = team === 1 ? val : s1
    const nb = team === 2 ? val : s2
    const ta = na ?? 0; const tb = nb ?? 0
    const winner = ta > tb ? 1 : tb > ta ? 2 : null
    onResult(match.id, winner, { a: ta, b: tb })
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-xl hover:shadow-sm hover:border-border/80 transition-all duration-200"
    >
      <div className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-2 border-b border-border/50">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">{matchLabel}</span>
        {match.played ? (
          <span className="text-[10px] font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">Completado</span>
        ) : (
          <span className="text-[10px] font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">Pendiente</span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-4">
          <div className="flex-1 space-y-1.5">
            {match.team1 && match.team1.map((p, i) => <PlayerTag key={i} player={p} winner={t1Won} />)}
            {!match.team1 && <div className="text-xs text-muted-foreground/40 italic px-2 py-3 text-center bg-muted/20 rounded-lg">Pendiente</div>}
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <ScoreCell value={s1} onChange={(v) => updateScore(1, v)} winner={t1Won} />
            <div className="flex items-center gap-1">
              <div className="flex items-center justify-center">
                <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground/50">VS</span>
              </div>
            </div>
            <ScoreCell value={s2} onChange={(v) => updateScore(2, v)} winner={t2Won} />
          </div>
          <div className="flex-1 space-y-1.5">
            {match.team2 && match.team2.map((p, i) => <PlayerTag key={i} player={p} winner={t2Won} />)}
            {!match.team2 && <div className="text-xs text-muted-foreground/40 italic px-2 py-3 text-center bg-muted/20 rounded-lg">Pendiente</div>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function KnockoutBracket({ semis = [], finalMatch, thirdPlace, onResult }) {
  const allDone = finalMatch?.winner != null
  const hasThird = thirdPlace != null
  return (
    <div className="space-y-4 sm:space-y-6">
      {semis.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Semifinales</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {semis.map((m, i) => <MatchDisplay key={m.id} match={m} matchLabel={hasThird ? (i === 0 ? "Semifinal 1" : "Semifinal 2") : "Semifinal"} onResult={onResult} />)}
          </div>
        </div>
      )}
      {semis.length > 0 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-muted-foreground/30">
            <div className="w-6 sm:w-12 h-px bg-border" />
            <ChevronRight className="w-4 h-4" />
            <div className="w-6 sm:w-12 h-px bg-border" />
          </div>
        </div>
      )}
      {finalMatch && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-yellow-500">Final</span>
            <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/30 to-border" />
          </div>
          <MatchDisplay match={finalMatch} matchLabel="Gran Final" onResult={onResult} />
        </div>
      )}
      {hasThird && thirdPlace && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tercer Lugar</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <MatchDisplay match={thirdPlace} matchLabel="3.er Puesto" onResult={onResult} />
        </div>
      )}
      {allDone && finalMatch && (
        <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",stiffness:200,damping:20}} className="relative overflow-hidden border-2 border-yellow-500/40 bg-gradient-to-b from-yellow-500/10 via-card to-card rounded-xl p-4 sm:p-7 text-center">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <motion.div initial={{scale:0,rotate:-30}} animate={{scale:1,rotate:0}} transition={{delay:0.3,type:"spring",stiffness:180}} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>
            <h3 className="font-heading font-bold text-2xl sm:text-3xl tracking-tight text-foreground mb-1">¡Campeones!</h3>
            <p className="text-base sm:text-lg font-semibold text-yellow-500">
              {finalMatch.winner === 1
                ? finalMatch.team1?.map(p => p.name).join(" & ")
                : finalMatch.team2?.map(p => p.name).join(" & ")}
            </p>
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-muted-foreground mt-2">
              <Trophy className="w-3 h-3" />
              {finalMatch.winner === 1
                ? (finalMatch.score?.a ?? 0) + "-" + (finalMatch.score?.b ?? 0)
                : (finalMatch.score?.b ?? 0) + "-" + (finalMatch.score?.a ?? 0)}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
