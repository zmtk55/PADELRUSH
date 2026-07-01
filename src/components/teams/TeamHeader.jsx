import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CATEGORY_COLORS } from '@/lib/theme-palette';

export default function TeamHeader({ team, leagueName }) {
  const navigate = useNavigate();
  
  const cat = CATEGORY_COLORS[team?.category];
  const categoryColor = cat ? `${cat.bg} ${cat.text} ${cat.border}` : 'bg-muted text-muted-foreground';

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
