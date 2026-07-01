import { useState } from 'react'
import { motion } from 'framer-motion'
import { Swords, Loader2, Check, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { useLeagues } from '@/hooks/useLeagues'
import { req } from '@/lib/data'

export function QuickScoreEntry() {
  const [open, setOpen] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState('')
  const [matches, setMatches] = useState([])
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const { leaguesQuery } = useLeagues()
  const toast = useToast()
  const leagues = leaguesQuery?.data || []

  const handleLeagueChange = async (leagueId) => {
    setSelectedLeague(leagueId)
    setSelectedMatch(null)
    if (!leagueId) { setMatches([]); return }
    setLoadingMatches(true)
    try {
      const m = await req('GET', '/matches?select=*,teams!team1_id(team_name)&league_id=eq.' + leagueId + '&status=eq.programado&order=scheduled_date.asc')
      setMatches(m || [])
    } catch (e) { console.error(e) }
    setLoadingMatches(false)
  }

  const handleSubmit = async () => {
    if (!selectedMatch || !score1 || !score2) return
    setSaving(true)
    try {
      const s1 = parseInt(score1)
      const s2 = parseInt(score2)
      const winner = s1 > s2 ? 1 : s2 > s1 ? 2 : null
      await req('PATCH', '/matches?id=eq.' + selectedMatch.id, {
        status: 'jugado', team1_score: s1, team2_score: s2,
        winner_team_number: winner,
        played_date: new Date().toISOString().split('T')[0],
      })
      toast.success('Resultado registrado')
      setOpen(false); setSelectedMatch(null); setScore1(''); setScore2('')
    } catch (e) {
      toast.error(e?.message || 'Error al registrar')
    }
    setSaving(false)
  }

  return (
    <>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className='w-full card-base p-5 flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer text-left'>
        <div className='w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0'>
          <Plus className='w-6 h-6 text-emerald-600' />
        </div>
        <div>
          <p className='text-sm font-semibold text-foreground'>Registrar Resultado</p>
          <p className='text-xs text-muted-foreground mt-0.5'>Ingresa el marcador de un partido</p>
        </div>
      </motion.button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='font-heading font-bold flex items-center gap-2'><Swords className='w-5 h-5' /> Registrar Resultado</DialogTitle>
            <DialogDescription>Selecciona la liga, el partido y registra el marcador</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground mb-1.5 block'>Liga</label>
              <Select value={selectedLeague} onValueChange={handleLeagueChange}>
                <SelectTrigger><SelectValue placeholder='Seleccionar liga...' /></SelectTrigger>
                <SelectContent>
                  {leagues.filter(l => l.status === 'activa').map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedLeague && (
              <div>
                <label className='text-sm font-medium text-muted-foreground mb-1.5 block'>Partido</label>
                {loadingMatches ? (
                  <div className='flex items-center gap-2 text-sm text-muted-foreground py-2'><Loader2 className='w-4 h-4 animate-spin' /> Cargando...</div>
                ) : matches.length === 0 ? (
                  <p className='text-sm text-muted-foreground py-2'>No hay partidos programados</p>
                ) : (
                  <div className='space-y-1.5 max-h-48 overflow-y-auto'>
                    {matches.map(m => (
                      <button key={m.id} onClick={() => { setSelectedMatch(m); setScore1(''); setScore2('') }}
                        className={'w-full text-left p-3 rounded-lg border text-sm transition-all ' + (selectedMatch?.id === m.id ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80')}>
                        <p className='font-medium'>{m.team1_name || 'Equipo 1'} vs {m.team2_name || 'Equipo 2'}</p>
                        {m.scheduled_date && <p className='text-xs text-muted-foreground mt-0.5'>{new Date(m.scheduled_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {selectedMatch && (
              <div className='p-4 rounded-lg bg-muted/30 border border-border'>
                <p className='text-sm font-medium text-center mb-3'>{selectedMatch.team1_name || 'Equipo 1'} vs {selectedMatch.team2_name || 'Equipo 2'}</p>
                <div className='flex items-center justify-center gap-3'>
                  <Input type='number' min='0' value={score1} onChange={e => setScore1(e.target.value)} placeholder='0' className='w-20 text-center text-lg font-bold' />
                  <span className='text-lg font-bold text-muted-foreground'>-</span>
                  <Input type='number' min='0' value={score2} onChange={e => setScore2(e.target.value)} placeholder='0' className='w-20 text-center text-lg font-bold' />
                </div>
              </div>
            )}
            <div className='flex gap-2 justify-end pt-2'>
              <Button variant='outline' onClick={() => setOpen(false)}><X className='w-4 h-4' /> Cancelar</Button>
              <Button onClick={handleSubmit} disabled={!selectedMatch || !score1 || !score2 || saving}>
                {saving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Check className='w-4 h-4' />}
                {saving ? 'Guardando...' : 'Registrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
