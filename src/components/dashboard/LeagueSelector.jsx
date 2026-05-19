import { useState } from 'react'
import { ChevronDown, Filter } from 'lucide-react'

export function LeagueSelector({ leagues, selectedLeague, onSelect }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!leagues?.length) return null

  const selected = leagues.find(l => l.id === selectedLeague)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors text-sm"
      >
        <Filter className="w-4 h-4 text-muted-foreground" />
        {selected ? (
          <span className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selected.color || '#c96442' }}
            />
            {selected.name}
          </span>
        ) : (
          <span className="text-muted-foreground">Todas las ligas</span>
        )}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden">
            <button
              onClick={() => { onSelect(null); setIsOpen(false) }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                !selectedLeague ? 'bg-muted/50 font-medium' : ''
              }`}
            >
              Todas las ligas
            </button>
            <div className="border-t border-border" />
            {leagues.map((league) => (
              <button
                key={league.id}
                onClick={() => { onSelect(league.id); setIsOpen(false) }}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                  selectedLeague === league.id ? 'bg-muted/50 font-medium' : ''
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: league.color || '#c96442' }}
                />
                <span className="truncate">{league.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
