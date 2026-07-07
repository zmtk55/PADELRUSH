import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Plus, Search, X, Phone, Camera,
  Filter, SlidersHorizontal, Trophy,
  Pencil, Trash2, AlertTriangle, LayoutGrid, List,
  Swords, Zap, ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useParticipants } from '@/hooks/useParticipants'
import { useAuth } from '@/hooks/useAuth'
import PlayerDashboard from '@/components/players/PlayerDashboard'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const niveles = [
  { value: '3RA', label: '3RA', desc: 'Avanzado' },
  { value: '4TA', label: '4TA', desc: 'Intermedio-Alto' },
  { value: '5TA', label: '5TA', desc: 'Intermedio' },
  { value: '6TA', label: '6TA', desc: 'Principiante' },
]

const generos = [
  { value: 'femenil', label: 'Femenil' },
  { value: 'varonil', label: 'Varonil' },
]

const initialForm = { name: '', level: '5TA', gender: 'femenil', phone: '', photo_url: '' }

export default function Participants() {
  const { isOrganizer } = useAuth()
  const { participantsQuery, createParticipant, updateParticipant, deleteParticipant } = useParticipants()
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [dashboardPlayer, setDashboardPlayer] = useState(null)

  const participants = participantsQuery.data || []

  const resetForm = () => { setForm(initialForm); setEditing(null); setShowForm(false) }
  const openNew = () => { setForm(initialForm); setEditing(null); setShowForm(true) }
  const openEdit = (p, e) => {
    e.stopPropagation()
    setForm({ name: p.name, level: p.level, gender: p.gender, phone: p.phone || '', photo_url: p.photo_url || '' })
    setEditing(p); setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { 
      toast.error('El nombre es obligatorio'); 
      return 
    }
    try {
      // Convert empty strings to null for optional fields
      const formData = {
        ...form,
        phone: form.phone === '' ? null : form.phone,
        photo_url: form.photo_url === '' ? null : form.photo_url,
      }
      if (editing) { 
        await updateParticipant.mutateAsync({ id: editing.id, ...formData }); 
        toast.success('Jugador actualizado')
      } else { 
        await createParticipant.mutateAsync(formData); 
        toast.success('Jugador registrado')
      }
      resetForm(); 
      participantsQuery.refetch()
    } catch (err) { 
      toast.error(err.message || 'Error al guardar') 
    }
  }

  const handleDelete = async (e) => {
    e?.stopPropagation()
    if (!deleteTarget) return
    try { await deleteParticipant.mutateAsync(deleteTarget.id); toast.success(`${deleteTarget.name} eliminado`); setDeleteTarget(null); participantsQuery.refetch() }
    catch { toast.error('Error al eliminar') }
  }

  const filtered = participants.filter((p) => {
    if (search && !(p.name || '').toLowerCase().includes(search.toLowerCase())) return false
    if (filterLevel && p.level !== filterLevel) return false
    if (filterGender && p.gender !== filterGender) return false
    return true
  })

  const stats = {
    total: participants.length,
    femenil: participants.filter(p => p.gender === 'femenil').length,
    varonil: participants.filter(p => p.gender === 'varonil').length,
    levels: Object.fromEntries(niveles.map(n => [n.value, participants.filter(p => p.level === n.value).length])),
  }

  const isLoading = participantsQuery.isLoading
  const hasFilters = search || filterLevel || filterGender

  return (
    <div className="space-y-5">
      <PageHeader
        title="Jugadores"
        description={isLoading ? 'Cargando...' : `${participants.length} ${participants.length === 1 ? 'jugador registrado' : 'jugadores registrados'}`}
        action={isOrganizer && (
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            Nuevo jugador
          </Button>
        )}
      />

      {!isLoading && participants.length > 0 && (
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <span className="font-semibold text-foreground">{stats.total} total</span>
            <span className="text-fg-secondary">{stats.femenil} femenil</span>
            <span className="text-fg-secondary">{stats.varonil} varonil</span>
            <span className="w-px h-4 bg-border-subtle" />
            {niveles.filter(n => (stats.levels[n.value] || 0) > 0).map(n => (
              <span key={n.value} className="text-fg-secondary">{n.label}: {stats.levels[n.value]}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
          <Input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="pl-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Select value={filterLevel || 'all'} onValueChange={v => setFilterLevel(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[140px]">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue placeholder="Nivel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            {niveles.map(n => <SelectItem key={n.value} value={n.value}>{n.label} - {n.desc}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterGender || 'all'} onValueChange={v => setFilterGender(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[130px]">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            <SelectValue placeholder="Género" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {generos.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="border border-border-subtle flex">
          <button onClick={() => setViewMode('grid')} className={cn('p-1.5', viewMode === 'grid' ? 'bg-court/[0.1] text-court' : 'text-fg-muted hover:text-foreground')}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={cn('p-1.5', viewMode === 'list' ? 'bg-court/[0.1] text-court' : 'text-fg-muted hover:text-foreground')}>
            <List className="w-4 h-4" />
          </button>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterLevel(''); setFilterGender('') }} className="text-xs">
            Limpiar filtros
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className={cn('gap-3', viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-3')}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted w-24" />
                  <div className="h-3 bg-muted w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 card p-8">
          <div className="w-16 h-16 border border-border-subtle flex items-center justify-center mx-auto mb-4 bg-[hsl(var(--bg-elevated))]">
            {hasFilters ? <Search className="w-7 h-7 text-fg-muted" />
              : <Users className="w-7 h-7 text-fg-muted" />}
          </div>
          <p className="font-heading font-bold text-base mb-2">
            {hasFilters ? 'Sin resultados' : 'No hay jugadores'}
          </p>
          <p className="text-sm text-fg-muted max-w-sm mx-auto mb-6">
            {hasFilters ? 'Ningún jugador coincide con los filtros' : 'Registra jugadores para crear equipos y organizar ligas'}
          </p>
          {!hasFilters && isOrganizer && (
            <Button onClick={openNew}>
              <Plus className="w-5 h-5" />
              Registrar primer jugador
            </Button>
          )}
          {hasFilters && (
            <Button variant="outline" onClick={() => { setSearch(''); setFilterLevel(''); setFilterGender('') }}>Limpiar filtros</Button>
          )}
        </motion.div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <ParticipantCard key={p.id} participant={p} index={i} isOrganizer={isOrganizer}
                onClick={() => setDashboardPlayer(p)}
                onEdit={(e) => openEdit(p, e)}
                onDelete={(e) => { e.stopPropagation(); setDeleteTarget(p) }} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <ParticipantRow key={p.id} participant={p} index={i} isOrganizer={isOrganizer}
                onClick={() => setDashboardPlayer(p)}
                onEdit={(e) => openEdit(p, e)}
                onDelete={(e) => { e.stopPropagation(); setDeleteTarget(p) }} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <PlayerDashboard player={dashboardPlayer} open={!!dashboardPlayer} onClose={() => setDashboardPlayer(null)} />

      <Dialog open={showForm} onOpenChange={(o) => !o && resetForm()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-xl">
              {editing ? 'Editar jugador' : 'Nuevo jugador'}
            </DialogTitle>
            <DialogDescription>
              {editing ? 'Actualiza los datos del jugador' : 'Registra un nuevo jugador en el sistema'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-border-subtle">
              <div className="relative">
                <div className="w-16 h-16 bg-muted text-fg-muted flex items-center justify-center text-2xl font-bold border border-border-subtle">
                  {form.name ? form.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card border border-border-subtle flex items-center justify-center">
                  <Camera className="w-2.5 h-2.5 text-fg-muted" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{form.name || 'Nombre del jugador'}</p>
                <p className="text-xs text-fg-muted">{form.level} · {generos.find(g => g.value === form.gender)?.label || form.gender}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-fg-muted">Nombre completo <span className="text-destructive">*</span></Label>
              <div className="relative mt-1.5">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Juan Pérez" className="pl-9" required autoFocus />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-fg-muted">Nivel</Label>
                <Select value={form.level} onValueChange={v => setForm({ ...form, level: v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {niveles.map(n => (
                      <SelectItem key={n.value} value={n.value}>
                        <span className="font-medium">{n.label}</span>
                        <span className="text-fg-muted ml-1">— {n.desc}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-fg-muted">Género</Label>
                <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {generos.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-fg-muted">Teléfono <span className="font-normal text-fg-muted">(opcional)</span></Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="5215512345678" className="pl-9" />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-fg-muted">Foto URL <span className="font-normal text-fg-muted">(opcional)</span></Label>
              <div className="relative mt-1.5">
                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
                <Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://ejemplo.com/foto.jpg" className="pl-9" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button type="submit" disabled={createParticipant.isPending || updateParticipant.isPending}>
                {(createParticipant.isPending || updateParticipant.isPending) ? (
                  <><div className="w-4 h-4 border-[1.5px] border-white border-t-transparent animate-spin rounded-sm" /> Guardando...</>
                ) : editing ? (
                  <><Pencil className="w-4 h-4" /> Guardar cambios</>
                ) : (
                  <><Plus className="w-4 h-4" /> Registrar</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/[0.1] border border-destructive/[0.2] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg">Eliminar jugador</DialogTitle>
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
  )
}

function ParticipantCard({ participant: p, index, isOrganizer, onClick, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02, type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      className="card-highlight p-4 group"
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          {p.photo_url ? (
            <img src={p.photo_url} alt={p.name} className="w-14 h-14 object-cover object-top shrink-0 border border-border-subtle" />
          ) : (
            <div className="w-14 h-14 flex items-center justify-center text-fg-muted text-xl font-bold shrink-0 bg-muted border border-border-subtle">
              {(p.name || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute -bottom-1.5 -right-1.5 pill pill-blue text-[10px] px-1.5 py-px">
            {p.level}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
          <span className="text-xs text-fg-muted">{p.gender}</span>
        </div>

        {isOrganizer && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center hover:bg-muted">
              <Pencil className="w-3 h-3 text-fg-muted" />
            </button>
            <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center hover:bg-destructive/[0.1]">
              <Trash2 className="w-3 h-3 text-destructive/60" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between">
        <span className="text-xs text-fg-muted flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Zap className="w-2.5 h-2.5" />
          Ver estadísticas
        </span>
      </div>
    </motion.div>
  )
}

function ParticipantRow({ participant: p, index, isOrganizer, onClick, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 5 }}
      transition={{ delay: index * 0.015 }}
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 card-highlight group"
    >
      {p.photo_url ? (
        <img src={p.photo_url} alt={p.name} className="w-10 h-10 object-cover object-top shrink-0 border border-border-subtle" />
      ) : (
        <div className="w-10 h-10 bg-muted flex items-center justify-center text-fg-muted font-bold shrink-0 border border-border-subtle">
          {(p.name || '?').charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{p.name}</p>
        <p className="text-xs text-fg-muted truncate flex items-center gap-1">
          <span className="pill pill-blue text-[10px] px-1.5 py-px">{p.level}</span>
          · {p.gender}
          {p.phone && ` · ${p.phone}`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-fg-muted flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Zap className="w-2.5 h-2.5" />
          Stats
        </span>
        {isOrganizer && (
          <div className="flex gap-1">
            <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center hover:bg-muted">
              <Pencil className="w-3 h-3 text-fg-muted" />
            </button>
            <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center hover:bg-destructive/[0.1]">
              <Trash2 className="w-3 h-3 text-destructive/60" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
