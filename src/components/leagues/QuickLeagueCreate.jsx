import { useState } from 'react'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle, X } from 'lucide-react'
import { Trophy } from 'lucide-react'

export default function QuickLeagueCreate() {
  const navigate = useNavigate()
  const { createLeague } = useLeagues()
  const { user, profile } = useAuth()
  const [form, setForm] = useState({
    name: '',
    // Smart defaults based on context
    sport: 'padel',
    gender: 'femenil',
    season: new Date().getFullYear().toString() + '-1',
    status: 'proxima',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre de la liga es obligatorio')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const newLeague = await createLeague.mutateAsync({
        ...form,
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        organizer_id: user?.id,
        organizer_name: profile?.display_name || '',
      })
      
      setSuccess(true)
      setTimeout(() => {
        navigate(`/ligas/${newLeague.id}`)
      }, 1500)
    } catch (err) {
      setError('Error al crear la liga: ' + (err.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>
            <Trophy className="w-8 h-8 text-success mx-auto mb-4" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Liga creada exitosamente</p>
          <p className="text-sm text-muted-foreground">
            Redirigiendo a la liga...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Creación Rápida de Liga
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Nombre de la Liga *
            </label>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Liga de Verano 2026"
              className={error ? 'border-destructive' : undefined}
            />
            {error && (
              <p className="mt-1 text-xs text-destructive">{error}</p>
            )}
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Deporte
              </label>
              <Input
                type="text"
                value={form.sport}
                onChange={(e) => setForm({ ...form, sport: e.target.value })}
                placeholder="padel"
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Género
              </label>
              <Input
                type="text"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                placeholder="femenil"
                readOnly
                className="bg-muted/50"
              />
            </div>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Temporada
              </label>
              <Input
                type="text"
                value={form.season}
                onChange={(e) => setForm({ ...form, season: e.target.value })}
                placeholder="2026-1"
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Estado Inicial
                </label>
                <Input
                  type="text"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  placeholder="proxima"
                  readOnly
                  className="bg-muted/50"
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !form.name.trim()}
          className="w-full"
        >
          {loading ? 'Creando...' : 'Crear Liga'}
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