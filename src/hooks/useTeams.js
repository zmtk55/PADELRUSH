import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export function useTeams(leagueId) {
  const queryClient = useQueryClient()

  const teamsQuery = useQuery({
    queryKey: ['teams', leagueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*, player1:player1_id(*), player2:player2_id(*)')
        .eq('league_id', leagueId)
        .order('team_number')
      if (error) throw error
      return data
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
