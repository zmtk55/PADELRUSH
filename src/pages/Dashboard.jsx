import { useState } from 'react'
import { Trophy, Users, Calendar, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatCard, { StatCardSkeleton } from '@/components/dashboard/StatCard'
import MatchesChart from '@/components/dashboard/MatchesChart'
import UpcomingMatches from '@/components/dashboard/UpcomingMatches'
import TopPlayers from '@/components/dashboard/TopPlayers'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import { useDashboardData } from '@/hooks/useDashboard'
import { useLeagues } from '@/hooks/useLeagues'

export default function Dashboard() {
  const { leaguesQuery } = useLeagues()
  const leagues = leaguesQuery.data || []
  const [selectedLeagueId, setSelectedLeagueId] = useState('all')
  const { stats, chartData, upcomingMatches, topPlayers, activities, isLoading, isError, refetchAll } =
    useDashboardData(selectedLeagueId)

  const statCards = [
    { label: 'Ligas activas', icon: Trophy, color: 'text-primary', value: stats.activas },
    { label: 'Participantes', icon: Users, color: 'text-blue-500', value: stats.participantes },
    { label: 'Partidos jugados', icon: Calendar, color: 'text-emerald-500', value: stats.partidosJugados },
    { label: 'Total ligas', icon: TrendingUp, color: 'text-amber-500', value: stats.totalLeagues },
  ]

  return (
    <div>
      <DashboardHeader
        leagues={leagues}
        selectedLeagueId={selectedLeagueId}
        onLeagueChange={setSelectedLeagueId}
      />

      {isError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 mb-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400 flex-1">Error al cargar datos</p>
          <button
            onClick={refetchAll}
            className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700"
          >
            <RefreshCw className="w-3 h-3" />
            Reintentar
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
          : statCards.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 0.05} />
            ))
        }
      </div>

      <div className="space-y-6">
        <MatchesChart data={chartData} />

        <div className="grid lg:grid-cols-2 gap-6">
          <UpcomingMatches matches={upcomingMatches} leagueId={selectedLeagueId !== 'all' ? selectedLeagueId : null} />
          <TopPlayers players={topPlayers} leagueId={selectedLeagueId !== 'all' ? selectedLeagueId : null} />
        </div>

        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}
