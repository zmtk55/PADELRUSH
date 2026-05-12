import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export function useParticipants() {
  const queryClient = useQueryClient()

  const participantsQuery = useQuery({
    queryKey: ['participants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('participants').select('*').order('name')
      if (error) throw error
      return data
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
