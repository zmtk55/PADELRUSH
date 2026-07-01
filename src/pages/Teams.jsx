import { useParams, useNavigate } from 'react-router-dom'
import { useTeams } from '@/hooks/useTeams'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import { useParticipants } from '@/hooks/useParticipants'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PlayerPickerPanel } from '@/components/leagues/PlayerPickerPanel'
import { ArrowLeft, Trash2, Swords, Plus, Users, Trophy, TrendingUp, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

function TeamCard({ team, onClick, onEdit, onDelete, isOrganizer }) {
  const player1 = team.player1_name || team.player1?.name || '?'
  const player2 = team.player2_name || team.player2?.name || '?'
  const wins = team.wins ?? team.matches_won ?? 0
  const draws = team.draws ?? 0
  const losses = team.losses ?? team.matches_lost ?? 0
  const avg = team.avg_score ?? team.avg_score ?? 0

  return (
    <motion.div
      variants={item}
      onClick={onClick}
      className="group bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-card transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
            {team.team_number}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {team.team_name || `Equipo ${team.team_number}`}
            </p>
            {team.league_name && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {team.league_name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {team.category}
          </Badge>
          {isOrganizer && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-1">
              <button
                className="w-6 h-6 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center rounded-md transition-colors"
                onClick={(e) => { e.stopPropagation(); onEdit(team) }}
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                className="w-6 h-6 hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center rounded-md transition-colors"
                onClick={(e) => { e.stopPropagation(); onDelete(team.id) }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          {wins}-{draws}-{losses}
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {avg > 0 ? avg.toFixed(1) : '-'} avg
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2 py-1">
          <Users className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{player1}</span>
        </div>
        <span className="text-muted-foreground text-xs">/</span>
        <div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2 py-1">
          <Users className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{player2}</span>
        </div>
      </div>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-9 w-32 bg-muted animate-pulse rounded-lg" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-3 bg-muted animate-pulse rounded w-16" />
              <div className="h-3 bg-muted animate-pulse rounded w-16" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-muted animate-pulse rounded w-20" />
              <div className="h-6 bg-muted animate-pulse rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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

  if (teamsQuery.isLoading) {
    return <LoadingSkeleton />
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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-card border border-border rounded-xl"
        >
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Swords className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold mb-1">No hay equipos registrados</p>
          <p className="text-sm text-muted-foreground mb-4">
            Crea equipos manualmente asignando dos jugadores por equipo
          </p>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Crear equipo
          </Button>
        </motion.div>
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
                <h3 className="font-semibold text-lg tracking-tight">{category}</h3>
                <span className="text-sm text-muted-foreground">{catTeams.length} equipos</span>
              </div>

              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              >
                {catTeams
                  .sort((a, b) => a.team_number - b.team_number)
                  .map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      onClick={() => navigate(`/ligas/${leagueId}/equipos/${team.id}`)}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isOrganizer={isOrganizer}
                    />
                  ))}
              </motion.div>
            </div>
          ))}
        </>
      )}

      {/* Create Teams Modal */}
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

      {/* Edit Team Dialog */}
      <Dialog open={!!editingTeam} onOpenChange={o => !o && setEditingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar equipo</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Cambia el nombre del equipo
            </DialogDescription>
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
