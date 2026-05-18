export default function CategoryTabs({ categories, active, onChange, counts = {}, variant = 'underline' }) {
  if (variant === 'pill') {
    return (
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button key={cat} onClick={() => onChange(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all ${
              active === cat
                ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
            }`}>
            {cat}
            {counts[cat] !== undefined && (
              <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${active === cat ? 'bg-accent-foreground/20' : 'bg-muted'}`}>
                {counts[cat]}
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }
  return (
    <div className="flex gap-4 border-b border-border">
      {categories.map((cat) => (
        <button key={cat} onClick={() => onChange(cat)}
          className={`pb-2 text-sm font-body font-medium transition-all border-b-2 ${
            active === cat ? 'border-accent text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>
          {cat}
          {counts[cat] !== undefined && <span className="ml-2 text-xs text-muted-foreground">({counts[cat]})</span>}
        </button>
      ))}
    </div>
  )
}
