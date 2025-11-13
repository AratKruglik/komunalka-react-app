import type { MeterType } from '../constants/meterTypes'

export type UtilityServiceType = 'water' | 'gas' | 'electricity' | 'heating'

export type BillingCycle = 'monthly' | 'quarterly' | 'annual'

export interface ProviderTemplate {
  id: string
  name: string
  serviceLabel: string
  serviceType: UtilityServiceType
  unitLabel: string
  unitPrice: number
  billingCycle: BillingCycle
  supportPhone?: string
  supportEmail?: string
  website?: string
  description?: string
  reminderDay?: number
  meterTypes?: MeterType[]
}
