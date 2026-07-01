import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Trophy, Users, Calendar, Check, Loader2, Settings } from 'lucide-react'
import { toast } from 'sonner'
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
import { ScheduleBuilder } from './ScheduleBuilder'

const steps = [
  { id: 'info', label: 'Información', icon: Trophy },
  { id: 'equipos', label: 'Equipos', icon: Users },
  { id: 'horarios', label: 'Horarios', icon: Calendar },
  { id: 'revisar', label: 'Revisar', icon: Check },
]

const sportOptions = [{ value: 'padel', label: 'Pádel' }]
const genderOptions = [
  { value: 'femenil', label: 'Femenil' },
  { value: 'varonil', label: 'Varonil' },
  { value: 'mixto', label: 'Mixto' },
]
const categoryOptions = [
  { value: '1RA', label: '1ra' },
  { value: '2DA', label: '2da' },
  { value: '3RA', label: '3ra' },
  { value: '4TA', label: '4ta' },
  { value: '5TA', label: '5ta' },
]
const setsOptions = [
  { value: '1', label: '1 set' },
  { value: '2', label: '2 sets (mejor de 3)' },
  { value: '3', label: '3 sets' },
]
const formatOptions = [
  { value: 'todos-contra-todos', label: 'Todos contra todos' },
  { value: 'round-robin-express', label: 'Round Robin Express' },
  { value: 'grupos-y-eliminatorias', label: 'Grupos + eliminatorias' },
  { value: 'eliminatoria-directa', label: 'Eliminatoria directa' },
]

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 60 : -60, opacity: 0 }),
}

