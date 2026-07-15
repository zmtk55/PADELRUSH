import { useNavigate } from 'react-router-dom'
import { Swords, Plus } from 'lucide-react'
import { useLeagues } from '@/hooks/useLeagues'

export default function Equipos() {
  const navigate = useNavigate()
  const { leaguesQuery, isAdmin } = useLeagues()

  return (
    <div className='max-w-[1200px] mx-auto p-4 lg:p-8'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-semibold text-foreground tracking-tight'>Equipos</h1>
          <p className='text-sm text-fg-secondary mt-1'>Selecciona una liga para ver sus equipos</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => navigate('/equipos/nuevo')} 
            className='flex items-center gap-2 h-9 px-4 rounded-md bg-court text-primary-foreground text-sm font-medium hover:bg-court/90 transition-colors'
          >
            <Plus className='w-4 h-4' /> Nuevo equipo
          </button>
        )}
      </div>

      {leaguesQuery?.isLoading ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map(i => (
            <div key={i} className='vercel-card h-24 animate-pulse' />
          ))}
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {(leaguesQuery?.data || []).map(l => (
            <div 
              key={l.id} 
              onClick={() => navigate(`/ligas/${l.id}/equipos`)}
              className='vercel-card p-5 cursor-pointer hover:bg-elevated transition-colors'
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-md flex items-center justify-center text-white font-medium' 
                  style={{ backgroundColor: l.color || 'hsl(var(--court))' }}>
                  {l.name?.charAt(0) || 'L'}
                </div>
                <div>
                  <p className='font-medium text-foreground'>{l.name}</p>
                  <p className='text-xs text-fg-secondary'>{l.gender} · {l.season || '—'}</p>
                </div>
              </div>
            </div>
          ))}
          {!(leaguesQuery?.data || []).length && (
            <div className='text-center py-20 col-span-full'>
              <Swords className='w-12 h-12 text-fg-muted mx-auto mb-3' />
              <p className='text-fg-secondary'>No hay ligas disponibles</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}