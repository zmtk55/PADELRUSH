import { motion, AnimatePresence } from 'framer-motion'
import { TeamCard } from './TeamCard'
import { groupColors } from './constants'

export function KanbanView({ teams, selectedCategory, enabledGroups, onMove, onDelete, onAssignGroup, onEdit }) {
  const ungrouped = teams.filter(t => t.category === selectedCategory && !t.group)
  return (
    <motion.div key='kanban' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='overflow-x-auto overscroll-x-contain pb-2'>
      <div className='inline-flex gap-3' style={{ minWidth: (enabledGroups.length + 1) * 220 + 'px' }}>
        <div className='w-[200px] shrink-0'>
          <div className='bg-muted/30 border-2 border-dashed border-border rounded-lg p-2.5 min-h-[100px]'>
            <h3 className='font-bold text-xs uppercase text-muted-foreground mb-2.5 flex items-center gap-2'>
              <span className='w-2 h-2 rounded-full bg-muted-foreground' /> Sin grupo
              <span className='ml-auto bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold'>{ungrouped.length}</span>
            </h3>
            <div className='space-y-2'>
              {ungrouped.map(team => <TeamCard key={team.id} team={team} onMove={onMove} onDelete={onDelete} onAssignGroup={onAssignGroup} onEdit={onEdit} />)}
              {ungrouped.length === 0 && <div className='text-center py-6'><p className='text-xs text-muted-foreground'>Arrastra equipos aquí o usa</p><p className='text-xs text-muted-foreground'>el randomizer arriba</p></div>}
            </div>
          </div>
        </div>
        {enabledGroups.map(group => (
          <div key={group} className='w-[200px] shrink-0'>
            <div className={'bg-muted/30 border-2 border-dashed rounded-lg p-2.5 min-h-[100px] ' + (groupColors[group]?.border || 'border-border')}>
              <h3 className={'font-bold text-xs uppercase mb-2.5 flex items-center gap-2 ' + (groupColors[group]?.accent || 'text-muted-foreground')}>
                <span className={'w-2 h-2 rounded-full ' + (groupColors[group]?.bg?.replace('/10', '/40') || 'bg-muted-foreground')} /> Grupo {group}
                <span className='ml-auto bg-muted/50 text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold'>{teams.filter(t => t.category === selectedCategory && t.group === group).length}</span>
              </h3>
              <div className='space-y-2'>{teams.filter(t => t.category === selectedCategory && t.group === group).map(team => <TeamCard key={team.id} team={team} onMove={onMove} onDelete={onDelete} onAssignGroup={onAssignGroup} onEdit={onEdit} />)}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
