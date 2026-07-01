import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, X, Phone, Mail, Calendar, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useParticipants } from '@/hooks/useParticipants'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const initialForm = { name: '', phone: '', email: '' }

export default function Players() {
  const { isOrganizer } = useAuth()
  const { participantsQuery, createParticipant, updateParticipant, deleteParticipant } = useParticipants()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const participants = participantsQuery.data || []
  const isLoading = participantsQuery.isLoading

  const resetForm = () => { setForm(initialForm); setEditing(null); setShowForm(false) }
  const openNew = () => { setForm(initialForm); setEditing(null); setShowForm(true) }
  const openEdit = (p, e) => {
    e.stopPropagation()
    setForm({ name: p.name, phone: p.phone || '', email: p.email || '' })
    setEditing(p)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return }
    try {
      if (editing) {
        await updateParticipant.mutateAsync({ id: editing.id, ...form })
        toast.success('Jugador actualizado')
      } else {
        await createParticipant.mutateAsync(form)
        toast.success('Jugador registrado')
      }
      resetForm()
      participantsQuery.refetch()
    } catch (err) { toast.error(err.message || 'Error al guardar') }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteParticipant.mutateAsync(deleteTarget.id)
      toast.success(`${deleteTarget.name} eliminado`)
      setDeleteTarget(null)
      participantsQuery.refetch()
    } catch { toast.error('Error al eliminar') }
  }

  const filtered = participants.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch { return dateStr }
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="space-y-6">
        <PageHeader
          title="Participantes"
          description={isLoading ? 'Cargando...' : `${participants.length} ${participants.length === 1 ? 'jugador' : 'jugadores'} registrados`}
          action={isOrganizer && (
            <Button onClick={openNew}>
              <Plus className="w-4 h-4" />
              Agregar Jugador
            </Button>
          )}
        />

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-card border border-border rounded-xl"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              {search ? <Search className="w-7 h-7 text-muted-foreground" /> : <Users className="w-7 h-7 text-muted-foreground" />}
            </div>
            <p className="text-lg font-bold mb-2">
              {search ? 'Sin resultados' : 'No hay participantes'}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              {search
                ? 'Ningún participante coincide con la búsqueda'
                : 'Registra a los jugadores para empezar a crear equipos y organizar ligas'}
            </p>
            {!search && isOrganizer && (
              <Button onClick={openNew}>
                <Plus className="w-4 h-4" />
                Registrar primer jugador
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  index={i}
                  isOrganizer={isOrganizer}
                  onEdit={(e) => openEdit(p, e)}
                  onDelete={(e) => { e.stopPropagation(); setDeleteTarget(p) }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={(o) => !o && resetForm()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                {editing ? 'Editar jugador' : 'Nuevo jugador'}
              </DialogTitle>
              <DialogDescription>
                {editing ? 'Actualiza los datos del jugador' : 'Registra un nuevo jugador en el sistema'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Avatar preview */}
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-14 h-14 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xl font-bold border border-border shrink-0">
                  {form.name ? form.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{form.name || 'Nombre del jugador'}</p>
                  <p className="text-xs text-muted-foreground">
                    {form.phone || 'Sin teléfono'} · {form.email || 'Sin email'}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Nombre completo <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                    className="pl-9"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Teléfono <span className="font-normal text-muted-foreground">(opcional)</span>
                </Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="555-0123"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Email <span className="font-normal text-muted-foreground">(opcional)</span>
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button type="submit" disabled={createParticipant.isPending || updateParticipant.isPending}>
                  {(createParticipant.isPending || updateParticipant.isPending) ? (
                    <>
                      <div className="w-4 h-4 border-[1.5px] border-white border-t-transparent animate-spin rounded-full" />
                      Guardando...
                    </>
                  ) : editing ? (
                    <>
                      <Pencil className="w-4 h-4" />
                      Guardar cambios
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Registrar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">Eliminar jugador</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de eliminar a <strong>{deleteTarget?.name}</strong>?
                    Esta acción no se puede deshacer.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function PlayerCard({ player: p, index, isOrganizer, onEdit, onDelete }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch { return dateStr }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-card transition-all duration-200 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
            {p.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{p.name}</p>
            {p.phone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" />
                {p.phone}
              </p>
            )}
            {p.email && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3" />
                <span className="truncate">{p.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {isOrganizer && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={onEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors duration-150"
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors duration-150"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
            </button>
          </div>
        )}
      </div>

      {/* Footer: teams + date */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        {p.teams && p.teams.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {p.teams.slice(0, 3).map((t, i) => (
              <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {t.name || `Equipo ${t.team_number || i + 1}`}
              </span>
            ))}
            {p.teams.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{p.teams.length - 3}</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/60">Sin equipos</span>
        )}
        {p.created_at && (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(p.created_at)}
          </span>
        )}
      </div>
    </motion.div>
  )
}
