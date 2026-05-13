import { req, useFetch } from '@/lib/data'
export function useParticipants() {
  const q = useFetch(() => req('GET', '/participants?select=*&order=name'))
  return {
    participantsQuery: q,
    createParticipant: { mutateAsync: (p) => req('POST', '/participants', p) },
    updateParticipant: { mutateAsync: ({ id, ...v }) => req('PATCH', `/participants?id=eq.${id}`, v) },
    deleteParticipant: { mutate: (id) => req('DELETE', `/participants?id=eq.${id}`) },
  }
}
