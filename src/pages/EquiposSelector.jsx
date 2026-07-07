import { Swords } from 'lucide-react'
import LeagueSelector from '@/components/layout/LeagueSelector'

export default function EquiposSelector() {
  return (
    <LeagueSelector
      icon={Swords}
      title="Equipos"
      description="Selecciona una liga para ver sus equipos"
      route="/ligas/${id}/equipos"
      emptyText="No hay ligas disponibles"
      emptyDescription="Crea una liga primero para ver sus equipos"
    />
  )
}
