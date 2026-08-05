import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/layout/PageHeader'
import { Plus, Trophy, Swords } from 'lucide-react'
import LeagueCardGrid from '@/components/leagues/LeagueCardGrid'
import LeagueTableView from '@/components/leagues/LeagueTableView'
import SuperToolbar from '@/components/layout/SuperToolbar'

const filters = [
    { value: 'all', label: 'Todas' },
    { value: 'activa', label: 'En producción' },
    { value: 'proxima', label: 'En pausa' },
    { value: 'finalizada', label: 'Finalizada' },
  ]

export default function Leagues() {
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leaguesQuery, deleteLeague } = useLeagues()
  const leagues = leaguesQuery.data || []
  const loading = leaguesQuery.isLoading
  const error = leaguesQuery.error

  const [viewMode, setViewMode] = useState('grid')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredLeagues = leagues.filter(l => filterStatus === 'all' || l.status === filterStatus)

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta liga?')) return
    try {
      await deleteLeague.mutateAsync(id)
      leaguesQuery.refetch()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div>
      <PageHeader title="LIGAS" description="Cargando..." />
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-[44px] h-[44px] bg-[hsl(var(--bg-elevated))]" />
              <div className="flex-1 space-y-2">
                <div className="h-[14px] bg-[hsl(var(--bg-elevated))] w-48" />
                <div className="h-[10px] bg-[hsl(var(--bg-elevated))] w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div>
      <PageHeader title="LIGAS" description="Error al cargar" />
      <div className="text-center py-20 card p-8">
        <p className="text-destructive text-sm mb-4 uppercase tracking-wider font-semibold">
          {error.message || 'Error al cargar las ligas'}
        </p>
        <button className="btn-outline h-9 px-4 text-xs" onClick={() => leaguesQuery.refetch()}>
          REINTENTAR
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="LIGAS"
        description={filteredLeagues.length > 0 ? `${filteredLeagues.length} ${filteredLeagues.length === 1 ? 'liga' : 'ligas'}` : 'Sin ligas'}
        action={isOrganizer && (
          <button onClick={() => navigate('/ligas/nueva')} className="btn-primary h-9 px-4 text-xs gap-2">
            <Plus className="w-[14px] h-[14px]" />
            NUEVA LIGA
          </button>
        )}
      />

      <SuperToolbar
        context="league-list"
        isOrganizer={isOrganizer}
        onNewLeague={() => navigate('/ligas/nueva')}
        onRefresh={() => leaguesQuery.refetch()}
      />

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`h-7 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                filterStatus === f.value
                  ? 'bg-court text-white'
                  : 'bg-[hsl(var(--bg-elevated))] text-fg-muted hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`w-7 h-7 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-court text-white' : 'bg-[hsl(var(--bg-elevated))] text-fg-muted hover:text-foreground'}`}
            aria-label="Cuadrícula"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="9" height="9" rx="1" />
              <rect x="12" y="3" width="9" height="9" rx="1" />
              <rect x="3" y="12" width="9" height="9" rx="1" />
              <rect x="12" y="12" width="9" height="9" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`w-7 h-7 flex items-center justify-center transition-colors ${viewMode === 'table' ? 'bg-court text-white' : 'bg-[hsl(var(--bg-elevated))] text-fg-muted hover:text-foreground'}`}
            aria-label="Tabla"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {filteredLeagues.length > 0 ? (
        viewMode === 'grid' ? (
          <LeagueCardGrid leagues={filteredLeagues} onDelete={handleDelete} />
        ) : (
          <LeagueTableView leagues={filteredLeagues} onDelete={handleDelete} />
        )
      ) : (
        <div className="text-center py-24 card p-8">
          <div className="w-[52px] h-[52px] flex items-center justify-center border border-border-subtle mx-auto mb-4 bg-[hsl(var(--bg-elevated))]">
            <Trophy className="w-[24px] h-[24px] text-fg-muted" />
          </div>
          <p className="font-heading font-bold text-base mb-1">NO HAY LIGAS</p>
          <p className="text-[13px] text-fg-muted mb-6">Crea tu primera liga de pádel</p>
          {isOrganizer && (
            <button onClick={() => navigate('/ligas/nueva')} className="btn-primary h-9 px-4 text-xs gap-2">
              <Plus className="w-[14px] h-[14px]" />
              CREAR LIGA
            </button>
          )}
        </div>
      )}
    </div>
  )
}
