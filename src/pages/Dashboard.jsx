import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { UpcomingMatches } from '@/components/dashboard/UpcomingMatches'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { LeagueOverview } from '@/components/dashboard/LeagueOverview'
import { LeagueSelector } from '@/components/dashboard/LeagueSelector'

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
    loading,
    error,
  } = useDashboard(selectedLeague, timeRange)

  const isLoading = leaguesQuery.isLoading || loading

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Dashboard"
        description={
          isLoading ? 'Cargando...' : leagues?.length > 0 ? 'Resumen general de tus ligas' : 'Resumen general de tus ligas'
        }
        action={
          <div className="flex items-center gap-3">
            {!isLoading && leagues?.length > 0 && (
              <LeagueSelector leagues={leagues} selectedLeague={selectedLeague} onSelect={setSelectedLeague} />
            )}
            {isOrganizer && (
              <Button onClick={() => navigate('/ligas/nueva')}>
                <Trophy className="w-4 h-4" />
                Nueva Liga
              </Button>
            )}
          </div>
        }
      />

      {!isLoading && leagues?.length > 0 && profile?.display_name && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 pb-6 border-b border-border/50"
        >
          <p className="text-sm font-body text-muted-foreground">
            Buenos d&iacute;as, <span className="text-foreground font-semibold">{profile.display_name.split(' ')[0]}</span>
            {stats?.activeLeagues > 0 && (
              <> &middot; <span className="text-muted-foreground">{stats.activeLeagues} {stats.activeLeagues === 1 ? 'liga activa' : 'ligas activas'}</span></>
            )}
          </p>
        </motion.div>
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : !leagues?.length ? (
        <EmptyDashboard />
      ) : (
        <div className="space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-body text-destructive">{error}</p>
            </div>
          )}

          <StatsGrid stats={stats} />
          <ActivityChart data={activityData} timeRange={timeRange} onTimeRangeChange={setTimeRange} />

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <LeagueOverview leagues={leagues} />
            <QuickActions />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <UpcomingMatches matches={upcomingMatches} />
            <RecentActivity activities={recentActivity} />
          </div>
        </div>
      )}
    </motion.div>
    </div>
  )
}
