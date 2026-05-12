import { useQuery } from '@tanstack/react-query'

const API = 'https://xmpsqjhywmwdekuhudtt.supabase.co/rest/v1'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHNxamh5d213ZGVrdWh1ZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjM5NzgsImV4cCI6MjA5MzgzOTk3OH0.-6CSavZAVZhRV72MTsaoJZN0cRvlS8ee-9Tc2jFuLRQ'

async function apiGet(url) {
  const res = await fetch(`${API}${url}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export function usePlayerStats(leagueId) {
  const statsQuery = useQuery({
    queryKey: ['player-stats', leagueId],
    queryFn: () => apiGet(`/player_stats?select=*&league_id=eq.${leagueId}&order=win_percentage.desc`),
    enabled: !!leagueId, retry: 2, staleTime: 10_000,
  })
  return { statsQuery }
}
