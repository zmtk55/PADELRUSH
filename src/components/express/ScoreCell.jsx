import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function ScoreCell({ value, onChange, isWinner }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const ref = useRef(null)

  useEffect(() => { setDraft(String(value)) }, [value])
  useEffect(() => {
    if (editing && ref.current) { ref.current.focus(); ref.current.select() }
  }, [editing])

  const commit = () => {
    setEditing(false)
    const p = parseInt(draft, 10)
    const cl = isNaN(p) ? 0 : Math.min(99, Math.max(0, p))
    if (cl !== value) onChange(cl)
    setDraft(String(cl))
  }

  return editing ? (
    <input
      ref={ref}
      type="number" min="0" max="99"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(String(value)); setEditing(false) } }}
      className="w-full h-full min-w-[40px] bg-background text-center text-xl sm:text-2xl font-bold tabular-nums outline-none ring-2 ring-foreground/30 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  ) : (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        'w-full h-full min-w-[40px] flex items-center justify-center text-xl sm:text-2xl font-bold tabular-nums transition-all cursor-text rounded-lg',
        isWinner
          ? 'bg-primary text-primary-foreground shadow-sm'
          : value > 0
            ? 'bg-muted text-foreground hover:bg-muted/80'
            : 'bg-muted/30 text-muted-foreground/40 hover:bg-muted/50'
      )}
    >{value}</button>
  )
}
