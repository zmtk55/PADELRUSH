import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, HelpCircle, CheckCircle2 } from 'lucide-react'
import { useParticipants } from '@/hooks/useParticipants'
import { PlayerPickerPanel } from './PlayerPickerPanel' // Note: We'll keep PlayerPickerPanel as a separate component

export default function TeamsStep({ form, setForm, errors, teams, setTeams, categoryInput, setCategoryInput, addCategory, removeCategory, participants }) {
  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Equipos</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Cree equipos asignando jugadores a cada categoría. Cada equipo necesita 2 jugadores.
      </p>
      
      {categories.length === 0 ? (
        <p className="text-sm text-muted-italic text-center py-8">
          Primero debe agregar categorías en el paso de Configuración
        </p>
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">Resumen de equipos</h3>
              <span className="text-sm text-muted-foreground">
                {teams.length} equipos creados
              </span>
            </div>
            {teams.length > 0 && (
              <div className="mt-3 space-y-2">
                {teams.map((t, idx) => (
                  <div 
                    key={t.id || idx} 
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{t.team_name || `Equipo ${t.team_number}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.category} • 
                        {t.player1_id ? (participants || []).find(p => p.id === t.player1_id)?.name || 'Jugador 1' : 'Sin asignar'} 
                        & 
                        {t.player2_id ? (participants || []).find(p => p.id === t.player2_id)?.name || 'Jugador 2' : 'Sin asignar'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          // Edit team logic would go here - for now just remove
                          setTeams(prev => prev.filter((_, i) => i !== idx))
                        }}
                        className="btn-ghost h-8 px-3 text-xs"
                        title="Editar equipo"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => setTeams(prev => prev.filter((_, i) => i !== idx))}
                        className="btn-ghost h-8 px-3 text-xs text-destructive"
                        title="Eliminar equipo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <PlayerPickerPanel 
            participants={participants || []} 
            categories={categories} 
            teams={teams} 
            onTeamsChange={setTeams} 
          />
        </>
      )}
      
      {errors.teams && <p className="text-sm text-destructive mt-2">{errors.teams}</p>}
      {errors.teamsDuplicate && <p className="text-sm text-destructive mt-2">{errors.teamsDuplicate}</p>}
    </div>
  )
}