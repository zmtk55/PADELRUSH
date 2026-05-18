import { useState } from 'react'
import { User, Mail, LogOut } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'

export default function Profile() {
  const { user, profile, signOut } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id)
      if (error) throw error
    } catch {}
    setSaving(false)
  }

  if (!user) return <div className="text-center py-20"><p className="text-muted-foreground">Inicia sesión para ver tu perfil</p></div>

  return (
    <div>
      <PageHeader title="Perfil" description="Tu información personal" />
      <div className="max-w-lg">
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold font-heading">
              {profile?.display_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg">{profile?.display_name || 'Sin nombre'}</h2>
              <p className="text-sm text-muted-foreground capitalize">{profile?.role || 'player'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div><Label>Nombre</Label><Input value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
            <div><Label>Email</Label><Input value={user.email} disabled className="opacity-60" /></div>
            <div><Label>Rol</Label><Input value={profile?.role || 'player'} disabled className="opacity-60 capitalize" /></div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
            <Button variant="outline" onClick={signOut}><LogOut className="w-4 h-4" /> Cerrar sesión</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
