import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PlayerSearchSelect } from './PlayerSearchSelect'

export function TeamCreateDialog({
  open, categories, newTeam, setNewTeam,
  playerSearch1, setPlayerSearch1, filteredPlayers1,
  playerSearch2, setPlayerSearch2, filteredPlayers2,
  creating, onClose, onCreate
}) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Crear equipo
          </DialogTitle>
          <DialogDescription>Asigna nombre, categoría y dos jugadores</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Nombre del equipo</Label>
            <Input value={newTeam.name} onChange={e => setNewTeam(n => ({ ...n, name: e.target.value }))} placeholder="Ej: Los Pumas" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Categoría</Label>
            <Select value={newTeam.category} onValueChange={v => setNewTeam(n => ({ ...n, category: v }))}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
              <SelectContent>{categories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <PlayerSearchSelect
            label="Jugador 1" searchValue={playerSearch1}
            onSearchChange={setPlayerSearch1}
            selectedPlayer={newTeam.player1}
            onClear={() => { setNewTeam(n => ({ ...n, player1: null })); setPlayerSearch1('') }}
            filteredPlayers={filteredPlayers1}
            onSelectPlayer={p => { if (newTeam.player2?.id === p.id) setNewTeam(n => ({ ...n, player2: null })); setNewTeam(n => ({ ...n, player1: p })) }}
          />
          <PlayerSearchSelect
            label="Jugador 2" searchValue={playerSearch2}
            onSearchChange={setPlayerSearch2}
            selectedPlayer={newTeam.player2}
            onClear={() => { setNewTeam(n => ({ ...n, player2: null })); setPlayerSearch2('') }}
            filteredPlayers={filteredPlayers2}
            onSelectPlayer={p => { if (newTeam.player1?.id === p.id) setNewTeam(n => ({ ...n, player1: null })); setNewTeam(n => ({ ...n, player2: p })) }}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={onClose} disabled={creating}>Cancelar</Button>
            <Button size="sm" onClick={onCreate} disabled={!newTeam.name.trim() || !newTeam.category || !newTeam.player1 || !newTeam.player2 || creating}>
              {creating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
              {creating ? 'Creando...' : 'Crear equipo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}