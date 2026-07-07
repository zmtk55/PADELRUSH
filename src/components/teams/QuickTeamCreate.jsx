import { useState } from 'react'
import { useTeams } from '@/hooks/useTeams'
import { useParticipants } from '@/hooks/useParticipants'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Users, CheckCircle } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export default function QuickTeamCreate({ leagueId }) {
  const { createTeam } = useTeams()
  const { participantsQuery } = useParticipants()
  const participants = participantsQuery.data || []
  const [form, setForm] = useState({
    team_number: 1,
    category: '',
    player1_id: null,
    player2_id: null,
    team_name: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  // Auto-generate team number based on existing teams (would need fetch)
  // For now, we'll let user specify or use a simple increment
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.team_name || !form.category || !form.player1_id || !form.player2_id) {
      setError('Por favor complete todos los campos')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await createTeam.mutateAsync({
        league_id: leagueId,
        team_number: form.team_number,
        category: form.category,
        player1_id: form.player1_id,
        player2_id: form.player2_id,
        team_name: form.team_name || `Equipo ${form.team_number}`,
      })
      
      setSuccess(true)
    } catch (err) {
      setError('Error al crear el equipo: ' + (err.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>
            <Users className="w-8 h-8 text-success mx-auto mb-4" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Equipo creado exitosamente</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Crear Otro Equipo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Creación Rápida de Equipo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Nombre del Equipo
            </label>
            <Input
              type="text"
              value={form.team_name}
              onChange={(e) => setForm({ ...form, team_name: e.target.value })}
              placeholder="Ej: Los Campeones"
            />
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Categoría
              </label>
              <Input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value.toUpperCase() })}
                placeholder="Ej: 5TA"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Número de Equipo
              </label>
              <Input
                type="number"
                value={form.team_number}
                onChange={(e) => setForm({ ...form, team_number: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Jugadores
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Jugador 1
                </label>
                <Select
                  value={form.player1_id?.toString() || ''}
                  onValueChange={(value) => setForm({ ...form, player1_id: value ? parseInt(value) : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar jugador..." />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name || `Jugador ${p.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Jugador 2
                </label>
                <Select
                  value={form.player2_id?.toString() || ''}
                  onValueChange={(value) => setForm({ ...form, player2_id: value ? parseInt(value) : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar jugador..." />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name || `Jugador ${p.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creando...' : 'Crear Equipo'}
        </Button>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="w-full mt-2"
        >
          Cancelar
        </Button>
      </CardFooter>
    </Card>
  )
}