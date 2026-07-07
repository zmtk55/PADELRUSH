import { useState } from 'react'
import { useMatches } from '@/hooks/useMatches'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export default function QuickMatchResult({ matchId }) {
  const { updateMatch } = useMatches()
  const [form, setForm] = useState({
    sets_won_team1: 0,
    sets_won_team2: 0,
    status: 'jugado',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.sets_won_team1 < 0 || form.sets_won_team2 < 0) {
      setError('Los sets no pueden ser negativos')
      return
    }
    
    // Basic validation: someone must win
    if (form.sets_won_team1 === 0 && form.sets_won_team2 === 0) {
      setError('Al menos un equipo debe ganar sets')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await updateMatch.mutateAsync({
        id: matchId,
        sets_won_team1: form.sets_won_team1,
        sets_won_team2: form.sets_won_team2,
        status: form.status,
      })
      
      setSuccess(true)
    } catch (err) {
      setError('Error al actualizar el partido: ' + (err.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>
            <CheckCircle className="w-8 h-8 text-success mx-auto mb-4" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Resultado registrado exitosamente</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Ver Partido
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="w-4 h-4" />
          Registro Rápido de Resultado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sets-team1" className="mb-2 block text-sm font-medium text-muted-foreground">
                Sets Ganados - Equipo 1
              </label>
              <Input
                id="sets-team1"
                type="number"
                value={form.sets_won_team1}
                onChange={(e) => setForm({ ...form, sets_won_team1: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="sets-team2" className="mb-2 block text-sm font-medium text-muted-foreground">
                Sets Ganados - Equipo 2
              </label>
              <Input
                id="sets-team2"
                type="number"
                value={form.sets_won_team2}
                onChange={(e) => setForm({ ...form, sets_won_team2: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="match-status" className="mb-2 block text-sm font-medium text-muted-foreground">
              Estado del Partido
            </label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm({ ...form, status: value })}
            >
              <SelectTrigger id="match-status">
                <SelectValue placeholder="Seleccionar estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jugado">Jugado</SelectItem>
                <SelectItem value="programado">Programado</SelectItem>
                <SelectItem value="pospuesto">Pospuesto</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          aria-busy={loading}
          className="w-full"
        >
          {loading ? 'Guardando...' : 'Guardar Resultado'}
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