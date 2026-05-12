import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, X, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

export function PlayerPickerPanel({ participants, categories, teams, onTeamsChange }) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || '')
  const [player1Search, setPlayer1Search] = useState('')
  const [player2Search, setPlayer2Search] = useState('')

  const filteredP1 = participants.filter(
    (p) => p.name.toLowerCase().includes(player1Search.toLowerCase()) && !teams.some((t) => t.player1_name === p.name || t.player2_name === p.name)
  )
  const filteredP2 = participants.filter(
    (p) => p.name.toLowerCase().includes(player2Search.toLowerCase()) && !teams.some((t) => t.player1_name === p.name || t.player2_name === p.name)
  )

  const addTeam = (player1, player2) => {
    const cat = selectedCategory || categories[0]
    const existingInCat = teams.filter((t) => t.category === cat).length
    const team = {
      id: `team-${Date.now()}`,
      category: cat,
      team_number: existingInCat + 1,
      player1_id: player1.id,
      player2_id: player2.id,
      player1_name: player1.name,
      player2_name: player2.name,
    }
    onTeamsChange([...teams, team])
    setPlayer1Search('')
    setPlayer2Search('')
  }

  const removeTeam = (teamId) => {
    onTeamsChange(teams.filter((t) => t.id !== teamId))
  }

  const autoShuffle = () => {
    const cat = selectedCategory || categories[0]
    const available = participants.filter(
      (p) => !teams.some((t) => t.player1_name === p.name || t.player2_name === p.name) && p.level === cat
    )
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    const newTeams = []
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const existingInCat = teams.filter((t) => t.category === cat).length
      newTeams.push({
        id: `team-auto-${Date.now()}-${i}`,
        category: cat,
        team_number: existingInCat + newTeams.length + 1,
        player1_id: shuffled[i].id,
        player2_id: shuffled[i + 1].id,
        player1_name: shuffled[i].name,
        player2_name: shuffled[i + 1].name,
      })
    }
    onTeamsChange([...teams, ...newTeams])
  }

  const teamsByCategory = categories.map((cat) => ({
    category: cat,
    teams: teams.filter((t) => t.category === cat),
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">Equipos</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-28">
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
          <Button variant="outline" size="sm" onClick={autoShuffle}>
            <Shuffle className="w-4 h-4" />
            Barajar
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-background rounded-xl p-4 border border-border">
          <Label className="text-xs mb-2 block">Jugador 1</Label>
          <Input
            value={player1Search}
            onChange={(e) => setPlayer1Search(e.target.value)}
            placeholder="Buscar jugador..."
          />
          {player1Search && (
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
              {filteredP1.slice(0, 6).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlayer1Search(p.name)}
                    className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  {p.name}
                  <span className="text-xs text-muted-foreground ml-2">{p.level}</span>
                </button>
              ))}
              {filteredP1.length === 0 && <p className="text-xs text-muted-foreground px-3 py-2">Sin resultados</p>}
            </div>
          )}
        </div>

        <div className="bg-background rounded-xl p-4 border border-border">
          <Label className="text-xs mb-2 block">Jugador 2</Label>
          <Input
            value={player2Search}
            onChange={(e) => setPlayer2Search(e.target.value)}
            placeholder="Buscar jugador..."
          />
          {player2Search && (
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
              {filteredP2.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlayer2Search(p.name)}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  {p.name}
                  <span className="text-xs text-muted-foreground ml-2">{p.level}</span>
                </button>
              ))}
              {filteredP2.length === 0 && <p className="text-xs text-muted-foreground px-3 py-2">Sin resultados</p>}
            </div>
          )}
        </div>
      </div>

      {player1Search && player2Search && filteredP1.length > 0 && filteredP2.length > 0 && (
        <Button
          onClick={() => {
            const p1 = participants.find((p) => p.name === player1Search)
            const p2 = participants.find((p) => p.name === player2Search)
            if (p1 && p2 && p1.id !== p2.id) addTeam(p1, p2)
          }}
          className="w-full"
        >
          <UserPlus className="w-4 h-4" />
          Agregar equipo
        </Button>
      )}

      {/* Teams list */}
      {teamsByCategory.map(({ category, teams: catTeams }) => (
        <div key={category}>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            {category} · {catTeams.length} equipos
          </h3>
          <div className="space-y-2">
            {catTeams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-background rounded-lg px-4 py-3 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                    {team.team_number}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{team.player1_name}</span>
                    <span className="text-muted-foreground mx-2">/</span>
                    <span className="font-medium">{team.player2_name}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => removeTeam(team.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {teams.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Busca dos jugadores y haz clic en "Agregar equipo"</p>
        </div>
      )}
    </div>
  )
}
