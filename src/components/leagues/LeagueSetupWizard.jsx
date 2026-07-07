import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Trophy, Settings, Users, Calendar, Check, Currency, HelpCircle, Trash2, Save } from 'lucide-react'
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
import PricingEditor from './PricingEditor'
import { toast } from 'sonner'

const steps = [
  { id: 'basicos', label: 'Datos básicos', icon: Trophy },
  { id: 'config', label: 'Configuración', icon: Settings },
  { id: 'equipos', label: 'Equipos', icon: Users },
  { id: 'precios', label: 'Precios', icon: Currency },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'revision', label: 'Revisión', icon: Check },
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
  { value: 'round-robin-express', label: 'Round Robin Express' },
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
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [errors, setErrors] = useState({})
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const formRef = useRef(null)

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
    // Pricing fields (new)
    inscriptionFee: 0,
    arbitrationCostPerMatch: 0,
    prizePool: 0,
    operationalCosts: 0,
  })

  const [teams, setTeams] = useState([])
  const [categoryInput, setCategoryInput] = useState('')

  // Load draft from localStorage on mount
  useEffect(() => {
    const draftKey = `leagueDraft_${user?.id || 'anon'}`
    const saved = localStorage.getItem(draftKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Only load if it's a draft (not a saved league)
        if (parsed && parsed._isDraft) {
          setForm(parsed.form)
          setTeams(parsed.teams)
          setCategoryInput(parsed.categoryInput || '')
          setDraftLoaded(true)
          toast.info('Borrador recuperado')
        }
      } catch (e) {
        console.error('Error loading draft', e)
      }
    }
    // Enable draft saving
    const handleStorage = (e) => {
      if (e.key?.startsWith('leagueDraft_') && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed && parsed._isDraft) {
            setForm(parsed.form)
            setTeams(parsed.teams)
            setCategoryInput(parsed.categoryInput || '')
          }
        } catch (err) {}
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [user?.id])

  // Save draft to localStorage on changes
  useEffect(() => {
    if (!draftLoaded) return
    const draftKey = `leagueDraft_${user?.id || 'anon'}`
    const draft = {
      _isDraft: true,
      form,
      teams,
      categoryInput,
      timestamp: Date.now(),
    }
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft))
    } catch (e) {
      console.error('Error saving draft', e)
    }
  }, [draftLoaded, form, teams, categoryInput, user?.id])

  // Clear draft on successful save or cancel
  const clearDraft = () => {
    const draftKey = `leagueDraft_${user?.id || 'anon'}`
    localStorage.removeItem(draftKey)
  }

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Check if form is dirty compared to initial state
      const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm) ||
        JSON.stringify(teams) !== JSON.stringify(initialTeams) ||
        categoryInput !== initialCategoryInput
      if (isDirty && !saving) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [form, teams, categoryInput, saving, initialForm, initialTeams, initialCategoryInput])

  // Initial values for dirty check
  const [initialForm, setInitialForm] = useState(form)
  const [initialTeams, setInitialTeams] = useState(teams)
  const [initialCategoryInput, setInitialCategoryInput] = useState(categoryInput)

  // Update initial values when we load existing league or reset
  useEffect(() => {
    if (isEditing && existingLeague) {
      setInitialForm({
        ...form,
        sets_per_match: String(existingLeague.sets_per_match),
      })
      setInitialTeams(existingLeague.teams || [])
      setInitialCategoryInput('')
    } else {
      setInitialForm(form)
      setInitialTeams(teams)
      setInitialCategoryInput(categoryInput)
    }
  }, [isExistingLeagueExists(), form, teams, categoryIndex])

  const isExistingLeagueExists = () => !!existingLeague

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const addCategory = () => {
    const c = categoryInput.toUpperCase().trim()
    if (c && !form.categories.includes(c)) {
      setForm(f => ({ ...f, categories: [...f.categories, c] }))
      setCategoryInput('')
    }
  }

  const removeCategory = (cat) => {
    setForm(f => ({ ...f, categories: f.categories.filter(c => c !== cat) }))
    // Also remove any teams in that category
    setTeams(t => t.filter(t => t.category !== cat))
  }

  const generateSlug = (name) => 
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const validateStep = (stepIndex) => {
    const newErrors = {}
    switch (stepIndex) {
      case 0: // Datos básicos
        if (!form.name.trim()) {
          newErrors.name = 'El nombre es requerido'
        }
        if (!form.slug.trim() && form.name.trim()) {
          // Auto-generate slug if empty but name exists
          const generated = generateSlug(form.name)
          if (generated) {
            setForm(f => ({ ...f, slug: generated }))
          }
        }
        break
      case 1: // Configuración
        if (form.categories.length === 0) {
          newErrors.categories = 'Debe agregar al menos una categoría'
        }
        form.categories.forEach((cat, idx) => {
          if (!form.category_formats[cat]) {
            newOptions[`format_${cat}`] = `Seleccione formato para ${cat}`
          }
        })
        break
      case 2: // Equipos
        if (teams.length < 2) {
          newErrors.teams = 'Debe crear al menos 2 equipos'
        }
        // Check for duplicate player assignments
        const playerAssignments = {}
        let hasConflict = false
        teams.forEach((t, i) => {
          const key1 = `${t.player1_id}-${t.player2_id}`
          const key2 = `${t.player2_id}-${t.player1_id}`
          if (playerAssignments[key1] || playerAssignments[key2]) {
            hasConflict = true
          }
          playerAssignments[key1] = i
          playerAssignments[key2] = i
        })
        if (hasConflict) {
          newErrors.teamsDuplicate = 'Un jugador no puede estar en dos equipos diferentes'
        }
        break
      case 3: // Precios
        if (form.inscriptionFee < 0) {
          newErrors.inscriptionFee = 'La inscripción no puede ser negativa'
        }
        if (form.arbitrationCostPerMatch < 0) {
          newErrors.arbitrationCostPerMatch = 'El costo de arbitraje no puede ser negativo'
        }
        break
      default:
        break
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    // Validate all steps
    let isValid = true
    for (let i = 0; i < steps.length - 1; i++) { // Exclude review step
      if (!validateStep(i)) {
        isValid = false
        // Jump to first invalid step
        if (step < i) setStep(i)
        break
      }
    }
    if (!isValid) return

    setSaving(true)
    try {
      const leagueData = {
        ...form,
        slug: form.slug || generateSlug(form.name),
        organizer_id: user?.id,
        sets_per_match: parseInt(form.sets_per_match),
      }
      let savedLeague
      if (isEditing) {
        savedLeague = await updateLeague.mutateAsync({ id: leagueId, ...leagueData })
      } else {
        savedLeague = await createLeague.mutateAsync(leagueData)
      }

      if (teams.length > 0 && savedLeague?.id) {
        const { error: teamsErr } = await supabase.from('teams').insert(
          teams.map(t => ({
            league_id: savedLeague.id,
            category: t.category,
            team_number: t.team_number,
            player1_id: t.player1_id,
            player2_id: t.player2_id,
            team_name: t.team_name || `Equipo ${t.team_number}`,
          }))
        )
        if (teamsErr) {
          console.error('Teams error:', teamsErr)
          throw teamsErr
        }
        queryClient.invalidateQueries({ queryKey: ['teams', savedLeague.id] })
      }

      clearDraft()
      setShowSuccessModal(true)
      setSaving(false)
    } catch (e) {
      console.error('Save error:', e)
      toast.error('Error al guardar: ' + (e?.message || e?.error?.message || 'Error desconocido'))
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isDraftDirty()) {
      if (window.confirm('¿Descartar cambios no guardados?')) {
        clearDraft()
        navigate('/ligas')
      }
    } else {
      navigate('/ligas')
    }
  }

  const isDraftDirty = () => {
    return JSON.stringify(form) !== JSON.stringify(initialForm) ||
           JSON.stringify(teams) !== JSON.stringify(initialTeams) ||
           categoryInput !== initialCategoryInput
  }

  const goToStep = (index) => {
    // Only allow jumping to completed steps or current/next
    const completedSteps = getCompletedSteps()
    if (index <= Math.max(...completedSteps, -1) + 1 || index === step) {
      setStep(index)
    }
  }

  const getCompletedSteps = () => {
    const completed = []
    for (let i = 0; i < steps.length; i++) {
      if (i < step && validateStep(i)) {
        completed.push(i)
      } else if (i === step) {
        break
      }
    }
    return completed
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-96 relative">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-xl font-bold">Liga creada exitosamente</h2>
              <p className="mt-2 text-gray-600">
                Tu liga ha sido guardada. Ahora puedes verla o crear otra.
              </p>
              <div className="mt-6 flex justify-center space-x-4">
                <Button variant="outline" onClick={() => {
                  setShowSuccessModal(false)
                  navigate(`/ligas/${leagueId || 'new'}`)
                }}>
                  Ver liga
                </Button>
                <Button onClick={() => {
                  setShowSuccessModal(false)
                  navigate('/ligas/nueva')
                }}>
                  Nueva liga
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-bold mb-4">¿Salir sin guardar?</h3>
            <p className="mb-6">
              Tiene cambios sin guardar. Si sale ahora, perderá su progreso.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowLeaveConfirm(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowLeaveConfirm(false)
                clearDraft()
                navigate('/ligas')
              }}>
                Salir sin guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{isEditing ? 'Editar liga' : 'Crear nueva liga'}</h1>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleCancel}
              className="btn-outline h-9 px-4 text-xs"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> {isEditing ? 'Cancelar' : 'Volver a ligas'}
            </button>
            {step < steps.length - 1 && (
              <button 
                onClick={() => setShowLeaveConfirm(isDraftDirty())}
                className="btn-outline h-9 px-4 text-xs"
              >
                <HelpCircle className="w-4 h-4 mr-1" /> Salir
              </button>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 
                    ${i < step ? 'bg-primary text-primary-foreground' : 
                      i === step ? 'bg-primary/20 text-primary' : 
                      'bg-muted text-muted-foreground'}`}
                  >
                    {i < step ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block 
                    ${i < step ? 'text-primary font-medium' : 
                      i === step ? 'text-primary font-medium' : 
                      'text-muted-foreground'}`}
                  >{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`absolute left-full -translate-x-1/2 h-px w-full 
                    ${i < step ? 'bg-primary' : 'bg-border'}`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {step === 0 && renderBasicsStep()}
            {step === 1 && renderConfigStep()}
            {step === 2 && renderTeamsStep()}
            {step === 3 && renderPricingStep()}
            {step === 4 && renderCalendarStep()}
            {step === 5 && renderReviewStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button 
            onClick={() => step === 0 ? navigate('/ligas') : setStep(step - 1)}
            className={`btn-outline h-10 px-6 
              ${step === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={step === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> 
            {step === 0 ? 'Cancelar' : 'Anterior'}
          </button>

          {step < steps.length - 1 ? (
            <>
              {step === steps.length - 2 ? (
                <button 
                  onClick={handleSave}
                  className={`btn-primary h-10 px-6 
                    ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear liga'}
                </button>
              ) : (
                <button 
                  onClick={() => setStep(step + 1)}
                  className="btn-primary h-10 px-6"
                >
                  Siguiente <ChevronRight className="ml-2 w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <button 
              onClick={handleSave}
              className={`btn-primary h-10 px-6 
                ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={saving}
            >
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear liga'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // Step renderers
  function renderBasicsStep() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Datos básicos</h2>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Nombre de la liga *</Label>
            <Input 
              value={form.name} 
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ej: Liga de Padel Primavera 2026"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>
          
          <div className="space-y-3">
            <Label>Slug (URL)</Label>
            <Input 
              value={form.slug} 
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="liga-padel-primavera-2026"
              className={errors.slug ? 'border-destructive' : ''}
            />
            {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label>Deporte</Label>
            <Select 
              value={form.sport} 
              onValueChange={(v) => handleChange('sport', v)}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {sportOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label>Género</Label>
            <Select 
              value={form.gender} 
              onValueChange={(v) => handleChange('gender', v)}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {genderOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label>Estado</Label>
            <Select 
              value={form.status} 
              onValueChange={(v) => handleChange('status', v)}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Temporada</Label>
          <Input 
            value={form.season} 
            onChange={(e) => handleChange('season', e.target.value)}
            placeholder="Ej: 2026-1"
          />
        </div>

        <div className="space-y-3">
          <Label>Color de la liga</Label>
          <div className="flex items-center gap-3">
            <input 
              type="color" 
              value={form.color} 
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-10 h-10 rounded-md border border-input bg-transparent cursor-pointer"
              aria-label="Color de la liga"
            />
            <Input 
              value={form.color} 
              onChange={(e) => handleChange('color', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-medium text-sm mb-4">Datos del organizador</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Nombre</Label>
              <Input 
                value={form.organizer_name} 
                onChange={(e) => handleChange('organizer_name', e.target.value)}
                placeholder="Nombre del organizador"
              />
            </div>
            <div className="space-y-3">
              <Label>WhatsApp</Label>
              <Input 
                value={form.organizer_whatsapp} 
                onChange={(e) => handleChange('organizer_whatsapp', e.target.value)}
                placeholder="5215512345678"
              />
            </div>
            <div className="space-y-3">
              <Label>Instagram</Label>
              <Input 
                value={form.organizer_instagram} 
                onChange={(e) => handleChange('organizer_instagram', e.target.value)}
                placeholder="usuario (sin @)"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderConfigStep() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Configuración</h2>
        
        <div className="space-y-4">
          <Label>Categorías</Label>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-0">
              <Input 
                value={categoryInput} 
                onChange={(e) => setCategoryInput(e.target.value.toUpperCase())}
                placeholder="Ej: 5TA"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                className={errors.categories ? 'border-destructive' : ''}
              />
              <button 
                onClick={addCategory}
                className="btn-outline h-9 px-3 ml-2"
                disabled={!categoryInput.trim()}
              >
                Agregar
              </button>
            </div>
          </div>
          {errors.categories && <p className="text-sm text-destructive mt-1">{errors.categories}</p>}
          
          <div className="mt-4 flex flex-wrap gap-2">
            {form.categories.map((cat, idx) => (
              <span 
                key={cat} 
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
              >
                {cat}
                <button 
                  type="button"
                  onClick={() => removeCategory(cat)}
                  className="hover:text-destructive font-bold p-0.5"
                  aria-label={`Eliminar categoría ${cat}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Sets por partido</Label>
              <Select 
                value={form.sets_per_match} 
                onValueChange={(v) => handleChange('sets_per_match', v)}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {setsOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
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
        </div>

        {form.categories.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-sm mb-3">Formato por categoría</h3>
            <div className="space-y-3">
              {form.categories.map((cat) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm w-20 font-medium">{cat}</span>
                  <Select 
                    value={form.category_formats?.[cat] || 'todos-contra-todos'}
                    onValueChange={(v) => setForm(f => ({ 
                      ...f, 
                      category_formats: { 
                        ...f.category_formats, 
                        [cat]: v 
                      } 
                    }))}
                  >
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {formatOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <HelpCircle 
                    title="Información"
                    description={
                      `Seleccione el formato de competencia para la categoría ${cat}.` +
                      '\n• Todos contra todos: Cada equipo juega contra todos los demás.' +
                      '\n• Round Robin Express: Formato acelerado para muchas equipes.' +
                      '\n• Grupos + eliminatorias: Se dividen en grupos y luego eliminatoria.' +
                      '\n• Eliminatoria directa: Partidos de eliminación directa desde el inicio.'
                    }
                    className="ml-2 h-4 w-4 text-muted-foreground hover:text-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderTeamsStep() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Equipos</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Cree equipos asignando jugadores a cada categoría. Cada equipo necesita 2 jugadores.
        </p>
        
        {form.categories.length === 0 ? (
          <p className="text-sm text-muted-italic text-center py-8">
            Primero debe agregar categorías en el paso de Configuración
          </p>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm">Resumen de equipos</h3>
                <span className="text-sm text-muted-foreground">
                  {teams.length} equipos creados
                </span>
              </div>
              {teams.length > 0 && (
                <div className="mt-3 space-y-2">
                  {teams.map((t, idx) => (
                    <div 
                      key={t.id || idx} 
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{t.team_name || `Equipo ${t.team_number}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.category} • 
                          {t.player1_id ? (participantsQuery.data || []).find(p => p.id === t.player1_id)?.name || 'Jugador 1' : 'Sin asignar'} 
                          & 
                          {t.player2_id ? (participantsQuery.data || []).find(p => p.id === t.player2_id)?.name || 'Jugador 2' : 'Sin asignar'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            // Edit team logic would go here - for now just remove
                            setTeams(prev => prev.filter((_, i) => i !== idx))
                          }}
                          className="btn-ghost h-8 px-3 text-xs"
                          title="Editar equipo"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => setTeams(prev => prev.filter((_, i) => i !== idx))}
                          className="btn-ghost h-8 px-3 text-xs text-destructive"
                          title="Eliminar equipo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <PlayerPickerPanel 
              participants={participantsQuery.data || []} 
              categories={form.categories} 
              teams={teams} 
              onTeamsChange={setTeams} 
            />
          </>
        )}
        
        {errors.teams && <p className="text-sm text-destructive mt-2">{errors.teams}</p>}
        {errors.teamsDuplicate && <p className="text-sm text-destructive mt-2">{errors.teamsDuplicate}</p>}
      </div>
    )
  }

  function renderPricingStep() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Precios y Costos</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Configure los aspectos financieros de su liga. Todos los valores están en la moneda local.
        </p>
        
        <div className="space-y-5">
          <div className="space-y-3">
            <Label>Inscripción por jugador</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">$</span>
              <Input 
                type="number"
                min="0"
                step="0.01"
                value={form.inscriptionFee}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0
                  handleChange('inscriptionFee', Math.max(0, Math.round(val * 100) / 100))
                }}
                placeholder="0.00"
                className="w-32 text-right"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Costo que cada jugador paga para participar en la liga
            </p>
            {errors.inscriptionFee && <p className="text-sm text-destructive mt-1">{errors.inscriptionFee}</p>}
          </div>
          
          <div className="space-y-3">
            <Label>Costo de arbitraje por partido</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">$</span>
              <Input 
                type="number"
                min="0"
                step="0.01"
                value={form.arbitrationCostPerMatch}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0
                  handleChange('arbitrationCostPerMatch', Math.max(0, Math.round(val * 100) / 100))
                }}
                placeholder="0.00"
                className="w-32 text-right"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lo que paga el árbitro por cada partido dirigido
            </p>
            {errors.arbitrationCostPerMatch && <p className="text-sm text-destructive mt-1">{errors.arbitrationCostPerMatch}</p>}
          </div>
          
          <div className="space-y-3">
            <Label>Pozo de premios (opcional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">$</span>
              <Input 
                type="number"
                min="0"
                step="0.01"
                value={form.prizePool}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0
                  handleChange('prizePool', Math.max(0, Math.round(val * 100) / 100))
                }}
                placeholder="0.00"
                className="w-32 text-right"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monto total a repartir entre los ganadores (opcional)
            </p>
          </div>
          
          <div className="space-y-3">
            <Label>Costos operativos (opcional)</Label>
            <div class="flex items-center gap-2">
              <span className="text-sm font-medium">$</span>
              <Input 
                type="number"
                min="0"
                step="0.01"
                value={form.operationalCosts}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0
                  handleChange('operationalCosts', Math.max(0, Math.round(val * 100) / 100))
                }}
                placeholder="0.00"
                className="w-32 text-right"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gastos como canchas, equipamiento, etc. (opcional)
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium text-sm mb-3">Resumen financiero</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Ingreso estimado por inscripción:</span>
              <span className="text-sm font-medium">${
                (form.inscriptionFee * (teams.reduce((sum, t) => {
                  // Estimar jugadores por equipo: 2 por equipo
                  return sum + (t.player1_id ? 1 : 0) + (t.player2_id ? 1 : 0)
                }, 0) * 2)).toFixed(2)
              }</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Costo estimado de arbitraje:</span>
              <span className="text-sm font-medium">${
                (form.arbitrationCostPerMatch * Math.max(0, teams.length - 1)).toFixed(2)
              }</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Ganancia estimada antes de costos:</span>
              <span className="text-sm font-medium">${
                (
                  (form.inscriptionFee * (teams.reduce((sum, t) => {
                    return sum + (t.player1_id ? 1 : 0) + (t.player2_id ? 1 : 0)
                  }, 0) * 2)) - 
                  (form.arbitrationCostPerMatch * Math.max(0, teams.length - 1))
                ).toFixed(2)
              }</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderCalendarStep() {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Vista previa del calendario</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Revise la estructura estimada de su liga basada en los equipos creados.
        </p>
        
        {teams.length < 2 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-italic">
              Agrega al menos 2 equipos en el paso anterior para ver la estructura completa
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-background rounded-lg p-4 text-center">
                <p className="text-2xl font-mono font-bold text-primary">{teams.length}</p>
                <p className="text-xs text-muted-foreground">Equipos</p>
              </div>
              <div className="bg-background rounded-lg p-4 text-center">
                <p className="text-2xl font-mono font-bold text-primary">
                  {teams.length > 1 ? teams.length - 1 : 0}
                </p>
                <p className="text-xs text-muted-foreground">Jornadas (estimado)</p>
              </div>
              <div className="bg-background rounded-lg p-4 text-center">
                <p className="text-2xl font-mono font-bold text-primary">
                  {teams.length >= 2 ? Math.ceil(teams.length * (teams.length - 1) / 2) : 0}
                </p>
                <p className="text-xs text-muted-foreground">Partidos totales (estimado)</p>
              </div>
            </div>
            
            {form.categories.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-sm mb-3">Desglose por categoría</h3>
                <div className="space-y-3">
                  {form.categories.map(cat => {
                    const catTeams = teams.filter(t => t.category === cat).length
                    const jornadas = catTeams > 1 ? catTeams - 1 : 0
                    const partidos = catTeams >= 2 ? Math.ceil(catTeams * (catTeams - 1) / 2) : 0
                    return (
                      <div key={cat} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">{cat}</span>
                        <span className="text-sm">
                          {catTeams} equipos • {jornadas} jornadas • {partidos} partidos
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium text-sm mb-3">Recomendaciones</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Para ligas con muchos equipos, considere usar "Grupos + eliminatorias"</li>
            <li>• El formato "Round Robin Express" es ideal para 8-16 equipos</li>
            <li>• Asegúrese de tener un número par de equipos para evitar byes en eliminación directa</li>
          </ul>
        </div>
      </div>
    )
  }

  function renderReviewStep() {
    const isValid = Object.keys(errors).length === 0 && 
                   !errors.teams && 
                   !errors.teamsDuplicate &&
                   teams.length >= 2 &&
                   form.categories.length > 0 &&
                   form.name.trim() !== ''
    
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Revisión y confirmación</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Revise todos los datos antes de crear su liga. Una vez creada, algunos campos no podrán modificarse.
        </p>
        
        <div className="space-y-6">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium text-sm mb-3">Información básica</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Nombre:</span>
                <span className="text-sm font-medium">{form.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Deporte:</span>
                <span className="text-sm font-medium">{sportOptions.find(o => o.value === form.sport)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Género:</span>
                <span className="text-sm font-medium">{genderOptions.find(o => o.value === form.gender)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Estado:</span>
                <span className="text-sm font-medium">{statusOptions.find(o => o.value === form.status)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Temporada:</span>
                <span className="text-sm font-medium">{form.season}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Slug:</span>
                <span className="text-sm font-medium monospace">{form.slug || generateSlug(form.name)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium text-sm mb-3">Configuración</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Categorías:</span>
                <span className="text-sm font-medium">{form.categories.length} {form.categories.length === 1 ? 'categoría' : 'categorías'}</span>
              </div>
              {form.categories.map(cat => (
                <div key={cat} className="flex justify-between px-3 py-1 text-sm">
                  <span>{cat}</span>
                  <span className="text-muted-foreground">{form.category_formats[cat] || 'todos-contra-todos'}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium text-sm mb-3">Equipos</h3>
            <p className="text-sm">
              {teams.length} equipos creados ({teams.filter(t => t.player1_id && t.player2_id).length} completos)
            </p>
            {teams.length > 0 && (
              <div className="mt-3 space-y-2">
                {teams.map((t, idx) => (
                  <div key={t.id || idx} className="flex items-center gap-2 px-3 py-1 bg-white rounded">
                    <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded">
                      #{t.team_number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{t.team_name || `Equipo ${t.team_number}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.category} • 
                        {(participantsQuery.data || []).find(p => p.id === t.player1_id)?.name || 'Sin asignar'} & 
                        {(participantsQuery.data || []).find(p => p.id === t.player2_id)?.name || 'Sin asignar'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium text-sm mb-3">Precios y Costos</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Inscripción por jugador:</span>
                <span className="text-sm font-medium">${
                  parseFloat(form.inscriptionFee).toFixed(2)
                }</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Costo de arbitraje por partido:</span>
                <span className="text-sm font-medium">${
                  parseFloat(form.arbitrationCostPerMatch).toFixed(2)
                }</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pozo de premios:</span>
                <span className="text-sm font-medium">${
                  parseFloat(form.prizePool).toFixed(2)
                }</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Costos operativos:</span>
                <span className="text-sm font-medium">${
                  parseFloat(form.operationalCosts).toFixed(2)
                }</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium text-sm mb-3">Validación</h3>
          {isValid ? (
            <p className="text-sm text-success">Todo listo para crear la liga</p>
          ) : (
            <p className="text-sm text-warning">
              Por favor corrija los errores marcados en los pasos anteriores antes de continuar
            </p>
          )}
        </div>
      </div>
    )
  }
}