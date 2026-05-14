import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient'
import { toast } from 'sonner'

async function fetchFrom(path, signal) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    signal,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function useLeagues() {
  const queryClient = useQueryClient()

  const leaguesQuery = useQuery({
    queryKey: ['leagues'],
    queryFn: async ({ signal }) => {
      return fetchFrom('leagues?select=*&order=created_at.desc', signal)
    },
  })

  const leagueQuery = (id) =>
    useQuery({
      queryKey: ['league', id],
      queryFn: async ({ signal }) => {
        const data = await fetchFrom(`leagues?select=*&id=eq.${id}&limit=1`, signal)
        return data[0] || null
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
