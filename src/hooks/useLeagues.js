import { req, useFetch } from '@/lib/data'
import { supabase } from '@/lib/supabaseClient'
import { demoData, addDemoLeague, updateDemoLeague, deleteDemoLeague } from '@/lib/demoData'

export function useLeagues() {
  const q = useFetch(
    async () => {
      try {
        const result = await req('GET', '/leagues?select=*&order=created_at.desc')
        console.log('Leagues API result:', result)
        return result
      } catch (e) {
        console.log('Leagues API error:', e?.message, '- using demo:', demoData.leagues)
        return demoData.leagues || []
      }
    },
    [],
    demoData.leagues || []
  )
  return {
    leaguesQuery: q,
    leagueQuery: (id) => useFetch(
      async () => {
        try {
          const r = await req('GET', `/leagues?select=*&id=eq.${id}`)
          return r?.[0] ?? r
        } catch (e) {
          console.log('LeagueQuery fallback', e?.message)
          return demoData.leagues?.find(l => l.id === id) || null
        }
      },
      [id],
      demoData.leagues?.find(l => l.id === id) || null
    ),
    createLeague: {
      mutateAsync: async (l) => {
        const r = await supabase.from('leagues').insert(l).select().single()
        if (r.error) throw r.error
        return r.data
      },
      fallback: (l) => addDemoLeague(l),
    },
    updateLeague: {
      mutateAsync: async ({ id, ...v }) => {
        const r = await supabase.from('leagues').update(v).eq('id', id).select().single()
        if (r.error) throw r.error
        return r.data
      },
      fallback: ({ id, ...v }) => updateDemoLeague(id, v),
    },
    deleteLeague: {
      mutateAsync: async (id) => {
        const r = await supabase.from('leagues').delete().eq('id', id)
        if (r.error) throw r.error
      },
      fallback: (id) => deleteDemoLeague(id),
    },
  }
}
