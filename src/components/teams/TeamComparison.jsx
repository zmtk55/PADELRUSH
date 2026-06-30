import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

function RadarComparison({ teamStats, leagueAvg }) {
  const data = [
    { metric: 'Winrate', team: teamStats?.win_rate || 0, promedio: leagueAvg?.win_rate || 0 },
    { metric: 'Partidos', team: Math.min((teamStats?.matches_played || 0) * 5, 100), promedio: Math.min((leagueAvg?.matches_played || 0) * 5, 100) },
    { metric: 'Racha', team: Math.min(Math.abs(teamStats?.current_streak || 0) * 10, 100), promedio: Math.min(Math.abs(leagueAvg?.current_streak || 0) * 10, 100) },
    { metric: 'Derrotas', team: 100 - (teamStats?.win_rate || 0), promedio: 100 - (leagueAvg?.win_rate || 0) },
    { metric: 'Consistencia', team: (teamStats?.matches_played || 0) > 5 ? 80 : 40, promedio: 60 },
  ];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar name="Equipo" dataKey="team" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
        <Radar name="Promedio Liga" dataKey="promedio" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function TrendLine({ matchHistory }) {
  if (!matchHistory || matchHistory.length === 0) return null;
  let wins = 0;
  const data = matchHistory.reverse().map((match, index) => {
    const isWinner = match.winner_team_id === match.team_id;
    if (isWinner) wins++;
    return { partido: index + 1, winrate: ((wins / (index + 1)) * 100).toFixed(1) };
  });
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="partido" tick={{ fill: 'hsl(var(--foreground))' }} />
        <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--foreground))' }} />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
        <Line type="monotone" dataKey="winrate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function TeamComparison({ teamStats, leagueAvg, matchHistory, teamId }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Comparación con Liga</CardTitle></CardHeader>
        <CardContent><RadarComparison teamStats={teamStats} leagueAvg={leagueAvg} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Evolución Winrate</CardTitle></CardHeader>
        <CardContent>
          {matchHistory && matchHistory.length > 0 ? (
            <TrendLine matchHistory={matchHistory.map(m => ({ ...m, team_id: teamId }))} />
          ) : (
            <p className="text-muted-foreground text-center py-8">Necesitas al menos un partido para ver la tendencia</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
