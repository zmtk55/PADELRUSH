import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const API = 'https://xmpsqjhywmwdekuhudtt.supabase.co/rest/v1'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHNxamh5d213ZGVrdWh1ZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjM5NzgsImV4cCI6MjA5MzgzOTk3OH0.-6CSavZAVZhRV72MTsaoJZN0cRvlS8ee-9Tc2jFuLRQ'

async function apiGet(url) {
  const res = await fetch(`${API}${url}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export function useMatches(leagueId) {
  const qc = useQueryClient()
  const matchesQuery = useQuery({
    queryKey: ['matches', leagueId],
    queryFn: () => apiGet(`/matches?select=*&league_id=eq.${leagueId}&order=round.asc.nullslast&order=match_number.asc.nullslast`),
    enabled: !!leagueId, retry: 2, staleTime: 10_000,
  })
  const createMatchesBatch = useMutation({
    mutationFn: async (m) => { const { data, error } = await supabase.from('matches').insert(m).select(); if (error) throw error; return data },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matches', leagueId] }); toast.success('Partidos generados') },
    onError: (e) => toast.error(e.message),
  })
  const updateMatch = useMutation({
    mutationFn: async ({ id, ...v }) => { const { data, error } = await supabase.from('matches').update(v).eq('id', id).select().single(); if (error) throw error; return data },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['matches', leagueId] }); qc.invalidateQueries({ queryKey: ['player-stats', leagueId] }); if (d.status === 'jugado') toast.success('Resultado guardado') },
    onError: (e) => toast.error(e.message),
  })
  const deleteMatch = useMutation({
    mutationFn: async (id) => { const { error } = await supabase.from('matches').delete().eq('id', id); if (error) throw error },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matches', leagueId] }); toast.success('Partido eliminado') },
    onError: (e) => toast.error(e.message),
  })
  return { matchesQuery, createMatchesBatch, updateMatch, deleteMatch }
}
