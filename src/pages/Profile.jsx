import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { UserCircle, Mail, Shield, Save, LogOut, Calendar } from 'lucide-react'

export default function Profile() {
  const { profile, isOrganizer, updateProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({ display_name: displayName })
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  if (!profile) return null

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Perfil"
        description="Tu informacion personal"
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-muted border border-border/50 flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">{profile.display_name || 'Sin nombre'}</CardTitle>
                <p className="text-sm font-body text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {profile.email}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Edit form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Editar perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-body font-semibold text-foreground/80 uppercase tracking-wider">
                  Nombre de usuario
                </Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  className="h-11"
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                    Guardando...
                  </span>
                ) : (
                  <><Save className="w-4 h-4" /> Guardar cambios</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informacion de la cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-body text-foreground">Rol</span>
              </div>
              <span className="text-sm font-body font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/10">
                {isOrganizer ? 'Organizador' : 'Jugador'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-body text-foreground">Miembro desde</span>
              </div>
              <span className="text-sm font-body text-muted-foreground">
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : 'Desconocido'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <div className="text-center pt-2">
          <Button
            variant="outline"
            onClick={() => { signOut(); navigate('/') }}
            className="border-destructive/20 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesion
          </Button>
        </div>
      </div>
    </motion.div>
    </div>
  )
}
