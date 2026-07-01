import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useTeamStats } from '../hooks/useTeamStats';
import TeamMatchHistory from '../components/teams/TeamMatchHistory';
import TeamComparison from '../components/teams/TeamComparison';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, Target, XCircle, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORY_COLORS } from '@/lib/theme-palette';

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

function StatMiniCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div variants={fadeIn}>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl space-y-6">
      <div className="h-9 w-28 bg-muted animate-pulse rounded-lg" />
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-64" />
        <div className="flex gap-3">
          <div className="h-5 bg-muted animate-pulse rounded w-20" />
          <div className="h-5 bg-muted animate-pulse rounded w-24" />
          <div className="h-5 bg-muted animate-pulse rounded w-20" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="h-3 bg-muted animate-pulse rounded w-16" />
            <div className="h-8 bg-muted animate-pulse rounded w-12" />
          </div>
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  )
}

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
    return <LoadingSkeleton />;
  }

  if (!team) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <button
          onClick={() => navigate(`/ligas/${leagueId}/equipos`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3 h-3" /> Volver
        </button>
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold mb-1">Equipo no encontrado</p>
          <p className="text-sm text-muted-foreground">El equipo que buscas no existe o fue eliminado.</p>
        </div>
      </div>
    );
  }

  const cat = CATEGORY_COLORS[team.category];
  const categoryColor = cat ? `${cat.bg} ${cat.text} ${cat.border}` : 'bg-muted text-muted-foreground';
  const winRate = stats?.win_rate || 0;
  const avgScore = stats?.avg_score || 0;

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Back button */}
      <button
        onClick={() => navigate(`/ligas/${leagueId}/equipos`)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-3 h-3" /> Volver
      </button>

      {/* Team Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6 mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
            {team.team_number}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-1 truncate">
              {team.team_name || `Equipo ${team.team_number}`}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={categoryColor}>{team.category}</Badge>
              {team.group && <Badge variant="outline">Grupo {team.group}</Badge>}
              {league?.name && <span className="text-sm text-muted-foreground">{league.name}</span>}
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                {stats?.matches_won ?? 0}-{stats?.matches_draw ?? 0}-{stats?.matches_lost ?? 0}
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 w-3.5" />
                {avgScore > 0 ? avgScore.toFixed(1) : '-'} avg
              </span>
              <span className="text-xs">{winRate.toFixed(1)}% winrate</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
      >
        <StatMiniCard
          icon={Target}
          label="Ganados"
          value={stats?.matches_won ?? 0}
          color="text-emerald-500"
        />
        <StatMiniCard
          icon={TrendingUp}
          label="Empates"
          value={stats?.matches_draw ?? 0}
          color="text-amber-500"
        />
        <StatMiniCard
          icon={XCircle}
          label="Perdidos"
          value={stats?.matches_lost ?? 0}
          color="text-red-500"
        />
        <StatMiniCard
          icon={Trophy}
          label="Promedio"
          value={avgScore > 0 ? avgScore.toFixed(1) : '-'}
          color="text-primary"
        />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="comparison">Comparación</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <TeamMatchHistory matches={matches} teamId={teamId} />
          </TabsContent>

          <TabsContent value="comparison">
            <TeamComparison teamStats={stats} leagueAvg={leagueAvg} matchHistory={matches} teamId={teamId} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
