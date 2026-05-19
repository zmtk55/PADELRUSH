import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Trophy, Settings, Users, Calendar, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useLeagues } from '@/hooks/useLeagues'
import { useParticipants } from '@/hooks/useParticipants'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { queryClient } from '@/lib/query-client'
import { PlayerPickerPanel } from './PlayerPickerPanel'

const steps = [
  { id: 'basicos', label: 'Datos básicos', icon: Trophy },
  { id: 'config', label: 'Configuración', icon: Settings },
  { id: 'equipos', label: 'Equipos', icon: Users },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
]

const sportOptions = [
  { value: 'padel', label: 'Pádel' },
]

const genderOptions = [
  { value: 'femenil', label: 'Femenil' },
  { value: 'varonil', label: 'Varonil' },
  { value: 'mixto', label: 'Mixto' },
]

const statusOptions = [
  { value: 'proxima', label: 'Próxima' },
  { value: 'activa', label: 'Activa' },
  { value: 'finalizada', label: 'Finalizada' },
]

const setsOptions = [
  { value: '1', label: '1 set' },
  { value: '2', label: '2 sets (al mejor de 3)' },
  { value: '3', label: '3 sets' },
]

const formatOptions = [
  { value: 'todos-contra-todos', label: 'Todos contra todos' },
  { value: 'grupos-y-eliminatorias', label: 'Grupos + eliminatorias' },
  { value: 'eliminatoria-directa', label: 'Eliminatoria directa' },
]

