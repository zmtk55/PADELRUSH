import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Plus, Pencil, Trash2, ListChecks, AlertCircle,
  ChevronRight, Users, Trophy, Search, Swords,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTeams } from '@/hooks/useTeams'
import { useLeagues } from '@/hooks/useLeagues'
import { useParticipants } from '@/hooks/useParticipants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PlayerPickerPanel } from '@/components/leagues/PlayerPickerPanel'

const emptyTeam = { player1_id: '', player2_id: '', category: '', team_number: 1, team_name: '' }

export default function Admin() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leagueQuery } = useLeagues()
  const { data: league } = leagueQuery(leagueId)
  const { teamsQuery, createTeamsBatch, updateTeam, deleteTeam } = useTeams(leagueId)
  const { participantsQuery } = useParticipants()
  const teams = teamsQuery.data || []
  const participants = participantsQuery.data || []
  const categories = league?.categories || []

  const [category, setCategory] = useState(categories[0] || '')
  const [section, setSection] = useState('equipos')
  const [editTeam, setEditTeam] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(emptyTeam)
  const [searchP1, setSearchP1] = useState('')
  const [searchP2, setSearchP2] = useState('')
  const [showPlayerPicker, setShowPlayerPicker] = useState(false)

  const filtered = teams.filter(t => t.category === category)
  const isLoading = teamsQuery.isLoading || participantsQuery.isLoading

  const getAssignedPlayerIds = () => {
    const assigned = new Set()
    teams.forEach(t => {
      if (editTeam && t.id === editTeam.id) return
      if (t.player1_id) assigned.add(t.player1_id)
      if (t.player2_id) assigned.add(t.player2_id)
    })
    return assigned
  }

  const availableParticipants = (excludeId = '') => {
    const assigned = getAssignedPlayerIds()
    return participants.filter(p =>
      !assigned.has(p.id) || p.id === form.player1_id || p.id === form.player2_id || p.id === excludeId
    )
  }

  const openNew = () => {
    setEditTeam(null)
    setForm({ ...emptyTeam, category })
    setSearchP1('')
    setSearchP2('')
    setShowPlayerPicker(true)
  }

  const openEdit = (team) => {
    setEditTeam(team)
    setForm({
      player1_id: team.player1_id || '',
      player2_id: team.player2_id || '',
      category: team.category,
      team_number: team.team_number,
      team_name: team.team_name || '',
    })
    setSearchP1('')
    setSearchP2('')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.player1_id || !form.player2_id) {
      toast.error('Selecciona ambos jugadores')
      return
    }
    if (form.player1_id === form.player2_id) {
      toast.error('Los jugadores deben ser diferentes')
      return
    }
    if (!form.category) {
      toast.error('Selecciona una categoría')
      return
    }

    const payload = {
      ...form,
      league_id: leagueId,
      team_name: form.team_name || `Equipo ${form.team_number}`,
    }

    try {
      if (editTeam) {
        await updateTeam.mutateAsync({ id: editTeam.id, ...payload })
        toast.success('Equipo actualizado')
      } else {
        await createTeamsBatch.mutateAsync(payload)
        toast.success('Equipo creado')
      }
      setDialogOpen(false)
      teamsQuery.refetch()
    } catch {
      toast.error('Error al guardar el equipo')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteTeam.mutateAsync(deleteTarget.id)
      toast.success(`${deleteTarget.team_name || `Equipo ${deleteTarget.team_number}`} eliminado`)
      setDeleteTarget(null)
      teamsQuery.refetch()
    } catch {
      toast.error('Error al eliminar el equipo')
    }
  }

  const getPlayerName = (id) => participants.find(p => p.id === id)?.name || '\u2014'

  if (!league) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-muted w-48" />
        <div className="h-10 bg-muted w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-card border border-border" />
          ))}
        </div>
      </div>
    )
  }

  if (!isOrganizer) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Breadcrumb league={league} leagueId={leagueId} navigate={navigate} />
        <div className="border border-border bg-card p-8 flex items-center gap-5">
          <div className="w-12 h-12 border border-border flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold mb-1">Acceso restringido</p>
            <p className="text-sm text-muted-foreground">Solo los organizadores pueden administrar la liga.</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Breadcrumb league={league} leagueId={leagueId} navigate={navigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">{league.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {teams.length} equipos · {categories.length} categorías
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-bold">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{teams.length}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-bold">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{participants.length}</span>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { key: 'equipos', label: 'Equipos', icon: Shield },
          { key: 'resultados', label: 'Resultados', icon: ListChecks },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              section === key
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-border'
            )}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {section === 'equipos' && (
        <>
          {/* Category tabs */}
          <div className="flex gap-1 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'px-3 py-2 text-xs font-medium transition-colors border',
                  category === cat
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:border-foreground'
                )}
              >
                <span>{cat}</span>
                <span className={cn(
                  'ml-2 px-1 py-0.5 text-[10px]',
                  category === cat ? 'bg-card/20 text-white' : 'bg-muted text-muted-foreground'
                )}>
                  {teams.filter(t => t.category === cat).length}
                </span>
              </button>
            ))}
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-card border border-border p-5 animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted w-24" />
                      <div className="h-3 bg-muted w-16" />
                    </div>
                  </div>
                  <div className="h-8 bg-muted" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-card border border-dashed border-border"
            >
              <div className="w-16 h-16 border border-border flex items-center justify-center mx-auto mb-4">
                <Swords className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-heading font-bold mb-2 tracking-tight">
                {participants.length === 0 ? 'Necesitas jugadores' : `No hay equipos en ${category}`}
              </p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                {participants.length === 0
                  ? 'Registra al menos dos participantes para crear un equipo'
                  : 'Crea el primer equipo asignando dos jugadores'
                }
              </p>
              {participants.length === 0 ? (
                <Button onClick={() => navigate('/participantes')}>
                  <Users className="w-4 h-4" />
                  Registrar jugadores
                </Button>
              ) : (
                <Button onClick={openNew}>
                  <Plus className="w-4 h-4" />
                  Crear primer equipo
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              <Button onClick={openNew} disabled={participants.length < 2} size="sm">
                <Plus className="w-3.5 h-3.5" />
                Nuevo equipo {category}
              </Button>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {[...filtered]
                    .sort((a, b) => a.team_number - b.team_number)
                    .map((team, i) => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        index={i}
                        getPlayerName={getPlayerName}
                        onEdit={() => openEdit(team)}
                        onDelete={() => setDeleteTarget(team)}
                      />
                    ))
                  }
                </AnimatePresence>
              </div>
            </>
          )}
        </>
      )}

      {section === 'resultados' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-8 text-center">
          <div className="w-16 h-16 border border-border flex items-center justify-center mx-auto mb-4">
            <ListChecks className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-bold mb-2">Registro de resultados</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Usa la sección <strong>Partidos</strong> en el menú lateral para gestionar resultados.
          </p>
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-xl">
              <div className="w-8 h-8 bg-foreground text-background flex items-center justify-center text-sm">
                {editTeam ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              {editTeam ? `Editar ${editTeam.team_name || `Equipo ${editTeam.team_number}`}` : `Nuevo equipo ${category}`}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editTeam ? 'Modifica los jugadores o el nombre del equipo' : 'Asigna dos jugadores para formar una pareja'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nombre del equipo <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <div className="relative mt-1.5">
                <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={form.team_name}
                  onChange={(e) => setForm({ ...form, team_name: e.target.value })}
                  placeholder={`Ej: ${category} - Pareja 1`}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Player 1 */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Jugador 1 <span className="text-red-500">*</span></Label>
              <div className="mt-1.5 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input value={searchP1} onChange={(e) => setSearchP1(e.target.value)} placeholder="Buscar jugador..." className="pl-9" />
                </div>
                <PlayerSelectGrid
                  players={availableParticipants(form.player1_id).filter(p =>
                    !searchP1 || p.name.toLowerCase().includes(searchP1.toLowerCase())
                  )}
                  selectedId={form.player1_id}
                  player2Id={form.player2_id}
                  onSelect={(id) => setForm({ ...form, player1_id: id })}
                  hasAnyParticipants={participants.length > 0}
                />
              </div>
            </div>

            {/* Player 2 */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Jugador 2 <span className="text-red-500">*</span></Label>
              <div className="mt-1.5 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input value={searchP2} onChange={(e) => setSearchP2(e.target.value)} placeholder="Buscar jugador..." className="pl-9" />
                </div>
                <PlayerSelectGrid
                  players={availableParticipants(form.player2_id).filter(p =>
                    !searchP2 || p.name.toLowerCase().includes(searchP2.toLowerCase())
                  )}
                  selectedId={form.player2_id}
                  player2Id={form.player1_id}
                  onSelect={(id) => setForm({ ...form, player2_id: id })}
                  hasAnyParticipants={participants.length > 0}
                />
              </div>
            </div>

            {/* Category & Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Categoría</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">No. de equipo</Label>
                <Input type="number" min={1} value={form.team_number}
                  onChange={(e) => setForm({ ...form, team_number: Math.max(1, +e.target.value) })}
                  className="mt-1.5" />
              </div>
            </div>

            {/* Preview */}
            {(form.player1_id || form.player2_id) && (
              <div className="bg-muted p-4 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-3">Vista previa del equipo</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={cn('w-12 h-12 flex items-center justify-center font-bold text-sm', form.player1_id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground')}>
                      {form.player1_id ? getPlayerName(form.player1_id).charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="text-xs text-muted-foreground max-w-[80px] truncate text-center font-medium">
                      {form.player1_id ? getPlayerName(form.player1_id).split(' ')[0] : 'VACÍO'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-muted-foreground">VS</span>
                    <div className="w-8 h-px bg-border" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={cn('w-12 h-12 flex items-center justify-center font-bold text-sm', form.player2_id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground')}>
                      {form.player2_id ? getPlayerName(form.player2_id).charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="text-xs text-muted-foreground max-w-[80px] truncate text-center font-medium">
                      {form.player2_id ? getPlayerName(form.player2_id).split(' ')[0] : 'VACÍO'}
                    </span>
                  </div>
                </div>
                {form.team_name && (
                  <p className="text-center text-xs font-medium text-muted-foreground mt-3">"{form.team_name}"</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setDialogOpen(false)} size="sm">Cancelar</Button>
              <Button onClick={handleSave} size="sm">
                {editTeam ? <><Pencil className="w-3.5 h-3.5" /> Actualizar</> : <><Plus className="w-3.5 h-3.5" /> Crear equipo</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-red-200 bg-red-50 text-red-500 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg">Eliminar equipo</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  ¿Estás seguro de eliminar <strong>{deleteTarget?.team_name || `Equipo ${deleteTarget?.team_number}`}</strong>?
                  Esta acción no se puede deshacer.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} size="sm">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} size="sm">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PlayerPickerPanel Modal */}
      <Dialog open={showPlayerPicker} onOpenChange={(o) => !o && setShowPlayerPicker(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Equipos</DialogTitle>
            <DialogDescription>Arrastra y organiza los equipos por grupo</DialogDescription>
          </DialogHeader>
          <PlayerPickerPanel
            teams={teams}
            onTeamsChange={(updated) => {
              const teamsToInsert = updated.filter(t => !t.id).map(t => ({
                league_id: leagueId,
                category: t.category,
                team_name: t.team_name,
                team_number: t.team_number,
                player1_id: t.player1_id,
                player2_id: t.player2_id,
              }))
              if (teamsToInsert.length > 0) {
                createTeamsBatch.mutateAsync(teamsToInsert).then(() => {
                  teamsQuery.refetch()
                  setShowPlayerPicker(false)
                  toast.success(`${teamsToInsert.length} equipos creados`)
                }).catch(err => {
                  toast.error('Error: ' + err.message)
                })
              } else {
                setShowPlayerPicker(false)
              }
            }}
            participants={participants}
            categories={categories}
            mode="full"
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

function Breadcrumb({ league, leagueId, navigate }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <button onClick={() => navigate('/ligas')} className="hover:text-foreground transition-colors">Ligas</button>
      <ChevronRight className="w-3 h-3" />
      <button onClick={() => navigate(`/ligas/${leagueId}`)} className="hover:text-foreground transition-colors">{league.name}</button>
      <ChevronRight className="w-3 h-3" />
      <span className="text-foreground font-bold">Admin</span>
    </div>
  )
}

function TeamCard({ team, index, getPlayerName, onEdit, onDelete }) {
  const p1Name = getPlayerName(team.player1_id)
  const p2Name = getPlayerName(team.player2_id)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-card border border-border p-4 hover:border-border transition-colors group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">#</span>
          <span className="text-lg font-bold">{team.team_number}</span>
          <span className="text-xs text-muted-foreground ml-1">{team.category}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="w-7 h-7 bg-muted hover:bg-muted flex items-center justify-center transition-colors" title="Editar">
            <Pencil className="w-3 h-3" />
          </button>
          <button onClick={onDelete} className="w-7 h-7 bg-muted hover:bg-red-100 text-muted-foreground hover:text-red-600 flex items-center justify-center transition-colors" title="Eliminar">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Player 1 */}
      <div className="flex items-center gap-3 py-2">
        <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center font-bold text-sm shrink-0">
          {p1Name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{p1Name}</p>
          <p className="text-xs text-muted-foreground">Jugador 1</p>
        </div>
      </div>

      {/* VS divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-bold text-muted-foreground">VS</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Player 2 */}
      <div className="flex items-center gap-3 py-2">
        <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center font-bold text-sm shrink-0">
          {p2Name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{p2Name}</p>
          <p className="text-xs text-muted-foreground">Jugador 2</p>
        </div>
      </div>

      {team.team_name && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground truncate text-center">{team.team_name}</p>
        </div>
      )}
    </motion.div>
  )
}

function PlayerSelectGrid({ players, selectedId, player2Id, onSelect, hasAnyParticipants }) {
  if (!hasAnyParticipants) {
    return (
      <div className="text-center py-8 bg-muted border border-dashed border-border space-y-3">
        <Users className="w-8 h-8 text-muted-foreground mx-auto" />
        <div>
          <p className="text-xs font-medium text-muted-foreground">No hay jugadores</p>
          <p className="text-xs text-muted-foreground mt-1">Primero debes crear participantes</p>
        </div>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-6 bg-muted border border-dashed border-border">
        <p className="text-xs text-muted-foreground">Todos los jugadores ya están asignados</p>
      </div>
    )
  }

  return (
    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
      {players.map(p => {
        const isSelected = p.id === selectedId
        const isP2 = p.id === player2Id
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border',
              isSelected
                ? 'bg-muted border-border'
                : isP2
                  ? 'bg-transparent border-transparent cursor-not-allowed opacity-50'
                  : 'bg-transparent border-transparent hover:bg-muted hover:border-border'
            )}
            disabled={isP2}
          >
            <div className={cn('w-8 h-8 flex items-center justify-center font-bold text-xs shrink-0', isSelected ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground')}>
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.level} · {p.gender}</p>
            </div>
            <div className={cn('w-4 h-4 border shrink-0', isSelected ? 'bg-foreground border-foreground' : 'border-border')}>
              {isSelected && (
                <svg viewBox="0 0 16 16" className="w-full h-full text-background p-0.5">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" fill="currentColor" />
                </svg>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
