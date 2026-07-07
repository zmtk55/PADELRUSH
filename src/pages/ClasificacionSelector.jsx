import { BarChart3 } from 'lucide-react'
import LeagueSelector from '@/components/layout/LeagueSelector'

export default function ClasificacionSelector() {
  return (
    <LeagueSelector
      icon={BarChart3}
      title="Clasificación"
      description="Selecciona una liga para ver su tabla de posiciones"
      route="/ligas/${id}/clasificacion"
      emptyText="No hay ligas disponibles"
      emptyDescription="Crea una liga primero para ver las clasificaciones"
    />
  )
}
