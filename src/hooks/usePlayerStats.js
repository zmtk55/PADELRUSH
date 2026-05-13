import { req, useFetch } from '@/lib/data'
export function usePlayerStats(leagueId) {
  const q = useFetch(() => req('GET', `/player_stats?select=*&league_id=eq.${leagueId}&order=win_percentage.desc`), [leagueId])
  return { statsQuery: q }
}
