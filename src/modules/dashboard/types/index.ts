import type { LucideIcon } from 'lucide-react'

export interface ServiceData {
  id: number
  name: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  cost: number
  consumption: number
  unit: string
  rate: number
  change: number // percentage
}

export interface Reading {
  id: number
  serviceId: number
  serviceName: string
  serviceIcon: LucideIcon
  serviceIconBg: string
  serviceIconColor: string
  date: string
  value: number
  unit: string
  difference: number
}

export interface PaymentReminder {
  id: number
  serviceId: number
  type: import('../../../shared/constants/meterTypes').MeterType
  serviceName: string
  amount: number
  dueDate: string
  daysUntilDue: number
  urgency: 'high' | 'medium' | 'low'
}

export interface ChartDataPoint {
  month: string
  electricity?: number
  gas?: number
  water?: number
  hotWater?: number
  coldWater?: number
  heating?: number
}

export type PeriodFilter = '3months' | '6months' | '1year'

export interface ExpenseDistributionItem {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

export type ExpenseDistributionByPeriod = Record<
  PeriodFilter,
  readonly ExpenseDistributionItem[]
>

export interface DashboardAddressOption {
  id: number
  label: string
  description?: string
}
