import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useLeagues } from '@/hooks/useLeagues'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Leagues() {
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leaguesQuery, deleteLeague } = useLeagues()

  return (
    <div>
      <PageHeader title="Ligas" description="Gestiona todas tus ligas" action={isOrganizer && <Button onClick={() => navigate('/ligas/nueva')}><Plus className="w-4 h-4" /> Nueva Liga</Button>} />
      <div className="grid gap-4">
        {leaguesQuery.isLoading && <p className="text-muted-foreground">Cargando...</p>}
        {leaguesQuery.data?.map((league) => (
          <motion.div key={league.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/ligas/${league.id}`)}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-heading font-bold text-lg" style={{ backgroundColor: league.color || '#c96442' }}>{league.name.charAt(0)}</div>
                <div>
                  <h3 className="font-heading font-semibold text-lg">{league.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{league.gender} · {league.sport}</Badge>
                    {league.season && <span className="text-xs text-muted-foreground">{league.season}</span>}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${league.status === 'activa' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : league.status === 'finalizada' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{league.status}</span>
            </div>
            {league.categories?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{league.categories.map((cat) => <span key={cat} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{cat}</span>)}</div>}
            {isOrganizer && <div className="flex gap-2 mt-4 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/ligas/${league.id}/editar`)}><Edit className="w-3.5 h-3.5" /> Editar</Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { if (confirm('¿Eliminar esta liga?')) deleteLeague.mutate(league.id) }}><Trash2 className="w-3.5 h-3.5" /> Eliminar</Button>
            </div>}
          </motion.div>
        ))}
        {leaguesQuery.data?.length === 0 && <div className="text-center py-20"><Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><p className="text-lg font-medium mb-2">No hay ligas todavía</p><p className="text-sm text-muted-foreground mb-4">Crea tu primera liga para empezar</p>{isOrganizer && <Button onClick={() => navigate('/ligas/nueva')}><Plus className="w-4 h-4" /> Crear Liga</Button>}</div>}
      </div>
    </div>
  )
}
