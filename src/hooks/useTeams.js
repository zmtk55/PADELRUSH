import { req, useFetch } from '@/lib/data'
export function useTeams(leagueId) {
  const q = useFetch(() => req('GET', `/teams?select=*&league_id=eq.${leagueId}&order=team_number`), [leagueId])
  return {
    teamsQuery: q,
    createTeam: { mutateAsync: (t) => req('POST', '/teams', t) },
    createTeamsBatch: { mutateAsync: (t) => req('POST', '/teams', t) },
    updateTeam: { mutateAsync: ({ id, ...v }) => req('PATCH', `/teams?id=eq.${id}`, v) },
    deleteTeam: { mutate: (id) => req('DELETE', `/teams?id=eq.${id}`) },
  }
}
