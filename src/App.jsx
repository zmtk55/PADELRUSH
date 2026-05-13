import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar, MobileNav } from '@/components/layout/Sidebar'
import Dashboard from '@/pages/Dashboard'
import Leagues from '@/pages/Leagues'
import LeagueDetail from '@/pages/LeagueDetail'
import Teams from '@/pages/Teams'
import Matches from '@/pages/Matches'
import Standings from '@/pages/Standings'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import PlayerDetail from '@/pages/PlayerDetail'
import Participants from '@/pages/Participants'

function AuthGate() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AuthGate />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ligas" element={<Leagues />} />
          <Route path="/ligas/:leagueId" element={<LeagueDetail />} />
          <Route path="/ligas/:leagueId/equipos" element={<Teams />} />
          <Route path="/ligas/:leagueId/partidos" element={<Matches />} />
          <Route path="/ligas/:leagueId/standings" element={<Standings />} />
          <Route path="/jugadores" element={<Participants />} />
          <Route path="/jugadores/:playerName" element={<PlayerDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      <main className="flex-1 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}