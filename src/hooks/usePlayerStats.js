import { useQuery } from '@tanstack/react-query'

const URL = 'https://xmpsqjhywmwdekuhudtt.supabase.co/rest/v1'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHNxamh5d213ZGVrdWh1ZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjM5NzgsImV4cCI6MjA5MzgzOTk3OH0.-6CSavZAVZhRV72MTsaoJZN0cRvlS8ee-9Tc2jFuLRQ'
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, Accept: 'application/json' }

async function get(url) {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), 8000)
  try {
    const r = await fetch(`${URL}${url}`, { headers: H, signal: c.signal })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  } finally { clearTimeout(t) }
}

export function usePlayerStats(leagueId) {
  const statsQuery = useQuery({ queryKey: ['player-stats', leagueId], queryFn: () => get(`/player_stats?select=*&league_id=eq.${leagueId}&order=win_percentage.desc`), enabled: !!leagueId, retry: 1, staleTime: 30000 })
  return { statsQuery }
}