export default function LeagueSetupWizard() {
  const navigate = useNavigate()
  const { leagueId } = useParams()
  const { user, profile } = useAuth()
  const { leagueQuery, createLeague, updateLeague } = useLeagues()
  const { data: existingLeague } = leagueQuery(leagueId)
  const { participantsQuery } = useParticipants()
  const isEditing = !!leagueId

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  
  // Usar strings para los selects
  const [form, setForm] = useState({
    name: '',
    slug: '',
    sport: 'padel',
    gender: 'femenil',
    season: '2026-1',
    categories: ['5TA'],
    status: 'proxima',
    color: '#c96442',
    sets_per_match: '2', // string ahora
    tiebreak_enabled: true,
    organizer_name: profile?.display_name || '',
    organizer_whatsapp: '',
    organizer_instagram: '',
    category_formats: {},
  })

  const [teams, setTeams] = useState([])
  const [categoryInput, setCategoryInput] = useState('')

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const addCategory = () => {
    const c = categoryInput.toUpperCase().trim()
    if (c && !form.categories.includes(c)) {
      handleChange('categories', [...form.categories, c])
      setCategoryInput('')
    }
  }

  const removeCategory = cat => handleChange('categories', form.categories.filter(c => c !== cat))

  const generateSlug = name => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      const leagueData = {
        ...form,
        slug: form.slug || generateSlug(form.name),
        organizer_id: user?.id,
        sets_per_match: parseInt(form.sets_per_match),
      }
      let savedLeague
      if (isEditing) savedLeague = await updateLeague.mutateAsync({ id: leagueId, ...leagueData })
      else savedLeague = await createLeague.mutateAsync(leagueData)

      if (teams.length > 0 && savedLeague?.id) {
        const { error: teamsErr } = await supabase.from('teams').insert(
          teams.map(t => ({ league_id: savedLeague.id, category: t.category, team_number: t.team_number, player1_id: t.player1_id, player2_id: t.player2_id, team_name: `Equipo ${t.team_number}` }))
        )
        if (teamsErr) console.error('Teams error:', teamsErr)
        queryClient.invalidateQueries({ queryKey: ['teams', savedLeague.id] })
      }
      navigate(`/ligas/${savedLeague.id}`)
    } catch (e) {
      alert('Error: ' + (e?.message || e?.error?.message || 'Error desconocido'))
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i < step ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${i <= step ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-card border border-border rounded-xl p-6 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            
            {/* Step 0: Datos básicos */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold">Datos básicos</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label>Nombre de la liga *</Label>
                    <Input value={form.name} onChange={e => { const n = e.target.value; handleChange('name', n); if (!form.slug) handleChange('slug', generateSlug(n)) }} placeholder="Ej: Liga de Padel Primavera 2026" />
                  </div>
                  
                  <div>
                    <Label>Deporte</Label>
                    <Select value={form.sport} onValueChange={handleChange.bind(null, 'sport')}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {sportOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Género</Label>
                    <Select value={form.gender} onValueChange={handleChange.bind(null, 'gender')}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {genderOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Estado</Label>
                    <Select value={form.status} onValueChange={handleChange.bind(null, 'status')}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Temporada</Label>
                    <Input value={form.season} onChange={e => handleChange('season', e.target.value)} placeholder="Ej: 2026-1" />
                  </div>
                  
                  <div>
                    <Label>Slug (URL)</Label>
                    <Input value={form.slug} onChange={e => handleChange('slug', e.target.value)} placeholder="liga-padel-primavera-2026" />
                  </div>
                  
                  <div>
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      <input type="color" value={form.color} onChange={e => handleChange('color', e.target.value)} className="w-10 h-10 rounded-md border border-input bg-transparent cursor-pointer" />
                      <Input value={form.color} onChange={e => handleChange('color', e.target.value)} className="flex-1" />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <h3 className="font-medium text-sm mb-3">Datos del organizador</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre</Label>
                      <Input value={form.organizer_name} onChange={e => handleChange('organizer_name', e.target.value)} placeholder="Nombre del organizador" />
                    </div>
                    <div>
                      <Label>WhatsApp</Label>
                      <Input value={form.organizer_whatsapp} onChange={e => handleChange('organizer_whatsapp', e.target.value)} placeholder="5215512345678" />
                    </div>
                    <div>
                      <Label>Instagram</Label>
                      <Input value={form.organizer_instagram} onChange={e => handleChange('organizer_instagram', e.target.value)} placeholder="usuario (sin @)" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Configuración */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold">Configuración</h2>
                
                <div>
                  <Label>Categorías</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={categoryInput} onChange={e => setCategoryInput(e.target.value.toUpperCase())} placeholder="Ej: 5TA" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategory())} />
                    <Button type="button" variant="outline" onClick={addCategory}>Agregar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.categories.map(cat => (
                      <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        {cat} 
                        <button type="button" onClick={() => removeCategory(cat)} className="hover:text-destructive font-bold">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Sets por partido</Label>
                    <Select value={form.sets_per_match} onValueChange={handleChange.bind(null, 'sets_per_match')}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {setsOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.tiebreak_enabled} onChange={e => handleChange('tiebreak_enabled', e.target.checked)} className="w-4 h-4 rounded border-border text-primary" />
                      <span className="text-sm">Tiebreak habilitado</span>
                    </label>
                  </div>
                </div>
                
                {form.categories.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm mb-2">Formato por categoría</h3>
                    {form.categories.map(cat => (
                      <div key={cat} className="flex items-center gap-2 mb-2">
                        <span className="text-sm w-12 font-medium">{cat}</span>
                        <Select 
                          value={form.category_formats?.[cat] || 'todos-contra-todos'} 
                          onValueChange={v => setForm(f => ({ ...f, category_formats: { ...f.category_formats, [cat]: v } }))}
                        >
                          <SelectTrigger className="flex-1"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                          <SelectContent>
                            {formatOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Equipos */}
            {step === 2 && (
              <PlayerPickerPanel 
                participants={participantsQuery.data || []} 
                categories={form.categories} 
                teams={teams} 
                onTeamsChange={setTeams} 
              />
            )}

            {/* Step 3: Calendario */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold">Vista previa del calendario</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-background rounded-lg p-4 text-center">
                    <p className="text-2xl font-heading font-bold text-primary">{teams.length}</p>
                    <p className="text-xs text-muted-foreground">Equipos</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 text-center">
                    <p className="text-2xl font-heading font-bold text-primary">{teams.length > 1 ? teams.length - 1 : 0}</p>
                    <p className="text-xs text-muted-foreground">Jornadas</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 text-center">
                    <p className="text-2xl font-heading font-bold text-primary">{teams.length >= 2 ? Math.ceil(teams.length * (teams.length - 1) / 2) : 0}</p>
                    <p className="text-xs text-muted-foreground">Partidos</p>
                  </div>
                </div>
                
                {teams.length >= 2 && form.categories.length > 0 && (
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Por categoría:</p>
                    {form.categories.map(cat => {
                      const catTeams = teams.filter(t => t.category === cat).length
                      const jornadas = catTeams > 1 ? catTeams - 1 : 0
                      const partidos = catTeams >= 2 ? Math.ceil(catTeams * (catTeams - 1) / 2) : 0
                      return (
                        <div key={cat} className="text-sm text-muted-foreground flex justify-between py-1">
                          <span className="font-medium">{cat}</span>
                          <span>{catTeams} equipos · {jornadas} jornadas · {partidos} partidos</span>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {teams.length < 2 && (
                  <p className="text-sm text-muted-foreground text-center py-8 text-amber-600">
                    Agrega al menos 2 equipos en el paso anterior para ver la estructura completa
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => step === 0 ? navigate('/ligas') : setStep(step - 1)}>
          <ChevronLeft className="w-4 h-4" /> {step === 0 ? 'Cancelar' : 'Anterior'}
        </Button>
        
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            Siguiente <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={saving}>
            <Check className="w-4 h-4" />
            {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear liga'}
          </Button>
        )}
      </div>
    </div>
  )
}