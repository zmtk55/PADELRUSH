import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { UserCircle, Mail, Shield, Save, LogOut, Calendar, Moon, Bell, Loader2, Settings, Trophy, Target, Swords } from 'lucide-react'
import { cn } from '@/lib/utils'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-card rounded-xl border border-border p-4 shadow-card">
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center border",
        color || "bg-primary/10 text-primary border-primary/20"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  </div>
)

const ToggleSwitch = ({ checked, onChange, label, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-card">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center border border-border">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted border border-border"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  </div>
)

export default function Profile() {
  const { profile, isOrganizer, updateProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

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

  if (!profile) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader title="Mi Perfil" description="Tu información personal" />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-2xl mx-auto space-y-6"
        >
          <motion.div variants={item}>
            <Card className="shadow-card overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
              <CardContent className="relative px-6 pb-6">
                <div className="relative -mt-12 mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-2xl border-4 border-card flex items-center justify-center shadow-lg">
                    <UserCircle className="w-12 h-12 text-primary-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">{profile.display_name || 'Sin nombre'}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {profile.email}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-full border",
                    isOrganizer
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-border"
                  )}>
                    <Shield className="w-3 h-3 inline-block mr-1" />
                    {isOrganizer ? 'Organizador' : 'Jugador'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 inline-block mr-1" />
                    Miembro desde {profile.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : 'Desconocido'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <div className="grid grid-cols-3 gap-4">
              <StatCard icon={Trophy} label="Ligas" value="3" color="bg-amber-500/10 text-amber-500 border-amber-500/20" />
              <StatCard icon={Swords} label="Partidos" value="24" color="bg-primary/10 text-primary border-primary/20" />
              <StatCard icon={Target} label="Victoria" value="67%" color="bg-emerald-500/10 text-emerald-500 border-emerald-500/20" />
            </div>
          </motion.div>

          <motion.div variants={item}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ToggleSwitch
                  checked={darkMode}
                  onChange={setDarkMode}
                  label="Modo oscuro"
                  icon={Moon}
                />
                <ToggleSwitch
                  checked={notifications}
                  onChange={setNotifications}
                  label="Notificaciones"
                  icon={Bell}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Editar perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                      Nombre de usuario
                    </Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tu nombre"
                      className="h-11"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg transition-all active:scale-[0.98]"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </span>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="pt-2">
            <Button
              variant="outline"
              onClick={() => { signOut(); navigate('/') }}
              className="w-full rounded-lg border-destructive/20 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
