import { useNavigate } from 'react-router-dom'
import { Swords } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useLeagues } from '@/hooks/useLeagues'
import { motion } from 'framer-motion'

export default function Partidos() {
  const navigate = useNavigate()
  const { leaguesQuery } = useLeagues()
  return (
    <div>
      <PageHeader title="PARTIDOS" description="Selecciona una liga para ver sus partidos" />
      {leaguesQuery.isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted w-32" />
                  <div className="h-3 bg-muted w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(leaguesQuery.data || []).map((l, i) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/ligas/${l.id}/partidos`)}
            whileHover={{ y: -1 }}
            className="bg-card border border-border p-5 transition-all cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-50"
              style={{ backgroundColor: l.color || 'hsl(var(--primary))' }}
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: l.color || 'hsl(var(--primary))' }}
              >
                {l.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-wide truncate">{l.name}</p>
                <p className="text-[10px] text-muted-foreground tracking-wider">{l.gender} · {l.season || '—'}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {!leaguesQuery.isLoading && (leaguesQuery.data || []).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 col-span-full"
          >
            <div className="w-16 h-16 border border-primary/30 flex items-center justify-center mx-auto mb-4 bg-primary/5">
              <Swords className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground tracking-wider">No hay ligas disponibles</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
