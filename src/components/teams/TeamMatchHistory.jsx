import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { cn } from '../../lib/utils';

export default function TeamMatchHistory({ matches, teamId }) {
  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Historial de Partidos</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No hay partidos registrados para este equipo</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Historial de Partidos</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Rival</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => {
              const isTeam1 = match.team1_id === teamId;
              const rival = isTeam1 ? match.team2_name : match.team1_name;
              const isWinner = match.winner_team_id === teamId;
              const score = isTeam1 ? `${match.team1_sets}-${match.team2_sets}` : `${match.team2_sets}-${match.team1_sets}`;
              return (
                <TableRow key={match.id}>
                  <TableCell className="text-muted-foreground">
                    {match.match_date ? format(new Date(match.match_date), 'dd MMM yyyy', { locale: es }) : '-'}
                  </TableCell>
                  <TableCell className="font-medium">{rival || 'Equipo desconocido'}</TableCell>
                  <TableCell>
                    <Badge variant={isWinner ? 'default' : 'destructive'} className={cn(isWinner && 'bg-green-500/20 text-green-400 border-green-500/30')}>
                      {isWinner ? 'Ganado' : 'Perdido'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{score}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
