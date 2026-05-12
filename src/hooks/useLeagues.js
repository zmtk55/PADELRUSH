import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export function useLeagues() {
  const queryClient = useQueryClient()

  const leaguesQuery = useQuery({
    queryKey: ['leagues'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leagues').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const leagueQuery = (id) =>
    useQuery({
      queryKey: ['league', id],
      queryFn: async () => {
        const { data, error } = await supabase.from('leagues').select('*').eq('id', id).single()
        if (error) throw error
        return data
      },
      enabled: !!id,
    })

  const createLeague = useMutation({
    mutationFn: async (league) => {
      const { data, error } = await supabase.from('leagues').insert(league).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues'] })
      toast.success('Liga creada exitosamente')
    },
    onError: (error) => toast.error(error.message),
  })

  const updateLeague = useMutation({
    mutationFn: async ({ id, ...values }) => {
      const { data, error } = await supabase.from('leagues').update(values).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leagues'] })
      queryClient.invalidateQueries({ queryKey: ['league', data.id] })
      toast.success('Liga actualizada')
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteLeague = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('leagues').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues'] })
      toast.success('Liga eliminada')
    },
    onError: (error) => toast.error(error.message),
  })

  return { leaguesQuery, leagueQuery, createLeague, updateLeague, deleteLeague }
}
