import { Shield } from 'lucide-react'
import LeagueSelector from '@/components/layout/LeagueSelector'

export default function AdminSelector() {
  return (
    <LeagueSelector
      icon={Shield}
      title="Panel de Control"
      description="Selecciona una liga para administrar"
      route="/ligas/${id}/admin"
      emptyText="No hay ligas disponibles"
      emptyDescription="Crea una liga primero para poder administrarla"
    />
  )
}
