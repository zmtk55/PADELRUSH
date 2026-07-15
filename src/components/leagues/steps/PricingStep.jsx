import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, TrendingUp, TrendingDown } from 'lucide-react'

function estimateMatches(teamCount) {
  // Round-robin (todos contra todos): n*(n-1)/2 por grupo
  if (teamCount < 2) return 0
  return Math.round((teamCount * (teamCount - 1)) / 2)
}

export default function PricingStep({ form, setForm, errors, teams = [] }) {
  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const [showProfit, setShowProfit] = useState(false)

  const inscriptionFee = parseFloat(form.inscriptionFee) || 0
  const arbitrationCostPerMatch = parseFloat(form.arbitrationCostPerMatch) || 0
  const prizePool = parseFloat(form.prizePool) || 0
  const operationalCosts = parseFloat(form.operationalCosts) || 0

  const playerCount = teams.length * 2
  const matchCount = estimateMatches(teams.length)
  const revenue = inscriptionFee * playerCount
  const arbitrationTotal = arbitrationCostPerMatch * matchCount
  const totalCosts = arbitrationTotal + operationalCosts + prizePool
  const profit = revenue - totalCosts

  const handleCheckProfitability = () => setShowProfit(true)

  const fmt = (n) => `$${Math.round(n).toLocaleString('es-MX')}`

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Precios</h2>
      <p className="text-muted-foreground">
        Configura los precios y costos asociados a la liga.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label>Costo de inscripción (por jugador)</Label>
          <Input
            type="number"
            value={form.inscriptionFee || 0}
            onChange={(e) => handleChange('inscriptionFee', parseFloat(e.target.value) || 0)}
            className={errors.inscriptionFee ? 'border-destructive' : ''}
            placeholder="0"
          />
          {errors.inscriptionFee && <p className="text-sm text-destructive mt-1">{errors.inscriptionFee}</p>}
        </div>

        <div className="space-y-4">
          <Label>Costo de arbitraje por partido</Label>
          <Input
            type="number"
            value={form.arbitrationCostPerMatch || 0}
            onChange={(e) => handleChange('arbitrationCostPerMatch', parseFloat(e.target.value) || 0)}
            className={errors.arbitrationCostPerMatch ? 'border-destructive' : ''}
            placeholder="0"
          />
          {errors.arbitrationCostPerMatch && <p className="text-sm text-destructive mt-1">{errors.arbitrationCostPerMatch}</p>}
        </div>

        <div className="space-y-4">
          <Label>Premio total</Label>
          <Input
            type="number"
            value={form.prizePool || 0}
            onChange={(e) => handleChange('prizePool', parseFloat(e.target.value) || 0)}
            className={errors.prizePool ? 'border-destructive' : ''}
            placeholder="0"
          />
          {errors.prizePool && <p className="text-sm text-destructive mt-1">{errors.prizePool}</p>}
        </div>

        <div className="space-y-4">
          <Label>Costos operativos</Label>
          <Input
            type="number"
            value={form.operationalCosts || 0}
            onChange={(e) => handleChange('operationalCosts', parseFloat(e.target.value) || 0)}
            className={errors.operationalCosts ? 'border-destructive' : ''}
            placeholder="0"
          />
          {errors.operationalCosts && <p className="text-sm text-destructive mt-1">{errors.operationalCosts}</p>}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <Button variant="outline" onClick={handleCheckProfitability}>
          Verificar rentabilidad
        </Button>
      </div>

      {showProfit && (
        <div className="mt-4 rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            {profit >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <h3 className="font-semibold">Proyección de rentabilidad</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Jugadores inscritos</span><span className="font-medium">{playerCount}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Partidos estimados</span><span className="font-medium">{matchCount}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Ingresos (inscripción)</span><span className="font-medium">{fmt(revenue)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Arbitraje total</span><span className="font-medium">{fmt(arbitrationTotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Premios</span><span className="font-medium">{fmt(prizePool)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Costos operativos</span><span className="font-medium">{fmt(operationalCosts)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="font-semibold">Ganancia neta</span><span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(profit)}</span></div>
          </div>
          {profit < 0 && (
            <p className="text-xs text-destructive">La liga tendría pérdidas con estos valores. Ajusta precios o costos.</p>
          )}
        </div>
      )}
    </div>
  )
}
