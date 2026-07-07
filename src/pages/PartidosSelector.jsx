import { Calendar } from 'lucide-react'
import LeagueSelector from '@/components/layout/LeagueSelector'

export default function PartidosSelector() {
  return (
    <LeagueSelector
      icon={Calendar}
      title="Partidos"
      description="Selecciona una liga para ver sus partidos"
      route="/ligas/${id}/partidos"
      emptyText="No hay ligas disponibles"
      emptyDescription="Crea una liga primero para ver sus partidos"
    />
  )
}
