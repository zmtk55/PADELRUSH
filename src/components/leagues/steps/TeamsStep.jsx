import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, HelpCircle, CheckCircle2 } from 'lucide-react'

export default function TeamsStep({ form, setForm, errors, teams, setTeams, categoryInput, setCategoryInput, addCategory, removeCategory, participants }) {
  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const categories = form.categories || []

  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [teamName, setTeamName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || '')
  const [editingIndex, setEditingIndex] = useState(null)

  const resetForm = () => {
    setPlayer1Id('')
    setPlayer2Id('')
    setTeamName('')
    setSelectedCategory(categories[0] || '')
    setEditingIndex(null)
  }

  const startEdit = (idx) => {
    const t = teams[idx]
    setPlayer1Id(t.player1_id)
    setPlayer2Id(t.player2_id)
    setTeamName(t.team_name || '')
    setSelectedCategory(t.category || categories[0] || '')
    setEditingIndex(idx)
  }

  const handleAddOrUpdateTeam = () => {
    if (!player1Id || !player2Id) {
      alert('Por favor seleccione dos jugadores')
      return
    }
    if (player1Id === player2Id) {
      alert('Por favor seleccione dos jugadores diferentes')
      return
    }

    const category = selectedCategory || categories[0] || ''
    if (!category) {
      alert('No hay categorías disponibles. Agréguelas en el paso de Configuración.')
      return
    }

    const newTeam = {
      id: editingIndex != null ? teams[editingIndex].id : Date.now(),
      team_number: editingIndex != null ? teams[editingIndex].team_number : teams.length + 1,
      category,
      team_name: teamName || `Equipo ${editingIndex != null ? teams[editingIndex].team_number : teams.length + 1}`,
      player1_id: player1Id,
      player2_id: player2Id,
    }

    if (editingIndex != null) {
      setTeams(prev => prev.map((t, i) => (i === editingIndex ? newTeam : t)))
    } else {
      setTeams([...teams, newTeam])
    }
    resetForm()
  }

  const handleRemove = (idx) => {
    if (window.confirm('¿Eliminar este equipo?')) {
      setTeams(prev => prev.filter((_, i) => i !== idx))
      if (editingIndex === idx) resetForm()
    }
  }

  const playerName = (id) => (participants || []).find(p => p.id === id)?.name || 'Jugador'

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Equipos</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Cree equipos asignando jugadores a cada categoría. Cada equipo necesita 2 jugadores.
      </p>

      {/* Form to add / edit team */}
      <div className="border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-4">
          {editingIndex != null ? `Editando equipo ${teams[editingIndex].team_number}` : 'Agregar nuevo equipo'}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Jugador 1</Label>
            <select
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar jugador</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Jugador 2</Label>
            <select
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar jugador</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Nombre del equipo (opcional)</Label>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Ej: Los Campeonas"
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          {categories.length > 0 ? (
            <div>
              <Label>Categoría</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay categorías disponibles. Por favor, agregue categorías en el paso de Configuración.</p>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleAddOrUpdateTeam} className="flex-1">
            {editingIndex != null ? 'Guardar cambios' : 'Agregar equipo'}
          </Button>
          {editingIndex != null && (
            <Button variant="outline" onClick={resetForm}>
              Cancelar edición
            </Button>
          )}
        </div>
      </div>

      {/* Existing teams list */}
      <div className="mt-6">
        <h3 className="font-semibold mb-4">Equipos creados ({teams.length})</h3>
        {teams.length === 0 ? (
          <p className="text-sm text-muted-italic text-center py-8">No se han creado equipos aún.</p>
        ) : (
          <div className="space-y-3">
            {teams.map((t, idx) => (
              <div key={t.id || idx} className="border border-border/50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{t.team_name || `Equipo ${t.team_number}`}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.category} • {playerName(t.player1_id)} & {playerName(t.player2_id)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(idx)}
                      className="btn-ghost h-8 px-3 text-xs"
                      title="Editar equipo"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(idx)}
                      className="btn-ghost h-8 px-3 text-xs"
                      title="Eliminar equipo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
