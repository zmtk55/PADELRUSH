import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Camera, Link } from 'lucide-react'

export default function PlayerAvatarManager({ teams }) {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [url, setUrl] = useState('')

  const updatePhoto = useMutation({
    mutationFn: async ({ id, photo_url }) => {
      const { error } = await supabase.from('participants').update({ photo_url }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); toast.success('Foto actualizada'); setSelected(null); setUrl('') },
    onError: (e) => toast.error(e.message),
  })

  const players = []
  teams.forEach(t => {
    if (t.player1?.name) players.push({ id: t.player1_id, name: t.player1.name, photo: t.player1.photo_url, team: t.team_name })
    if (t.player2?.name) players.push({ id: t.player2_id, name: t.player2.name, photo: t.player2.photo_url, team: t.team_name })
  })

  return (
    <div className="space-y-4">
      <h3 className=" font-mono font-semibold">Fotos de jugadores</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {players.map((p, i) => (
          <div key={`${p.id}-${i}`} onClick={() => { setSelected(p); setUrl(p.photo || '') }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(p); setUrl(p.photo || '') } }}
            role="button" tabIndex={0} aria-label={`Seleccionar ${p.name}`}
            className={`bg-background rounded-xl border p-4 text-center cursor-pointer transition-all hover:border-accent/50 ${selected?.id === p.id ? 'border-accent ring-1 ring-accent' : 'border-border'}`}>
            {p.photo ? (
              <img src={p.photo} alt={p.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                <Camera className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <p className="text-xs font-medium truncate">{p.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{p.team}</p>
          </div>
        ))}
      </div>
      {selected && (
        <div className="bg-background rounded-xl border border-border p-4 flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="photo-url" className="text-xs text-muted-foreground">URL de foto para {selected.name}</Label>
            <div className="flex gap-2 mt-1">
              <Input id="photo-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="flex-1" />
              <Button size="sm" onClick={() => updatePhoto.mutate({ id: selected.id, photo_url: url })} disabled={updatePhoto.isPending} aria-busy={updatePhoto.isPending}>
                <Link className="w-4 h-4" /> Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
