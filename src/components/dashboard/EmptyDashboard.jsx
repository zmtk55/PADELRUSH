import { useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyDashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-lg text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-heading font-bold mb-3">Bienvenido a PadelRush</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Comienza creando tu primera liga para gestionar partidos, equipos y clasificaciones.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Crea una liga</h3>
            <p className="text-xs text-muted-foreground">Configura categorías y formato</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Agrega equipos</h3>
            <p className="text-xs text-muted-foreground">Registra participantes</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Programa partidos</h3>
            <p className="text-xs text-muted-foreground">Genera el calendario</p>
          </div>
        </div>

        <Button onClick={() => navigate('/ligas/nueva')} size="lg" className="gap-2">
          Crear primera liga
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
