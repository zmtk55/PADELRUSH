import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
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
  const { isOrganizer } = useAuth()
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

  if (leaguesQuery.isLoading || loading) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Resumen general de tus ligas"
          action={
            <div className="flex items-center gap-3">
              <LeagueSelector leagues={leagues} selectedLeague={selectedLeague} onSelect={setSelectedLeague} />
              {isOrganizer && (
                <Button onClick={() => navigate('/ligas/nueva')}>
                  <Trophy className="w-4 h-4" />
                  Nueva Liga
                </Button>
              )}
            </div>
          }
        />
        <DashboardSkeleton />
      </div>
    )
  }

  if (!leagues?.length) {
    return <EmptyDashboard />
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen general de tus ligas"
        action={
          <div className="flex items-center gap-3">
            <LeagueSelector leagues={leagues} selectedLeague={selectedLeague} onSelect={setSelectedLeague} />
            {isOrganizer && (
              <Button onClick={() => navigate('/ligas/nueva')}>
                <Trophy className="w-4 h-4" />
                Nueva Liga
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Stats */}
        <StatsGrid stats={stats} />

        {/* Activity Chart */}
        <ActivityChart data={activityData} timeRange={timeRange} onTimeRangeChange={setTimeRange} />

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          <LeagueOverview leagues={leagues} />
          <QuickActions />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <UpcomingMatches matches={upcomingMatches} />
          <RecentActivity activities={recentActivity} />
        </div>
      </div>
    </div>
  )
}
