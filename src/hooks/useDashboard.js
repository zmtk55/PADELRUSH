import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { authedReq, useFetch } from '@/lib/data'

export function useDashboard(leagueId, timeRange = 'week') {
  const [stats, setStats] = useState(null)
  const [activityData, setActivityData] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      let leagues = []
      if (leagueId) {
        leagues = await authedReq('GET', `/leagues?select=*&id=eq.${leagueId}`)
      } else {
        leagues = await authedReq('GET', '/leagues?select=*')
      }

      let totalMatches = 0
      let totalParticipants = 0
      let totalTeams = 0
      let activeLeagues = 0

      for (const league of leagues) {
        if (league.status === 'activa') activeLeagues++

        const matches = await authedReq('GET', `/matches?select=id&league_id=eq.${league.id}&status=eq.jugado`)
        totalMatches += matches?.length || 0

        // Get teams first, then count unique participants via player1_id/player2_id
        const teams = await authedReq('GET', `/teams?select=id,player1_id,player2_id&league_id=eq.${league.id}`)
        totalTeams += teams?.length || 0

        const participantIds = new Set()
        ;(teams || []).forEach(t => {
          if (t.player1_id) participantIds.add(t.player1_id)
          if (t.player2_id) participantIds.add(t.player2_id)
        })
        totalParticipants += participantIds.size
      }

      setStats({
        totalLeagues: leagues.length,
        activeLeagues,
        totalMatches,
        totalParticipants,
        totalTeams,
        leagues,
      })
    } catch (e) {
      console.error('Error fetching stats:', e)
      setStats({
        totalLeagues: 0,
        activeLeagues: 0,
        totalMatches: 0,
        totalParticipants: 0,
        totalTeams: 0,
        leagues: [],
      })
    }
  }, [leagueId])

  const fetchActivityData = useCallback(async () => {
    try {
      let matches = []
      if (leagueId) {
        matches = await authedReq('GET', `/matches?select=*&league_id=eq.${leagueId}&status=eq.jugado&order=played_date.asc`)
      } else {
        matches = await authedReq('GET', '/matches?select=*&status=eq.jugado&order=played_date.asc')
      }

      if (!matches?.length) {
        setActivityData([])
        return
      }

      const now = new Date()
      const groupedData = {}

      matches.forEach(match => {
        const date = new Date(match.played_date || match.created_at)
        let label
        if (timeRange === 'week') {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          label = weekStart.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
        } else if (timeRange === 'month') {
          label = date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
        } else {
          label = date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
        }

        groupedData[label] = (groupedData[label] || 0) + 1
      })

      const chartData = Object.entries(groupedData).map(([label, count]) => ({
        label,
        partidos: count,
      }))

      setActivityData(chartData)
    } catch (e) {
      console.error('Error fetching activity data:', e)
      setActivityData([])
    }
  }, [leagueId, timeRange])

  const fetchUpcomingMatches = useCallback(async () => {
    try {
      let matches = []
      if (leagueId) {
        matches = await authedReq('GET', `/matches?select=*,teams!team1_id(team_name),leagues(name)&league_id=eq.${leagueId}&status=eq.programado&order=scheduled_date.asc&limit=5`)
      } else {
        matches = await authedReq('GET', '/matches?select=*,teams!team1_id(team_name),leagues(name)&status=eq.programado&order=scheduled_date.asc&limit=5')
      }
      setUpcomingMatches(matches || [])
    } catch (e) {
      console.error('Error fetching upcoming matches:', e)
      setUpcomingMatches([])
    }
  }, [leagueId])

  const fetchRecentActivity = useCallback(async () => {
    try {
      let matches = []
      if (leagueId) {
        matches = await authedReq('GET', `/matches?select=*,leagues(name)&league_id=eq.${leagueId}&status=eq.jugado&order=updated_at.desc&limit=10`)
      } else {
        matches = await authedReq('GET', '/matches?select=*,leagues(name)&status=eq.jugado&order=updated_at.desc&limit=10')
      }

      const activities = (matches || []).map(m => ({
        id: m.id,
        type: 'match_result',
        title: `${m.team1_name || 'Equipo 1'} vs ${m.team2_name || 'Equipo 2'}`,
        league: m.leagues?.name || '',
        date: m.updated_at || m.created_at,
        details: m.winner_team_number ? `Ganador: Equipo ${m.winner_team_number}` : 'Partido jugado',
      }))

      setRecentActivity(activities)
    } catch (e) {
      console.error('Error fetching recent activity:', e)
      setRecentActivity([])
    }
  }, [leagueId])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    Promise.all([
      fetchStats(),
      fetchActivityData(),
      fetchUpcomingMatches(),
      fetchRecentActivity(),
    ]).then(() => {
      if (mounted) setLoading(false)
    }).catch(e => {
      if (mounted) {
        setError(e.message)
        setLoading(false)
      }
    })

    return () => { mounted = false }
  }, [fetchStats, fetchActivityData, fetchUpcomingMatches, fetchRecentActivity])

  const refetch = useCallback(() => {
    fetchStats()
    fetchActivityData()
    fetchUpcomingMatches()
    fetchRecentActivity()
  }, [fetchStats, fetchActivityData, fetchUpcomingMatches, fetchRecentActivity])

  return {
    stats,
    activityData,
    upcomingMatches,
    recentActivity,
    loading,
    error,
    refetch,
  }
}
