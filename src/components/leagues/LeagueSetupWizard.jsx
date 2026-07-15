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
import { toast } from 'sonner'
import BasicsStep from './steps/BasicsStep'
import ConfigStep from './steps/ConfigStep'
import TeamsStep from './steps/TeamsStep'
import PricingStep from './steps/PricingStep'
import CalendarStep from './steps/CalendarStep'
import ReviewStep from './steps/ReviewStep'

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

  const [teams, setTeams] = useState(isEditing ? (existingLeague?.teams || []) : [])
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
  }, [isEditing, existingLeague, form, teams, categoryInput])

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
            newErrors[`format_${cat}`] = `Seleccione formato para ${cat}`
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
      // Remove derived/preview-only fields not persisted to the leagues table
      delete leagueData.schedule
      delete leagueData.generateSchedule
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
          <div className="bg-card rounded-xl p-8 w-96 relative border border-border-subtle">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute right-4 top-4 text-fg-muted hover:text-foreground"
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
              <p className="mt-2 text-fg-secondary">
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
            {step === 0 && <BasicsStep form={form} setForm={setForm} errors={errors} />}
            {step === 1 && <ConfigStep 
              form={form} 
              setForm={setForm} 
              errors={errors} 
              categories={form.categories} 
              setCategoryInput={setCategoryInput} 
              addCategory={addCategory} 
              removeCategory={removeCategory} 
              participants={participantsQuery.data || []} 
            />}
            {step === 2 && <TeamsStep 
              form={form} 
              setForm={setForm} 
              errors={errors} 
              teams={teams} 
              setTeams={setTeams} 
              categoryInput={categoryInput} 
              setCategoryInput={setCategoryInput} 
              addCategory={addCategory} 
              removeCategory={removeCategory} 
              participants={participantsQuery.data || []} 
            />}
            {step === 3 && <PricingStep 
              form={form} 
              setForm={setForm} 
              errors={errors} 
            />}
            {step === 4 && <CalendarStep 
              form={form} 
              setForm={setForm} 
              errors={errors} 
              teams={teams} 
              categories={form.categories} 
            />}
            {step === 5 && <ReviewStep 
              form={form} 
              setForm={setForm} 
              errors={errors} 
              teams={teams} 
              categories={form.categories} 
              participants={participantsQuery.data || []} 
              initialForm={initialForm} 
              initialTeams={initialTeams} 
              initialCategoryInput={initialCategoryInput} 
              isDraftDirty={isDraftDirty} 
              handleSave={handleSave} 
              saving={saving} 
              isEditing={isEditing} 
              navigate={navigate} 
            />}
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
}