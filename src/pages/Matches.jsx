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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ArrowLeft, Edit, Calendar, LayoutGrid, List } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/animations'
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

  const [deleteConfirm, setDeleteConfirm] = useState(null)
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
    try { await deleteMatch.mutateAsync(id) } catch(e) { toast.error('Error al eliminar: ' + (e.message || 'desconocido')) }
    setDeleteConfirm(null)
  }

  const handleGenerateBracket = async (bracketMatches) => {
    try {
      await createMatchesBatch.mutateAsync(bracketMatches)
      matchesQuery.refetch()
    } catch(e) { toast.error('Error al generar: ' + (e.message || 'desconocido')) }
  }

  const filterTabs = [
    { key: 'all', label: 'Todos' },
    { key: 'programado', label: 'Programados' },
    { key: 'jugado', label: 'Jugados' },
  ]

  if (matchesQuery.isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-5 bg-muted w-48 mb-2" />
              <div className="h-3 bg-muted w-32" />
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Button variant="ghost" onClick={() => navigate(`/ligas/${leagueId}`)} className="mb-4 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Volver a liga
      </Button>

      <PageHeader
        title="Partidos"
        description={`${matches.length} partidos`}
        action={
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            {isRRExpress && (
              <div className="flex border border-border-subtle mr-1">
                <button
                  onClick={() => setView('list')}
                  className={cn('p-1.5', view === 'list' ? 'bg-muted' : 'hover:bg-muted')}
                  title="Vista de lista"
                >
                  <List className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setView('roundrobin')}
                  className={cn('p-1.5', view === 'roundrobin' ? 'bg-muted' : 'hover:bg-muted')}
                  title="Vista Round Robin"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            )}
            <div className="flex border border-border-subtle">
              {filterTabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium transition-colors',
                    filter === key ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                <ScheduleBuilder leagueId={leagueId} teams={teams} onComplete={() => setShowScheduler(false)} onCancel={() => setShowScheduler(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {Object.keys(grouped).length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 card card-accent-left">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-heading font-bold mb-2">No hay partidos registrados</p>
              <p className="text-sm text-muted-foreground mb-4">
                {filter !== 'all' ? 'No hay partidos con ese estado' : 'Genera el calendario para empezar'}
              </p>
              {isOrganizer && <Button onClick={() => setShowScheduler(true)}>Generar calendario</Button>}
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              {Object.entries(grouped).map(([category, catMatches]) => (
                <motion.div key={category} variants={staggerItem} className="mb-8">
                  <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-2">
                    <h3 className="font-heading font-bold text-lg tracking-tight flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0">{category.charAt(0)}</span>
                      {category}
                    </h3>
                    <span className="text-sm text-muted-foreground">{catMatches.length} partidos</span>
                  </div>
                  <div className="space-y-3">
                    {catMatches.map((match, i) => (
                      <MatchCard key={match.id} match={match} isOrganizer={isOrganizer}
                        onEdit={setEditingMatch} onDelete={() => setDeleteConfirm(match.id)} index={i} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}

      <Dialog open={!!deleteConfirm} onOpenChange={o => !o && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-lg">Confirmar eliminación</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">¿Estás seguro de eliminar este partido? Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button size="sm" onClick={() => handleDeleteMatch(deleteConfirm)}>Eliminar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {editingMatch && (
        <ScoreEditor match={editingMatch} open={!!editingMatch}
          onClose={() => setEditingMatch(null)}
          onSave={async (values) => {
            try { await updateMatch.mutateAsync({ id: editingMatch.id, ...values }) } catch(e) { toast.error('Error al guardar: ' + (e.message || 'desconocido')) }
            setEditingMatch(null)
          }} />
      )}
    </motion.div>
  )
}

function MatchCard({ match, isOrganizer, onEdit, onDelete, index = 0 }) {
  const setsDetail = [
    match.set1_team1 != null && `${match.set1_team1}-${match.set1_team2}`,
    match.set2_team1 != null && `${match.set2_team1}-${match.set2_team2}`,
    match.set3_team1 != null && `${match.set3_team1}-${match.set3_team2}`,
  ].filter(Boolean)

  const t1Won = match.status === 'jugado' && match.sets_won_team1 > match.sets_won_team2
  const t2Won = match.status === 'jugado' && match.sets_won_team2 > match.sets_won_team1

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="card card-accent-left p-4 hover:shadow-court-glow hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className={cn('font-semibold truncate', t1Won && 'text-foreground')}>
              {match.team1_name || `Equipo ${match.team1_number}`}
            </span>
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">vs</span>
            <span className={cn('font-semibold truncate', t2Won && 'text-foreground')}>
              {match.team2_name || `Equipo ${match.team2_number}`}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
            {match.round && <span className="text-xs text-muted-foreground">Ronda {match.round}</span>}
            {match.court && <span className="text-xs text-muted-foreground">· {match.court}</span>}
            {match.scheduled_date && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                · {match.scheduled_date}{match.scheduled_time ? ` ${match.scheduled_time}` : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {match.status === 'jugado' ? (
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className={cn('text-xl font-bold font-mono tabular-nums', t1Won ? 'text-foreground' : 'text-muted-foreground')}>
                  {match.sets_won_team1}
                </span>
                <span className="text-muted-foreground font-bold">-</span>
                <span className={cn('text-xl font-bold font-mono tabular-nums', t2Won ? 'text-foreground' : 'text-muted-foreground')}>
                  {match.sets_won_team2}
                </span>
              </div>
              {setsDetail.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">{setsDetail.join(', ')}</p>
              )}
            </div>
          ) : match.status === 'walkover' ? (
            <Badge variant="outline" className="text-xs border-destructive text-destructive">W/O</Badge>
          ) : match.status === 'cancelado' ? (
            <Badge variant="outline" className="text-xs border-destructive text-destructive">Cancelado</Badge>
          ) : (
            <span className="text-xs text-muted-foreground border border-border-subtle px-2 py-1">
              {match.scheduled_date || 'Programado'}
            </span>
          )}

          {isOrganizer && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onEdit(match)}>
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={onDelete}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c0 1 2 1 2 2v2"/></svg>
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
          <DialogTitle className="font-heading text-lg">Registrar resultado</DialogTitle>
          <DialogDescription>{match.team1_name || `Eq. ${match.team1_number}`} vs {match.team2_name || `Eq. ${match.team2_number}`}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Estado</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jugado">Jugado (con resultado)</SelectItem>
                <SelectItem value="walkover">Walkover (W/O)</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
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
              {(() => { const c = calcSets(); if (!c.winner_team_number) return null
                return (
                  <div className="bg-muted border border-border-subtle text-muted-foreground text-sm px-3 py-2 text-center">
                    {c.sets_won_team1}-{c.sets_won_team2} — Ganó {c.winner_team_number === match.team1_number ? (match.team1_name || `Equipo ${match.team1_number}`) : (match.team2_name || `Equipo ${match.team2_number}`)}
                  </div>
                )
              })()}
            </>
          )}
          {status === 'walkover' && <p className="text-sm text-muted-foreground">Se registrará como walkover (W/O). El equipo contrario obtiene la victoria.</p>}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