export default function LeagueSetupWizard() {
  const navigate = useNavigate()
  const { leagueId } = useParams()
  const { user, profile } = useAuth()
  const { leagueQuery, createLeague, updateLeague } = useLeagues()
  const { data: existingLeague } = leagueQuery(leagueId)
  const { participantsQuery } = useParticipants()
  const isEditing = !!leagueId

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    sport: 'padel',
    gender: 'femenil',
    season: '2026-1',
    categories: ['5TA'],
    status: 'proxima',
    color: 'hsl(var(--primary))',
    sets_per_match: '2',
    tiebreak_enabled: true,
    organizer_name: profile?.display_name || '',
    organizer_whatsapp: '',
    organizer_instagram: '',
    category_formats: {},
  })

  const [teams, setTeams] = useState([])
  const [schedules, setSchedules] = useState([])
  const participants = participantsQuery.data || []

  useEffect(() => {
    if (existingLeague && isEditing) {
      setForm({
        name: existingLeague.name || '',
        slug: existingLeague.slug || '',
        sport: existingLeague.sport || 'padel',
        gender: existingLeague.gender || 'femenil',
        status: existingLeague.status || 'proxima',
        season: existingLeague.season || '',
        color: existingLeague.color || 'hsl(var(--primary))',
        organizer_name: existingLeague.organizer_name || '',
        organizer_whatsapp: existingLeague.organizer_whatsapp || '',
        organizer_instagram: existingLeague.organizer_instagram || '',
        categories: existingLeague.categories || [],
        sets_per_match: existingLeague.sets_per_match ? String(existingLeague.sets_per_match) : '2',
        tiebreak_enabled: existingLeague.tiebreak_enabled ?? true,
        category_formats: existingLeague.category_formats || {},
      })
    }
  }, [existingLeague, isEditing])

  const generateSlug = (name) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const validateStep = (s) => {
    if (s === 0) {
      if (!form.name.trim()) { toast.error('El nombre de la liga es obligatorio'); return false }
      return true
    }
    if (s === 1) {
      if (teams.length < 2) { toast.error('Crea al menos 2 equipos'); return false }
      return true
    }
    if (s === 2) {
      if (schedules.length < 1) { toast.error('Agrega al menos 1 partido al calendario'); return false }
      return true
    }
    return true
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setDirection(1)
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const goBack = () => {
    if (step === 0) { navigate('/ligas'); return }
    setDirection(-1)
    setStep((s) => s - 1)
  }

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      const leagueData = {
        ...form,
        slug: isEditing ? form.slug : `${generateSlug(form.name) || 'liga'}-${Math.random().toString(36).slice(2, 6)}`,
        organizer_id: user?.id,
        sets_per_match: parseInt(form.sets_per_match),
      }
      let savedLeague
      if (isEditing) savedLeague = await updateLeague.mutateAsync({ id: leagueId, ...leagueData })
      else savedLeague = await createLeague.mutateAsync(leagueData)

      if (teams.length > 0 && savedLeague?.id) {
        const nameToId = {}
        participants.forEach((p) => { nameToId[p.name?.toLowerCase().trim()] = p.id })

        const teamsData = []
        for (const t of teams) {
          let p1Id = t.player1_id
          let p2Id = t.player2_id

          if (typeof p1Id === 'string' && p1Id.startsWith('temp-')) {
            const key = (t.player1_name || '').toLowerCase().trim()
            if (nameToId[key]) {
              p1Id = nameToId[key]
            } else {
              const { data: newP, error: errP } = await supabase.from('participants').insert({ name: t.player1_name || 'Jugador' }).select().single()
              if (!errP && newP) { nameToId[key] = newP.id; p1Id = newP.id }
            }
          }

          if (typeof p2Id === 'string' && p2Id.startsWith('temp-')) {
            const key = (t.player2_name || '').toLowerCase().trim()
            if (nameToId[key]) {
              p2Id = nameToId[key]
            } else {
              const { data: newP, error: errP } = await supabase.from('participants').insert({ name: t.player2_name || 'Jugador' }).select().single()
              if (!errP && newP) { nameToId[key] = newP.id; p2Id = newP.id }
            }
          }

          teamsData.push({
            league_id: savedLeague.id,
            category: t.category,
            team_number: t.team_number,
            player1_id: p1Id,
            player2_id: p2Id,
            team_name: t.team_name || 'Equipo ' + t.team_number,
            group: t.group || null,
          })
        }

        const { data: savedTeams, error: teamsErr } = await supabase.from('teams').insert(teamsData).select()
        if (teamsErr) console.error('Teams error:', teamsErr)
        const teamIdMap = {}
        if (savedTeams && savedTeams.length > 0) {
          teamsData.forEach((td, i) => {
            if (teams[i] && savedTeams[i]) teamIdMap[teams[i].id] = savedTeams[i].id
          })
        }
        queryClient.invalidateQueries({ queryKey: ['teams', savedLeague.id] })
      }

      if (schedules.length > 0 && savedLeague?.id) {
        const matchesData = schedules.map((s) => ({
          league_id: savedLeague.id,
          category: s.category,
          round: s.round,
          match_number: s.match_number,
          team1_id: teamIdMap?.[s.team1_id] || s.team1_id,
          team2_id: teamIdMap?.[s.team2_id] || s.team2_id,
          team1_name: s.team1_name,
          team2_name: s.team2_name,
          status: s.status || 'programado',
          scheduled_date: s.scheduled_date || null,
          scheduled_time: s.scheduled_time || null,
          court: s.court || null,
        }))
        const { error: matchesErr } = await supabase.from('matches').insert(matchesData)
        if (matchesErr) console.error('Matches error:', matchesErr)
        queryClient.invalidateQueries({ queryKey: ['matches', savedLeague.id] })
      }

      navigate('/ligas/' + savedLeague.id)
    } catch (e) {
      toast.error('Error: ' + (e?.message || e?.error?.message || 'Error desconocido'))
      setSaving(false)
    }
  }

  const completedCount = step
  const progressPercent = (completedCount / (steps.length - 1)) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Nueva Liga</h1>
          <p className="text-muted-foreground mt-1">Crea una nueva liga paso a paso</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Background line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0" />
            {/* Progress line */}
            <motion.div
              className="absolute top-5 left-0 h-0.5 bg-primary z-[1]"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />

            {steps.map((s, i) => {
              const isCompleted = i < step
              const isCurrent = i === step
              return (
                <div key={s.id} className="flex flex-col items-center relative z-10">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground border border-border'
                    }`}
                    animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : i + 1}
                  </motion.div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${isCurrent ? 'text-foreground' : isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="p-6 sm:p-8"
            >
              {/* Step 0: Información básica */}
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">Información básica</h2>
                    <p className="text-sm text-muted-foreground mt-1">Datos generales de la liga</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label>Nombre de la liga *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => { const n = e.target.value; handleChange('name', n); if (!form.slug) handleChange('slug', generateSlug(n)) }}
                        placeholder="Ej: Liga de Pádel Primavera 2026"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Deporte</Label>
                      <Select value={form.sport} onValueChange={handleChange.bind(null, 'sport')}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                          {sportOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Género</Label>
                      <Select value={form.gender} onValueChange={handleChange.bind(null, 'gender')}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Temporada</Label>
                      <Input value={form.season} onChange={(e) => handleChange('season', e.target.value)} placeholder="Ej: 2026-1" className="mt-1.5" />
                    </div>

                    <div>
                      <Label>Categoría principal</Label>
                      <Select value={form.categories[0] || '5TA'} onValueChange={(v) => handleChange('categories', [v])}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Sets por partido</Label>
                      <Select value={form.sets_per_match} onValueChange={handleChange.bind(null, 'sets_per_match')}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                          {setsOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.tiebreak_enabled}
                          onChange={(e) => handleChange('tiebreak_enabled', e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                        <span className="text-sm">Tiebreak habilitado</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-border pt-5">
                    <h3 className="font-medium text-sm mb-3">Datos del organizador</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label>Nombre</Label>
                        <Input value={form.organizer_name} onChange={(e) => handleChange('organizer_name', e.target.value)} placeholder="Nombre del organizador" className="mt-1.5" />
                      </div>
                      <div>
                        <Label>WhatsApp</Label>
                        <Input value={form.organizer_whatsapp} onChange={(e) => handleChange('organizer_whatsapp', e.target.value)} placeholder="5215512345678" className="mt-1.5" />
                      </div>
                      <div>
                        <Label>Instagram</Label>
                        <Input value={form.organizer_instagram} onChange={(e) => handleChange('organizer_instagram', e.target.value)} placeholder="usuario (sin @)" className="mt-1.5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Seleccionar equipos */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">Seleccionar equipos</h2>
                    <p className="text-sm text-muted-foreground mt-1">Agrega los equipos participantes</p>
                  </div>
                  <PlayerPickerPanel
                    participants={participantsQuery.data || []}
                    categories={form.categories}
                    teams={teams}
                    onTeamsChange={setTeams}
                  />
                </div>
              )}

              {/* Step 2: Configurar horarios */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">Configurar horarios</h2>
                    <p className="text-sm text-muted-foreground mt-1">Programa los partidos de la liga</p>
                  </div>
                  <ScheduleBuilder
                    leagueId={null}
                    teams={teams}
                    schedules={schedules}
                    onSchedulesChange={setSchedules}
                  />
                </div>
              )}

              {/* Step 3: Revisar y crear */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">Revisar y crear</h2>
                    <p className="text-sm text-muted-foreground mt-1">Verifica la información antes de crear la liga</p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-border p-4">
                      <h3 className="font-medium text-sm text-muted-foreground mb-3">Información general</h3>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Nombre:</span> <span className="font-medium">{form.name}</span></div>
                        <div><span className="text-muted-foreground">Deporte:</span> <span className="font-medium">{sportOptions.find((o) => o.value === form.sport)?.label}</span></div>
                        <div><span className="text-muted-foreground">Género:</span> <span className="font-medium">{genderOptions.find((o) => o.value === form.gender)?.label}</span></div>
                        <div><span className="text-muted-foreground">Temporada:</span> <span className="font-medium">{form.season}</span></div>
                        <div><span className="text-muted-foreground">Categorías:</span> <span className="font-medium">{form.categories.join(', ')}</span></div>
                        <div><span className="text-muted-foreground">Sets:</span> <span className="font-medium">{form.sets_per_match}</span></div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-4">
                      <h3 className="font-medium text-sm text-muted-foreground mb-3">Equipos ({teams.length})</h3>
                      {teams.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No se han agregado equipos</p>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-2">
                          {teams.map((t, i) => (
                            <div key={i} className="text-sm flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">{i + 1}</span>
                              <span>{t.team_name || `Equipo ${t.team_number}`}</span>
                              <span className="text-muted-foreground text-xs">({t.category})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border border-border p-4">
                      <h3 className="font-medium text-sm text-muted-foreground mb-3">Calendario ({schedules.length} partidos)</h3>
                      {schedules.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No se han programado partidos</p>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {schedules.length} partidos programados en {form.categories.length} categoría(s)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={goBack}
            className="rounded-lg transition-all active:scale-[0.98]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {step === 0 ? 'Cancelar' : 'Atrás'}
          </Button>

          {step < steps.length - 1 ? (
            <Button
              onClick={goNext}
              className="rounded-lg transition-all active:scale-[0.98]"
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg transition-all active:scale-[0.98]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear liga'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
