import { useParams, useNavigate } from 'react-router-dom'
import { useMatches } from '@/hooks/useMatches'
import { useTeams } from '@/hooks/useTeams'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Edit, Calendar, LayoutGrid, List } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScheduleBuilder } from '@/components/leagues/ScheduleBuilder'
import RoundRobinExpress from '@/components/roundrobin/RoundRobinExpress'
import { cn } from '@/lib/utils'

export default function Matches() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { matchesQuery, updateMatch, deleteMatch, createMatchesBatch } = useMatches(leagueId)
  const { teamsQuery } = useTeams(leagueId)
  const { leagueQuery } = useLeagues()
  const { data: league } = leagueQuery(leagueId)

  const [editingMatch, setEditingMatch] = useState(null)
  const [showScheduler, setShowScheduler] = useState(false)
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('list')

  const matches = matchesQuery.data || []
  const teams = teamsQuery.data || []
  const isRRExpress = league?.category_formats &&
    Object.values(league.category_formats).some(v => v === 'round-robin-express')

  const filtered = filter === 'all' ? matches : matches.filter(m => m.status === filter)

  const grouped = filtered.reduce((acc, m) => {
    const cat = m.category || 'Sin categoría'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(m)
    return acc
  }, {})

  const handleDeleteMatch = async (id) => {
    if (!confirm('¿Eliminar este partido?')) return
    try { await deleteMatch.mutateAsync(id) } catch { /* demo fallback */ }
  }

  const handleGenerateBracket = async (bracketMatches) => {
    try {
      await createMatchesBatch.mutateAsync(bracketMatches)
      matchesQuery.refetch()
    } catch { /* demo fallback */ }
  }

  const filterTabs = [
    { key: 'all', label: 'Todos' },
    { key: 'programado', label: 'Pendientes' },
    { key: 'jugado', label: 'Completados' },
  ]

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate(`/ligas/${leagueId}`)} className="mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a liga
      </Button>

      <PageHeader
        title="Partidos"
        description={`${matches.length} partidos`}
        action={
          <div className="flex items-center gap-2">
            {isRRExpress && (
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setView('list')}
                  className={cn(
                    'p-2 transition-colors',
                    view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  )}
                  title="Vista de lista"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('roundrobin')}
                  className={cn(
                    'p-2 transition-colors',
                    view === 'roundrobin' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  )}
                  title="Vista Round Robin"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex border border-border rounded-lg overflow-hidden">
              {filterTabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold transition-all',
                    filter === key
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {isOrganizer && view === 'list' && (
              <Button variant="outline" size="sm" onClick={() => setShowScheduler(!showScheduler)}>
                {showScheduler ? 'Cancelar' : 'Generar horarios'}
              </Button>
            )}
          </div>
        }
      />

      {/* Round Robin Express View */}
      {view === 'roundrobin' && isRRExpress ? (
        <RoundRobinExpress
          matches={matches}
          teams={teams}
          leagueId={leagueId}
          isOrganizer={isOrganizer}
          onGenerateBracket={handleGenerateBracket}
          onEditMatch={setEditingMatch}
        />
      ) : (
        <>
          <AnimatePresence>
            {showScheduler && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <ScheduleBuilder
                  leagueId={leagueId}
                  teams={teams}
                  onComplete={() => setShowScheduler(false)}
                  onCancel={() => setShowScheduler(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {Object.keys(grouped).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-card border border-border rounded-xl"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold mb-2">
                {filter !== 'all' ? 'No hay partidos con ese estado' : 'No hay partidos registrados'}
              </p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                {filter !== 'all'
                  ? 'Intenta con otro filtro para ver más resultados'
                  : 'Genera el calendario para empezar a jugar'}
              </p>
              {isOrganizer && (
                <Button onClick={() => setShowScheduler(true)}>
                  Generar calendario
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {Object.entries(grouped).map(([category, catMatches]) => (
                <div key={category} className="mb-8">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                    <h3 className="font-bold text-lg tracking-tight">{category}</h3>
                    <span className="text-sm text-muted-foreground">{catMatches.length} partidos</span>
                  </div>
                  <div className="space-y-3">
                    {catMatches.map((match, i) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        isOrganizer={isOrganizer}
                        onEdit={setEditingMatch}
                        onDelete={() => handleDeleteMatch(match.id)}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </>
      )}

      {editingMatch && (
        <ScoreEditor
          match={editingMatch}
          open={!!editingMatch}
          onClose={() => setEditingMatch(null)}
          onSave={async (values) => {
            try { await updateMatch.mutateAsync({ id: editingMatch.id, ...values }) } catch { /* demo fallback */ }
            setEditingMatch(null)
          }}
        />
      )}
    </div>
  )
}

function MatchCard({ match, isOrganizer, onEdit, onDelete, index = 0 }) {
  const setsDetail = [
    match.set1_team1 != null && match.set1_team1 + '-' + match.set1_team2,
    match.set2_team1 != null && match.set2_team1 + '-' + match.set2_team2,
    match.set3_team1 != null && match.set3_team1 + '-' + match.set3_team2,
  ].filter(Boolean)

  const t1Won = match.status === 'jugado' && match.sets_won_team1 > match.sets_won_team2
  const t2Won = match.status === 'jugado' && match.sets_won_team2 > match.sets_won_team1

  const formatDate = (dateStr, timeStr) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      const formatted = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
      return timeStr ? `${formatted} • ${timeStr}` : formatted
    } catch { return dateStr }
  }

  const statusConfig = {
    jugado: { label: 'Completado', variant: 'success' },
    walkover: { label: 'W/O', variant: 'destructive' },
    cancelado: { label: 'Cancelado', variant: 'destructive' },
    programado: { label: 'Pendiente', variant: 'warning' },
  }

  const status = statusConfig[match.status] || statusConfig.programado

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card border border-border rounded-xl hover:shadow-card transition-all duration-200"
    >
      <div className="p-4">
        {/* League + Status header */}
        <div className="flex items-center justify-between mb-3">
          {match.category && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {match.category}
            </span>
          )}
          <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
        </div>

        {/* Teams VS layout */}
        <div className="flex items-center gap-3">
          {/* Team A */}
          <div className={cn(
            "flex-1 rounded-lg px-3 py-2.5 min-w-0",
            "bg-muted/50",
            t1Won && "ring-1 ring-success/30"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                t1Won ? "bg-success/20 text-success" : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {(match.team1_name || "E" + String(match.team1_number || 1)).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className={cn(
                  "text-sm font-bold truncate",
                  t1Won ? "text-foreground" : "text-muted-foreground"
                )}>
                  {match.team1_name || `Equipo ${match.team1_number || 1}`}
                </p>
                <p className="text-[10px] text-muted-foreground/60">Sets: {match.sets_won_team1 ?? 0}</p>
              </div>
            </div>
          </div>

          {/* VS / Score */}
          <div className="flex flex-col items-center shrink-0">
            {match.status === 'jugado' ? (
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "text-xl font-bold tabular-nums",
                  t1Won ? "text-foreground" : "text-muted-foreground"
                )}>{match.sets_won_team1}</span>
                <span className="text-muted-foreground/40 font-bold">-</span>
                <span className={cn(
                  "text-xl font-bold tabular-nums",
                  t2Won ? "text-foreground" : "text-muted-foreground"
                )}>{match.sets_won_team2}</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-muted-foreground/50 tracking-widest">VS</span>
            )}
          </div>

          {/* Team B */}
          <div className={cn(
            "flex-1 rounded-lg px-3 py-2.5 min-w-0 text-right",
            "bg-muted/50",
            t2Won && "ring-1 ring-success/30"
          )}>
            <div className="flex items-center gap-2 justify-end">
              <div className="min-w-0">
                <p className={cn(
                  "text-sm font-bold truncate",
                  t2Won ? "text-foreground" : "text-muted-foreground"
                )}>
                  {match.team2_name || `Equipo ${match.team2_number || 2}`}
                </p>
                <p className="text-[10px] text-muted-foreground/60">Sets: {match.sets_won_team2 ?? 0}</p>
              </div>
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                t2Won ? "bg-success/20 text-success" : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {(match.team2_name || "E" + String(match.team2_number || 2)).charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Sets detail */}
        {match.status === 'jugado' && setsDetail.length > 0 && (
          <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">{setsDetail.join(" • ")}</p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-muted-foreground">
          {match.round && (
            <span className="font-medium bg-muted/50 px-2 py-0.5 rounded-md">Ronda {match.round}</span>
          )}
          {match.court && <span>Cancha {match.court}</span>}
          {match.scheduled_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(match.scheduled_date, match.scheduled_time)}
            </span>
          )}
        </div>

        {/* Organizer actions */}
        {isOrganizer && (
          <div className="flex gap-1 mt-3 pt-3 border-t border-border/40 justify-end">
            <button
              className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              onClick={() => onEdit(match)}
              title="Editar resultado"
            >
              <Edit className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors text-destructive"
              onClick={onDelete}
              title="Eliminar partido"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ScoreEditor({ match, open, onClose, onSave }) {
  const [status, setStatus] = useState('jugado')
  const [s1t1, setS1t1] = useState(match.set1_team1 ?? '')
  const [s1t2, setS1t2] = useState(match.set1_team2 ?? '')
  const [s2t1, setS2t1] = useState(match.set2_team1 ?? '')
  const [s2t2, setS2t2] = useState(match.set2_team2 ?? '')
  const [s3t1, setS3t1] = useState(match.set3_team1 ?? '')
  const [s3t2, setS3t2] = useState(match.set3_team2 ?? '')

  const calcSets = () => {
    let sw1 = 0, sw2 = 0
    const sets = [
      [parseInt(s1t1) || 0, parseInt(s1t2) || 0],
      [parseInt(s2t1) || 0, parseInt(s2t2) || 0],
    ]
    if (s3t1 !== '' || s3t2 !== '') sets.push([parseInt(s3t1) || 0, parseInt(s3t2) || 0])
    sets.forEach(([a, b]) => { if (a > b) sw1++; else if (b > a) sw2++ })
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
      set1_team1: parseInt(s1t1) || 0, set1_team2: parseInt(s1t2) || 0,
      set2_team1: parseInt(s2t1) || 0, set2_team2: parseInt(s2t2) || 0,
      set3_team1: s3t1 !== '' ? parseInt(s3t1) : null,
      set3_team2: s3t2 !== '' ? parseInt(s3t2) : null,
    }
    onSave({ ...parsed, ...calcSets(), played_date: new Date().toISOString().split('T')[0] })
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Registrar resultado</DialogTitle>
          <DialogDescription>
            {match.team1_name || `Eq. ${match.team1_number}`} vs {match.team2_name || `Eq. ${match.team2_number}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Estado</Label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="jugado">Jugado (con resultado)</option>
              <option value="walkover">Walkover (W/O)</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          {status === 'jugado' && (
            <>
              <div className="grid grid-cols-3 gap-3 items-center">
                <span className="text-xs font-medium text-muted-foreground">Set 1</span>
                <Input value={s1t1} onChange={e => setS1t1(e.target.value)} placeholder="Eq1" className="text-center" />
                <Input value={s1t2} onChange={e => setS1t2(e.target.value)} placeholder="Eq2" className="text-center" />
              </div>
              <div className="grid grid-cols-3 gap-3 items-center">
                <span className="text-xs font-medium text-muted-foreground">Set 2</span>
                <Input value={s2t1} onChange={e => setS2t1(e.target.value)} placeholder="Eq1" className="text-center" />
                <Input value={s2t2} onChange={e => setS2t2(e.target.value)} placeholder="Eq2" className="text-center" />
              </div>
              <div className="grid grid-cols-3 gap-3 items-center">
                <span className="text-xs font-medium text-muted-foreground">Set 3 (opcional)</span>
                <Input value={s3t1} onChange={e => setS3t1(e.target.value)} placeholder="Eq1" className="text-center" />
                <Input value={s3t2} onChange={e => setS3t2(e.target.value)} placeholder="Eq2" className="text-center" />
              </div>
              {(() => {
                const c = calcSets()
                if (!c.winner_team_number) return null
                return (
                  <div className="bg-muted border border-border text-muted-foreground text-sm px-3 py-2 rounded-lg text-center">
                    {c.sets_won_team1}-{c.sets_won_team2} — Ganó{' '}
                    {c.winner_team_number === match.team1_number
                      ? (match.team1_name || `Equipo ${match.team1_number}`)
                      : (match.team2_name || `Equipo ${match.team2_number}`)}
                  </div>
                )
              })()}
            </>
          )}
          {status === 'walkover' && (
            <p className="text-sm text-muted-foreground">
              Se registrará como walkover (W/O). El equipo contrario obtiene la victoria.
            </p>
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
