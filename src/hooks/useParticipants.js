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

export function useParticipants() {
  const qc = useQueryClient()
  const participantsQuery = useQuery({
    queryKey: ['participants'],
    queryFn: () => apiGet('/participants?select=*&order=name'),
    retry: 2, staleTime: 10_000,
  })
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
