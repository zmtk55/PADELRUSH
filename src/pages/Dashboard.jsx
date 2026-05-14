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
          className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-sm"
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-red-600 dark:text-red-400">Error al cargar datos</p>
          <button
            onClick={refetchAll}
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
