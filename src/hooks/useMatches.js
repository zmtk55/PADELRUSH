import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { demoData } from '@/lib/demo-data'

async function fetchFrom(path, signal) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    signal,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function useMatches(leagueId) {
  const queryClient = useQueryClient()

  const matchesQuery = useQuery({
    queryKey: ['matches', leagueId],
    queryFn: async ({ signal }) => {
      let data = []
      try {
        data = await fetchFrom(`matches?select=*&league_id=eq.${leagueId}&order=round.asc.nullsfirst&order=match_number.asc.nullsfirst`, signal)
      } catch (e) {}
      if (!data || data.length === 0) {
        return demoData.matches.filter(m => m.league_id === leagueId)
      }
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
