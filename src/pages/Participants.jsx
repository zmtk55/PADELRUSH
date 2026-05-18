import { Users, Plus, Search, Upload, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useParticipants } from '@/hooks/useParticipants'
import { useAuth } from '@/hooks/useAuth'
import { demoData } from '@/lib/demoData'
import { useState } from 'react'
import { motion } from 'framer-motion'

const niveles = [
  { value: '3RA', label: '3RA - Avanzado' },
  { value: '4TA', label: '4TA - Intermedio-Alto' },
  { value: '5TA', label: '5TA - Intermedio' },
  { value: '6TA', label: '6TA - Principiante' },
]

const generos = [
  { value: 'femenil', label: 'Femenil' },
  { value: 'varonil', label: 'Varonil' },
]

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    try {
      if (editing) {
        try {
          await updateParticipant.mutateAsync({ id: editing.id, ...form })
        } catch {
          const idx = demoData.participants.findIndex(p => p.id === editing.id)
          if (idx !== -1) Object.assign(demoData.participants[idx], form)
        }
      } else {
        try {
          await createParticipant.mutateAsync(form)
        } catch {
          const newP = { id: `demo-p-${Date.now()}`, ...form }
          demoData.participants.push(newP)
        }
      }
      resetForm()
      participantsQuery.refetch()
    } catch (err) {
      alert('Error: ' + (err.message || 'Error al guardar'))
    }
  }

  const openEdit = (p) => {
    setForm({ name: p.name, level: p.level, gender: p.gender, phone: p.phone || '', photo_url: p.photo_url || '' })
    setEditing(p)
    setShowForm(true)
  }

  const handleDelete = async (p) => {
    if (!confirm(`¿Eliminar a ${p.name}?`)) return
    try {
      try {
        await deleteParticipant.mutateAsync(p.id)
      } catch {
        demoData.participants = demoData.participants.filter(x => x.id !== p.id)
      }
      participantsQuery.refetch()
    } catch (err) {
      alert('Error al eliminar')
    }
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
              Nuevo jugador
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
        
        <Select value={filterLevel || 'all'} onValueChange={v => setFilterLevel(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Nivel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {niveles.map(n => <SelectItem key={n.value} value={n.value}>{n.value}</SelectItem>)}
          </SelectContent>
        </Select>
        
        <Select value={filterGender || 'all'} onValueChange={v => setFilterGender(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Género" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {generos.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
          </SelectContent>
        </Select>
        
        {(search || filterLevel || filterGender) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterLevel(''); setFilterGender('') }}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {p.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.level} · {p.gender}</p>
              </div>
            </div>
            
            {p.phone && (
              <p className="text-xs text-muted-foreground mb-2">📱 {p.phone}</p>
            )}
            
            {isOrganizer && (
              <div className="flex gap-1 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(p)}>
                  Editar
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(p)}>
                  <X className="w-4 h-4" />
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
            {participants.length === 0 ? 'No hay participantes. ¡Agrega el primero!' : 'Sin resultados'}
          </p>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => !o && resetForm()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Nuevo'} jugador</DialogTitle>
            <DialogDescription>Registra los datos del participante</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nombre completo *</Label>
              <Input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                placeholder="Ej: Juan Pérez" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nivel</Label>
                <Select value={form.level} onValueChange={v => setForm({ ...form, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {niveles.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Género</Label>
                <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {generos.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Teléfono (opcional)</Label>
              <Input 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                placeholder="5215512345678" 
              />
            </div>
            
            <div>
              <Label>Foto (URL o archivo)</Label>
              <Input 
                value={form.photo_url} 
                onChange={(e) => setForm({ ...form, photo_url: e.target.value })} 
                placeholder="https://..." 
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button type="submit" disabled={createParticipant.isPending || updateParticipant.isPending}>
                {createParticipant.isPending || updateParticipant.isPending ? 'Guardando...' : editing ? 'Guardar cambios' : 'Registrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}