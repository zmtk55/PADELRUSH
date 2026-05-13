import { req, useFetch } from '@/lib/data'
export function useMatches(leagueId) {
  const q = useFetch(() => req('GET', `/matches?select=*&league_id=eq.${leagueId}&order=round.asc.nullslast&order=match_number.asc.nullslast`), [leagueId])
  return {
    matchesQuery: q,
    createMatchesBatch: { mutateAsync: (m) => req('POST', '/matches', m) },
    updateMatch: { mutateAsync: ({ id, ...v }) => req('PATCH', `/matches?id=eq.${id}`, v) },
    deleteMatch: { mutate: (id) => req('DELETE', `/matches?id=eq.${id}`) },
  }
}
