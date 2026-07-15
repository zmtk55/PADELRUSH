import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, CalendarDays } from 'lucide-react'

const DAY_MAP = {
  'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3,
  'Jueves': 4, 'Viernes': 5, 'Sábado': 6,
}

// Round-robin fixture using the circle method
function generateRoundRobin(teams) {
  if (teams.length < 2) return []
  const arr = teams.map((t) => ({ ...t }))
  if (arr.length % 2 !== 0) arr.push(null) // bye
  const n = arr.length
  const rounds = n - 1
  const half = n / 2
  const schedule = []

  for (let r = 0; r < rounds; r++) {
    const roundMatches = []
    for (let i = 0; i < half; i++) {
      const home = arr[i]
      const away = arr[n - 1 - i]
      if (home && away) {
        roundMatches.push({
          home: { team_number: home.team_number, team_name: home.team_name || `Equipo ${home.team_number}`, category: home.category },
          away: { team_number: away.team_number, team_name: away.team_name || `Equipo ${away.team_number}`, category: away.category },
        })
      }
    }
    schedule.push(roundMatches)
    // rotate (keep first fixed)
    arr.splice(1, 0, arr.pop())
  }
  return schedule
}

function nextMatchDate(startStr, matchDays, usedCount) {
  if (!startStr) return null
  const start = new Date(startStr + 'T00:00:00')
  if (matchDays.length === 0) {
    const d = new Date(start)
    d.setDate(d.getDate() + usedCount)
    return d
  }
  const targetDows = matchDays.map((d) => DAY_MAP[d]).sort((a, b) => a - b)
  let cursor = new Date(start)
  let placed = 0
  while (placed < usedCount) {
    cursor.setDate(cursor.getDate() + 1)
    if (targetDows.includes(cursor.getDay())) placed++
  }
  return cursor
}

export default function CalendarStep({ form, setForm, errors, teams = [] }) {
  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const [generated, setGenerated] = useState(form.schedule || null)

  const handleGenerate = () => {
    if (teams.length < 2) {
      alert('Necesitas al menos 2 equipos para generar el calendario (puedes crearlos en el paso Equipos).')
      return
    }
    const rounds = generateRoundRobin(teams)
    const matchDays = form.matchDays || []
    let matchIndex = 0
    const dated = rounds.map((round, ri) => {
      const datedRound = round.map((m) => {
        const date = nextMatchDate(form.startDate, matchDays, matchIndex)
        matchIndex++
        return { ...m, date: date ? date.toISOString().slice(0, 10) : null }
      })
      return { round: ri + 1, matches: datedRound }
    })
    setGenerated(dated)
    setForm(f => ({ ...f, schedule: dated, generateSchedule: true }))
  }

  const fmtDate = (d) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Calendario</h2>
      <p className="text-muted-foreground">
        Configura el calendario de partidos para tu liga.
      </p>

      <div className="space-y-4">
        <Label>Fecha de inicio</Label>
        <Input
          type="date"
          value={form.startDate || ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
          className={errors.startDate ? 'border-destructive' : ''}
        />
        {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate}</p>}
      </div>

      <div className="space-y-4">
        <Label>Fecha de fin</Label>
        <Input
          type="date"
          value={form.endDate || ''}
          onChange={(e) => handleChange('endDate', e.target.value)}
          className={errors.endDate ? 'border-destructive' : ''}
        />
        {errors.endDate && <p className="text-sm text-destructive mt-1">{errors.endDate}</p>}
      </div>

      <div className="space-y-4">
        <Label>Días de la semana para partidos</Label>
        <div className="flex flex-wrap gap-2">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
            <label key={day} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.matchDays?.includes(day) || false}
                onChange={(e) => {
                  const days = e.target.checked
                    ? [...(form.matchDays || []), day]
                    : (form.matchDays || []).filter((d) => d !== day)
                  handleChange('matchDays', days)
                }}
              />
              <span>{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6 flex items-center gap-3">
        <Button variant="outline" onClick={handleGenerate}>
          <CalendarDays className="h-4 w-4 mr-2" />
          Generar calendario automático
        </Button>
        <span className="text-sm text-muted-foreground">
          ({teams.length} equipos → {teams.length < 2 ? 0 : Math.round(teams.length * (teams.length - 1) / 2)} partidos estimados)
        </span>
      </div>

      {generated && (
        <div className="mt-4 rounded-lg border border-border p-4 max-h-80 overflow-auto space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" /> Calendario generado
          </h3>
          {generated.map((r) => (
            <div key={r.round}>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Jornada {r.round}</p>
              <div className="space-y-1">
                {r.matches.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-muted/40 rounded px-3 py-1.5">
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
  )
}
