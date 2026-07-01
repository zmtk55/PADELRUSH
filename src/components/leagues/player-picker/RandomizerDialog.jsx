import { Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function RandomizerDialog({ open, onClose, randomizerConfig, setRandomizerConfig, teams, selectedCategory, onRandomize }) {
  const ungroupedCount = teams.filter(t => t.category === selectedCategory && !t.group).length
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle className='flex items-center gap-2'><Shuffle className='w-5 h-5' />Randomizar grupos</DialogTitle></DialogHeader>
        <div className='space-y-4 py-4'>
          <div><Label className='text-sm font-medium'>Número de grupos</Label><Select value={randomizerConfig.numGroups.toString()} onValueChange={v => setRandomizerConfig({ ...randomizerConfig, numGroups: parseInt(v) })}><SelectTrigger className='mt-1'><SelectValue /></SelectTrigger><SelectContent>{[2, 3, 4, 5, 6, 7, 8].map(n => <SelectItem key={n} value={n.toString()}>{n} grupos</SelectItem>)}</SelectContent></Select></div>
          <div className='bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground'><p>Se asignarán grupos aleatoriamente a {ungroupedCount} equipo{ungroupedCount !== 1 ? 's' : ''} sin grupo en la categoría <strong>{selectedCategory}</strong>.</p></div>
          <div className='flex justify-end gap-2 pt-2'>
            <Button variant='outline' onClick={() => onClose(false)}>Cancelar</Button>
            <Button onClick={onRandomize}><Shuffle className='w-4 h-4 mr-1.5' />Randomizar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
