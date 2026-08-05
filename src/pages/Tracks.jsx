import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function Tracks() {
  return (
    <div>
      <PageHeader title="Gestión de pistas" description="Administra tus pistas de audio" />
      <div className="space-y-4">
        <Button variant="outline" onClick={() => alert('Crear pista - por implementar')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva pista
        </Button>
        <div className="card p-6">
          <p className="text-fg-muted">Esta sección está en desarrollo. Próximamente podrás:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Crear nuevas pistas</li>
            <li>Cambiar el estado (grabada, mezclada, masterizada)</li>
            <li>Subir nuevas versiones</li>
            <li>Cambiar nombre y portada</li>
            <li>Ver historial de cambios</li>
          </ul>
        </div>
      </div>
    </div>
  )
}