import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { useTeams } from '@/hooks/useTeams'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Shield, ArrowLeft, Plus, Pencil, Trash2, ListChecks, Camera, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { useLeagues } from '@/hooks/useLeagues'
import { useParticipants } from '@/hooks/useParticipants'

const emptyTeam = { player1_id: '', player2_id: '', category: '', team_number: 1, team_name: '' }

export default function Admin() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { leagueQuery } = useLeagues()
  const { data: league } = leagueQuery(leagueId)
  const { teamsQuery, createTeam, updateTeam, deleteTeam } = useTeams(leagueId)
  const { participantsQuery } = useParticipants()
  const teams = teamsQuery.data || []
  const participants = participantsQuery.data || []

  const categories = league?.categories || []
  const [category, setCategory] = useState(categories[0] || '')
  const [section, setSection] = useState('equipos')
  const [editTeam, setEditTeam] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyTeam)

  const filtered = teams.filter(t => t.category === category)

  if (!league) return <p className="text-muted-foreground py-8">Cargando...</p>

  const counts = Object.fromEntries(categories.map(c => [c, teams.filter(t => t.category === c).length]))

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(`/ligas/${leagueId}`)} className="mb-2">
        <ArrowLeft className="w-4 h-4" /> Volver a liga
      </Button>

      <PageHeader title="Panel de Liga" description={`${league.name} · ${teams.length} equipos`} />

      {!isOrganizer ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-amber-400 shrink-0" />
          <p className="text-sm text-muted-foreground">Solo los organizadores pueden administrar la liga.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {[{ key: 'equipos', label: 'Equipos', icon: Shield }, { key: 'resultados', label: 'Resultados', icon: ListChecks }].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setSection(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  section === key ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                }`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {section === 'equipos' && (
            <>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                    }`}>
                    {cat} <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-background/20">{counts[cat] || 0}</span>
                  </button>
                ))}
              </div>

              <Button onClick={() => { setEditTeam(null); setForm({ ...emptyTeam, category }); setDialogOpen(true) }}
                className="bg-accent text-accent-foreground font-semibold">
                <Plus className="w-4 h-4" /> Nuevo equipo
              </Button>

              {filtered.length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
                  No hay equipos en {category}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3">#</th>
                        <th className="text-left px-4 py-3">Jugadores</th>
                        <th className="text-center px-3 py-3">Equipo</th>
                        <th className="text-right px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.sort((a, b) => a.team_number - b.team_number).map((team) => (
                        <tr key={team.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-bold">{team.team_number}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{team.player1?.name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{team.player2?.name || '—'}</p>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <Badge variant="secondary">{team.team_name || `Eq ${team.team_number}`}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" onClick={() => { setEditTeam(team); setForm({ player1_id: team.player1_id || '', player2_id: team.player2_id || '', category: team.category, team_number: team.team_number, team_name: team.team_name || '' }); setDialogOpen(true) }}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive/50 hover:text-destructive" onClick={() => { if (confirm('¿Eliminar equipo?')) deleteTeam.mutate(team.id) }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {section === 'resultados' && (
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground text-sm">Usa la sección <strong>Partidos</strong> en el menú para registrar resultados.</p>
            </div>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editTeam ? 'Editar' : 'Nuevo'} equipo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nombre del equipo</Label>
                  <Input value={form.team_name} onChange={e => setForm({ ...form, team_name: e.target.value })} placeholder="Ej: Pareja 1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Jugador 1</Label>
                    <Select value={form.player1_id} onValueChange={v => setForm({ ...form, player1_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {participants.filter(p => !teams.some(t => t.player1_id === p.id || t.player2_id === p.id) || p.id === form.player1_id || p.id === form.player2_id)
                          .map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.level})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Jugador 2</Label>
                    <Select value={form.player2_id} onValueChange={v => setForm({ ...form, player2_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {participants.filter(p => !teams.some(t => t.player1_id === p.id || t.player2_id === p.id) || p.id === form.player1_id || p.id === form.player2_id)
                          .map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.level})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Categoría</Label>
                    <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>No. Equipo</Label>
                    <Input type="number" value={form.team_number} onChange={e => setForm({ ...form, team_number: +e.target.value })} />
                  </div>
                </div>
                <Button onClick={() => {
                  if (!form.player1_id || !form.player2_id) { toast.error('Selecciona ambos jugadores'); return }
                  const payload = { ...form, league_id: leagueId, team_name: form.team_name || `Equipo ${form.team_number}` }
                  if (editTeam) updateTeam.mutate({ id: editTeam.id, ...payload })
                  else createTeam.mutate(payload)
                  setDialogOpen(false)
                }} className="w-full bg-accent text-accent-foreground font-semibold">
                  {editTeam ? 'Actualizar' : 'Crear'} equipo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
