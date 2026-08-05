import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar, MobileNav } from '@/components/layout/Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { ThemeProvider } from '@/lib/ThemeContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { LeagueProvider } from '@/lib/LeagueContext'
import AuthPage from '@/components/auth/AuthPage'
import Dashboard from '@/pages/Dashboard'
import Leagues from '@/pages/Leagues'
import LeagueDetail from '@/pages/LeagueDetail'
import LeagueSetupWizard from '@/components/leagues/LeagueSetupWizard'
import Teams from '@/pages/Teams'
import Matches from '@/pages/Matches'
import Standings from '@/pages/Standings'
import Admin from '@/pages/Admin'
import EquiposSelector from '@/pages/EquiposSelector'
import PartidosSelector from '@/pages/PartidosSelector'
import ClasificacionSelector from '@/pages/ClasificacionSelector'
import AdminSelector from '@/pages/AdminSelector'
import Participants from '@/pages/Participants'
import Express from '@/pages/Express'
import Profile from '@/pages/Profile'
import Tracks from '@/pages/Tracks'
import { Zap, Loader2 } from 'lucide-react'

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-h-screen relative">
        <div className="fixed inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, hsla(207, 100%, 47%, 0.03) 0%, transparent 30%, transparent 70%, hsla(320, 80%, 46%, 0.02) 100%)`,
          }}
        />
        <MobileNav />
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="max-w-[1200px] mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 flex items-center justify-center bg-court">
          <Zap className="w-7 h-7 text-white animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-fg-secondary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium tracking-wider uppercase">Cargando</span>
        </div>
      </div>
    </div>
  )
}

function App() {
  const location = useLocation()
  const { user, loading, signIn, signUp } = useAuth()

  if (loading) return <AppLoading />

  if (!user) {
    return (
      <ThemeProvider>
        <AuthPage onSignIn={signIn} onSignUp={signUp} />
      </ThemeProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LeagueProvider>
          <AppLayout>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ligas" element={<Leagues />} />
                <Route path="/ligas/nueva" element={<LeagueSetupWizard />} />
                <Route path="/ligas/:leagueId" element={<LeagueDetail />} />
                <Route path="/ligas/:leagueId/editar" element={<LeagueSetupWizard />} />
                <Route path="/ligas/:leagueId/equipos" element={<Teams />} />
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
            </AnimatePresence>
          </AppLayout>
        </LeagueProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
