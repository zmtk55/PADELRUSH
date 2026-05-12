import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

function queryWithTimeout(promise, ms = 10000) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))])
}

export function useTeams(leagueId) {
  const qc = useQueryClient()

  const teamsQuery = useQuery({
    queryKey: ['teams', leagueId],
    queryFn: async () => {
      const { data, error } = await queryWithTimeout(supabase.from('teams').select('*, player1:player1_id(*), player2:player2_id(*)').eq('league_id', leagueId).order('team_number'))
      if (error) throw error
      return data || []
    },
    enabled: !!leagueId, retry: 1, staleTime: 30_000,
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
