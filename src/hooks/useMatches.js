import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export function useMatches(leagueId) {
  const queryClient = useQueryClient()

  const matchesQuery = useQuery({
    queryKey: ['matches', leagueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('league_id', leagueId)
        .order('round', { ascending: true, nullsFirst: false })
        .order('match_number', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data
    },
    enabled: !!leagueId,
  })

  const createMatchesBatch = useMutation({
    mutationFn: async (matches) => {
      const { data, error } = await supabase.from('matches').insert(matches).select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', leagueId] })
      toast.success('Partidos generados')
    },
    onError: (error) => toast.error(error.message),
  })

  const updateMatch = useMutation({
    mutationFn: async ({ id, ...values }) => {
      const { data, error } = await supabase.from('matches').update(values).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches', leagueId] })
      queryClient.invalidateQueries({ queryKey: ['player-stats', leagueId] })
      if (data.status === 'jugado') toast.success('Resultado guardado')
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteMatch = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('matches').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', leagueId] })
      toast.success('Partido eliminado')
    },
    onError: (error) => toast.error(error.message),
  })

  return { matchesQuery, createMatchesBatch, updateMatch, deleteMatch }
}
