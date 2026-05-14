import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient'
import { toast } from 'sonner'

async function fetchFrom(path, signal) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    signal,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function useTeams(leagueId) {
  const queryClient = useQueryClient()

  const teamsQuery = useQuery({
    queryKey: ['teams', leagueId],
    queryFn: async ({ signal }) => {
      return fetchFrom(`teams?select=*,player1:player1_id(*),player2:player2_id(*)&league_id=eq.${leagueId}&order=team_number.asc`, signal)
    },
    enabled: !!leagueId,
  })

  const createTeam = useMutation({
    mutationFn: async (team) => {
      const { data, error } = await supabase.from('teams').insert(team).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', leagueId] })
      toast.success('Equipo registrado')
    },
    onError: (error) => toast.error(error.message),
  })

  const createTeamsBatch = useMutation({
    mutationFn: async (teams) => {
      const { data, error } = await supabase.from('teams').insert(teams).select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', leagueId] })
      toast.success('Equipos registrados')
    },
    onError: (error) => toast.error(error.message),
  })

  const updateTeam = useMutation({
    mutationFn: async ({ id, ...values }) => {
      const { data, error } = await supabase.from('teams').update(values).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', leagueId] })
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteTeam = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('teams').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', leagueId] })
      toast.success('Equipo eliminado')
    },
    onError: (error) => toast.error(error.message),
  })

  return { teamsQuery, createTeam, createTeamsBatch, updateTeam, deleteTeam }
}
