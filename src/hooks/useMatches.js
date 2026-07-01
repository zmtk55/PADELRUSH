import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export function useMatches(leagueId) {
  const matchesQuery = useQuery({
    queryKey: ['matches', leagueId],
    queryFn: async () => {
      if (!leagueId) return []
      const { data, error } = await supabase.from('matches').select('*').eq('league_id', leagueId).order('round', { ascending: true }).order('match_number', { ascending: true })
      if (error) throw error
      return data || []
    },
    enabled: !!leagueId
  })

  return {
    matchesQuery,
    createMatchesBatch: { mutateAsync: (m) => supabase.from('matches').insert(m).select().then(r => { if (r.error) throw r.error; return r.data }) },
    updateMatch: { mutateAsync: ({ id, ...v }) => supabase.from('matches').update(v).eq('id', id).select().single().then(r => { if (r.error) throw r.error; return r.data }) },
    deleteMatch: { mutateAsync: async (id) => { const r = await supabase.from('matches').delete().eq('id', id); if (r.error) throw r.error } },
  }
}
