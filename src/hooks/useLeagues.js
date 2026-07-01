import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export function useLeagues() {
  const leaguesQuery = useQuery({
    queryKey: ['leagues'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leagues').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  const leagueQuery = (id) => useQuery({
    queryKey: ['league', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase.from('leagues').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    enabled: !!id
  })

  return {
    leaguesQuery,
    leagueQuery,
    createLeague: {
      mutateAsync: async (l) => {
        const r = await supabase.from('leagues').insert(l).select().single()
        if (r.error) throw r.error
        return r.data
      },
    },
    updateLeague: {
      mutateAsync: async ({ id, ...v }) => {
        const r = await supabase.from('leagues').update(v).eq('id', id).select().single()
        if (r.error) throw r.error
        return r.data
      },
    },
    deleteLeague: {
      mutateAsync: async (id) => {
        const r = await supabase.from('leagues').delete().eq('id', id)
        if (r.error) throw r.error
      },
    },
  }
}
