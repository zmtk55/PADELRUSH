import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTeamCard from './SortableTeamCard';
import { cn } from '../../lib/utils';

export default function KanbanColumn({ id, label, teams, activeId, readOnly }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-72 bg-muted/30 rounded-lg p-3 min-h-[200px]',
        isOver && 'ring-2 ring-primary/50'
      )}
    >
      <h3 className="font-semibold text-sm mb-3 text-muted-foreground">
        {label}
        <span className="ml-2 text-xs">({teams.length})</span>
      </h3>
      
      <SortableContext items={teams.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {teams.map(team => (
            <SortableTeamCard 
              key={team.id} 
              team={team} 
              isDragging={activeId === team.id}
              readOnly={readOnly}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
