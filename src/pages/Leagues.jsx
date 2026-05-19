import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Trophy } from 'lucide-react'

export default function Leagues() {
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leaguesQuery, deleteLeague } = useLeagues()
  const leagues = leaguesQuery.data || []
  const loading = leaguesQuery.isLoading
  const error = leaguesQuery.error

  const del = async (id) => {
    if (!confirm('¿Eliminar esta liga?')) return
    try {
      await deleteLeague.mutateAsync(id)
      leaguesQuery.refetch()
    } catch (err) {
      console.error('Error deleting league:', err)
    }
  }

  if (loading) return (
    <div>
      <PageHeader title="Ligas" description="Cargando..." action={isOrganizer && <Button onClick={() => navigate('/ligas/nueva')}><Plus className="w-4 h-4" /> Nueva Liga</Button>} />
      <div className="text-center py-16">
        <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Cargando ligas...</p>
      </div>
    </div>
  )

  if (error) return (
    <div>
      <PageHeader title="Ligas" description="Error" />
      <div className="text-center py-16">
        <p className="text-destructive mb-4">{error.message || 'Error al cargar'}</p>
        <Button variant="outline" onClick={() => leaguesQuery.refetch()}>Reintentar</Button>
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title="Ligas" description={`${leagues.length} ligas`} action={isOrganizer && <Button onClick={() => navigate('/ligas/nueva')}><Plus className="w-4 h-4" /> Nueva Liga</Button>} />
      <div className="grid gap-4">
        {leagues.map(l => (
          <div key={l.id} onClick={() => navigate(`/ligas/${l.id}`)}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-heading font-bold text-lg"
                  style={{ backgroundColor: l.color || '#c96442' }}>{l.name.charAt(0)}</div>
                <div>
                  <h3 className="font-heading font-semibold text-lg">{l.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{l.gender} · {l.sport}</Badge>
                    {l.season && <span className="text-xs text-muted-foreground">{l.season}</span>}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${l.status === 'activa' ? 'bg-emerald-100 text-emerald-700' : l.status === 'finalizada' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>{l.status}</span>
            </div>
            {l.categories?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">{l.categories.map(cat => <span key={cat} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{cat}</span>)}</div>
            )}
            {isOrganizer && (
              <div className="flex gap-2 mt-4 pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/ligas/${l.id}/editar`)}><Edit className="w-3.5 h-3.5" /> Editar</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => del(l.id)}><Trash2 className="w-3.5 h-3.5" /> Eliminar</Button>
              </div>
            )}
          </div>
        ))}
        {leagues.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No hay ligas todavía</p>
            <p className="text-sm text-muted-foreground mb-4">Crea tu primera liga para empezar</p>
            {isOrganizer && <Button onClick={() => navigate('/ligas/nueva')}><Plus className="w-4 h-4" /> Crear Liga</Button>}
          </div>
        )}
      </div>
    </div>
  )
}
