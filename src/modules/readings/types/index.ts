import type { MeterType } from '../../../shared/constants/meterTypes'

export interface MeterReadingDraft {
  id: number
  type: MeterType
  serviceName: string
  meterLabel: string
  meterNumber: string
  unit: string
  previousValue: number
  previousDate: string
  currentValue: number
  readingDate: string
  tariffId: string
  tariff: number
  tariffLabel: string
  tariffs: TariffOption[]
  photo?: {
    fileName: string | null
    previewUrl: string | null
  }
}

export interface TariffOption {
  id: string
  name: string
  price: number
  label: string
}

export interface MeterReadingSummaryRow {
  id: string
  type: MeterType
  serviceName: string
  previousValue: number | null
  currentValue: number | null
  unit: string
  tariffId: string
  tariff: number
  tariffLabel: string
}

export interface MeterReadingHistoryRecord {
  id: string
  submittedAt: string
  serviceName: string
  type: MeterType
  currentValue: number
  consumption: number
  tariff: number
  cost: number
}

export interface AddressReadingsSnapshot {
  addressId: number
  meterDrafts: MeterReadingDraft[]
  summaryRows: MeterReadingSummaryRow[]
}
