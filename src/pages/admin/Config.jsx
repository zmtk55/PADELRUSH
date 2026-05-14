import { useState, useEffect } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSystemConfig } from '@/hooks/useSystemConfig'

export default function AdminConfig() {
  const { config, isLoading, updateConfig } = useSystemConfig()
  const [form, setForm] = useState({})

  useEffect(() => {
    if (config) setForm({ ...config })
  }, [config])

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = () => {
    const changed = {}
    Object.entries(form).forEach(([k, v]) => {
      if (JSON.stringify(v) !== JSON.stringify(config[k])) changed[k] = v
    })
    if (Object.keys(changed).length === 0) return
    updateConfig.mutate(changed)
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Configuración" description="Ajustes globales del sistema" />
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6">
              <div className="h-4 w-32 bg-muted rounded mb-4" />
              <div className="h-10 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Ajustes globales del sistema"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setForm({ ...config })}>
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={updateConfig.isPending}>
              <Save className="w-4 h-4" />
              {updateConfig.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-lg mb-4">Información de la app</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre de la app</Label>
              <Input value={form.app_name || ''} onChange={(e) => set('app_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Logo (texto corto)</Label>
              <Input value={form.app_logo || ''} onChange={(e) => set('app_logo', e.target.value)} maxLength={3} />
            </div>
            <div className="space-y-2">
              <Label>Color primario (hex)</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.primary_color || '#c96442'}
                  onChange={(e) => set('primary_color', e.target.value)}
                  className="w-12 p-1"
                />
                <Input value={form.primary_color || ''} onChange={(e) => set('primary_color', e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-lg mb-4">Valores por defecto (nuevas ligas)</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Deporte default</Label>
              <select
                value={form.default_sport || 'padel'}
                onChange={(e) => set('default_sport', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {(form.sports || ['padel', 'tenis', 'squash', 'otro']).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Sets por partido</Label>
              <Input type="number" min={1} max={5} value={form.default_sets || 2} onChange={(e) => set('default_sets', parseInt(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Tiebreak</Label>
              <select
                value={form.tiebreak_enabled ? 'true' : 'false'}
                onChange={(e) => set('tiebreak_enabled', e.target.value === 'true')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="true">Activado</option>
                <option value="false">Desactivado</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-lg mb-4">Contacto / Redes</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input value={form.contact_whatsapp || ''} onChange={(e) => set('contact_whatsapp', e.target.value)} placeholder="+521234567890" />
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input value={form.contact_instagram || ''} onChange={(e) => set('contact_instagram', e.target.value)} placeholder="@padelrush" />
            </div>
            <div className="space-y-2">
              <Label>Facebook</Label>
              <Input value={form.contact_facebook || ''} onChange={(e) => set('contact_facebook', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sitio web</Label>
              <Input value={form.contact_website || ''} onChange={(e) => set('contact_website', e.target.value)} placeholder="https://" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
