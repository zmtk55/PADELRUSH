import { useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="font-heading font-semibold text-lg mb-4">Acceso rápido</h2>
      <div className="space-y-3">
        <button
          onClick={() => navigate('/ligas/nueva')}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors text-left"
        >
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Nueva liga</p>
            <p className="text-xs text-muted-foreground">Crear desde cero con el wizard</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => navigate('/participantes')}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors text-left"
        >
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Participantes</p>
            <p className="text-xs text-muted-foreground">Gestionar jugadores</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => navigate('/ligas')}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors text-left"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Ver ligas</p>
            <p className="text-xs text-muted-foreground">Todas las ligas</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
