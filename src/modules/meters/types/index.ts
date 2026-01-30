import type { MeterType } from '@shared/constants/meterTypes'

// API types
export * from './meter.types'

export type MeterStatus = 'active' | 'maintenance' | 'pending'
export type MeterHistoryStatus = 'accepted' | 'processing' | 'error'

export interface MeterDevice {
  id: string
  name: string
  meterNumber: string
  location: string
  installedAt: string
  providerName: string
  status: MeterStatus
  lastSubmission: string
  nextCheckDate?: string
}

export interface MeterLatestReading {
  id: string
  monthLabel: string
  value: number
  delta: number
  trend: 'up' | 'down'
}

export interface MeterHistoryRecord {
  id: string
  periodLabel: string
  submittedAt: string
  value: number
  consumption: number
  status: MeterHistoryStatus
  note?: string
}

export interface MeterQuickDraft {
  meterId: string
  monthLabel: string
  previousValue: number
  unit: string
}

export interface MeterTypeGroup {
  type: MeterType
  meters: MeterDevice[]
  latestReadings: MeterLatestReading[]
  quickDraft: MeterQuickDraft
  history: MeterHistoryRecord[]
}

export interface AddressMetersSummary {
  totalMeters: number
  activeMeters: number
  pendingReadings: number
}

export interface AddressMetersSnapshot {
  addressId: string
  summary: AddressMetersSummary
  groups: Partial<Record<MeterType, MeterTypeGroup>>
}
