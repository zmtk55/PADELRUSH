import { getInitials } from './constants'

export function PlayerBadge({ name, isNew }) {
  if (!name) return null
  return (
    <div className='flex items-center gap-1.5'>
      <div className={
        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ' +
        (isNew
          ? 'bg-amber-500/10 text-amber-600 border border-amber-200'
          : 'bg-primary/10 text-primary')
      }>
        {getInitials(name)}
      </div>
      <span className='text-sm truncate max-w-[100px]'>{name}</span>
      {isNew && (
        <span className='text-[9px] font-semibold text-amber-600 bg-amber-500/10 px-1 py-0.5 rounded-full'>
          Nuevo
        </span>
      )}
    </div>
  )
}
