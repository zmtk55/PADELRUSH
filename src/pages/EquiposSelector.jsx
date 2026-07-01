import { useNavigate } from 'react-router-dom'
import { Users, ChevronRight, FolderOpen } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useLeagues } from '@/hooks/useLeagues'
import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function EquiposSelector() {
  const navigate = useNavigate()
  const { leaguesQuery } = useLeagues()
  const leagues = leaguesQuery.data || []

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader title="Equipos" description="Selecciona una liga para ver sus equipos" />
      </motion.div>

      {leaguesQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-28" />
                  <div className="h-3 bg-muted rounded w-20" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!leaguesQuery.isLoading && leagues.length > 0 && (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {leagues.map(l => (
            <motion.button
              key={l.id}
              variants={item}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/ligas/${l.id}/equipos`)}
              className="group relative bg-card border border-border rounded-xl p-5 text-left transition-all duration-200 hover:shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.25)] hover:border-primary/40 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

              <div className="relative flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md"
                  style={{ backgroundColor: l.color || 'hsl(var(--primary))' }}
                >
                  {l.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate group-hover:text-primary transition-colors duration-200">
                    {l.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[l.gender, l.season].filter(Boolean).join(' · ') || 'Sin detalles'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0 mt-1" />
              </div>

              <div className="relative mt-4 pt-3 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>Ver equipos</span>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {!leaguesQuery.isLoading && leagues.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium mb-1">No hay ligas disponibles</p>
          <p className="text-sm text-muted-foreground">Crea una liga primero para ver sus equipos</p>
        </motion.div>
      )}
    </div>
  )
}
