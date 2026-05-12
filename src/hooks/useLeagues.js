import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera agotado')), ms))
}

async function queryWithTimeout(promise, ms = 10000) {
  const result = await Promise.race([promise, timeout(ms)])
  return result
}

export function useLeagues() {
  const qc = useQueryClient()

  const leaguesQuery = useQuery({
    queryKey: ['leagues'],
    queryFn: async () => {
      const { data, error } = await queryWithTimeout(supabase.from('leagues').select('*').order('created_at', { ascending: false }))
      if (error) throw error
      return data
    },
    retry: 1, staleTime: 30_000,
  })

  const leagueQuery = (id) =>
    useQuery({
      queryKey: ['league', id],
      queryFn: async () => {
        const { data, error } = await queryWithTimeout(supabase.from('leagues').select('*').eq('id', id).single())
        if (error) throw error
        return data
      },
      enabled: !!id, retry: 1, staleTime: 30_000,
    })

  const createLeague = useMutation({
    mutationFn: async (l) => { const { data, error } = await supabase.from('leagues').insert(l).select().single(); if (error) throw error; return data },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leagues'] }); toast.success('Liga creada') },
    onError: (e) => toast.error(e.message),
  })

  const updateLeague = useMutation({
    mutationFn: async ({ id, ...v }) => { const { data, error } = await supabase.from('leagues').update(v).eq('id', id).select().single(); if (error) throw error; return data },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['leagues'] }); qc.invalidateQueries({ queryKey: ['league', d.id] }); toast.success('Liga actualizada') },
    onError: (e) => toast.error(e.message),
  })

  const deleteLeague = useMutation({
    mutationFn: async (id) => { const { error } = await supabase.from('leagues').delete().eq('id', id); if (error) throw error },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leagues'] }); toast.success('Liga eliminada') },
    onError: (e) => toast.error(e.message),
  })

  return { leaguesQuery, leagueQuery, createLeague, updateLeague, deleteLeague }
}
