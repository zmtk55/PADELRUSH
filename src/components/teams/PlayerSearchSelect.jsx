import { Search, Users, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function PlayerSearchSelect({ label, searchValue, onSearchChange, selectedPlayer, onClear, filteredPlayers, onSelectPlayer }) {
  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <div className="relative mt-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input value={searchValue} onChange={e => onSearchChange(e.target.value)}
          placeholder="Buscar jugador..." className="pl-8" />
      </div>
      {selectedPlayer ? (
        <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 mt-2 rounded-md">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-medium">{selectedPlayer.name}</span>
          </div>
          <button onClick={onClear}><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <div className="max-h-32 overflow-y-auto mt-2 space-y-0.5 border border-border rounded-md">
          {filteredPlayers.slice(0, 10).map(p => (
            <button key={p.id} onClick={() => onSelectPlayer(p)}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors">
              {p.name}
            </button>
          ))}
          {filteredPlayers.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              {searchValue ? 'Sin resultados' : 'No hay jugadores disponibles'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}