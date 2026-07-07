import { useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, Zap, ArrowRight } from 'lucide-react'

const actions = [
  { label: 'Nueva liga', desc: 'Crear desde cero con el wizard', icon: Trophy, path: '/ligas/nueva' },
  { label: 'Express', desc: 'Torneo round robin rápido', icon: Zap, path: '/express' },
  { label: 'Participantes', desc: 'Gestionar jugadores', icon: Users, path: '/participantes' },
  { label: 'Ver ligas', desc: 'Todas las ligas', icon: Calendar, path: '/ligas' },
]

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-[11px] font-heading font-bold tracking-wider text-fg-secondary uppercase">Acceso Rápido</h3>
      </div>

      <div className="space-y-1">
        {actions.map(({ label, desc, icon: Icon, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="w-full flex items-center gap-3 py-3 px-3 text-left transition-colors hover:bg-muted group"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-muted">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-body font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground font-body">{desc}</p>
            </div>

            <ArrowRight className="w-3 h-3 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  )
}
