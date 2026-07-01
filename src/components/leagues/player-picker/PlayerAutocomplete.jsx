import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X, Plus, Check } from 'lucide-react'
import { getInitials, getAvatarColor } from './constants'
export function PlayerAutocomplete({ participants, value, onChange, placeholder, excludedIds }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightIdx, setHighlightIdx] = useState(0)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => { setHighlightIdx(0) }, [value])

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !inputRef.current.contains(e.target))
        setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const filtered = useMemo(() => {
    if (!search.trim()) return participants.slice(0, 8)
    const q = search.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return participants
      .filter(p => {
        const nameNorm = p.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        return nameNorm.includes(q) && !excludedIds?.includes(p.id)
      })
      .slice(0, 10)
  }, [participants, search, excludedIds])

  const exactMatch = participants.find(p => p.name.toLowerCase() === search.trim().toLowerCase())
  const canCreate = search.trim().length >= 2 && !exactMatch

  const selectPlayer = (p) => { onChange(p); setIsOpen(false) }
  const createPlayer = () => {
    if (!canCreate) return
    const newP = { id: 'new-' + Date.now(), name: search.trim(), isNew: true }
    onChange(newP); setIsOpen(false)
  }
  const clearSelection = () => { onChange(null); setTimeout(() => inputRef.current?.focus(), 50) }

  if (value && value.name) {
    return (
      <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 group animate-in fade-in zoom-in-95 duration-150">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${getAvatarColor(value.name)}`}
        >
          {getInitials(value.name)}
        </div>
        <span className="text-sm font-medium">{value.name}</span>
        {value.isNew ? (
          <span className="text-[9px] font-semibold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">Nuevo</span>
        ) : (
          <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Existente</span>
        )}
        <button
          onClick={clearSelection}
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 hover:text-destructive rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setIsOpen(true); setHighlightIdx(0) }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, Math.max(filtered.length - 1, 0))) }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)) }
            else if (e.key === 'Enter') {
              e.preventDefault()
              if (filtered.length > 0) { selectPlayer(filtered[highlightIdx]) }
              else if (canCreate) { createPlayer() }
            }
            else if (e.key === 'Escape') { setIsOpen(false) }
          }}
          placeholder={placeholder || "Buscar jugador..."}
          className="w-full h-10 pl-9 pr-4 bg-background border border-input rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
        >
          {filtered.length === 0 && !canCreate && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Escribe al menos 2 caracteres...
            </div>
          )}
          {filtered.map((p, i) => (
            <button
              key={p.id}
              onClick={() => selectPlayer(p)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${i === highlightIdx ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${getAvatarColor(p.name)}`}>
                {getInitials(p.name)}
              </div>
              <span>{p.name}</span>
              <Check className={`w-3.5 h-3.5 ml-auto ${i === highlightIdx ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
          {canCreate && (
            <button
              onClick={createPlayer}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm border-t border-border text-primary font-medium hover:bg-primary/5 transition-colors"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary/10 text-primary border border-primary/30">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>Crear nuevo: <strong>{search.trim()}</strong></span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
