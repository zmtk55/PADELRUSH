import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../ui/card';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SortableTeamCard({ team, isDragging, readOnly }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: team.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-3 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-primary'
      )}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        {!readOnly && (
          <button
            className="mt-1 text-muted-foreground hover:text-foreground"
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {team.player1_name} & {team.player2_name}
          </p>
          {team.team_name && (
            <p className="text-xs text-muted-foreground truncate">
              "{team.team_name}"
            </p>
          )}
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-muted px-2 py-0.5 rounded">
              {team.category}
            </span>
            {team.team_number && (
              <span className="text-xs text-muted-foreground">
                #{team.team_number}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
