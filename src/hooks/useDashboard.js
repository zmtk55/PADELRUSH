import { useQuery } from '@tanstack/react-query'
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient'
import { demoData } from '@/lib/demo-data'

async function fetchFrom(path, signal) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    signal,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function hasNoData(data) {
  return !data || (Array.isArray(data) && data.length === 0)
}

function groupByDate(matches) {
  const groups = {}
  matches.forEach((m) => {
    const date = m.played_at?.split('T')[0] || m.date
    groups[date] = (groups[date] || 0) + 1
  })
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([name, value]) => ({ name: name.slice(5), value }))
}

function groupByWeek(matches) {
  const groups = {}
  matches.forEach((m) => {
    const d = new Date(m.played_at || m.date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    groups[key] = (groups[key] || 0) + 1
  })
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([name, value]) => ({ name: `Sem ${name.slice(5)}`, value }))
}

export function useDashboardData(leagueId) {
  const filter = leagueId && leagueId !== 'all' ? `&league_id=eq.${leagueId}` : ''

  const statsQuery = useQuery({
    queryKey: ['dashboard-stats', leagueId],
    queryFn: async ({ signal }) => {
      let leagues = [], participants = [], matches = []
      try {
        [leagues, participants, matches] = await Promise.all([
          fetchFrom(`leagues?select=id,status,categories${filter}&limit=100`, signal),
          fetchFrom(`participants?select=id${filter}&limit=1000`, signal),
          fetchFrom(`matches?select=id,status,played_at,date${filter}&limit=500`, signal),
        ])
      } catch (e) { console.warn('Fetch failed, using demo data') }
      
      if (hasNoData(leagues) && hasNoData(participants) && hasNoData(matches)) {
        return {
          totalLeagues: demoData.leagues.length,
          activas: demoData.leagues.filter(l => l.status === 'activa').length,
          participantes: demoData.participants.length,
          partidosJugados: demoData.matches.filter(m => m.status === 'jugado').length,
        }
      }
      
      const activas = leagues.filter((l) => l.status === 'activa').length
      const jugados = matches.filter((m) => m.status === 'jugado').length
      return {
        totalLeagues: leagues.length,
        activas,
        participantes: participants.length,
        partidosJugados: jugados,
      }
    },
    staleTime: 30_000,
    retry: 1,
  })

  const chartQuery = useQuery({
    queryKey: ['dashboard-chart', leagueId],
    queryFn: async ({ signal }) => {
      let matches = []
      try {
        matches = await fetchFrom(`matches?select=id,status,played_at,date,league_id${filter}&status=eq.jugado&limit=500`, signal)
      } catch (e) {}
      if (hasNoData(matches)) {
        return { byDay: groupByDate(demoData.matches), byWeek: groupByWeek(demoData.matches) }
      }
      return { byDay: groupByDate(matches), byWeek: groupByWeek(matches) }
    },
    staleTime: 30_000,
    retry: 1,
  })

  const upcomingQuery = useQuery({
    queryKey: ['dashboard-upcoming', leagueId],
    queryFn: async ({ signal }) => {
      let data = []
      try {
        data = await fetchFrom(`matches?select=*,team1:team1_id(name),team2:team2_id(name)&status=eq.pendiente&order=scheduled_at.asc&limit=5${filter}`, signal)
      } catch (e) {}
      if (hasNoData(data)) {
        return demoData.matches.filter(m => m.status === 'programado')
      }
      return data
    },
    staleTime: 15_000,
    retry: 1,
  })

  const topPlayersQuery = useQuery({
    queryKey: ['dashboard-top-players', leagueId],
    queryFn: async ({ signal }) => {
      let stats = []
      try {
        stats = await fetchFrom(`player_stats?select=*,participant:participant_id(name)&order=puntos.desc&limit=5${filter}`, signal)
      } catch (e) {}
      if (hasNoData(stats)) {
        return demoData.participants.slice(0, 5).map((p, i) => ({
          id: p.id,
          name: p.name,
          puntos: 100 - (i * 15),
          trend: i < 2 ? 'up' : null,
        }))
      }
      return stats.map((s) => ({
        id: s.id,
        name: s.participant?.name || 'Jugador',
        puntos: s.puntos || 0,
        trend: s.partidos_jugados > 3 ? (s.puntos > 10 ? 'up' : 'down') : null,
      }))
    },
    staleTime: 30_000,
    retry: 1,
  })

  const activityQuery = useQuery({
    queryKey: ['dashboard-activity', leagueId],
    queryFn: async ({ signal }) => {
      const leagues = await fetchFrom(`leagues?select=id,name,created_at,status&order=created_at.desc&limit=8`, signal)
      return leagues.map((l) => ({
        id: `league-${l.id}`,
        type: 'league_created',
        message: `Liga "${l.name}" creada`,
        created_at: l.created_at,
      }))
    },
    staleTime: 30_000,
    retry: 1,
  })

  return {
    stats: statsQuery.data || { totalLeagues: 0, activas: 0, participantes: 0, partidosJugados: 0 },
    chartData: chartQuery.data || { byDay: [], byWeek: [] },
    upcomingMatches: upcomingQuery.data || [],
    topPlayers: topPlayersQuery.data || [],
    activities: activityQuery.data || [],
    isLoading: statsQuery.isLoading || chartQuery.isLoading || upcomingQuery.isLoading || topPlayersQuery.isLoading || activityQuery.isLoading,
    isError: statsQuery.isError || chartQuery.isError || upcomingQuery.isError || topPlayersQuery.isError || activityQuery.isError,
    refetchAll: () => {
      statsQuery.refetch()
      chartQuery.refetch()
      upcomingQuery.refetch()
      topPlayersQuery.refetch()
      activityQuery.refetch()
    },
  }
}
