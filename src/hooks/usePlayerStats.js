import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

function queryWithTimeout(promise, ms = 10000) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))])
}

export function usePlayerStats(leagueId) {
  const statsQuery = useQuery({
    queryKey: ['player-stats', leagueId],
    queryFn: async () => {
      const { data, error } = await queryWithTimeout(supabase.from('player_stats').select('*').eq('league_id', leagueId).order('win_percentage', { ascending: false }))
      if (error) throw error
      return data || []
    },
    enabled: !!leagueId, retry: 1, staleTime: 30_000,
  })

  return { statsQuery }
}
