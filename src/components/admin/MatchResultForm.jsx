import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { base44 } from '@/api/base44Client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export default function MatchResultForm({ leagueId, category }) {
  const qc = useQueryClient()
  const [match, setMatch] = useState({ team1: '', team2: '', score1: '', score2: '', status: 'jugado', date: new Date().toISOString().split('T')[0] })

  const saveMatch = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('matches').insert(data).select()
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matches'] }); toast.success('Resultado guardado'); setMatch({ team1: '', team2: '', score1: '', score2: '', status: 'jugado', date: new Date().toISOString().split('T')[0] }) },
    onError: (e) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <h3 className=" font-mono font-semibold">Registrar resultado</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="team1" className="text-xs text-muted-foreground">Equipo 1</Label>
          <Input id="team1" value={match.team1} onChange={(e) => setMatch({ ...match, team1: e.target.value })} placeholder="Nombre del equipo" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="team2" className="text-xs text-muted-foreground">Equipo 2</Label>
          <Input id="team2" value={match.team2} onChange={(e) => setMatch({ ...match, team2: e.target.value })} placeholder="Nombre del equipo" className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="score1" className="text-xs text-muted-foreground">Sets Eq1</Label>
          <Input id="score1" type="number" value={match.score1} onChange={(e) => setMatch({ ...match, score1: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="score2" className="text-xs text-muted-foreground">Sets Eq2</Label>
          <Input id="score2" type="number" value={match.score2} onChange={(e) => setMatch({ ...match, score2: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="match-status" className="text-xs text-muted-foreground">Estado</Label>
          <Select value={match.status} onValueChange={(v) => setMatch({ ...match, status: v })}>
            <SelectTrigger id="match-status" className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="jugado">Jugado</SelectItem>
              <SelectItem value="walkover">W/O</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={() => saveMatch.mutate({ ...match, league_id: leagueId, category })} disabled={saveMatch.isPending} aria-busy={saveMatch.isPending}
        className="w-full bg-accent text-accent-foreground font-body font-semibold">
        <Save className="w-4 h-4" /> Guardar resultado
      </Button>
    </div>
  )
}
