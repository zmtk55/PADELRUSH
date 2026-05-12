import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar, MobileNav } from '@/components/layout/Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trophy, Mail, Lock, UserPlus, LogIn } from 'lucide-react'

import Dashboard from '@/pages/Dashboard'
import Leagues from '@/pages/Leagues'
import LeagueSetupWizard from '@/components/leagues/LeagueSetupWizard'
import LeagueDetail from '@/pages/LeagueDetail'
import Teams from '@/pages/Teams'
import Matches from '@/pages/Matches'
import Participants from '@/pages/Participants'
import Standings from '@/pages/Standings'
import Equipos from '@/pages/Equipos'
import Partidos from '@/pages/Partidos'
import Clasificacion from '@/pages/Clasificacion'
import Profile from '@/pages/Profile'
import Admin from '@/pages/Admin'
import AdminSelector from '@/pages/AdminSelector'

function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    const { error: err } = await (isRegister ? signUp : signIn)(email, password, name)
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold">PadelRush</h1>
          <p className="text-sm text-muted-foreground mt-1">{isRegister ? 'Crea tu cuenta' : 'Inicia sesión'}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</div>}
          {isRegister && <div><Label>Nombre</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" /></div>}
          <div><Label>Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="pl-9" required /></div></div>
          <div><Label>Contraseña</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" required /></div></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Cargando...' : isRegister ? <><UserPlus className="w-4 h-4" /> Registrarse</> : <><LogIn className="w-4 h-4" /> Iniciar sesión</>}</Button>
          <p className="text-xs text-center text-muted-foreground">
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button type="button" onClick={() => { setIsRegister(!isRegister); setError('') }} className="text-primary underline-offset-4 hover:underline font-medium">
              {isRegister ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <MobileNav />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center gap-4"><div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" /><p className="text-muted-foreground text-sm animate-pulse">Cargando...</p></div>
  if (!user) return <AuthPage />
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ligas" element={<Leagues />} />
        <Route path="/ligas/nueva" element={<LeagueSetupWizard />} />
        <Route path="/ligas/:leagueId" element={<LeagueDetail />} />
        <Route path="/ligas/:leagueId/editar" element={<LeagueSetupWizard />} />
        <Route path="/ligas/:leagueId/equipos" element={<Teams />} />
        <Route path="/ligas/:leagueId/partidos" element={<Matches />} />
        <Route path="/ligas/:leagueId/clasificacion" element={<Standings />} />
        <Route path="/ligas/:leagueId/admin" element={<Admin />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/partidos" element={<Partidos />} />
        <Route path="/clasificacion" element={<Clasificacion />} />
        <Route path="/admin" element={<AdminSelector />} />
        <Route path="/participantes" element={<Participants />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}
