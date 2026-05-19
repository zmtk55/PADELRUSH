import { req, useFetch } from '@/lib/data'
import { supabase } from '@/lib/supabaseClient'

export function useLeagues() {
  const q = useFetch(
    async () => await req('GET', '/leagues?select=*&order=created_at.desc'),
    [],
    []
  )
  return {
    leaguesQuery: q,
    leagueQuery: (id) => useFetch(
      async () => {
        const r = await req('GET', `/leagues?select=*&id=eq.${id}`)
        return r?.[0] ?? null
      },
      [id],
      null
    ),
    createLeague: {
      mutateAsync: async (l) => {
        const r = await supabase.from('leagues').insert(l).select().single()
        if (r.error) throw r.error
        return r.data
      },
    },
    updateLeague: {
      mutateAsync: async ({ id, ...v }) => {
        const r = await supabase.from('leagues').update(v).eq('id', id).select().single()
        if (r.error) throw r.error
        return r.data
      },
    },
    deleteLeague: {
      mutateAsync: async (id) => {
        const r = await supabase.from('leagues').delete().eq('id', id)
        if (r.error) throw r.error
      },
    },
  }
}
