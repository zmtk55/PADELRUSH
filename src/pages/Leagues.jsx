import { useNavigate } from 'react-router-dom'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  Plus,
  Trophy,
  Calendar,
  Users,
  ArrowRight,
  Swords,
  Sparkles,
  Edit,
  Trash2,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

function statusConfig(status) {
  switch (status) {
    case 'activa':
      return { label: 'Activa', variant: 'success' }
    case 'finalizada':
      return { label: 'Finalizada', variant: 'secondary' }
    case 'inactiva':
      return { label: 'Inactiva', variant: 'warning' }
    default:
      return { label: status || 'Activa', variant: 'default' }
  }
}

function LeagueCard({ league, isOrganizer, onEdit, onDelete, onClick }) {
  const sc = statusConfig(league.status)

  return (
    <motion.div variants={item}>
      <div
        onClick={onClick}
        className="relative bg-card border border-border rounded-xl p-6 shadow-card group cursor-pointer transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0 group-hover:shadow-glow-sm transition-shadow duration-300">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-base tracking-tight truncate text-foreground group-hover:text-primary transition-colors">
                {league.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={sc.variant} className="text-[10px] px-2 py-0">
                  {sc.label}
                </Badge>
                {league.gender && league.sport && (
                  <span className="text-xs text-muted-foreground">
                    {league.gender} · {league.sport}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300 shrink-0 mt-2" />
        </div>

        <div className="mt-5 pt-4 border-t border-border/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {league.start_date && league.end_date
                ? `${new Date(league.start_date).toLocaleDateString('es', { day: 'numeric', month: 'short' })} — ${new Date(league.end_date).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : league.season || 'Sin fechas'}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {league.team_count ?? '—'} equipos
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${league.progress ?? 0}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>

          {league.categories?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {league.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50"
                >
                  {cat}
                </span>
              ))}
              {league.categories.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{league.categories.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {isOrganizer && (
          <div
            className="flex gap-2 mt-4 pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-7 text-xs rounded-lg"
            >
              <Edit className="w-3 h-3 mr-1" /> Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="h-7 text-xs rounded-lg text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40"
            >
              <Trash2 className="w-3 h-3 mr-1" /> Eliminar
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function EmptyState({ isOrganizer, onCreate }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full bg-card border border-border rounded-xl p-12 text-center shadow-card"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-5">
        <Swords className="w-8 h-8 text-primary" />
      </div>
      <h2 className="font-heading text-xl font-bold tracking-tight text-foreground mb-2">
        No hay ligas todavía
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        Crea tu primera liga de pádel y empieza a organizar torneos con tus jugadores
      </p>
      {isOrganizer && (
        <Button onClick={onCreate} className="rounded-lg">
          <Plus className="w-4 h-4 mr-2" /> Crear Liga
        </Button>
      )}
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted/60" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted/60 rounded w-2/3" />
          <div className="h-3 bg-muted/40 rounded w-1/2" />
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-border/50 space-y-3">
        <div className="flex justify-between">
          <div className="h-3 bg-muted/40 rounded w-1/3" />
          <div className="h-3 bg-muted/40 rounded w-1/4" />
        </div>
        <div className="h-1.5 bg-muted/40 rounded-full" />
      </div>
    </div>
  )
}

export default function Leagues() {
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leaguesQuery, deleteLeague } = useLeagues()
  const leagues = leaguesQuery.data || []
  const loading = leaguesQuery.isLoading
  const error = leaguesQuery.error

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta liga? Esta acción no se puede deshacer.')) return
    try {
      await deleteLeague.mutateAsync(id)
      leaguesQuery.refetch()
    } catch (err) {
      console.error('Error deleting league:', err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <PageHeader
          title="Ligas"
          description="Cargando..."
          action={
            isOrganizer && (
              <Button disabled className="rounded-lg">
                <Plus className="w-4 h-4 mr-2" /> Nueva Liga
              </Button>
            )
          }
        />
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <PageHeader title="Ligas" description="Error al cargar" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-12 text-center shadow-card"
        >
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
            <Swords className="w-7 h-7 text-destructive" />
          </div>
          <p className="text-sm text-destructive mb-4">
            {error.message || 'Error al cargar las ligas'}
          </p>
          <Button variant="outline" className="rounded-lg" onClick={() => leaguesQuery.refetch()}>
            Reintentar
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <PageHeader
        title="Ligas"
        description={`${leagues.length} ${leagues.length === 1 ? 'liga' : 'ligas'} en total`}
        action={
          isOrganizer && (
            <Button onClick={() => navigate('/ligas/nueva')} className="rounded-lg">
              <Plus className="w-4 h-4 mr-2" /> Nueva Liga
            </Button>
          )
        }
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {leagues.map((l) => (
          <LeagueCard
            key={l.id}
            league={l}
            isOrganizer={isOrganizer}
            onClick={() => navigate(`/ligas/${l.id}`)}
            onEdit={() => navigate(`/ligas/${l.id}/editar`)}
            onDelete={() => handleDelete(l.id)}
          />
        ))}

        {leagues.length === 0 && (
          <EmptyState isOrganizer={isOrganizer} onCreate={() => navigate('/ligas/nueva')} />
        )}
      </motion.div>
    </div>
  )
}
