import { useParams, useNavigate } from 'react-router-dom'
import { useTeams } from '@/hooks/useTeams'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import { useParticipants } from '@/hooks/useParticipants'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ArrowLeft, Trash2, Swords, ChevronRight, Plus, CheckCircle, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { useState } from 'react'
import { toast } from 'sonner'

export default function Teams() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leagueQuery } = useLeagues()
  const { data: league } = leagueQuery(leagueId)
  const { teamsQuery, deleteTeam, updateTeam, createTeam } = useTeams(leagueId)
  const { participantsQuery } = useParticipants()
  const teams = teamsQuery.data || []
  const participants = participantsQuery.data || []

  const [editingTeam, setEditingTeam] = useState(null)
  const [editName, setEditName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [createForm, setCreateForm] = useState({
    team_number: '',
    category: '',
    player1_id: null,
    player2_id: null,
    team_name: '',
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [createSuccess, setCreateSuccess] = useState(false)

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
    if (!editName.trim()) {
      toast.error('El nombre del equipo es obligatorio')
      return
    }
    try {
      await updateTeam.mutateAsync({ id: editingTeam.id, team_name: editName })
      toast.success('Equipo actualizado')
    } catch(e) {
      toast.error('Error al actualizar: ' + (e.message || 'desconocido'))
    }
    setEditingTeam(null)
  }

  const handleDelete = async (id) => {
    try {
      await deleteTeam.mutateAsync(id)
      toast.success('Equipo eliminado')
    } catch(e) {
      toast.error('Error al eliminar: ' + (e.message || 'desconocido'))
    }
    setDeleteConfirm(null)
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    if (!createForm.team_number || !createForm.category || !createForm.player1_id || !createForm.player2_id) {
      setCreateError('Por favor complete todos los campos')
      return
    }

    setCreateLoading(true)
    setCreateError(null)
    try {
      await createTeam.mutateAsync({
        league_id: leagueId,
        team_number: parseInt(createForm.team_number),
        category: createForm.category.toUpperCase(),
        player1_id: createForm.player1_id,
        player2_id: createForm.player2_id,
        team_name: createForm.team_name || `Equipo ${createForm.team_number}`,
      })
      setCreateSuccess(true)
      setCreateForm({
        team_number: '',
        category: '',
        player1_id: null,
        player2_id: null,
        team_name: '',
      })
    } catch(e) {
      setCreateError('Error al crear el equipo: ' + (e.message || 'desconocido'))
    } finally {
      setCreateLoading(false)
    }
  }

  if (teamsQuery.isLoading) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-w-16 aspect-h-9 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          
            <div className="mt-6 space-y-3">
              <div className="h-4 bg-muted rounded animate-pulse w-32" />
              <div className="h-4 bg-muted rounded animate-pulse w-48" />
              <div className="h-4 bg-muted rounded animate-pulse w-40" />
            </div>
          </div>
        </motion.div>
      );
    }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/ligas/${leagueId}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
        >
          <ChevronRight className="w-3 h-3 rotate-180 group-hover:-translate-x-0.5 transition-transform" /> Volver a liga
        </button>
        
        {isOrganizer && (
          <>
            <button
              onClick={() => setShowCreateTeam(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-md bg-court text-white text-sm font-medium hover:bg-court/[0.8] transition-colors"
            >
              <Plus className="w-4 h-4" /> Nuevo equipo
            </button>
            <button
              onClick={() => teamsQuery.refetch()}
              className="flex items-center gap-2 h-9 px-4 rounded-md btn-ghost text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
          </>
        )}
      </div>

      <PageHeader title="Equipos" description={league?.name} />

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 card card-accent-left">
          <div className="w-16 h-16 border border-border-subtle flex items-center justify-center mx-auto mb-4">
            <Swords className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-base font-heading font-bold mb-1">No hay equipos registrados</p>
          <p className="text-sm text-muted-foreground mb-4">Los equipos se crean durante la configuración de la liga</p>
          <Button size="sm" onClick={() => navigate(`/ligas/${leagueId}/partidos`)}>Ir a partidos</Button>
        </div>
      ) : (
        <>
          {Object.entries(grouped).map(([category, catTeams]) => (
            <motion.div key={category} variants={staggerContainer} initial="initial" animate="animate" className="mb-8">
              <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-2">
                <h3 className="font-heading font-bold text-lg tracking-tight flex items-center gap-2">
                  <span className="w-6 h-6 bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0">{category.charAt(0)}</span>
                  {category}
                </h3>
                <span className="text-sm text-muted-foreground">{catTeams.length} equipos</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catTeams.sort((a, b) => a.team_number - b.team_number).map((team, i) => (
                  <motion.div
                    key={team.id}
                    variants={staggerItem}
                    className="card card-accent-left p-4 hover:shadow-court-glow hover:-translate-y-0.5 transition-all duration-300"
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
                              className="w-7 h-7 hover:bg-destructive/[0.1] text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                              onClick={() => setDeleteConfirm(team.id)}
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
            </motion.div>
          ))}
        </>
      )}

      <Dialog open={!!deleteConfirm} onOpenChange={o => !o && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-lg">Confirmar eliminación</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">¿Estás seguro de eliminar este equipo? Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button size="sm" onClick={() => handleDelete(deleteConfirm)}>Eliminar</Button>
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

      <Dialog open={showCreateTeam} onOpenChange={(o) => !o && setShowCreateTeam(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-xl">
              {createSuccess ? 'Equipo creado' : 'Crear nuevo equipo'}
            </DialogTitle>
            <DialogDescription>
              {createSuccess 
                ? 'El equipo ha sido creado exitosamente' 
                : 'Asigne dos jugadores para formar un nuevo equipo'}
            </DialogDescription>
          </DialogHeader>

          {createSuccess ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-success/[0.1] flex items-center justify-center rounded-lg">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <p className="font-semibold text-success">Equipo creado exitosamente</p>
              <Button variant="outline" size="sm" onClick={() => {
                setShowCreateTeam(false)
                setCreateSuccess(false)
                setCreateForm({
                  team_number: '',
                  category: '',
                  player1_id: null,
                  player2_id: null,
                  team_name: '',
                })
              }}>
                Crear otro equipo
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreateTeam} className="space-y-5">
              <div className="space-y-4">
                {createError && (
                  <div className="bg-destructive/[0.1] border-destructive/20 text-destructive rounded px-4 py-3">
                    {createError}
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre del equipo (opcional)</label>
                  <Input
                    type="text"
                    value={createForm.team_name}
                    onChange={(e) => setCreateForm({ ...createForm, team_name: e.target.value })}
                    placeholder="Ej: Los Campeones"
                  />
                </div>
                
                <div className="gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">Número de equipo</label>
                    <Input
                      type="number"
                      value={createForm.team_number}
                      onChange={(e) => setCreateForm({ ...createForm, team_number: e.target.value })}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">Categoría</label>
                    <Input
                      type="text"
                      value={createForm.category}
                      onChange={(e) => setCreateForm({ ...createForm, category: e.target.value.toUpperCase() })}
                      placeholder="Ej: 5TA"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Jugadores</label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Jugador 1</label>
                      <Select
                        value={createForm.player1_id?.toString() || ''}
                        onValueChange={(value) => setCreateForm({ ...createForm, player1_id: value ? parseInt(value) : null })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar jugador..." />
                        </SelectTrigger>
                        <SelectContent>
                          {participants.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.name || `Jugador ${p.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Jugador 2</label>
                      <Select
                        value={createForm.player2_id?.toString() || ''}
                        onValueChange={(value) => setCreateForm({ ...createForm, player2_id: value ? parseInt(value) : null })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar jugador..." />
                        </SelectTrigger>
                        <SelectContent>
                          {participants.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.name || `Jugador ${p.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
                  <Button type="button" variant="outline" onClick={() => setShowCreateTeam(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createLoading} 
                    className="w-fit"
                  >
                    {createLoading ? (
                      <>
                        <div className="w-4 h-4 border-[1.5px] border-white border-t-transparent animate-spin rounded-sm mr-2" />
                        <span>Creando...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        <span>Crear Equipo</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}// Deploy trigger: Fri, Jul  3, 2026  6:07:32 PM
