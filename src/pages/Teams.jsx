import { useParams, useNavigate } from 'react-router-dom'
import { useTeams } from '@/hooks/useTeams'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import { useParticipants } from '@/hooks/useParticipants'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PlayerPickerPanel } from '@/components/leagues/PlayerPickerPanel'
import { ArrowLeft, Trash2, Swords, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'

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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [modalTeams, setModalTeams] = useState([])

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

  const handlePersist = async (updatedTeams) => {
    setModalTeams(updatedTeams)
  }

  const handlePersistClose = async () => {
    if (modalTeams.length > 0) {
      const teamsToInsert = modalTeams.map(t => ({
        league_id: leagueId,
        category: t.category,
        team_name: t.team_name,
        team_number: t.team_number,
        player1_id: t.player1_id,
        player2_id: t.player2_id,
      }))
      try {
        await createTeamsBatch.mutateAsync(teamsToInsert)
        teamsQuery.refetch()
      } catch (err) {
        toast.error('Error al crear equipos: ' + err.message)
      }
    }
    setShowCreateModal(false)
    setModalTeams([])
  }


  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
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
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Crear equipo
          </Button>
        </div>
      ) : (
        <>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{teams.length} equipos en total</p>
          {isOrganizer && (
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
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
                  onClick={() => navigate(`/ligas/${leagueId}/equipos/${team.id}`)}
                  className="bg-card border border-border p-4 hover:border-foreground/30 transition-colors cursor-pointer"
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
                            className="w-7 h-7 hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

      {/* --- Create Teams Modal (PlayerPickerPanel) --- */}
      {showCreateModal && (
        <Dialog open={showCreateModal} onOpenChange={(open) => {
          if (!open) handlePersistClose()
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Equipos</DialogTitle>
            </DialogHeader>
            <PlayerPickerPanel
              teams={modalTeams}
              onTeamsChange={handlePersist}
              participants={participants}
              categories={categories}
              mode="compact"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* --- Edit Team Dialog --- */}
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
