import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export function usePlayerStats(leagueId) {
  const statsQuery = useQuery({
    queryKey: ['player-stats', leagueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('league_id', leagueId)
        .order('win_percentage', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!leagueId,
  })

  return { statsQuery }
}
