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

export function useParticipants() {
  const queryClient = useQueryClient()

  const participantsQuery = useQuery({
    queryKey: ['participants'],
    queryFn: async ({ signal }) => {
      return fetchFrom('participants?select=*&order=name.asc', signal)
    },
  })

  const createParticipant = useMutation({
    mutationFn: async (participant) => {
      const { data, error } = await supabase.from('participants').insert(participant).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
      toast.success('Participante registrado')
    },
    onError: (error) => toast.error(error.message),
  })

  const updateParticipant = useMutation({
    mutationFn: async ({ id, ...values }) => {
      const { data, error } = await supabase.from('participants').update(values).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
      toast.success('Participante actualizado')
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteParticipant = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('participants').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
      toast.success('Participante eliminado')
    },
    onError: (error) => toast.error(error.message),
  })

  return { participantsQuery, createParticipant, updateParticipant, deleteParticipant }
}
