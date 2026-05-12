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

export function useParticipants() {
  const qc = useQueryClient()
  const participantsQuery = useQuery({ queryKey: ['participants'], queryFn: () => get('/participants?select=*&order=name'), retry: 1, staleTime: 30000 })
  const createParticipant = useMutation({
    mutationFn: async (p) => { const { data, error } = await supabase.from('participants').insert(p).select().single(); if (error) throw error; return data },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['participants'] }); toast.success('Participante registrado') },
    onError: (e) => toast.error(e.message),
  })
  const updateParticipant = useMutation({
    mutationFn: async ({ id, ...v }) => { const { data, error } = await supabase.from('participants').update(v).eq('id', id).select().single(); if (error) throw error; return data },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['participants'] }); toast.success('Participante actualizado') },
    onError: (e) => toast.error(e.message),
  })
  const deleteParticipant = useMutation({
    mutationFn: async (id) => { const { error } = await supabase.from('participants').delete().eq('id', id); if (error) throw error },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['participants'] }); toast.success('Participante eliminado') },
    onError: (e) => toast.error(e.message),
  })
  return { participantsQuery, createParticipant, updateParticipant, deleteParticipant }
}
