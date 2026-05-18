import { req, useFetch } from '@/lib/data'
import { supabase } from '@/lib/supabaseClient'
import { demoData } from '@/lib/demoData'

export function useTeams(leagueId) {
  const initialTeams = demoData.teams?.filter(t => t.league_id === leagueId) || []
  console.log('useTeams DEBUG:', { leagueId, initialTeams, allTeams: demoData.teams })
  
  const q = useFetch(
    async () => {
      console.log('useTeams fetching API...')
      try {
        const result = await req('GET', `/teams?select=*&league_id=eq.${leagueId}&order=team_number`)
        console.log('useTeams API result:', result)
        return result
      } catch (e) {
        console.log('useTeams API error:', e?.message, '- returning initialTeams:', initialTeams)
        return initialTeams
      }
    },
    [leagueId],
    initialTeams
  )
  return {
    teamsQuery: q,
    createTeam: { mutateAsync: (t) => supabase.from('teams').insert(t).select().single().then(r => { if (r.error) throw r.error; return r.data }) },
    createTeamsBatch: { mutateAsync: (t) => supabase.from('teams').insert(t).select().then(r => { if (r.error) throw r.error; return r.data }) },
    updateTeam: { mutateAsync: ({ id, ...v }) => supabase.from('teams').update(v).eq('id', id).select().single().then(r => { if (r.error) throw r.error; return r.data }) },
    deleteTeam: { mutateAsync: async (id) => { const r = await supabase.from('teams').delete().eq('id', id); if (r.error) throw r.error } },
  }
}
