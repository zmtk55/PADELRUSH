import { req, useFetch } from '@/lib/data'
import { demoData } from '@/lib/demoData'

export function usePlayerStats(leagueId) {
  const initialStats = demoData.player_stats?.filter(s => s.league_id === leagueId) || []
  const q = useFetch(
    async () => {
      try {
        const result = await req('GET', `/player_stats?select=*&league_id=eq.${leagueId}&order=win_percentage.desc`)
        return result
      } catch (e) {
        console.log('PlayerStats fallback to demo data', e?.message)
        return demoData.player_stats?.filter(s => s.league_id === leagueId) || []
      }
    },
    [leagueId],
    initialStats
  )
  return { statsQuery: q }
}
