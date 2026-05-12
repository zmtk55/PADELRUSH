import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const URL = 'https://xmpsqjhywmwdekuhudtt.supabase.co/rest/v1'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHNxamh5d213ZGVrdWh1ZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjM5NzgsImV4cCI6MjA5MzgzOTk3OH0.-6CSavZAVZhRV72MTsaoJZN0cRvlS8ee-9Tc2jFuLRQ'
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, Accept: 'application/json' }

async function get(url) {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), 8000)
  try {
    const r = await fetch(`${URL}${url}`, { headers: H, signal: c.signal })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  } finally { clearTimeout(t) }
}

export function useLeagues() {
  const qc = useQueryClient()
  const leaguesQuery = useQuery({ queryKey: ['leagues'], queryFn: () => get('/leagues?select=*&order=created_at.desc'), retry: 1, staleTime: 30000 })
  const leagueQuery = (id) => useQuery({ queryKey: ['league', id], queryFn: () => get(`/leagues?select=*&id=eq.${id}`).then(r => r?.[0]), enabled: !!id, retry: 1, staleTime: 30000 })
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
