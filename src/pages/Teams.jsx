import { useParams, useNavigate } from 'react-router-dom'
import { useTeams } from '@/hooks/useTeams'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Teams() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leagueQuery } = useLeagues()
  const { data: league } = leagueQuery(leagueId)
  const { teamsQuery, deleteTeam, updateTeam } = useTeams(leagueId)
  const teams = teamsQuery.data || []
  const [editingTeam, setEditingTeam] = useState(null)
  const [editName, setEditName] = useState('')

  const grouped = teams.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {})

  const handleEdit = (team) => {
    setEditingTeam(team)
    setEditName(team.team_name || `Equipo ${team.team_number}`)
  }

  const handleSaveEdit = () => {
    if (editingTeam) {
      updateTeam.mutate({ id: editingTeam.id, team_name: editName })
      setEditingTeam(null)
    }
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate(`/ligas/${leagueId}`)} className="mb-4">
        <ArrowLeft className="w-4 h-4" />
        Volver a liga
      </Button>

      <PageHeader title="Equipos" description={league?.name} />

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground">No hay equipos registrados</p>
          <p className="text-xs text-muted-foreground mt-1">
            Los equipos se crean durante la configuración de la liga
          </p>
          <Button className="mt-4" onClick={() => navigate(`/ligas/${leagueId}/partidos`)}>
            Ir a partidos
          </Button>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catTeams]) => (
          <div key={category} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-lg">{category}</h3>
              <span className="text-xs text-muted-foreground">{catTeams.length} equipos</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catTeams
                .sort((a, b) => a.team_number - b.team_number)
                .map((team) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-heading shrink-0">
                          {team.team_number}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{team.team_name || `Equipo ${team.team_number}`}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {team.player1?.name || '?'} / {team.player2?.name || '?'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant="secondary" className="text-xs">{team.category}</Badge>
                        {isOrganizer && (
                          <>
                            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleEdit(team)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </Button>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive" onClick={() => { if (confirm('¿Eliminar este equipo?')) deleteTeam.mutate(team.id) }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        ))
      )}

      <Dialog open={!!editingTeam} onOpenChange={(o) => !o && setEditingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar equipo</DialogTitle>
            <DialogDescription>Cambia el nombre del equipo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre del equipo</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTeam(null)}>Cancelar</Button>
              <Button onClick={handleSaveEdit}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
