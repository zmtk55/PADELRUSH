import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useTeamStats } from '../hooks/useTeamStats';
import TeamHeader from '../components/teams/TeamHeader';
import TeamStatsCards from '../components/teams/TeamStatsCards';
import TeamMatchHistory from '../components/teams/TeamMatchHistory';
import TeamComparison from '../components/teams/TeamComparison';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeamDetail() {
  const { leagueId, teamId } = useParams();
  const navigate = useNavigate();

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase.from('teams').select('*').eq('id', teamId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });

  const { data: league } = useQuery({
    queryKey: ['league', leagueId],
    queryFn: async () => {
      const { data } = await supabase.from('leagues').select('name').eq('id', leagueId).single();
      return data;
    },
    enabled: !!leagueId,
  });

  const { data: stats, isLoading: statsLoading } = useTeamStats(teamId);

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['teamMatches', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
        .eq('status', 'completed')
        .order('match_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!teamId,
  });

  const { data: leagueAvg } = useQuery({
    queryKey: ['leagueAvgStats', leagueId],
    queryFn: async () => {
      const { data } = await supabase.from('team_stats').select('*').eq('league_id', leagueId);
      if (!data || data.length === 0) return null;
      return {
        win_rate: data.reduce((sum, s) => sum + s.win_rate, 0) / data.length,
        matches_played: data.reduce((sum, s) => sum + s.matches_played, 0) / data.length,
        current_streak: data.reduce((sum, s) => sum + Math.abs(s.current_streak), 0) / data.length,
      };
    },
    enabled: !!leagueId,
  });

  if (teamLoading || statsLoading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Equipo no encontrado</h2>
        <p className="text-muted-foreground">El equipo que buscas no existe o fue eliminado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <TeamHeader team={team} leagueName={league?.name} />
      <TeamStatsCards stats={stats} />
      <div className="mb-6">
        <TeamComparison teamStats={stats} leagueAvg={leagueAvg} matchHistory={matches} teamId={teamId} />
      </div>
      <TeamMatchHistory matches={matches} teamId={teamId} />
    </div>
  );
}
