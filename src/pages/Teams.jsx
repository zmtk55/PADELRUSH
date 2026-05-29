import { useParams, useNavigate } from 'react-router-dom'
import { useTeams } from '@/hooks/useTeams'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import { useParticipants } from '@/hooks/useParticipants'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ArrowLeft, Trash2, Swords, Plus, Search, Users, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'

export default function Teams() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leagueQuery } = useLeagues()
  const { data: league } = leagueQuery(leagueId)
  const { participantsQuery } = useParticipants()
  const { teamsQuery, deleteTeam, updateTeam, createTeamsBatch } = useTeams(leagueId)
  const teams = teamsQuery.data || []
  const participants = participantsQuery.data || []

  const [editingTeam, setEditingTeam] = useState(null)
  const [editName, setEditName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', category: '', player1: null, player2: null })
  const [playerSearch1, setPlayerSearch1] = useState('')
  const [playerSearch2, setPlayerSearch2] = useState('')

  const grouped = teams.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {})

  const handleEdit = (team) => {
    setEditingTeam(team)
    setEditName(team.team_name || `Equipo ${team.team_number}`)
  }

  const handleSaveEdit = async () => {
    if (!editingTeam) return
    try {
      await updateTeam.mutateAsync({ id: editingTeam.id, team_name: editName })
    } catch {
      const idx = teams.findIndex(t => t.id === editingTeam.id)
      if (idx !== -1) teamsQuery.data[idx] = { ...teamsQuery.data[idx], team_name: editName }
    }
    setEditingTeam(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este equipo?')) return
    try {
      await deleteTeam.mutateAsync(id)
    } catch {
      const idx = teams.findIndex(t => t.id === id)
      if (idx !== -1) teams.splice(idx, 1)
    }
  }

  const categories = league?.categories || []

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim() || !newTeam.category || !newTeam.player1 || !newTeam.player2) return
    const maxNum = teams
      .filter(t => t.category === newTeam.category)
      .reduce((max, t) => Math.max(max, t.team_number || 0), 0)
    try {
      await createTeamsBatch.mutateAsync([{
        league_id: leagueId,
        category: newTeam.category,
        team_name: newTeam.name.trim(),
        team_number: maxNum + 1,
        player1_id: newTeam.player1.id,
        player2_id: newTeam.player2.id,
      }])
      teamsQuery.refetch()
      setShowCreate(false)
      setNewTeam({ name: '', category: '', player1: null, player2: null })
    } catch (err) { alert('Error al crear equipo: ' + err.message) }
  }

  const togglePlayer1 = (p) => {
    if (newTeam.player1?.id === p.id) { setNewTeam(n => ({ ...n, player1: null })); return }
    setNewTeam(n => ({ ...n, player1: p }))
    if (newTeam.player2?.id === p.id) setNewTeam(n => ({ ...n, player2: null }))
  }
  const togglePlayer2 = (p) => {
    if (newTeam.player2?.id === p.id) { setNewTeam(n => ({ ...n, player2: null })); return }
    setNewTeam(n => ({ ...n, player2: p }))
    if (newTeam.player1?.id === p.id) setNewTeam(n => ({ ...n, player1: null }))
  }

  const usedPlayerIds = new Set(teams
    .filter(t => t.category === (newTeam.category || '_'))
    .flatMap(t => [t.player1_id, t.player2_id, t.player1?.id, t.player2?.id])
    .filter(Boolean))

  const filteredPlayers1 = participants.filter(p =>
    !usedPlayerIds.has(p.id) &&
    (!playerSearch1 || p.name.toLowerCase().includes(playerSearch1.toLowerCase()))
  )
  const filteredPlayers2 = participants.filter(p =>
    (!newTeam.player1 || p.id === newTeam.player1.id || !usedPlayerIds.has(p.id)) &&
    (!playerSearch2 || p.name.toLowerCase().includes(playerSearch2.toLowerCase()))
  )


  return (
    <div>
      <button
        onClick={() => navigate(`/ligas/${leagueId}`)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-3 h-3" /> Volver a liga
      </button>

      <PageHeader title="Equipos" description={league?.name} />

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 bg-card border border-border">
          <div className="w-16 h-16 border border-border flex items-center justify-center mx-auto mb-4">
            <Swords className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-base font-heading font-bold mb-1">No hay equipos registrados</p>
          <p className="text-sm text-muted-foreground mb-4">Crea equipos manualmente asignando dos jugadores por equipo</p>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Crear equipo
          </Button>
        </div>
      ) : (
        <>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{teams.length} equipos en total</p>
          {isOrganizer && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Crear equipo
            </Button>
          )}
        </div>
        {Object.entries(grouped).map(([category, catTeams]) => (
          <div key={category} className="mb-8">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h3 className="font-heading font-bold text-lg tracking-tight">{category}</h3>
              <span className="text-sm text-muted-foreground">{catTeams.length} equipos</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catTeams.sort((a, b) => a.team_number - b.team_number).map((team, i) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-card border border-border p-4 hover:border-border transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm shrink-0">
                        {team.team_number}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{team.team_name || `Equipo ${team.team_number}`}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {(team.player1_name || team.player1?.name || '?')} / {(team.player2_name || team.player2?.name || '?')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground">{team.category}</span>
                      {isOrganizer && (
                        <>
                          <button
                            className="w-7 h-7 hover:bg-muted text-muted-foreground hover:text-muted-foreground flex items-center justify-center transition-colors"
                            onClick={() => handleEdit(team)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </button>
                          <button
                            className="w-7 h-7 hover:bg-red-50 text-muted-foreground hover:text-red-600 flex items-center justify-center transition-colors"
                            onClick={() => handleDelete(team.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        </>
      )}

      {/* --- Create Team Dialog --- */}
      <Dialog open={showCreate} onOpenChange={o => { if (!o) { setShowCreate(false); setNewTeam({ name: '', category: '', player1: null, player2: null }); setPlayerSearch1(''); setPlayerSearch2('') } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-lg flex items-center gap-2">
              <Plus className="w-4 h-4" /> Crear equipo manualmente
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Asigna un nombre, categoría y dos jugadores al equipo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {/* Team name */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nombre del equipo</Label>
              <Input
                value={newTeam.name}
                onChange={e => setNewTeam(n => ({ ...n, name: e.target.value }))}
                placeholder="Ej: Los Pumas"
                className="mt-1"
              />
            </div>

            {/* Category */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Categoría</Label>
              <Select
                value={newTeam.category}
                onValueChange={v => setNewTeam(n => ({ ...n, category: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Player 1 */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Jugador 1</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={playerSearch1}
                  onChange={e => setPlayerSearch1(e.target.value)}
                  placeholder="Buscar jugador..."
                  className="pl-8"
                />
              </div>
              {newTeam.player1 && (
                <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 mt-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-medium">{newTeam.player1.name}</span>
                  </div>
                  <button onClick={() => { setNewTeam(n => ({ ...n, player1: null })); setPlayerSearch1('') }}>
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              )}
              {!newTeam.player1 && (
                <div className="max-h-32 overflow-y-auto mt-2 space-y-0.5 border border-border rounded-md">
                  {filteredPlayers1.slice(0, 10).map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePlayer1(p)}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                  {filteredPlayers1.length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                      {playerSearch1 ? 'Sin resultados' : 'No hay jugadores disponibles'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Player 2 */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Jugador 2</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={playerSearch2}
                  onChange={e => setPlayerSearch2(e.target.value)}
                  placeholder="Buscar jugador..."
                  className="pl-8"
                />
              </div>
              {newTeam.player2 && (
                <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 mt-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-medium">{newTeam.player2.name}</span>
                  </div>
                  <button onClick={() => { setNewTeam(n => ({ ...n, player2: null })); setPlayerSearch2('') }}>
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              )}
              {!newTeam.player2 && (
                <div className="max-h-32 overflow-y-auto mt-2 space-y-0.5 border border-border rounded-md">
                  {filteredPlayers2.slice(0, 10).map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePlayer2(p)}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                  {filteredPlayers2.length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                      {playerSearch2 ? 'Sin resultados' : 'No hay jugadores disponibles'}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => { setShowCreate(false); setNewTeam({ name: '', category: '', player1: null, player2: null }) }}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleCreateTeam} disabled={!newTeam.name.trim() || !newTeam.category || !newTeam.player1 || !newTeam.player2}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Crear equipo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTeam} onOpenChange={o => !o && setEditingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-lg">Editar equipo</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Cambia el nombre del equipo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre del equipo</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="mt-1" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingTeam(null)}>Cancelar</Button>
              <Button size="sm" onClick={handleSaveEdit}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
