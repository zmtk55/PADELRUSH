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
        className="flex items-center gap-2 px-3 py-2 text-sm font-body border border-border bg-card hover:bg-muted transition-colors"
      >
        <Filter className="w-4 h-4 text-muted-foreground" />
        {selected ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-foreground" />
            <span className="text-foreground">{selected.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Todas las ligas</span>
        )}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 z-20 bg-card border border-border shadow-elevated">
            <button
              onClick={() => { onSelect(null); setIsOpen(false) }}
              className={`w-full text-left px-4 py-3 text-sm font-body transition-colors ${
                !selectedLeague ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Todas las ligas
            </button>
            <div className="h-px bg-border" />
            {leagues.map((league) => (
              <button
                key={league.id}
                onClick={() => { onSelect(league.id); setIsOpen(false) }}
                className={`w-full text-left px-4 py-3 text-sm font-body transition-colors flex items-center gap-2 ${
                  selectedLeague === league.id ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="w-2 h-2 bg-foreground shrink-0" />
                <span className="truncate">{league.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
