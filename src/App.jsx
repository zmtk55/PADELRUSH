import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar, MobileNav } from '@/components/layout/Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/lib/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trophy, Mail, Lock, UserPlus, LogIn, Sun, Moon } from 'lucide-react'
import Dashboard from '@/pages/Dashboard'
import Leagues from '@/pages/Leagues'
import LeagueSetupWizard from '@/components/leagues/LeagueSetupWizard'
import LeagueDetail from '@/pages/LeagueDetail'
import Teams from '@/pages/Teams'
import TeamDetail from '@/pages/TeamDetail'
import Matches from '@/pages/Matches'
import Participants from '@/pages/Participants'
import Standings from '@/pages/Standings'
import Profile from '@/pages/Profile'
import Admin from '@/pages/Admin'
import AdminSelector from '@/pages/AdminSelector'
import EquiposSelector from '@/pages/EquiposSelector'
import PartidosSelector from '@/pages/PartidosSelector'
import ClasificacionSelector from '@/pages/ClasificacionSelector'
import Express from '@/pages/Express'
function AuthPage() {
  const { signIn, signUp } = useAuth()
  const { theme, toggleTheme } = useTheme()
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* THEME TOGGLE */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-all duration-150 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
      >
        {theme === 'light' ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </button>

      <div className="w-full max-w-sm">
        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-lg bg-primary flex items-center justify-center">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-5xl font-bold tracking-[0.15em] text-foreground">
            PADELRUSH
          </h1>
          <p className="text-sm font-body text-muted-foreground mt-3 tracking-wider uppercase">
            <span className="inline-block w-8 h-[1px] bg-border align-middle mr-2" />
            {isRegister ? 'Crea tu cuenta' : 'Inicia sesion'}
            <span className="inline-block w-8 h-[1px] bg-border align-middle ml-2" />
          </p>
        </motion.div>
        {/* FORM CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="card-base p-5 sm:p-8 space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.1em]">Nombre</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="h-11 bg-background border-border text-foreground placeholder:text-muted-foreground/50 rounded-lg focus:border-primary/50 transition-all" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.1em]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="h-11 pl-11 bg-background border-border text-foreground placeholder:text-muted-foreground/50 rounded-lg focus:border-primary/50 transition-all" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.1em]">Contrasena</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="" className="h-11 pl-11 bg-background border-border text-foreground placeholder:text-muted-foreground/50 rounded-lg focus:border-primary/50 transition-all" required />
              </div>
            </div>
            <Button type="submit" disabled={loading}
              className="w-full h-11 text-sm font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground border-0 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
                  Cargando...
                </span>
              ) : isRegister ? (
                <><UserPlus className="w-5 h-5" /> Registrarse</>
              ) : (
                <><LogIn className="w-5 h-5" /> Iniciar sesion</>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              {isRegister ? 'Ya tienes cuenta?' : 'No tienes cuenta?'}{' '}
              <button type="button" onClick={() => { setIsRegister(!isRegister); setError('') }}
                className="text-primary hover:text-primary/80 font-semibold underline-offset-2 hover:underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {isRegister ? 'Inicia sesion' : 'Registrate'}
              </button>
            </p>
          </form>
        </motion.div>

        {/* FOOTER */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-xs text-muted-foreground/40 tracking-wider"
        >
          PADELRUSH &copy; {new Date().getFullYear()} &middot; Todos los derechos reservados
        </motion.p>
      </div>
    </div>
  )
}
function AppLayout({ children }) {
  return (
    <div className="min-h-[100dvh] bg-background overscroll-contain">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-[100dvh] md:ml-[240px] transition-[margin] duration-200">
        <MobileNav />
        <main className="flex-1 p-3 sm:p-5 lg:p-8 container-pad pb-safe">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent animate-spin rounded-full" />
      </div>
      <p className="text-sm text-muted-foreground">Cargando...</p>
    </div>
  )
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
        <Route path="/ligas/:leagueId/equipos/:teamId" element={<TeamDetail />} />
        <Route path="/ligas/:leagueId/partidos" element={<Matches />} />
        <Route path="/ligas/:leagueId/clasificacion" element={<Standings />} />
        <Route path="/ligas/:leagueId/admin" element={<Admin />} />
        <Route path="/equipos" element={<EquiposSelector />} />
        <Route path="/partidos" element={<PartidosSelector />} />
        <Route path="/clasificacion" element={<ClasificacionSelector />} />
        <Route path="/admin" element={<AdminSelector />} />
        <Route path="/participantes" element={<Participants />} />
        <Route path="/express" element={<Express />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}
