import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Trophy, Settings, Users, Calendar, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useLeagues } from '@/hooks/useLeagues'
import { useParticipants } from '@/hooks/useParticipants'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { queryClient } from '@/lib/query-client'
import { demoData } from '@/lib/demo-data'
import { PlayerPickerPanel } from './PlayerPickerPanel'

const steps = [
  { id: 'basicos', label: 'Datos básicos', icon: Trophy },
  { id: 'config', label: 'Configuración', icon: Settings },
  { id: 'equipos', label: 'Equipos', icon: Users },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
]

export default function LeagueSetupWizard() {
  const navigate = useNavigate()
  const { leagueId } = useParams()
  const { user } = useAuth()
  const { leagueQuery, createLeague, updateLeague } = useLeagues()
  const { data: existingLeague } = leagueQuery(leagueId)
  const { participantsQuery } = useParticipants()
  const isEditing = !!leagueId

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    sport: 'padel',
    gender: 'femenil',
    season: `2026-1`,
    categories: ['5TA'],
    status: 'proxima',
    color: '#c96442',
    sets_per_match: 2,
    tiebreak_enabled: true,
    organizer_name: '',
    organizer_whatsapp: '',
    organizer_instagram: '',
    category_formats: {},
  })

  const [teams, setTeams] = useState([])
  const [categoryInput, setCategoryInput] = useState('')

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const addCategory = () => {
    if (categoryInput && !form.categories.includes(categoryInput)) {
      handleChange('categories', [...form.categories, categoryInput])
      setCategoryInput('')
    }
  }

  const removeCategory = (cat) => {
    handleChange('categories', form.categories.filter((c) => c !== cat))
  }

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  const handleSave = async () => {
    if (!form.name) return

    const leagueData = {
      ...form,
      slug: form.slug || generateSlug(form.name),
      organizer_id: user?.id,
    }

    let savedLeague
    if (isEditing) {
      savedLeague = await updateLeague.mutateAsync({ id: leagueId, ...leagueData })
    } else {
      savedLeague = await createLeague.mutateAsync(leagueData)
    }

    if (teams.length > 0 && savedLeague?.id) {
      const teamRecords = teams.map((t) => ({
        league_id: savedLeague.id,
        category: t.category,
        team_number: t.team_number,
        player1_id: t.player1_id,
        player2_id: t.player2_id,
        team_name: `Equipo ${t.team_number}`,
      }))
      const { error } = await supabase.from('teams').insert(teamRecords).select()
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ['teams', savedLeague.id] })
      } else {
        teamRecords.forEach(t => demoData.teams.push({ id: `t-${Date.now()}-${t.team_number}`, ...t }))
      }
    }

    navigate(savedLeague ? `/ligas/${savedLeague.id}` : '/ligas')
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${i <= step ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl p-6 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {step === 0 && <BasicInfo form={form} onChange={handleChange} generateSlug={generateSlug} />}
            {step === 1 && (
              <CategoryConfig
                form={form}
                onChange={handleChange}
                categoryInput={categoryInput}
                setCategoryInput={setCategoryInput}
                addCategory={addCategory}
                removeCategory={removeCategory}
              />
            )}
            {step === 2 && (
              <PlayerPickerPanel
                participants={participantsQuery.data || []}
                categories={form.categories}
                teams={teams}
                onTeamsChange={setTeams}
              />
            )}
            {step === 3 && (
              <SchedulePreview
                teams={teams}
                form={form}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => step === 0 ? navigate('/ligas') : setStep(step - 1)}>
          <ChevronLeft className="w-4 h-4" />
          {step === 0 ? 'Cancelar' : 'Anterior'}
        </Button>

        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSave}>
            <Check className="w-4 h-4" />
            {isEditing ? 'Guardar cambios' : 'Crear liga'}
          </Button>
        )}
      </div>
    </div>
  )
}

