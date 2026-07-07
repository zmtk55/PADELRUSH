import { useNavigate } from 'react-router-dom'
import { Trophy, Users, Calendar, ArrowRight, Zap, Plus } from 'lucide-react'

export function EmptyDashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-[520px] w-full text-center">
        <div className="inline-flex mb-10">
          <div className="relative">
            <div className="w-[72px] h-[72px] flex items-center justify-center bg-court">
              <Zap className="w-[30px] h-[30px] text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-[26px] h-[26px] flex items-center justify-center bg-ball text-background">
              <Trophy className="w-[13px] h-[13px]" />
            </div>
          </div>
        </div>

        <h1 className="font-heading font-bold text-[2rem] sm:text-[2.5rem] leading-[1.05] tracking-tight mb-4">
          <span className="text-court">PADEL</span>RUSH
        </h1>

        <p className="text-fg-secondary text-sm mb-10 max-w-[400px] mx-auto leading-relaxed">
          Organiza torneos de pádel, gestiona equipos y sigue los resultados en tiempo real.
        </p>

        <div className="space-y-3 mb-10">
          {[
            { icon: Trophy, title: 'CREA TU LIGA', desc: 'Nombre, categorías, formato y precio' },
            { icon: Users, title: 'INVITA JUGADORES', desc: 'Registra participantes y arma parejas' },
            { icon: Calendar, title: 'JUEGA Y SIGUE', desc: 'Partidos, resultados y clasificación en vivo' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="flex items-start gap-4 card p-4 text-left" style={{ borderLeft: '2px solid hsl(var(--court))' }}>
              <div className="flex items-center gap-3 shrink-0 mt-0.5">
                <div className="w-[18px] h-[18px] flex items-center justify-center bg-court text-primary-foreground text-[10px] font-bold font-score">
                  {i + 1}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="w-[14px] h-[14px] text-court shrink-0" />
                  <h3 className="font-heading font-bold text-xs tracking-[0.1em]">{title}</h3>
                </div>
                <p className="text-[13px] text-fg-muted mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/ligas/nueva')} className="btn-primary h-12 px-10 text-sm gap-3">
          <Plus className="w-5 h-5" />
          CREAR PRIMERA LIGA
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
