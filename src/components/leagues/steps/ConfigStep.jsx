import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

export default function ConfigStep({ form, setForm, errors, categories, setCategoryInput, addCategory, removeCategory, participants }) {
  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

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
          {categories.map((cat, idx) => (
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
                {[
                  { value: '1', label: '1 set' },
                  { value: '2', label: '2 sets (al mejor de 3)' },
                  { value: '3', label: '3 sets' }
                ].map(opt => (
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

      {categories.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-sm mb-3">Formato por categoría</h3>
          <div className="space-y-3">
            {categories.map(cat => (
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
                    {[
                      { value: 'todos-contra-todos', label: 'Todos contra todos' },
                      { value: 'round-robin-express', label: 'Round Robin Express' },
                      { value: 'grupos-y-eliminatorias', label: 'Grupos + eliminatorias' },
                      { value: 'eliminatoria-directa', label: 'Eliminatoria directa' }
                    ].map(opt => (
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