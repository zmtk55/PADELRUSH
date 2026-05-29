import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

export default function CategoryTabs({ categories, active, onChange, counts = {}, variant = 'underline' }) {
  if (variant === 'pill') {
    return (
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={cn(
              "relative px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all duration-200",
              active === cat
                ? "text-primary-foreground shadow-glow-sm"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/20"
            )}
          >
            {active === cat && (
              <motion.div
                layoutId="pill-bg"
                className="absolute inset-0 rounded-xl bg-gradient-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
            {counts[cat] !== undefined && (
              <span className={cn(
                "ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono relative z-10",
                active === cat ? "bg-white/20" : "bg-muted"
              )}>
                {counts[cat]}
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-1 p-1 rounded-xl bg-muted/30 border border-border/30">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            "relative px-4 py-2 rounded-lg text-sm font-body font-medium transition-all duration-200",
            active === cat
              ? "text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {active === cat && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 rounded-lg bg-card border border-border/50"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{cat}</span>
          {counts[cat] !== undefined && (
            <span className={cn(
              "ml-2 text-xs font-mono relative z-10",
              active === cat ? "text-primary" : "text-muted-foreground"
            )}>
              {counts[cat]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
