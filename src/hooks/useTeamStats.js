import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function useTeamStats(teamId) {
  return useQuery({
    queryKey: ['teamStats', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      
      const { data, error } = await supabase
        .from('team_stats')
        .select('*')
        .eq('team_id', teamId)
        .single();
      
      if (error) {
        // If no stats exist yet, return default values
        if (error.code === 'PGRST116') {
          return {
            team_id: teamId,
            matches_played: 0,
            matches_won: 0,
            matches_lost: 0,
            win_rate: 0,
            current_streak: 0,
            streak_type: null,
            avg_score: 0,
          };
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!teamId,
  });
}

export function useLeagueTeamStats(leagueId) {
  return useQuery({
    queryKey: ['leagueTeamStats', leagueId],
    queryFn: async () => {
      if (!leagueId) return [];
      
      const { data, error } = await supabase
        .from('team_stats')
        .select('*, teams!inner(id, team_name, category, player1_name, player2_name)')
        .eq('league_id', leagueId)
        .order('win_rate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!leagueId,
  });
}
