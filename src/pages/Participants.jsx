import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, Plus, Search, LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PlayerCard, PlayerCardGrid } from '@/components/players/PlayerCard'
import { useParticipants } from '@/hooks/useParticipants'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'

export default function Participants() {
  const navigate = useNavigate()
  const { isOrganizer } = useAuth()
  const { participantsQuery, createParticipant, updateParticipant, deleteParticipant } = useParticipants()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [form, setForm] = useState({ name: '', level: '5TA', gender: 'femenil', phone: '', photo_url: '' })

  const { data: allStats = [] } = useQuery({
    queryKey: ['all-player-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('player_stats').select('*')
      if (error) return []
      return data
    },
    enabled: !participantsQuery.isLoading,
  })

  const getPlayerStats = (playerName) => {
    return allStats.filter((s) => s.player_name === playerName).reduce(
      (acc, s) => ({
        matches_played: acc.matches_played + s.matches_played,
        matches_won: acc.matches_won + s.matches_won,
        matches_lost: acc.matches_lost + s.matches_lost,
        sets_won: acc.sets_won + s.sets_won,
        sets_lost: acc.sets_lost + s.sets_lost,
        win_percentage:
          (acc.matches_played + s.matches_played) > 0
            ? Math.round(
                ((acc.matches_won + s.matches_won) / (acc.matches_played + s.matches_played)) * 100
              )
            : 0,
      }),
      { matches_played: 0, matches_won: 0, matches_lost: 0, sets_won: 0, sets_lost: 0, win_percentage: 0 }
    )
  }

  const resetForm = () => {
    setShowForm(false)
    setEditing(null)
    setForm({ name: '', level: '5TA', gender: 'femenil', phone: '', photo_url: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editing) {
      updateParticipant.mutate({ id: editing.id, ...form }, { onSuccess: resetForm })
    } else {
      createParticipant.mutate(form, { onSuccess: resetForm })
    }
  }

  const openEdit = (p) => {
    setForm({ name: p.name, level: p.level, gender: p.gender, phone: p.phone || '', photo_url: p.photo_url || '' })
    setEditing(p)
    setShowForm(true)
  }

  const participants = participantsQuery.data || []
  const filtered = participants.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterLevel && p.level !== filterLevel) return false
    if (filterGender && p.gender !== filterGender) return false
    return true
  })

  const hasActiveFilters = search || filterLevel || filterGender

  return (
    <div>
      <PageHeader
        title="Jugadores"
        description={`${participants.length} registrados`}
        action={
          isOrganizer && (
            <Button onClick={() => { resetForm(); setShowForm(true) }}>
              <Plus className="w-4 h-4" />
              Nuevo jugador
            </Button>
          )
        }
      />

      {/* ── Filters & Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="w-24">
            <option value="">Nivel</option>
            <option value="3RA">3RA</option>
            <option value="4TA">4TA</option>
            <option value="5TA">5TA</option>
            <option value="6TA">6TA</option>
          </Select>
          <Select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="w-28">
            <option value="">Género</option>
            <option value="femenil">Femenil</option>
            <option value="varonil">Varonil</option>
          </Select>

          {/* View toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              title="Vista en tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 transition-colors ${viewMode === 'compact' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              title="Vista compacta"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(''); setFilterLevel(''); setFilterGender('') }}
              className="text-destructive hover:text-destructive"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* ── Players Grid/List ── */}
      {filtered.length > 0 ? (
        viewMode === 'compact' ? (
          <div className="space-y-2">
            {filtered.map((p) => (
              <PlayerCard
                key={p.id}
                player={p}
                stats={getPlayerStats(p.name)}
                variant="compact"
                editable={isOrganizer}
                onEdit={openEdit}
                onDelete={deleteParticipant.mutate}
                onClick={(player) => navigate(`/jugadores/${encodeURIComponent(player.name)}`)}
              />
            ))}
          </div>
        ) : (
          <PlayerCardGrid>
            {filtered.map((p) => (
              <PlayerCard
                key={p.id}
                player={p}
                stats={getPlayerStats(p.name)}
                variant="detailed"
                editable={isOrganizer}
                onEdit={openEdit}
                onDelete={deleteParticipant.mutate}
                onClick={(player) => navigate(`/jugadores/${encodeURIComponent(player.name)}`)}
              />
            ))}
          </PlayerCardGrid>
        )
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            {participants.length === 0
              ? 'No hay jugadores registrados'
              : 'Sin resultados con esos filtros'}
          </p>
          {hasActiveFilters && (
            <Button
              variant="link"
              size="sm"
              className="mt-2"
              onClick={() => { setSearch(''); setFilterLevel(''); setFilterGender('') }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* ── Form Dialog ── */}
      <Dialog open={showForm} onOpenChange={(o) => !o && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Nuevo'} jugador</DialogTitle>
            <DialogDescription>Registra los datos del jugador</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nombre completo *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej. Ana García"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nivel</Label>
                <Select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                  <option value="3RA">3RA — Alta</option>
                  <option value="4TA">4TA — Media-Alta</option>
                  <option value="5TA">5TA — Media</option>
                  <option value="6TA">6TA — Iniciación</option>
                </Select>
              </div>
              <div>
                <Label>Género</Label>
                <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="femenil">Femenil</option>
                  <option value="varonil">Varonil</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Opcional — para contacto"
              />
            </div>
            <div>
              <Label>Foto</Label>
              <Input
                value={form.photo_url}
                onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                placeholder="https://... (URL de imagen)"
              />
              {form.photo_url && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={form.photo_url}
                    alt="Preview"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div
                    className="w-10 h-10 rounded-full bg-muted hidden items-center justify-center text-xs text-muted-foreground"
                  >
                    —
                  </div>
                  <span className="text-[10px] text-muted-foreground">Vista previa</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editing ? 'Guardar cambios' : 'Registrar jugador'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}