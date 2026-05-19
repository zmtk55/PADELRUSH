import { req, useFetch } from '@/lib/data'
import { supabase } from '@/lib/supabaseClient'

export function useTeams(leagueId) {
  const q = useFetch(
    async () => await req('GET', `/teams?select=*&league_id=eq.${leagueId}&order=category.asc&order=team_number.asc`),
    [leagueId],
    []
  )
  return {
    teamsQuery: q,
    createTeamsBatch: { mutateAsync: (t) => supabase.from('teams').insert(t).select().then(r => { if (r.error) throw r.error; return r.data }) },
    updateTeam: { mutateAsync: ({ id, ...v }) => supabase.from('teams').update(v).eq('id', id).select().single().then(r => { if (r.error) throw r.error; return r.data }) },
    deleteTeam: { mutateAsync: async (id) => { const r = await supabase.from('teams').delete().eq('id', id); if (r.error) throw r.error } },
  }
}
