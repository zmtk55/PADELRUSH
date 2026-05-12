import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const URL = 'https://xmpsqjhywmwdekuhudtt.supabase.co/rest/v1'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHNxamh5d213ZGVrdWh1ZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjM5NzgsImV4cCI6MjA5MzgzOTk3OH0.-6CSavZAVZhRV72MTsaoJZN0cRvlS8ee-9Tc2jFuLRQ'
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, Accept: 'application/json' }

async function get(url) {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), 8000)
  try {
    const r = await fetch(`${URL}${url}`, { headers: H, signal: c.signal })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  } finally { clearTimeout(t) }
}

export function useMatches(leagueId) {
  const qc = useQueryClient()
  const matchesQuery = useQuery({ queryKey: ['matches', leagueId], queryFn: () => get(`/matches?select=*&league_id=eq.${leagueId}&order=round.asc.nullslast&order=match_number.asc.nullslast`), enabled: !!leagueId, retry: 1, staleTime: 30000 })
  const createMatchesBatch = useMutation({
    mutationFn: async (m) => { const { data, error } = await supabase.from('matches').insert(m).select(); if (error) throw error; return data },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matches', leagueId] }); toast.success('Partidos generados') },
    onError: (e) => toast.error(e.message),
  })
  const updateMatch = useMutation({
    mutationFn: async ({ id, ...v }) => { const { data, error } = await supabase.from('matches').update(v).eq('id', id).select().single(); if (error) throw error; return data },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['matches', leagueId] }); qc.invalidateQueries({ queryKey: ['player-stats', leagueId] }); if (d?.status === 'jugado') toast.success('Resultado guardado') },
    onError: (e) => toast.error(e.message),
  })
  const deleteMatch = useMutation({
    mutationFn: async (id) => { const { error } = await supabase.from('matches').delete().eq('id', id); if (error) throw error },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matches', leagueId] }); toast.success('Partido eliminado') },
    onError: (e) => toast.error(e.message),
  })
  return { matchesQuery, createMatchesBatch, updateMatch, deleteMatch }
}
