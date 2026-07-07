import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export default function BasicsStep({ form, setForm, errors }) {
  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

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
              {[
                { value: 'padel', label: 'Pádel' }
              ].map(opt => (
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
              {[
                { value: 'femenil', label: 'Femenil' },
                { value: 'varonil', label: 'Varonil' },
                { value: 'mixto', label: 'Mixto' }
              ].map(opt => (
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
              {[
                { value: 'proxima', label: 'Próxima' },
                { value: 'activa', label: 'Activa' },
                { value: 'finalizada', label: 'Finalizada' }
              ].map(opt => (
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