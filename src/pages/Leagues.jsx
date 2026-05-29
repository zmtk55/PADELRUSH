import { useNavigate } from 'react-router-dom'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Trophy, Calendar, Swords, ChevronRight, Users, Sparkles } from 'lucide-react'

export default function Leagues() {
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leaguesQuery, deleteLeague } = useLeagues()
  const leagues = leaguesQuery.data || []
  const loading = leaguesQuery.isLoading
  const error = leaguesQuery.error

  const del = async (id) => {
    if (!confirm('Eliminar esta liga?')) return
    try {
      await deleteLeague.mutateAsync(id)
      leaguesQuery.refetch()
    } catch (err) {
      console.error('Error deleting league:', err)
    }
  }

  if (loading) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Ligas"
        description="Cargando..."
        action={isOrganizer && <Button onClick={() => navigate('/ligas/nueva')}><Plus className="w-4 h-4" /> Nueva Liga</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-muted/60" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-muted/60 rounded w-3/4" />
                <div className="h-3 bg-muted/40 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )

  if (error) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Ligas" description="Error al cargar" />
      <div className="glass-card rounded-xl p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
          <Swords className="w-7 h-7 text-destructive" />
        </div>
        <p className="text-sm font-body text-destructive mb-4">{error.message || 'Error al cargar las ligas'}</p>
        <Button variant="outline" onClick={() => leaguesQuery.refetch()}>Reintentar</Button>
      </div>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader
        title="Ligas"
        description={`${leagues.length} ${leagues.length === 1 ? 'liga' : 'ligas'} en total`}
        action={isOrganizer && <Button onClick={() => navigate('/ligas/nueva')}><Plus className="w-4 h-4" /> Nueva Liga</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leagues.map((l, i) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => navigate(`/ligas/${l.id}`)}
            className="glass-card rounded-xl p-6 group cursor-pointer hover:shadow-glow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center shrink-0 group-hover:shadow-glow-sm transition-all duration-300">
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading font-bold text-lg tracking-tight truncate text-foreground group-hover:text-primary transition-colors">
                  {l.name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  <span className="text-sm font-body text-muted-foreground flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {l.gender} - {l.sport}
                  </span>
                  {l.season && (
                    <span className="text-sm font-body text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {l.season}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary/60 transition-all duration-300 group-hover:translate-x-0.5 shrink-0 mt-1" />
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
              <span className="inline-flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary-light border border-primary/10">
                <Sparkles className="w-3 h-3" />
                {l.status || 'Activa'}
              </span>
              {l.categories?.length > 0 && l.categories.slice(0, 2).map(cat => (
                <span key={cat} className="text-xs font-body text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/50">
                  {cat}
                </span>
              ))}
              {l.categories?.length > 2 && (
                <span className="text-xs font-body text-muted-foreground">+{l.categories.length - 2}</span>
              )}
            </div>

            {isOrganizer && (
              <div className="flex gap-2 mt-4 pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-all duration-300" onClick={e => e.stopPropagation()}>
                <Button variant="outline" size="sm" onClick={() => navigate(`/ligas/${l.id}/editar`)} className="h-8 text-xs">
                  <Edit className="w-3 h-3" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive h-8 text-xs border-destructive/20 hover:border-destructive/40" onClick={() => del(l.id)}>
                  <Trash2 className="w-3 h-3" /> Eliminar
                </Button>
              </div>
            )}
          </motion.div>
        ))}

        {leagues.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full glass-card rounded-xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <Swords className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-bold tracking-wider text-foreground mb-2">No hay ligas todavia</h2>
            <p className="text-sm font-body text-muted-foreground mb-6 max-w-sm mx-auto">
              Crea tu primera liga de padel y empieza a organizar torneos
            </p>
            {isOrganizer && (
              <Button onClick={() => navigate('/ligas/nueva')}>
                <Plus className="w-4 h-4" />
                Crear Liga
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