function BasicInfo({ form, onChange, generateSlug }) {
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-xl font-semibold">Datos básicos</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label>Nombre de la liga</Label>
          <Input
            value={form.name}
            onChange={(e) => {
              const name = e.target.value
              onChange('name', name)
              if (!form.slug) onChange('slug', generateSlug(name))
            }}
            placeholder="Ej: Liga de Padel Primavera 2026"
          />
        </div>
        <div>
          <Label>Slug (URL)</Label>
          <Input value={form.slug} onChange={(e) => onChange('slug', e.target.value)} />
        </div>
        <div>
          <Label>Temporada</Label>
          <Input value={form.season} onChange={(e) => onChange('season', e.target.value)} />
        </div>
        <div>
          <Label>Deporte</Label>
          <Select value={form.sport} onValueChange={(v) => onChange('sport', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="padel">Pádel</SelectItem>
              <SelectItem value="tenis">Tenis</SelectItem>
              <SelectItem value="squash">Squash</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Género</Label>
          <Select value={form.gender} onValueChange={(v) => onChange('gender', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="femenil">Femenil</SelectItem>
              <SelectItem value="varonil">Varonil</SelectItem>
              <SelectItem value="mixto">Mixto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Color distintivo</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={form.color}
              onChange={(e) => onChange('color', e.target.value)}
              className="w-10 h-10 rounded-md border border-input bg-transparent cursor-pointer"
            />
            <Input value={form.color} onChange={(e) => onChange('color', e.target.value)} className="flex-1" />
          </div>
        </div>
        <div>
          <Label>Estado</Label>
          <Select value={form.status} onValueChange={(v) => onChange('status', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proxima">Próxima</SelectItem>
              <SelectItem value="activa">Activa</SelectItem>
              <SelectItem value="finalizada">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="font-medium text-sm mb-3">Organizador</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Nombre</Label>
            <Input value={form.organizer_name} onChange={(e) => onChange('organizer_name', e.target.value)} />
          </div>
          <div>
            <Label>WhatsApp (con código)</Label>
            <Input value={form.organizer_whatsapp} onChange={(e) => onChange('organizer_whatsapp', e.target.value)} placeholder="5215512345678" />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input value={form.organizer_instagram} onChange={(e) => onChange('organizer_instagram', e.target.value)} placeholder="sin @" />
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryConfig({ form, onChange, categoryInput, setCategoryInput, addCategory, removeCategory }) {
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-xl font-semibold">Configuración</h2>

      <div>
        <Label>Categorías</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value.toUpperCase())}
            placeholder="Ej: 5TA"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
          />
          <Button type="button" variant="outline" onClick={addCategory}>Agregar</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {form.categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
            >
              {cat}
              <button onClick={() => removeCategory(cat)} className="hover:text-destructive">&times;</button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Sets por partido</Label>
          <Select value={String(form.sets_per_match)} onValueChange={(v) => onChange('sets_per_match', parseInt(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 set</SelectItem>
              <SelectItem value="2">2 sets (al mejor de 3)</SelectItem>
              <SelectItem value="3">3 sets</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.tiebreak_enabled}
              onChange={(e) => onChange('tiebreak_enabled', e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary"
            />
            <span className="text-sm">Tiebreak habilitado</span>
          </label>
        </div>
      </div>

      {form.categories.length > 0 && (
        <div>
          <h3 className="font-medium text-sm mb-2">Formato por categoría (opcional)</h3>
          {form.categories.map((cat) => (
            <div key={cat} className="flex items-center gap-2 mb-2">
              <span className="text-sm w-12 font-medium">{cat}</span>
              <Select
                value={form.category_formats[cat] || ''}
                onValueChange={(v) =>
                  onChange('category_formats', {
                    ...form.category_formats,
                    [cat]: v,
                  })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Formato por defecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Formato por defecto</SelectItem>
                  <SelectItem value="todos-contra-todos">Todos contra todos</SelectItem>
                  <SelectItem value="grupos-y-eliminatorias">Grupos + eliminatorias</SelectItem>
                  <SelectItem value="eliminatoria-directa">Eliminatoria directa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SchedulePreview({ teams, form }) {
  const totalTeams = teams.length
  const rounds = totalTeams > 1 ? totalTeams - 1 : 0
  const matchesPerRound = Math.floor(totalTeams / 2)

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-xl font-semibold">Calendario</h2>
      <p className="text-sm text-muted-foreground">Vista previa de la estructura del calendario</p>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background rounded-lg p-4 text-center">
          <p className="text-2xl font-heading font-bold text-primary">{totalTeams}</p>
          <p className="text-xs text-muted-foreground">Equipos</p>
        </div>
        <div className="bg-background rounded-lg p-4 text-center">
          <p className="text-2xl font-heading font-bold text-primary">{rounds}</p>
          <p className="text-xs text-muted-foreground">Jornadas</p>
        </div>
        <div className="bg-background rounded-lg p-4 text-center">
          <p className="text-2xl font-heading font-bold text-primary">{rounds * matchesPerRound}</p>
          <p className="text-xs text-muted-foreground">Partidos totales</p>
        </div>
      </div>

      {totalTeams >= 2 ? (
        <div className="bg-background rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Distribución por categoría:</p>
          {form.categories.map((cat) => {
            const catTeams = teams.filter((t) => t.category === cat).length
            const r = catTeams > 1 ? catTeams - 1 : 0
            const m = Math.floor(catTeams / 2)
            return (
              <div key={cat} className="text-sm text-muted-foreground flex justify-between py-1">
                <span>{cat}</span>
                <span>{catTeams} equipos · {r} jornadas · {r * m} partidos</span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Registra equipos en el paso anterior para ver la estructura del calendario
        </p>
      )}
    </div>
  )
}
