import { METER_TYPE_UNITS } from '../../../shared/constants/meterTypes'
import type { AddressReadingsSnapshot, MeterReadingDraft } from '../types'

const createDraft = (draft: Omit<MeterReadingDraft, 'unit'>): MeterReadingDraft => {
  return {
    ...draft,
    unit: METER_TYPE_UNITS[draft.type],
  }
}

const KYIV_ADDRESS_DRAFTS: MeterReadingDraft[] = [
  createDraft({
    id: 'kyiv-electricity',
    type: 'electricity',
    serviceName: 'Електроенергія',
    meterLabel: 'Основний тариф',
    meterNumber: 'EL-238923',
    previousValue: 5212,
    previousDate: '2025-05-25',
    currentValue: 5432,
    readingDate: '2025-06-25',
    tariff: 1.68,
    tariffLabel: '1.68 грн/кВт·год',
    photo: {
      fileName: null,
      previewUrl: null,
    },
  }),
  createDraft({
    id: 'kyiv-gas',
    type: 'gas',
    serviceName: 'Газ',
    meterLabel: 'Кухонна плита',
    meterNumber: 'GS-88342',
    previousValue: 1843,
    previousDate: '2025-05-20',
    currentValue: 1879,
    readingDate: '2025-06-25',
    tariff: 7.96,
    tariffLabel: '7.96 грн/м³',
    photo: {
      fileName: null,
      previewUrl: null,
    },
  }),
  createDraft({
    id: 'kyiv-cold-water',
    type: 'coldWater',
    serviceName: 'Холодна вода',
    meterLabel: 'Ванна кімната',
    meterNumber: 'CW-55231',
    previousValue: 126,
    previousDate: '2025-05-25',
    currentValue: 131,
    readingDate: '2025-06-25',
    tariff: 25.98,
    tariffLabel: '25.98 грн/м³',
    photo: {
      fileName: null,
      previewUrl: null,
    },
  }),
  createDraft({
    id: 'kyiv-hot-water',
    type: 'hotWater',
    serviceName: 'Гаряча вода',
    meterLabel: 'Кухня',
    meterNumber: 'HW-99331',
    previousValue: 87.2,
    previousDate: '2025-05-25',
    currentValue: 92.2,
    readingDate: '2025-06-25',
    tariff: 92.82,
    tariffLabel: '92.82 грн/м³',
    photo: {
      fileName: null,
      previewUrl: null,
    },
  }),
]

export const MOCK_ADDRESS_READING_SNAPSHOTS: AddressReadingsSnapshot[] = [
  {
    addressId: 'kyiv-khreschatyk-22',
    meterDrafts: KYIV_ADDRESS_DRAFTS,
    summaryRows: KYIV_ADDRESS_DRAFTS.map((draft) => ({
      id: `${draft.id}-summary`,
      type: draft.type,
      serviceName: draft.serviceName,
      previousValue: draft.previousValue,
      currentValue: draft.currentValue,
      unit: draft.unit,
      tariff: draft.tariff,
      tariffLabel: draft.tariffLabel,
    })),
  },
]
