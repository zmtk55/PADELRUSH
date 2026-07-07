import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Users, Plus, Zap } from 'lucide-react'
import { PageContainer } from '@/components/ui/layout-components'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'
import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { UpcomingMatches } from '@/components/dashboard/UpcomingMatches'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { LeagueOverview } from '@/components/dashboard/LeagueOverview'
import SuperToolbar from '@/components/layout/SuperToolbar'
import { QuickActions } from '@/components/dashboard/QuickActions'

export default function Dashboard() {
  const navigate = useNavigate()
  const { leaguesQuery } = useLeagues()
  const { isOrganizer, profile } = useAuth()
  const leagues = leaguesQuery?.data || []
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [timeRange, setTimeRange] = useState('week')

  const {
    stats,
    activityData,
    upcomingMatches,
    recentActivity,
    loading: isLoading,
    error,
    refetch,
  } = useDashboard(selectedLeague, timeRange)

  return (
    <div className="max-w-[1200px] mx-auto p-4 lg:p-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            DASH<span className="text-develop">BOARD</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            {isLoading ? 'Cargando...' : leagues?.length > 0
              ? `Resumen · ${leagues.length} ${leagues.length === 1 ? 'liga' : 'ligas'}`
              : 'Resumen general'}
          </p>
        </div>
        {isOrganizer && (
          <button onClick={() => navigate('/ligas/nueva')} className="btn btn-primary h-10 px-4 text-sm gap-2">
            <Plus className="w-4 h-4" />
            Nueva liga
          </button>
        )}
      </div>

      <SuperToolbar
        context="dashboard"
        isOrganizer={isOrganizer}
        onNewLeague={() => navigate('/ligas/nueva')}
        onNewTeam={() => navigate('/equipos/nuevo')}
        onRefresh={() => leaguesQuery.refetch()}
      />

      {!isLoading && leagues?.length > 0 && profile?.display_name && (
        <div className="vercel-card p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-gray-900 text-white text-sm font-medium rounded-md">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                Buenos días, <span className="font-semibold">{profile.display_name.split(' ')[0]}</span>
              </p>
              {stats?.activeLeagues > 0 && (
                <p className="text-xs text-gray-600 mt-0.5">
                  <span className="text-develop font-medium">{stats.activeLeagues}</span>
                  {' '}{stats.activeLeagues === 1 ? 'liga activa' : 'ligas activas'}
                  {' · '}
                  <span className="text-[hsl(var(--ball))] font-medium">{stats?.totalPlayers || 0}</span> jugadores
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="vercel-card h-[100px] animate-pulse" />
            ))}
          </div>
          <div className="vercel-card h-[280px] animate-pulse" />
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="vercel-card h-[200px] animate-pulse" />
            ))}
          </div>
        </div>
      ) : !leagues?.length ? (
        <EmptyDashboard />
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="vercel-card p-4 border-l-4 border-ship">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-ship" />
                  <p className="text-sm text-ship font-medium">{error}</p>
                </div>
                <button onClick={refetch} className="btn btn-ghost h-8 px-3 text-xs shrink-0">
                  Reintentar
                </button>
              </div>
            </div>
          )}

          <div className="vercel-card p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-medium uppercase tracking-wider text-gray-600">
                Estadísticas
              </h2>
              <div className="flex gap-1">
                {[
                  { key: 'week', label: 'Semana' },
                  { key: 'month', label: 'Mes' },
                  { key: 'all', label: 'Todo' },
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => setTimeRange(r.key)}
                    className={`h-6 px-2.5 text-[10px] font-medium uppercase transition-colors ${
                      timeRange === r.key 
                        ? 'bg-gray-900 text-white rounded' 
                        : 'bg-gray-50 text-gray-600 hover:text-gray-900 rounded'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <StatsGrid stats={stats} />
          </div>

          <div className="vercel-card p-5">
            <ActivityChart data={activityData} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="vercel-card p-5">
              <LeagueOverview leagues={leagues} />
            </div>
            <div className="vercel-card p-5">
              <QuickActions />
            </div>
            <div className="vercel-card p-5 lg:col-span-2">
              <RecentActivity activities={recentActivity} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}