import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Plus, X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useMatches } from '@/hooks/useMatches'

export function ScheduleBuilder({ leagueId, teams, onComplete, onCancel }) {
  const { createMatchesBatch } = useMatches(leagueId)
  const [schedules, setSchedules] = useState([])

  const categories = [...new Set(teams.map((t) => t.category))]

  const generateRoundRobin = (category) => {
    const catTeams = teams.filter((t) => t.category === category).sort((a, b) => a.team_number - b.team_number)
    if (catTeams.length < 2) return

    const n = catTeams.length
    const rounds = n % 2 === 0 ? n - 1 : n
    const mid = Math.floor(n / 2)
    const teamsList = [...catTeams]
    if (n % 2 !== 0) teamsList.push({ team_number: 'BYE', team_name: 'Descansa' })

    const generated = []

    for (let r = 0; r < rounds; r++) {
      for (let m = 0; m < mid; m++) {
        const t1 = teamsList[m]
        const t2 = teamsList[teamsList.length - 1 - m]
        if (t1.team_number !== 'BYE' && t2.team_number !== 'BYE') {
          generated.push({
            id: `match-${category}-r${r + 1}-m${m + 1}`,
            category,
            round: (r + 1).toString(),
            match_number: m + 1,
            team1_id: t1.id,
            team2_id: t2.id,
            team1_number: t1.team_number,
            team2_number: t2.team_number,
            team1_name: t1.team_name || `Equipo ${t1.team_number}`,
            team2_name: t2.team_name || `Equipo ${t2.team_number}`,
            status: 'programado',
          })
        }
      }
      // Rotate (keep first fixed)
      teamsList.splice(1, 0, teamsList.pop())
    }

    setSchedules((prev) => [...prev.filter((s) => s.category !== category), ...generated])
  }

  const updateSchedule = (id, field, value) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const removeSchedule = (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id))
  }

  const handleSave = async () => {
    const matches = schedules.map(({ id, ...rest }) => ({
      ...rest,
      league_id: leagueId,
    }))
    await createMatchesBatch.mutateAsync(matches)
    onComplete?.()
  }

  const allGenerated = categories.every((cat) => schedules.some((s) => s.category === cat))

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold">Generar calendario</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          {schedules.length > 0 && (
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Guardar calendario
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={schedules.some((s) => s.category === cat) ? 'default' : 'outline'}
            size="sm"
            onClick={() => generateRoundRobin(cat)}
          >
            {schedules.some((s) => s.category === cat) ? '✓ ' : ''}
            {cat} — Todos contra todos
          </Button>
        ))}
      </div>

      {schedules.length > 0 && (
        <div className="space-y-4">
          {categories.map((cat) => {
            const catSchedules = schedules.filter((s) => s.category === cat)
            if (catSchedules.length === 0) return null

            const rounds = [...new Set(catSchedules.map((s) => s.round))]

            return (
              <div key={cat}>
                <h4 className="font-medium text-sm mb-2">{cat}</h4>
                {rounds.map((round) => (
                  <div key={round} className="mb-3">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Ronda {round}</p>
                    <div className="space-y-1">
                      {catSchedules
                        .filter((s) => s.round === round)
                        .map((match) => (
                          <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border text-sm"
                          >
                            <span className="font-medium w-32 truncate">{match.team1_name}</span>
                            <span className="text-muted-foreground">vs</span>
                            <span className="font-medium w-32 truncate">{match.team2_name}</span>

                            <div className="flex items-center gap-2 ml-auto">
                              <input
                                type="date"
                                value={match.scheduled_date || ''}
                                onChange={(e) => updateSchedule(match.id, 'scheduled_date', e.target.value)}
                                className="border border-input rounded px-2 py-1 text-xs bg-transparent w-32"
                              />
                              <input
                                type="time"
                                value={match.scheduled_time || ''}
                                onChange={(e) => updateSchedule(match.id, 'scheduled_time', e.target.value)}
                                className="border border-input rounded px-2 py-1 text-xs bg-transparent w-20"
                              />
                              <input
                                placeholder="Cancha"
                                value={match.court || ''}
                                onChange={(e) => updateSchedule(match.id, 'court', e.target.value)}
                                className="border border-input rounded px-2 py-1 text-xs bg-transparent w-20"
                              />
                              <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => removeSchedule(match.id)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {!allGenerated && schedules.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Haz clic en una categoría para generar el calendario automáticamente (todos contra todos)
        </p>
      )}
    </div>
  )
}
