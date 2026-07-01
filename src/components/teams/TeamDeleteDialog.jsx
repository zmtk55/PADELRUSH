import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export function TeamDeleteDialog({ deleteConfirm, deleting, onClose, onDelete }) {
  return (
    <Dialog open={!!deleteConfirm} onOpenChange={() => { if (!deleting) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-lg flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" /> Eliminar equipo
          </DialogTitle>
          <DialogDescription>
            {deleteConfirm && (
              <span>Se va a eliminar a <strong>{deleteConfirm.team_name || 'Equipo ' + deleteConfirm.team_number}</strong> de la categoría <strong>{deleteConfirm.category}</strong>.</span>
            )}
            <br />Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={deleting}>Cancelar</Button>
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={deleting}>
            {deleting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}