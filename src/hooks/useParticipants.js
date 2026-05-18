import { req, useFetch } from '@/lib/data'
import { supabase } from '@/lib/supabaseClient'
import { demoData } from '@/lib/demoData'

export function useParticipants() {
  const q = useFetch(
    () => req('GET', '/participants?select=*&order=name')
      .catch(() => demoData.participants),
    []
  )
  return {
    participantsQuery: q,
    createParticipant: {
      mutateAsync: async (p) => {
        const r = await supabase.from('participants').insert(p).select().single()
        if (r.error) throw r.error
        return r.data
      },
      isPending: false,
    },
    updateParticipant: {
      mutateAsync: async ({ id, ...v }) => {
        const r = await supabase.from('participants').update(v).eq('id', id).select().single()
        if (r.error) throw r.error
        return r.data
      },
      isPending: false,
    },
    deleteParticipant: {
      mutateAsync: async (id) => {
        const r = await supabase.from('participants').delete().eq('id', id)
        if (r.error) throw r.error
      },
    },
  }
}
