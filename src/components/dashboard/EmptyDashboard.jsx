import { motion } from 'framer-motion'
import { Trophy, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function EmptyDashboard() {
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-6 sm:p-12 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted border border-border/50 flex items-center justify-center mx-auto mb-6">
        <Trophy className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-foreground tracking-wider mb-2">Bienvenido a PadelRush</h2>
      <p className="font-body text-muted-foreground max-w-md mx-auto mb-8">Crea tu primera liga y comienza a organizar partidos de padel de forma sencilla y profesional.</p>
      {isOrganizer && (
        <Button size="lg" onClick={() => navigate('/ligas/nueva')}>
          <Sparkles className="w-4 h-4" />
          Crear Primera Liga
        </Button>
      )}
    </motion.div>
  )
}
