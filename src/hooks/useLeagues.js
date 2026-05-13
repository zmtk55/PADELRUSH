import { req, useFetch } from '@/lib/data'
export function useLeagues() {
  const q = useFetch(() => req('GET', '/leagues?select=*&order=created_at.desc'))
  return {
    leaguesQuery: q,
    leagueQuery: (id) => useFetch(() => req('GET', `/leagues?select=*&id=eq.${id}`).then(r => r?.[0] ?? r), [id]),
    createLeague: { mutateAsync: (l) => req('POST', '/leagues', l) },
    updateLeague: { mutateAsync: ({ id, ...v }) => req('PATCH', `/leagues?id=eq.${id}`, v) },
    deleteLeague: { mutate: (id) => req('DELETE', `/leagues?id=eq.${id}`) },
  }
}
