import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Users, Calendar, ChevronRight } from 'lucide-react'

function LeagueCard({ league, index }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      onClick={() => navigate(`/ligas/${league.id}`)}
      className="group flex items-center gap-4 py-3.5 px-6 cursor-pointer transition-all duration-200 hover:bg-muted/30 hover:pl-7 border-b border-border/50 last:border-b-0"
    >
      <div className="w-10 h-10 rounded-lg bg-muted border border-border/50 flex items-center justify-center shrink-0">
        <Trophy className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body font-semibold text-foreground truncate">{league.name}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-body"><Users className="w-3 h-3" />{league.participant_count || 0}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-body"><Calendar className="w-3 h-3" />{new Date(league.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold font-body">{league.category || 'General'}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-200" />
    </motion.div>
  )
}

export function LeagueOverview({ leagues }) {
  if (!leagues?.length) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card-base p-0"
    >
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><Trophy className="w-4 h-4 text-muted-foreground" /></div>
          <div><h3 className="font-heading text-base font-semibold text-foreground tracking-wider">Tus Ligas</h3><p className="text-xs font-body text-muted-foreground">{leagues.length} {leagues.length === 1 ? 'liga' : 'ligas'}</p></div>
        </div>
      </div>
      <div className="divide-y divide-border/50">
        {leagues.slice(0, 5).map((league, i) => (<LeagueCard key={league.id} league={league} index={i} />))}
      </div>
    </motion.div>
  )
}
