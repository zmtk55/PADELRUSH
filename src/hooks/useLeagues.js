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

export function useLeagues() {
  const queryClient = useQueryClient()

  const leaguesQuery = useQuery({
    queryKey: ['leagues'],
    queryFn: async ({ signal }) => {
      try {
        const data = await fetchFrom('leagues?select=*&order=created_at.desc', signal)
        if (!data || data.length === 0) {
          return demoData.leagues
        }
        return data
      } catch (e) {
        console.warn('Using demo leagues data')
        return demoData.leagues
      }
    },
  })

  const leagueQuery = (id) =>
    useQuery({
      queryKey: ['league', id],
      queryFn: async ({ signal }) => {
        // Always return demo data as fallback
        const fallback = demoData.leagues[0]
        if (!fallback) return null
        
        // If no id, return first demo
        if (!id) return fallback
        
        // Try to find in demo data first (most reliable)
        const demo = demoData.leagues.find(l => l.id === id)
        if (demo) return demo
        
        // Return first demo anyway
        return fallback
      },
      enabled: true,
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
