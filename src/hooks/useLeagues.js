import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const API = 'https://xmpsqjhywmwdekuhudtt.supabase.co/rest/v1'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHNxamh5d213ZGVrdWh1ZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjM5NzgsImV4cCI6MjA5MzgzOTk3OH0.-6CSavZAVZhRV72MTsaoJZN0cRvlS8ee-9Tc2jFuLRQ'

async function apiGet(url) {
  const res = await fetch(`${API}${url}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export function useLeagues() {
  const qc = useQueryClient()

  const leaguesQuery = useQuery({
    queryKey: ['leagues'],
    queryFn: () => apiGet('/leagues?select=*&order=created_at.desc'),
    retry: 2, staleTime: 10_000,
  })

  const leagueQuery = (id) =>
    useQuery({
      queryKey: ['league', id],
      queryFn: () => apiGet(`/leagues?select=*&id=eq.${id}`).then(r => r[0]),
      enabled: !!id, retry: 2, staleTime: 10_000,
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
