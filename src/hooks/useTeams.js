import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export function useTeams(leagueId) {
  const teamsQuery = useQuery({
    queryKey: ['teams', leagueId],
    queryFn: async () => {
      if (!leagueId) return []
      const { data, error } = await supabase.from('teams').select('*').eq('league_id', leagueId).order('category', { ascending: true }).order('team_number', { ascending: true })
      if (error) throw error
      return data || []
    },
    enabled: !!leagueId
  })

  return {
    teamsQuery,
    createTeamsBatch: { mutateAsync: (t) => supabase.from('teams').insert(t).select().then(r => { if (r.error) throw r.error; return r.data }) },
    updateTeam: { mutateAsync: ({ id, ...v }) => supabase.from('teams').update(v).eq('id', id).select().single().then(r => { if (r.error) throw r.error; return r.data }) },
    deleteTeam: { mutateAsync: async (id) => { const r = await supabase.from('teams').delete().eq('id', id); if (r.error) throw r.error } },
  }
}
