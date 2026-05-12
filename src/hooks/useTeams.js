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

export function useTeams(leagueId) {
  const qc = useQueryClient()
  const teamsQuery = useQuery({
    queryKey: ['teams', leagueId],
    queryFn: () => apiGet(`/teams?select=*&league_id=eq.${leagueId}&order=team_number`),
    enabled: !!leagueId, retry: 2, staleTime: 10_000,
  })
  const createTeam = useMutation({
    mutationFn: async (t) => { const { data, error } = await supabase.from('teams').insert(t).select().single(); if (error) throw error; return data },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams', leagueId] }); toast.success('Equipo registrado') },
    onError: (e) => toast.error(e.message),
  })
  const createTeamsBatch = useMutation({
    mutationFn: async (t) => { const { data, error } = await supabase.from('teams').insert(t).select(); if (error) throw error; return data },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams', leagueId] }); toast.success('Equipos registrados') },
    onError: (e) => toast.error(e.message),
  })
  const updateTeam = useMutation({
    mutationFn: async ({ id, ...v }) => { const { data, error } = await supabase.from('teams').update(v).eq('id', id).select().single(); if (error) throw error; return data },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams', leagueId] }) },
    onError: (e) => toast.error(e.message),
  })
  const deleteTeam = useMutation({
    mutationFn: async (id) => { const { error } = await supabase.from('teams').delete().eq('id', id); if (error) throw error },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams', leagueId] }); toast.success('Equipo eliminado') },
    onError: (e) => toast.error(e.message),
  })
  return { teamsQuery, createTeam, createTeamsBatch, updateTeam, deleteTeam }
}
