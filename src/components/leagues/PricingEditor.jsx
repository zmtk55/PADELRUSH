import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Currency } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import PricingBreakdown from './PricingBreakdown'

export default function PricingEditor({ 
initialData = {}, 
onChange 
}) {
const [pricing, setPricing] = useState({
inscriptionFee: initialData.inscriptionFee || 0,
arbitrationCostPerMatch: initialData.arbitrationCostPerMatch || 0,
prizePool: initialData.prizePool || 0,
operationalCosts: initialData.operationalCosts || 0,
...initialData
})

const handleChange = (field, value) => {
setPricing(prev => ({ ...prev, [field]: value }))
onChange({ ...pricing, [field]: value })
}

return (
<Card>
<CardHeader>
<CardTitle className="flex items-center gap-2">
<Currency className="w-4 h-4" />
Configuración de Precios y Costos
</CardTitle>
</CardHeader>
<CardContent className="space-y-6">
<div className="grid gap-4 sm:grid-cols-2">
<div>
<Label>Costo de Inscripción por Equipo</Label>
<div className="flex gap-2">
<Input
type="number"
value={pricing.inscriptionFee}
onChange={(e) => handleChange('inscriptionFee', parseFloat(e.target.value) || 0)}
placeholder="0"
/>
</div>
<p className="text-xs text-muted-foreground mt-1">
Costo que cada equipo paga para participar
</p>
</div>

<div>
<Label>Costo de Árbitro por Partido</Label>
<div className="flex gap-2">
<Input
type="number"
value={pricing.arbitrationCostPerMatch}
onChange={(e) => handleChange('arbitrationCostPerMatch', parseFloat(e.target.value) || 0)}
placeholder="0"
/>
</div>
<p className="text-xs text-muted-foreground mt-1">
Costo promedio por partido para pagar árbitros
</p>
</div>
</div>

<div className="grid gap-4 sm:grid-cols-2">
<div>
<Label>Pozo de Premios Total</Label>
<div className="flex gap-2">
<Input
type="number"
value={pricing.prizePool}
onChange={(e) => handleChange('prizePool', parseFloat(e.target.value) || 0)}
placeholder="0"
/>
</div>
<p className="text-xs text-muted-foreground mt-1">
Monto total destinado a premios
</p>
</div>

<div>
<Label>Costos Operacionales</Label>
<div className="flex gap-2">
<Input
type="number"
value={pricing.operationalCosts}
onChange={(e) => handleChange('operationalCosts', parseFloat(e.target.value) || 0)}
placeholder="0"
/>
</div>
<p className="text-xs text-muted-foreground mt-1">
Gastos diversos (canchas, agua, luz, etc.)
</p>
</div>
</div>

{/* Preview section */}
<div className="border-t border-border pt-4">
<CardHeader>
<CardTitle className="flex items-center gap-2">
<Badge variant="outline">Vista Preliminar</Badge>
</CardTitle>
</CardHeader>
<CardContent>
<PricingBreakdown league={{
...pricing,
// For preview, assume some default values
// In reality, these would come from the league data
// We'd need to pass teams and matches data for accurate calculation
}}/>
</CardContent>
</div>
</CardContent>
</Card>
)
}