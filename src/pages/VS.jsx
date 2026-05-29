import { motion } from 'framer-motion'
import { Trophy, CheckCircle2 } from 'lucide-react'

export default function VS() {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border p-8 sm:p-12 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-muted mb-6"
        >
          <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3 tracking-tight">
          VS · VERIFICACIÓN
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Esta página confirma que el <strong className="text-foreground">nuevo sistema de diseño</strong> está funcionando correctamente
        </p>

        <div className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 border border-border bg-muted">
          <span className="text-sm font-medium text-muted-foreground">Diseño Editorial B/N</span>
        </div>
      </motion.div>

      {/* CSS Variables / Color Palette */}
      <div>
        <h2 className="text-xl font-heading font-bold mb-4">Paleta de colores activa</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Background', className: 'bg-card border border-border' },
            { name: 'Card', className: 'bg-card border border-border' },
            { name: 'Foreground', className: 'bg-foreground' },
            { name: 'Muted', className: 'bg-muted border border-border' },
            { name: 'Border', className: 'bg-muted' },
            { name: 'Primary', className: 'bg-foreground' },
            { name: 'Secondary', className: 'bg-muted' },
            { name: 'Muted fg', className: 'bg-muted0' },
            { name: 'Destructive', className: 'bg-red-600' },
            { name: 'Success', className: 'bg-emerald-600' },
          ].map(({ name, className }) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border p-3"
            >
              <div className={`w-full h-16 mb-2 ${className}`} />
              <p className="text-sm font-medium text-foreground">{name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h2 className="text-xl font-heading font-bold mb-4">Tipografía</h2>
        <div className="bg-card border border-border p-6 sm:p-8 space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Headlines: Playfair Display · Body: Inter
          </p>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Heading (font-heading)</p>
            <h1 className="text-4xl font-heading font-bold tracking-tight">Playfair Display</h1>
            <h2 className="text-2xl font-heading font-semibold mt-2 tracking-tight">The quick brown fox</h2>
            <h3 className="text-xl font-heading mt-2 tracking-tight">Jumps over the lazy dog</h3>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Body (font-body)</p>
            <p className="text-base font-body">
              Inter — El pádel es un deporte que combina estrategia, velocidad y técnica.
            </p>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              Cada vez más popular en todo el mundo, el pádel sigue creciendo.
            </p>
          </div>
        </div>
      </div>

      {/* Design Tokens */}
      <div>
        <h2 className="text-xl font-heading font-bold mb-4">Design Tokens</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div className="bg-card border border-border p-5 space-y-3">
            <p className="text-sm font-medium">Sombras</p>
            <div className="space-y-2">
              <div className="shadow-sm bg-card p-3 text-sm border border-border">shadow-sm</div>
              <div className="shadow-md bg-card p-3 text-sm border border-border">shadow-md</div>
            </div>
          </motion.div>

          <motion.div className="bg-card border border-border p-5 space-y-3">
            <p className="text-sm font-medium">Bordes</p>
            <div className="space-y-2">
              <div className="border border-border bg-card p-3 text-sm">border-border</div>
              <div className="border border-border bg-card p-3 text-sm">border-border</div>
              <div className="border border-foreground bg-card p-3 text-sm">border-foreground</div>
            </div>
          </motion.div>

          <motion.div className="bg-card border border-border p-5 space-y-3">
            <p className="text-sm font-medium">Radios</p>
            <div className="space-y-2">
              <div className="rounded-none border border-border bg-card p-3 text-sm">rounded-none</div>
              <div className="rounded border border-border bg-card p-3 text-sm">rounded</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-muted-foreground border-t border-border">
        <p>PadelRush — Diseño Editorial B/N</p>
      </div>
    </div>
  )
}
