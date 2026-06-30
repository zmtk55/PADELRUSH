import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const categoryColors = {
  '1RA': 'bg-red-500/20 text-red-400 border-red-500/30',
  '2DA': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  '3RA': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  '4TA': 'bg-green-500/20 text-green-400 border-green-500/30',
  '5TA': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function TeamHeader({ team, leagueName }) {
  const navigate = useNavigate();
  
  const categoryColor = categoryColors[team?.category] || 'bg-muted text-muted-foreground';

  return (
    <div className="flex items-start gap-4 mb-6">
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold">
            {team?.player1_name} & {team?.player2_name}
          </h1>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={categoryColor}>{team?.category}</Badge>
          {team?.group && <Badge variant="outline">Grupo {team.group}</Badge>}
          {team?.team_number && <Badge variant="secondary">Equipo #{team.team_number}</Badge>}
          {team?.team_name && <span className="text-muted-foreground text-sm ml-2">"{team.team_name}"</span>}
        </div>
        
        {leagueName && <p className="text-sm text-muted-foreground mt-2">{leagueName}</p>}
      </div>
    </div>
  );
}
