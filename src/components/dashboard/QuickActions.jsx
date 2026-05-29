import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Zap, Users, Swords, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const actions = [
  { label: 'Nueva Liga', icon: Trophy, to: '/ligas/nueva', description: 'Crea una liga desde cero' },
  { label: 'Partido Express', icon: Zap, to: '/express', description: 'Partido rapido sin liga' },
  { label: 'Agregar Equipo', icon: Users, to: '/equipos', description: 'Registra un nuevo equipo' },
  { label: 'Ver Partidos', icon: Swords, to: '/partidos', description: 'Calendario de partidos' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
}

export function QuickActions() {
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="card-base p-6"
    >
      <h3 className="font-heading text-base font-semibold text-foreground tracking-wider mb-4">Acciones Rapidas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map(({ label, icon: Icon, to, description }) => (
          <motion.button
            key={to}
            variants={item}
            onClick={() => navigate(to)}
            className="group relative flex flex-col items-start gap-2 p-4 sm:p-4 touch-y rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-all duration-200 text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-body font-semibold text-foreground">{label}</p>
              <p className="text-[10px] font-body text-muted-foreground mt-0.5">{description}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-primary absolute top-3 right-3 transition-all duration-200" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
