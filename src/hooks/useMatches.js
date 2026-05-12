import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

function queryWithTimeout(promise, ms = 10000) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))])
}

export function useMatches(leagueId) {
  const qc = useQueryClient()

  const matchesQuery = useQuery({
    queryKey: ['matches', leagueId],
    queryFn: async () => {
      const { data, error } = await queryWithTimeout(supabase.from('matches').select('*').eq('league_id', leagueId).order('round', { ascending: true, nullsFirst: false }).order('match_number', { ascending: true, nullsFirst: false }))
      if (error) throw error
      return data || []
    },
    enabled: !!leagueId, retry: 1, staleTime: 30_000,
  })

  const createMatchesBatch = useMutation({
    mutationFn: async (m) => { const { data, error } = await supabase.from('matches').insert(m).select(); if (error) throw error; return data },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matches', leagueId] }); toast.success('Partidos generados') },
    onError: (e) => toast.error(e.message),
  })
  const updateMatch = useMutation({
    mutationFn: async ({ id, ...v }) => { const { data, error } = await supabase.from('matches').update(v).eq('id', id).select().single(); if (error) throw error; return data },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['matches', leagueId] }); qc.invalidateQueries({ queryKey: ['player-stats', leagueId] }); if (d.status === 'jugado') toast.success('Resultado guardado') },
    onError: (e) => toast.error(e.message),
  })
  const deleteMatch = useMutation({
    mutationFn: async (id) => { const { error } = await supabase.from('matches').delete().eq('id', id); if (error) throw error },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matches', leagueId] }); toast.success('Partido eliminado') },
    onError: (e) => toast.error(e.message),
  })

  return { matchesQuery, createMatchesBatch, updateMatch, deleteMatch }
}
