import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FORMAT_LABELS = {
  'todos-contra-todos': 'Todos contra todos',
  'round-robin-express': 'Round Robin Express',
  'grupos-y-eliminatorias': 'Grupos + eliminatorias',
  'eliminatoria-directa': 'Eliminatoria directa',
}

const fmtDate = (d) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

export default function ReviewStep({ form, teams = [], participants = [], saving, handleSave, isEditing }) {
  const playerName = (id) => (participants || []).find((p) => p.id === id)?.name || 'Desconocido'

  const totalMatches = form.schedule
    ? form.schedule.reduce((acc, r) => acc + r.matches.length, 0)
    : (teams.length >= 2 ? Math.round(teams.length * (teams.length - 1) / 2) : 0)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Revisión</h2>
      <p className="text-muted-foreground">
        Revisa los detalles de tu liga antes de crearla.
      </p>

      {/* Basic Info */}
      <div className="border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Datos básicos</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><p className="text-sm text-muted-foreground">Nombre</p><p className="font-medium">{form.name}</p></div>
          <div><p className="text-sm text-muted-foreground">Slug</p><p className="font-medium">{form.slug || '(se generará automáticamente)'}</p></div>
          <div><p className="text-sm text-muted-foreground">Deporte</p><p className="font-medium">{form.sport === 'padel' ? 'Pádel' : form.sport}</p></div>
          <div><p className="text-sm text-muted-foreground">Género</p><p className="font-medium">{form.gender === 'femenil' ? 'Femenil' : form.gender === 'varonil' ? 'Varonil' : 'Mixto'}</p></div>
          <div><p className="text-sm text-muted-foreground">Estado</p><p className="font-medium">{form.status === 'proxima' ? 'Próxima' : form.status === 'activa' ? 'Activa' : 'Finalizada'}</p></div>
          <div><p className="text-sm text-muted-foreground">Temporada</p><p className="font-medium">{form.season}</p></div>
        </div>
      </div>

      {/* Configuration */}
      <div className="border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Configuración</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Categorías</p>
            <p className="font-medium">{form.categories.length > 0 ? form.categories.join(', ') : '(ninguna)'}</p>
          </div>
          {form.categories.map((cat) => (
            <div key={cat} className="pl-4">
              <p className="text-sm text-muted-foreground">Formato para {cat}</p>
              <p className="font-medium">{FORMAT_LABELS[form.category_formats[cat]] || '(no seleccionado)'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Teams */}
      <div className="border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Equipos ({teams.length})</h3>
        {teams.length > 0 ? (
          <div className="space-y-2">
            {teams.map((team, index) => (
              <div key={index} className="border border-border/50 rounded-lg p-3">
                <p className="font-medium">{team.team_name || `Equipo ${team.team_number}`}</p>
                <p className="text-sm text-muted-foreground">Categoría: {team.category}</p>
                <p className="text-sm text-muted-foreground">Jugador 1: {playerName(team.player1_id)}</p>
                <p className="text-sm text-muted-foreground">Jugador 2: {playerName(team.player2_id)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No se han creado equipos.</p>
        )}
      </div>

      {/* Pricing */}
      <div className="border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Precios</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><p className="text-sm text-muted-foreground">Inscripción</p><p className="font-medium">${form.inscriptionFee}</p></div>
          <div><p className="text-sm text-muted-foreground">Costo de arbitraje por partido</p><p className="font-medium">${form.arbitrationCostPerMatch}</p></div>
          <div><p className="text-sm text-muted-foreground">Premio total</p><p className="font-medium">${form.prizePool}</p></div>
          <div><p className="text-sm text-muted-foreground">Costos operativos</p><p className="font-medium">${form.operationalCosts}</p></div>
        </div>
      </div>

      {/* Calendar */}
      <div className="border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Calendario</h3>
        <div className="space-y-3">
          <div><p className="text-sm text-muted-foreground">Fecha de inicio</p><p className="font-medium">{form.startDate || '(no establecida)'}</p></div>
          <div><p className="text-sm text-muted-foreground">Fecha de fin</p><p className="font-medium">{form.endDate || '(no establecida)'}</p></div>
          <div><p className="text-sm text-muted-foreground">Días de partido</p><p className="font-medium">{form.matchDays && form.matchDays.length > 0 ? form.matchDays.join(', ') : '(ningún día seleccionado)'}</p></div>
          <div><p className="text-sm text-muted-foreground">Partidos</p><p className="font-medium">{totalMatches}</p></div>
          {form.schedule && form.schedule.length > 0 && (
            <div className="pt-2 space-y-2 max-h-60 overflow-auto">
              {form.schedule.map((r) => (
                <div key={r.round}>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Jornada {r.round}</p>
                  <div className="space-y-1">
                    {r.matches.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-muted/40 rounded px-2 py-1">
                        <span className="font-medium">{m.home.team_name}</span>
                        <span className="text-muted-foreground text-xs">vs</span>
                        <span className="font-medium">{m.away.team_name}</span>
                        <span className="text-muted-foreground text-xs ml-2">{fmtDate(m.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
