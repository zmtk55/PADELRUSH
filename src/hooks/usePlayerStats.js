import { useQuery } from '@tanstack/react-query'
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient'

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
      return fetchFrom(`player_stats?select=*&league_id=eq.${leagueId}&order=win_percentage.desc`, signal)
    },
    enabled: !!leagueId,
  })

  return { statsQuery }
}
