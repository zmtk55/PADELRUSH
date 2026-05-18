import { req, useFetch } from '@/lib/data'
import { supabase } from '@/lib/supabaseClient'
import { demoData } from '@/lib/demoData'

export function useMatches(leagueId) {
  const initialMatches = demoData.matches?.filter(m => m.league_id === leagueId) || []
  const q = useFetch(
    async () => {
      try {
        const result = await req('GET', `/matches?select=*&league_id=eq.${leagueId}&order=round.asc.nullslast&order=match_number.asc.nullslast`)
        return result
      } catch (e) {
        console.log('Matches fallback to demo data', e?.message)
        return demoData.matches?.filter(m => m.league_id === leagueId) || []
      }
    },
    [leagueId],
    initialMatches
  )
  return {
    matchesQuery: q,
    createMatchesBatch: { mutateAsync: (m) => supabase.from('matches').insert(m).select().then(r => { if (r.error) throw r.error; return r.data }) },
    updateMatch: { mutateAsync: ({ id, ...v }) => supabase.from('matches').update(v).eq('id', id).select().single().then(r => { if (r.error) throw r.error; return r.data }) },
    deleteMatch: { mutateAsync: async (id) => { const r = await supabase.from('matches').delete().eq('id', id); if (r.error) throw r.error } },
  }
}
