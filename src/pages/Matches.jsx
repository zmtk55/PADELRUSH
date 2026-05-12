import { useParams, useNavigate } from 'react-router-dom'
import { useMatches } from '@/hooks/useMatches'
import { useTeams } from '@/hooks/useTeams'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Edit } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScheduleBuilder } from '@/components/leagues/ScheduleBuilder'

export default function Matches() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { matchesQuery, updateMatch, deleteMatch } = useMatches(leagueId)
  const { teamsQuery } = useTeams(leagueId)
  const [editingMatch, setEditingMatch] = useState(null)
  const [showScheduler, setShowScheduler] = useState(false)

  const matches = matchesQuery.data || []
  const teams = teamsQuery.data || []

  const grouped = matches.reduce((acc, m) => {
    const cat = m.category || 'Sin categoría'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(m)
    return acc
  }, {})

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate(`/ligas/${leagueId}`)} className="mb-4">
        <ArrowLeft className="w-4 h-4" />
        Volver a liga
      </Button>

      <PageHeader
        title="Partidos"
        description="Calendario y resultados"
        action={
          isOrganizer && (
            <Button variant="outline" onClick={() => setShowScheduler(!showScheduler)}>
              {showScheduler ? 'Cancelar' : 'Generar horarios'}
            </Button>
          )
        }
      />

      {showScheduler && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <ScheduleBuilder
            leagueId={leagueId}
            teams={teams}
            onComplete={() => setShowScheduler(false)}
            onCancel={() => setShowScheduler(false)}
          />
        </motion.div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground">No hay partidos registrados</p>
          {isOrganizer && (
            <Button className="mt-4" onClick={() => setShowScheduler(true)}>
              Generar calendario
            </Button>
          )}
        </div>
      ) : (
        Object.entries(grouped).map(([category, catMatches]) => (
          <div key={category} className="mb-6">
            <h3 className="font-heading font-semibold text-lg mb-3">{category}</h3>
            <div className="space-y-2">
              {catMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isOrganizer={isOrganizer}
                  onEdit={setEditingMatch}
                  onDelete={() => deleteMatch.mutate(match.id)}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {editingMatch && (
        <ScoreEditor
          match={editingMatch}
          open={!!editingMatch}
          onClose={() => setEditingMatch(null)}
          onSave={(values) => {
            updateMatch.mutate({ id: editingMatch.id, ...values })
            setEditingMatch(null)
          }}
        />
      )}
    </div>
  )
}

function MatchCard({ match, isOrganizer, onEdit, onDelete }) {
  const setsDetail = [
    match.set1_team1 != null && `${match.set1_team1}-${match.set1_team2}`,
    match.set2_team1 != null && `${match.set2_team1}-${match.set2_team2}`,
    match.set3_team1 != null && `${match.set3_team1}-${match.set3_team2}`,
  ].filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium">
            {match.team1_name || `Equipo ${match.team1_number}`}
            <span className="text-muted-foreground mx-2">vs</span>
            {match.team2_name || `Equipo ${match.team2_number}`}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {match.round && <span className="text-xs text-muted-foreground">Ronda {match.round}</span>}
            {match.court && <span className="text-xs text-muted-foreground">· {match.court}</span>}
            {match.scheduled_date && <span className="text-xs text-muted-foreground">· {match.scheduled_date}</span>}
            {match.scheduled_time && <span className="text-xs text-muted-foreground">· {match.scheduled_time}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {match.status === 'jugado' ? (
            <div className="text-right">
              <p className="text-lg font-bold font-heading">
                {match.sets_won_team1} - {match.sets_won_team2}
              </p>
              {setsDetail.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  ({setsDetail.join(', ')})
                </p>
              )}
            </div>
          ) : match.status === 'walkover' ? (
            <Badge variant="destructive">W/O</Badge>
          ) : match.status === 'cancelado' ? (
            <Badge variant="destructive">Cancelado</Badge>
          ) : (
            <Badge variant="secondary">Programado</Badge>
          )}

          {isOrganizer && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(match)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function ScoreEditor({ match, open, onClose, onSave }) {
  const [status, setStatus] = useState('jugado')
  const [set1_team1, setSet1t1] = useState(match.set1_team1 ?? '')
  const [set1_team2, setSet1t2] = useState(match.set1_team2 ?? '')
  const [set2_team1, setSet2t1] = useState(match.set2_team1 ?? '')
  const [set2_team2, setSet2t2] = useState(match.set2_team2 ?? '')
  const [set3_team1, setSet3t1] = useState(match.set3_team1 ?? '')
  const [set3_team2, setSet3t2] = useState(match.set3_team2 ?? '')

  const calcSets = () => {
    let sw1 = 0, sw2 = 0
    const sets = [
      [parseInt(set1_team1) || 0, parseInt(set1_team2) || 0],
      [parseInt(set2_team1) || 0, parseInt(set2_team2) || 0],
    ]
    if (set3_team1 !== '' || set3_team2 !== '') {
      sets.push([parseInt(set3_team1) || 0, parseInt(set3_team2) || 0])
    }
    sets.forEach(([a, b]) => {
      if (a > b) sw1++
      else if (b > a) sw2++
    })
    const winner = sw1 > sw2 ? match.team1_number : sw2 > sw1 ? match.team2_number : null
    return { sets_won_team1: sw1, sets_won_team2: sw2, winner_team_number: winner }
  }

  const handleSave = () => {
    if (status !== 'jugado') {
      onSave({ status, played_date: new Date().toISOString().split('T')[0] })
      return
    }
    const parsed = {
      status: 'jugado',
      set1_team1: parseInt(set1_team1) || 0,
      set1_team2: parseInt(set1_team2) || 0,
      set2_team1: parseInt(set2_team1) || 0,
      set2_team2: parseInt(set2_team2) || 0,
      set3_team1: set3_team1 !== '' ? parseInt(set3_team1) : null,
      set3_team2: set3_team2 !== '' ? parseInt(set3_team2) : null,
    }
    onSave({ ...parsed, ...calcSets(), played_date: new Date().toISOString().split('T')[0] })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar resultado</DialogTitle>
          <DialogDescription>
            {match.team1_name || `Eq. ${match.team1_number}`} vs {match.team2_name || `Eq. ${match.team2_number}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Estado</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="jugado">Jugado (con resultado)</option>
              <option value="walkover">Walkover (W/O)</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </div>

          {status === 'jugado' && (
            <>
              <div className="grid grid-cols-3 gap-3 items-center">
                <span className="text-xs font-medium text-muted-foreground">Set 1</span>
                <Input value={set1_team1} onChange={(e) => setSet1t1(e.target.value)} placeholder="Eq1" className="text-center" />
                <Input value={set1_team2} onChange={(e) => setSet1t2(e.target.value)} placeholder="Eq2" className="text-center" />
              </div>
              <div className="grid grid-cols-3 gap-3 items-center">
                <span className="text-xs font-medium text-muted-foreground">Set 2</span>
                <Input value={set2_team1} onChange={(e) => setSet2t1(e.target.value)} placeholder="Eq1" className="text-center" />
                <Input value={set2_team2} onChange={(e) => setSet2t2(e.target.value)} placeholder="Eq2" className="text-center" />
              </div>
              <div className="grid grid-cols-3 gap-3 items-center">
                <span className="text-xs font-medium text-muted-foreground">Set 3 (opcional)</span>
                <Input value={set3_team1} onChange={(e) => setSet3t1(e.target.value)} placeholder="Eq1" className="text-center" />
                <Input value={set3_team2} onChange={(e) => setSet3t2(e.target.value)} placeholder="Eq2" className="text-center" />
              </div>

              {(() => {
                const c = calcSets()
                if (c.winner_team_number) {
                  return (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm rounded-lg px-3 py-2 text-center">
                      {c.sets_won_team1}-{c.sets_won_team2} — Ganó {c.winner_team_number === match.team1_number
                        ? (match.team1_name || `Equipo ${match.team1_number}`)
                        : (match.team2_name || `Equipo ${match.team2_number}`)}
                    </div>
                  )
                }
                return null
              })()}
            </>
          )}

          {status === 'walkover' && (
            <p className="text-sm text-muted-foreground">Se registrará como walkover (W/O). El equipo contrario obtiene la victoria.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
