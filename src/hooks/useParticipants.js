import { req, useFetch } from '@/lib/data'
import { supabase } from '@/lib/supabaseClient'

export function useParticipants() {
  const q = useFetch(
    async () => await req('GET', '/participants?select=*&order=name.asc'),
    [],
    []
  )
  return {
    participantsQuery: q,
    createParticipant: { mutateAsync: (p) => supabase.from('participants').insert(p).select().single().then(r => { if (r.error) throw r.error; return r.data }) },
    updateParticipant: { mutateAsync: ({ id, ...v }) => supabase.from('participants').update(v).eq('id', id).select().single().then(r => { if (r.error) throw r.error; return r.data }) },
    deleteParticipant: { mutateAsync: async (id) => { const r = await supabase.from('participants').delete().eq('id', id); if (r.error) throw r.error } },
  }
}
