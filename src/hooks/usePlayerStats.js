import { req, useFetch } from '@/lib/data'
import { supabase } from '@/lib/supabaseClient'

export function usePlayerStats(leagueId) {
  const q = useFetch(
    async () => await req('GET', `/player_stats?select=*&league_id=eq.${leagueId}&order=final_ranking.asc.nullslast`),
    [leagueId],
    []
  )
  return {
    statsQuery: q,
    upsertStats: { mutateAsync: (s) => supabase.from('player_stats').upsert(s).select() },
  }
}
