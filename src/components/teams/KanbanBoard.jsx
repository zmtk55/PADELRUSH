import { useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard({ 
  teams, 
  gruposLetras, 
  onMoveTeam, 
  onReorderTeam,
  readOnly = false 
}) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const teamsByGroup = {};
  gruposLetras.forEach(g => { teamsByGroup[g] = []; });
  teamsByGroup['sin-grupo'] = [];

  teams.forEach(team => {
    const group = team.group || 'sin-grupo';
    if (!teamsByGroup[group]) teamsByGroup[group] = [];
    teamsByGroup[group].push(team);
  });

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeTeam = teams.find(t => t.id === active.id);
    if (!activeTeam) return;

    let targetGroup;
    if (gruposLetras.includes(over.id)) {
      targetGroup = over.id;
    } else {
      const overTeam = teams.find(t => t.id === over.id);
      targetGroup = overTeam?.group || 'sin-grupo';
    }

    if (activeTeam.group !== targetGroup) {
      onMoveTeam(activeTeam.id, targetGroup === 'sin-grupo' ? null : targetGroup);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTeam = teams.find(t => t.id === active.id);
    const overTeam = teams.find(t => t.id === over.id);

    if (activeTeam && overTeam && activeTeam.id !== overTeam.id) {
      onReorderTeam(activeTeam.id, overTeam.id);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {gruposLetras.map(grupo => (
          <KanbanColumn
            key={grupo}
            id={grupo}
            label={`Grupo ${grupo}`}
            teams={teamsByGroup[grupo] || []}
            activeId={activeId}
            readOnly={readOnly}
          />
        ))}
        {teamsByGroup['sin-grupo']?.length > 0 && (
          <KanbanColumn
            id="sin-grupo"
            label="Sin grupo"
            teams={teamsByGroup['sin-grupo']}
            activeId={activeId}
            readOnly={readOnly}
          />
        )}
      </div>
    </DndContext>
  );
}
