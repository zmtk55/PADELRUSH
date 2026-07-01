import { useNavigate } from 'react-router-dom'
import { Shield, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useLeagues } from '@/hooks/useLeagues'
import { motion } from 'framer-motion'

export default function AdminSelector() {
  const navigate = useNavigate()
  const { leaguesQuery } = useLeagues()
  const leagues = leaguesQuery.data || []

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title="Panel de Control" description="Selecciona una liga para administrar" />

      {leaguesQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!leaguesQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              onClick={() => navigate(`/ligas/${l.id}/admin`)}
              className="group bg-card border border-border rounded-xl p-5 hover:shadow-card-hover transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ backgroundColor: l.color || 'hsl(var(--primary))' }}>
                  {l.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate group-hover:text-primary transition-colors">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.gender} · {l.season || '—'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5 shrink-0" />
              </div>
            </motion.div>
          ))}

          {leagues.length === 0 && (
            <div className="text-center py-20 col-span-full">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-2">No hay ligas disponibles</p>
              <p className="text-sm text-muted-foreground">Crea una liga primero para poder administrarla</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
