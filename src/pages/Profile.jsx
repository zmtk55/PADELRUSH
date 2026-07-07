import { useState } from 'react'
import { LogOut, Shield, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'

export default function Profile() {
  const { user, profile, signOut } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id)
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  if (!user) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
      <p className="text-muted-foreground">Inicia sesión para ver tu perfil</p>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title="Perfil" description="Tu información personal" />
      
      <div className="max-w-lg">
        <div className="bg-card border border-border-subtle p-6 sm:p-8">
          {/* Avatar section */}
          <div className="flex items-center gap-5 mb-8 pb-6 border-b border-border-subtle">
            <div className="w-20 h-20 bg-foreground text-background flex items-center justify-center text-3xl font-bold shrink-0">
              {profile?.display_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold">{profile?.display_name || 'Sin nombre'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  <Shield className="w-3 h-3 mr-1" />
                  {profile?.role || 'player'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nombre completo</Label>
              <Input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Correo electrónico</Label>
              <Input
                value={user.email}
                disabled
                className="mt-1.5 opacity-60 bg-muted"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Rol</Label>
              <Input
                value={profile?.role || 'player'}
                disabled
                className="mt-1.5 opacity-60 bg-muted capitalize"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-border-subtle">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Guardando...' : saved ? (
                <><CheckCircle2 className="w-4 h-4" /> Guardado</>
              ) : (
                'Guardar cambios'
              )}
            </Button>
            <Button variant="outline" onClick={signOut} className="sm:flex-none">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
