import type { Meter, Reading, ConsumptionCalculation } from '@shared/types/entities'

export interface CostSource {
  type: 'api' | 'fallback'
  cost: number
  rate: number
  unit: string
}

export interface DashboardDataContext {
  meters: Meter[]
  readings: Reading[]
  calculations: Map<number, ConsumptionCalculation>
}
