import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

function queryWithTimeout(promise, ms = 10000) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))])
}

export function useParticipants() {
  const qc = useQueryClient()

  const participantsQuery = useQuery({
    queryKey: ['participants'],
    queryFn: async () => {
      const { data, error } = await queryWithTimeout(supabase.from('participants').select('*').order('name'))
      if (error) throw error
      return data || []
    },
    retry: 1, staleTime: 30_000,
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
