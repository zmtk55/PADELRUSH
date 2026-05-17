import { useQuery } from '@tanstack/react-query'
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient'
import { demoData } from '@/lib/demo-data'

const demoStats = [
  { id: 's1', player_name: 'Ana García', category: '5TA', matches_played: 5, matches_won: 4, matches_lost: 1, sets_won: 9, sets_lost: 3, win_percentage: 80 },
  { id: 's2', player_name: 'María López', category: '5TA', matches_played: 5, matches_won: 3, matches_lost: 2, sets_won: 7, sets_lost: 5, win_percentage: 60 },
  { id: 's3', player_name: 'Roberto Sánchez', category: '5TA', matches_played: 5, matches_won: 2, matches_lost: 3, sets_won: 5, sets_lost: 7, win_percentage: 40 },
  { id: 's4', player_name: 'Carlos Mendoza', category: '5TA', matches_played: 5, matches_won: 1, matches_lost: 4, sets_won: 3, sets_lost: 9, win_percentage: 20 },
  { id: 's5', player_name: 'Sofia Hernández', category: '4TA', matches_played: 4, matches_won: 4, matches_lost: 0, sets_won: 8, sets_lost: 0, win_percentage: 100 },
  { id: 's6', player_name: 'Laura Martínez', category: '4TA', matches_played: 4, matches_won: 3, matches_lost: 1, sets_won: 6, sets_lost: 2, win_percentage: 75 },
  { id: 's7', player_name: 'Alejandro Vega', category: '4TA', matches_played: 4, matches_won: 2, matches_lost: 2, sets_won: 4, sets_lost: 4, win_percentage: 50 },
  { id: 's8', player_name: 'Diego Castillo', category: '4TA', matches_played: 4, matches_won: 1, matches_lost: 3, sets_won: 2, sets_lost: 6, win_percentage: 25 },
]

async function fetchFrom(path, signal) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    signal,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function usePlayerStats(leagueId) {
  const statsQuery = useQuery({
    queryKey: ['player-stats', leagueId],
    queryFn: async ({ signal }) => {
      try {
        const data = await fetchFrom(`player_stats?select=*&league_id=eq.${leagueId}&order=win_percentage.desc`, signal)
        if (!data || data.length === 0) return demoStats
        return data
      } catch (e) {
        return demoStats
      }
    },
    enabled: !!leagueId,
  })

  return { statsQuery }
}
