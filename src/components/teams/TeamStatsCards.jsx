import { Trophy, Target, XCircle, Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

function StatCard({ icon: Icon, title, value, subtitle, color, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', color)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 mt-1 text-xs', trend >= 0 ? 'text-green-500' : 'text-red-500')}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(trend)}% vs anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TeamStatsCards({ stats }) {
  if (!stats) return null;
  const winRate = stats.win_rate || 0;
  const streakText = stats.current_streak === 0 
    ? 'Sin racha'
    : `${Math.abs(stats.current_streak)} ${stats.streak_type === 'W' ? 'ganados' : 'perdidos'}`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard icon={Target} title="Jugados" value={stats.matches_played} subtitle="partidos como pareja" />
      <StatCard icon={Trophy} title="Ganados" value={stats.matches_won} subtitle={`${winRate.toFixed(1)}% winrate`} color="text-green-500" />
      <StatCard icon={XCircle} title="Perdidos" value={stats.matches_lost} subtitle={`${(100 - winRate).toFixed(1)}% derrota`} color="text-red-500" />
      <StatCard icon={Flame} title="Racha" value={stats.current_streak === 0 ? '-' : Math.abs(stats.current_streak)} subtitle={streakText} color={stats.streak_type === 'W' ? 'text-orange-500' : 'text-blue-500'} />
    </div>
  );
}