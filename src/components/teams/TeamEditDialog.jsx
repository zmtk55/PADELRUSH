import { Edit3, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PlayerSearchSelect } from './PlayerSearchSelect'

export function TeamEditDialog({
  open, categories, onClose,
  editName, setEditName,
  editCategory, setEditCategory,
  editPlayer1, setEditPlayer1, editSearch1, setEditSearch1, editFiltered1,
  editPlayer2, setEditPlayer2, editSearch2, setEditSearch2, editFiltered2,
  saving, onSave
}) {
  return (
    <Dialog open={open} onOpenChange={() => { if (!saving) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-lg flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Editar equipo
          </DialogTitle>
          <DialogDescription>Modifica nombre, categoría o jugadores</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Nombre del equipo</Label>
            <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nombre del equipo" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Categoría</Label>
            <Select value={editCategory} onValueChange={setEditCategory}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
              <SelectContent>{categories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <PlayerSearchSelect
            label="Jugador 1" searchValue={editSearch1}
            onSearchChange={setEditSearch1}
            selectedPlayer={editPlayer1}
            onClear={() => { setEditPlayer1(null); setEditSearch1('') }}
            filteredPlayers={editFiltered1}
            onSelectPlayer={p => { if (editPlayer2?.id === p.id) setEditPlayer2(null); setEditPlayer1(p) }}
          />
          <PlayerSearchSelect
            label="Jugador 2" searchValue={editSearch2}
            onSearchChange={setEditSearch2}
            selectedPlayer={editPlayer2}
            onClear={() => { setEditPlayer2(null); setEditSearch2('') }}
            filteredPlayers={editFiltered2}
            onSelectPlayer={p => { if (editPlayer1?.id === p.id) setEditPlayer1(null); setEditPlayer2(p) }}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button size="sm" onClick={onSave} disabled={!editName.trim() || !editCategory || saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5 mr-1.5" />}
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}