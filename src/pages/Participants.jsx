import { Users, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useParticipants } from '@/hooks/useParticipants'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Participants() {
  const { isOrganizer } = useAuth()
  const { participantsQuery, createParticipant, updateParticipant, deleteParticipant } = useParticipants()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [form, setForm] = useState({ name: '', level: '5TA', gender: 'femenil', phone: '', photo_url: '' })

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

  return (
    <div>
      <PageHeader
        title="Participantes"
        description={`${participants.length} registrados`}
        action={
          isOrganizer && (
            <Button onClick={() => { resetForm(); setShowForm(true) }}>
              <Plus className="w-4 h-4" />
              Nuevo
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="pl-9"
          />
        </div>
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
        {(search || filterLevel || filterGender) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterLevel(''); setFilterGender('') }}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  {p.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.level} · {p.gender}
                  {p.phone && ` · ${p.phone}`}
                </p>
              </div>
            </div>
            {isOrganizer && (
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => openEdit(p)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => { if (confirm('¿Eliminar?')) deleteParticipant.mutate(p.id) }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {participants.length === 0 ? 'No hay participantes registrados' : 'Sin resultados con esos filtros'}
          </p>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => !o && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Nuevo'} participante</DialogTitle>
            <DialogDescription>Registra los datos del jugador</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nombre completo *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nivel</Label>
                <Select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                  <option value="3RA">3RA</option>
                  <option value="4TA">4TA</option>
                  <option value="5TA">5TA</option>
                  <option value="6TA">6TA</option>
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
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Opcional" />
            </div>
            <div>
              <Label>Foto URL</Label>
              <Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button type="submit">{editing ? 'Guardar' : 'Registrar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
