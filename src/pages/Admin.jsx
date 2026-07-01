import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Plus, Pencil, Trash2, AlertCircle, ChevronRight, Users, Trophy,
  Search, Swords, Settings, LayoutGrid, List, Calendar, UserPlus,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTeams } from '@/hooks/useTeams'
import { useLeagues } from '@/hooks/useLeagues'
import { useParticipants } from '@/hooks/useParticipants'
import { useMatches } from '@/hooks/useMatches'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PlayerPickerPanel } from '@/components/leagues/PlayerPickerPanel'

const emptyTeam = { player1_id: '', player2_id: '', category: '', team_number: 1, team_name: '' }

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

export default function Admin() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leagueQuery } = useLeagues()
  const { data: league } = leagueQuery(leagueId)
  const { teamsQuery, createTeamsBatch, updateTeam, deleteTeam } = useTeams(leagueId)
  const { participantsQuery, createParticipant, updateParticipant, deleteParticipant } = useParticipants()
  const { matchesQuery } = useMatches(leagueId)
  const teams = teamsQuery.data || []
  const participants = participantsQuery.data || []
  const matches = matchesQuery.data || []
  const categories = league?.categories || []

  const [activeTab, setActiveTab] = useState('equipos')
  const [category, setCategory] = useState(categories[0] || '')
  const [editTeam, setEditTeam] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(emptyTeam)
  const [searchP1, setSearchP1] = useState('')
  const [searchP2, setSearchP2] = useState('')
  const [showPlayerPicker, setShowPlayerPicker] = useState(false)

  const [playerSearch, setPlayerSearch] = useState('')
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false)
  const [playerForm, setPlayerForm] = useState({ name: '', level: '', gender: '' })
  const [deletePlayerTarget, setDeletePlayerTarget] = useState(null)

  const filteredTeams = teams.filter(t => t.category === category)
  const isLoading = teamsQuery.isLoading || participantsQuery.isLoading || matchesQuery.isLoading

  const statCards = [
    { label: 'Jugadores', value: participants.length, icon: Users, color: 'text-blue-500' },
    { label: 'Equipos', value: teams.length, icon: Shield, color: 'text-orange-500' },
    { label: 'Partidos', value: matches.length, icon: Calendar, color: 'text-green-500' },
    { label: 'Categorías', value: categories.length, icon: Trophy, color: 'text-purple-500' },
  ]

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

  const getPlayerName = (id) => participants.find(p => p.id === id)?.name || '—'

  const openNewTeam = () => {
    setEditTeam(null)
    setForm({ ...emptyTeam, category })
    setSearchP1('')
    setSearchP2('')
    setDialogOpen(true)
  }

  const openEditTeam = (team) => {
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

  const handleSaveTeam = async () => {
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

  const handleDeleteTeam = async () => {
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

  const openNewPlayer = () => {
    setEditingPlayer(null)
    setPlayerForm({ name: '', level: '', gender: '' })
    setPlayerDialogOpen(true)
  }

  const openEditPlayer = (player) => {
    setEditingPlayer(player)
    setPlayerForm({ name: player.name || '', level: player.level || '', gender: player.gender || '' })
    setPlayerDialogOpen(true)
  }

  const handleSavePlayer = async () => {
    if (!playerForm.name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    try {
      if (editingPlayer) {
        await updateParticipant.mutateAsync({ id: editingPlayer.id, ...playerForm })
        toast.success('Jugador actualizado')
      } else {
        await createParticipant.mutateAsync({ ...playerForm, league_id: leagueId })
        toast.success('Jugador creado')
      }
      setPlayerDialogOpen(false)
      participantsQuery.refetch()
    } catch {
      toast.error('Error al guardar el jugador')
    }
  }

  const handleDeletePlayer = async () => {
    if (!deletePlayerTarget) return
    try {
      await deleteParticipant.mutateAsync(deletePlayerTarget.id)
      toast.success(`${deletePlayerTarget.name} eliminado`)
      setDeletePlayerTarget(null)
      participantsQuery.refetch()
    } catch {
      toast.error('Error al eliminar el jugador')
    }
  }

  const filteredPlayers = participants.filter(p =>
    !playerSearch || p.name?.toLowerCase().includes(playerSearch.toLowerCase())
  )

  if (!league) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!isOrganizer) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <motion.div {...fadeUp} className="space-y-6">
          <Breadcrumb league={league} leagueId={leagueId} navigate={navigate} />
          <Card className="p-8">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="font-bold mb-1">Acceso restringido</p>
                <p className="text-sm text-muted-foreground">Solo los organizadores pueden administrar la liga.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <motion.div {...fadeUp} className="space-y-6">
        <Breadcrumb league={league} leagueId={leagueId} navigate={navigate} />

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
            <p className="text-muted-foreground mt-1">Gestiona jugadores, equipos y configuración de la liga</p>
          </div>
          <Badge variant="outline" className="w-fit gap-1.5 px-3 py-1.5">
            <Shield className="w-3.5 h-3.5 text-orange-500" />
            <span className="font-semibold">{league.name}</span>
          </Badge>
        </div>

        <motion.div variants={stagger} initial="initial" animate="animate" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} variants={staggerItem}>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-muted', color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-none">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-xl h-12 p-1">
            <TabsTrigger value="jugadores" className="gap-2 rounded-lg px-5">
              <Users className="w-4 h-4" /> Jugadores
            </TabsTrigger>
            <TabsTrigger value="equipos" className="gap-2 rounded-lg px-5">
              <Shield className="w-4 h-4" /> Equipos
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2 rounded-lg px-5">
              <Settings className="w-4 h-4" /> Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jugadores" className="mt-4 space-y-4">
            <JugadoresSection
              players={filteredPlayers}
              isLoading={isLoading}
              playerSearch={playerSearch}
              setPlayerSearch={setPlayerSearch}
              onNew={openNewPlayer}
              onEdit={openEditPlayer}
              onDelete={setDeletePlayerTarget}
              navigate={navigate}
            />
          </TabsContent>

          <TabsContent value="equipos" className="mt-4 space-y-4">
            <EquiposSection
              teams={teams}
              filteredTeams={filteredTeams}
              categories={categories}
              category={category}
              setCategory={setCategory}
              participants={participants}
              isLoading={isLoading}
              getPlayerName={getPlayerName}
              onNew={openNewTeam}
              onEdit={openEditTeam}
              onDelete={setDeleteTarget}
              onOpenPlayerPicker={() => setShowPlayerPicker(true)}
            />
          </TabsContent>

          <TabsContent value="config" className="mt-4 space-y-4">
            <ConfigSection league={league} categories={categories} teamsCount={teams.length} playersCount={participants.length} />
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-xl">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">
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
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Jugador 1 <span className="text-destructive">*</span></Label>
              <div className="mt-1.5 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input value={searchP1} onChange={(e) => setSearchP1(e.target.value)} placeholder="Buscar jugador..." className="pl-9" />
                </div>
                <PlayerSelectGrid
                  players={availableParticipants(form.player1_id).filter(p =>
                    !searchP1 || p.name?.toLowerCase().includes(searchP1.toLowerCase())
                  )}
                  selectedId={form.player1_id}
                  player2Id={form.player2_id}
                  onSelect={(id) => setForm({ ...form, player1_id: id })}
                  hasAnyParticipants={participants.length > 0}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Jugador 2 <span className="text-destructive">*</span></Label>
              <div className="mt-1.5 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input value={searchP2} onChange={(e) => setSearchP2(e.target.value)} placeholder="Buscar jugador..." className="pl-9" />
                </div>
                <PlayerSelectGrid
                  players={availableParticipants(form.player2_id).filter(p =>
                    !searchP2 || p.name?.toLowerCase().includes(searchP2.toLowerCase())
                  )}
                  selectedId={form.player2_id}
                  player2Id={form.player1_id}
                  onSelect={(id) => setForm({ ...form, player2_id: id })}
                  hasAnyParticipants={participants.length > 0}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Categoría</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
            {(form.player1_id || form.player2_id) && (
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-3">Vista previa del equipo</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm', form.player1_id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
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
                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm', form.player2_id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
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
              <Button onClick={handleSaveTeam} size="sm">
                {editTeam ? <><Pencil className="w-3.5 h-3.5" /> Actualizar</> : <><Plus className="w-3.5 h-3.5" /> Crear equipo</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg">Eliminar equipo</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  ¿Estás seguro de eliminar <strong>{deleteTarget?.team_name || `Equipo ${deleteTarget?.team_number}`}</strong>? Esta acción no se puede deshacer.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} size="sm">Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteTeam} size="sm">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      <Dialog open={playerDialogOpen} onOpenChange={(o) => !o && setPlayerDialogOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                {editingPlayer ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </div>
              {editingPlayer ? 'Editar jugador' : 'Nuevo jugador'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editingPlayer ? 'Modifica los datos del jugador' : 'Registra un nuevo participante'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Nombre completo</Label>
              <Input
                value={playerForm.name}
                onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                placeholder="Ej: Juan Pérez"
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nivel</Label>
                <Select value={playerForm.level} onValueChange={v => setPlayerForm({ ...playerForm, level: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Principiante">Principiante</SelectItem>
                    <SelectItem value="Intermedio">Intermedio</SelectItem>
                    <SelectItem value="Avanzado">Avanzado</SelectItem>
                    <SelectItem value="Profesional">Profesional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Género</Label>
                <Select value={playerForm.gender} onValueChange={v => setPlayerForm({ ...playerForm, gender: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Mixto">Mixto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setPlayerDialogOpen(false)} size="sm">Cancelar</Button>
              <Button onClick={handleSavePlayer} size="sm">
                {editingPlayer ? <><Pencil className="w-3.5 h-3.5" /> Actualizar</> : <><Plus className="w-3.5 h-3.5" /> Crear</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletePlayerTarget} onOpenChange={(o) => !o && setDeletePlayerTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg">Eliminar jugador</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  ¿Estás seguro de eliminar a <strong>{deletePlayerTarget?.name}</strong>? Esta acción no se puede deshacer.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeletePlayerTarget(null)} size="sm">Cancelar</Button>
            <Button variant="destructive" onClick={handleDeletePlayer} size="sm">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
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

function JugadoresSection({ players, isLoading, playerSearch, setPlayerSearch, onNew, onEdit, onDelete, navigate }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-muted-foreground" />
          Jugadores
          <Badge variant="secondary" className="ml-1">{players.length}</Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 h-9 w-48"
            />
          </div>
          <Button size="sm" onClick={onNew}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Nuevo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold mb-1">No hay jugadores</p>
            <p className="text-sm text-muted-foreground mb-4">Registra al menos dos participantes para crear equipos</p>
            <Button size="sm" onClick={onNew}>
              <UserPlus className="w-4 h-4 mr-1.5" /> Registrar primer jugador
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead className="text-right w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {players.map((player, i) => (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {player.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-sm">{player.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{player.level || '—'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{player.gender || '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => onEdit(player)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Editar">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => onDelete(player)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Eliminar">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EquiposSection({ teams, filteredTeams, categories, category, setCategory, participants, isLoading, getPlayerName, onNew, onEdit, onDelete, onOpenPlayerPicker }) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-3 py-2 text-xs font-medium transition-all rounded-lg border',
                category === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              )}
            >
              <span>{cat}</span>
              <span className={cn(
                'ml-2 px-1.5 py-0.5 text-[10px] rounded-full font-bold',
                category === cat ? 'bg-primary-foreground/20' : 'bg-muted text-muted-foreground'
              )}>
                {teams.filter(t => t.category === cat).length}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onOpenPlayerPicker}>
            <LayoutGrid className="w-3.5 h-3.5 mr-1" /> Panel de jugadores
          </Button>
          <Button size="sm" onClick={onNew} disabled={participants.length < 2}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Nuevo equipo
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-3 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Swords className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-semibold mb-1">
                {participants.length === 0 ? 'Necesitas jugadores' : `No hay equipos en ${category}`}
              </p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
                {participants.length === 0
                  ? 'Registra al menos dos participantes para crear un equipo'
                  : 'Crea el primer equipo asignando dos jugadores'}
              </p>
              {participants.length === 0 ? (
                <Button size="sm" onClick={onNew}>
                  <Users className="w-4 h-4 mr-1.5" /> Registrar jugadores
                </Button>
              ) : (
                <Button size="sm" onClick={onNew}>
                  <Plus className="w-4 h-4 mr-1.5" /> Crear primer equipo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {[...filteredTeams]
              .sort((a, b) => a.team_number - b.team_number)
              .map((team, i) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  index={i}
                  getPlayerName={getPlayerName}
                  onEdit={() => onEdit(team)}
                  onDelete={() => onDelete(team)}
                />
              ))}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}

function ConfigSection({ league, categories, teamsCount, playersCount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5 text-muted-foreground" />
          Configuración de la liga
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Nombre de la liga</Label>
            <Input value={league.name || ''} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
            <div className="flex items-center h-10 px-3 rounded-lg border border-border bg-muted/50">
              <Badge variant={league.status === 'activa' ? 'success' : 'secondary'}>
                {league.status || 'borrador'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Categorías</Label>
          <div className="flex flex-wrap gap-2">
            {categories.length > 0 ? categories.map(cat => (
              <Badge key={cat} variant="outline">{cat}</Badge>
            )) : (
              <span className="text-sm text-muted-foreground">Sin categorías definidas</span>
            )}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-border">
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold">{teamsCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Equipos registrados</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold">{playersCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Jugadores activos</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold">{categories.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Categorías</p>
          </div>
        </div>
      </CardContent>
    </Card>
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
      className="rounded-xl border border-border bg-card p-4 hover:shadow-card-hover transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            #{team.team_number}
          </div>
          <span className="text-xs font-medium text-muted-foreground">{team.category}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors" title="Editar">
            <Pencil className="w-3 h-3" />
          </button>
          <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors" title="Eliminar">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 py-2">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
          {p1Name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{p1Name}</p>
          <p className="text-xs text-muted-foreground">Jugador 1</p>
        </div>
      </div>
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-bold text-muted-foreground">VS</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="flex items-center gap-3 py-2">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
          {p2Name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{p2Name}</p>
          <p className="text-xs text-muted-foreground">Jugador 2</p>
        </div>
      </div>
      {team.team_name && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground truncate text-center font-medium">{team.team_name}</p>
        </div>
      )}
    </motion.div>
  )
}

function PlayerSelectGrid({ players, selectedId, player2Id, onSelect, hasAnyParticipants }) {
  if (!hasAnyParticipants) {
    return (
      <div className="text-center py-8 rounded-xl bg-muted/50 border border-dashed border-border space-y-3">
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
      <div className="text-center py-6 rounded-xl bg-muted/50 border border-dashed border-border">
        <p className="text-xs text-muted-foreground">Todos los jugadores ya están asignados</p>
      </div>
    )
  }

  return (
    <div className="max-h-48 overflow-y-auto space-y-1 pr-1 rounded-xl border border-border">
      {players.map(p => {
        const isSelected = p.id === selectedId
        const isP2 = p.id === player2Id
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
              isSelected
                ? 'bg-primary/10 border-l-2 border-l-primary'
                : isP2
                  ? 'bg-transparent cursor-not-allowed opacity-50 border-l-2 border-l-transparent'
                  : 'bg-transparent hover:bg-muted border-l-2 border-l-transparent'
            )}
            disabled={isP2}
          >
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0', isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
              {p.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.level} · {p.gender}</p>
            </div>
            {isSelected && (
              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                <svg viewBox="0 0 16 16" className="w-3 h-3 text-primary-foreground">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" fill="currentColor" />
                </svg>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
