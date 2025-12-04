import { METER_TYPE_UNITS, type MeterType } from '../../../shared/constants/meterTypes'
import type {
  AddressMetersSnapshot,
  MeterHistoryRecord,
  MeterLatestReading,
  MeterTypeGroup,
} from '../types'

const buildLatest = (
  monthLabel: string,
  value: number,
  delta: number,
  trend: MeterLatestReading['trend'],
): MeterLatestReading => ({
  id: `${monthLabel}-${value}`,
  monthLabel,
  value,
  delta,
  trend,
})

const buildHistory = (
  periodLabel: string,
  params: Omit<MeterHistoryRecord, 'id' | 'periodLabel'>,
): MeterHistoryRecord => ({
  id: `${periodLabel}-${params.value}`,
  periodLabel,
  ...params,
})

const createGroup = (
  type: MeterType,
  overrides: Partial<MeterTypeGroup>,
): MeterTypeGroup => {
  if (!overrides.meters || overrides.meters.length === 0) {
    throw new Error('Meter group requires at least one meter')
  }

  return {
    type,
    meters: overrides.meters,
    latestReadings: [],
    quickDraft: {
      meterId: overrides.meters[0].id,
      monthLabel: 'Березень 2025',
      previousValue: 0,
      unit: METER_TYPE_UNITS[type],
    },
    history: [],
    ...overrides,
  }
}

export const MOCK_ADDRESS_METERS: AddressMetersSnapshot[] = [
  {
    addressId: '1',
    summary: {
      totalMeters: 4,
      activeMeters: 3,
      pendingReadings: 2,
    },
    groups: {
      electricity: createGroup('electricity', {
        meters: [
          {
            id: 'el-main',
            name: 'Основний тариф',
            meterNumber: 'EL-238923',
            location: 'Щитова, коридор',
            installedAt: '2021-04-15',
            providerName: 'YASNO',
            status: 'active',
            lastSubmission: '12 лютого 2025',
            nextCheckDate: '05 квітня 2026',
          },
          {
            id: 'el-night',
            name: 'Нічний тариф',
            meterNumber: 'EL-238923-N',
            location: 'Щитова, коридор',
            installedAt: '2022-01-20',
            providerName: 'YASNO',
            status: 'pending',
            lastSubmission: '12 лютого 2025',
            nextCheckDate: '05 квітня 2026',
          },
        ],
        latestReadings: [
          buildLatest('Лютий 2025', 4820, 124, 'up'),
          buildLatest('Січень 2025', 4696, 88, 'down'),
          buildLatest('Грудень 2024', 4784, 132, 'up'),
        ],
        quickDraft: {
          meterId: 'el-main',
          monthLabel: 'Березень 2025',
          previousValue: 4820,
          unit: METER_TYPE_UNITS.electricity,
        },
        history: [
          buildHistory('Лютий 2025', {
            submittedAt: '12.02.2025 09:24',
            value: 4820,
            consumption: 124,
            status: 'accepted',
          }),
          buildHistory('Січень 2025', {
            submittedAt: '12.01.2025 09:15',
            value: 4696,
            consumption: 88,
            status: 'accepted',
          }),
          buildHistory('Грудень 2024', {
            submittedAt: '12.12.2024 08:57',
            value: 4608,
            consumption: 132,
            status: 'processing',
            note: 'Очікує підтвердження провайдера',
          }),
        ],
      }),
      gas: createGroup('gas', {
        meters: [
          {
            id: 'gas-kitchen',
            name: 'Плита на кухні',
            meterNumber: 'GS-88342',
            location: 'Кухня',
            installedAt: '2019-11-05',
            providerName: 'КиївГаз',
            status: 'active',
            lastSubmission: '02 лютого 2025',
            nextCheckDate: '10 листопада 2025',
          },
        ],
        latestReadings: [
          buildLatest('Лютий 2025', 612, 6, 'down'),
          buildLatest('Січень 2025', 606, 10, 'up'),
          buildLatest('Грудень 2024', 596, 4, 'down'),
        ],
        quickDraft: {
          meterId: 'gas-kitchen',
          monthLabel: 'Березень 2025',
          previousValue: 612,
          unit: METER_TYPE_UNITS.gas,
        },
        history: [
          buildHistory('Лютий 2025', {
            submittedAt: '02.02.2025 10:12',
            value: 612,
            consumption: 6,
            status: 'accepted',
          }),
          buildHistory('Січень 2025', {
            submittedAt: '02.01.2025 10:07',
            value: 606,
            consumption: 10,
            status: 'accepted',
          }),
          buildHistory('Грудень 2024', {
            submittedAt: '02.12.2024 09:59',
            value: 596,
            consumption: 4,
            status: 'accepted',
          }),
        ],
      }),
      coldWater: createGroup('coldWater', {
        meters: [
          {
            id: 'cw-bathroom',
            name: 'Ванна кімната',
            meterNumber: 'CW-55231',
            location: 'Санвузол',
            installedAt: '2020-05-10',
            providerName: 'КиївВодоканал',
            status: 'maintenance',
            lastSubmission: '05 лютого 2025',
            nextCheckDate: '19 серпня 2025',
          },
        ],
        latestReadings: [
          buildLatest('Лютий 2025', 125, 2, 'up'),
          buildLatest('Січень 2025', 123, -1, 'down'),
          buildLatest('Грудень 2024', 124, 0, 'up'),
        ],
        quickDraft: {
          meterId: 'cw-bathroom',
          monthLabel: 'Березень 2025',
          previousValue: 125,
          unit: METER_TYPE_UNITS.coldWater,
        },
        history: [
          buildHistory('Лютий 2025', {
            submittedAt: '05.02.2025 13:40',
            value: 125,
            consumption: 2,
            status: 'processing',
            note: 'Перевіряємо нетипове споживання',
          }),
          buildHistory('Січень 2025', {
            submittedAt: '05.01.2025 13:33',
            value: 123,
            consumption: -1,
            status: 'accepted',
          }),
          buildHistory('Грудень 2024', {
            submittedAt: '05.12.2024 13:28',
            value: 124,
            consumption: 0,
            status: 'accepted',
          }),
        ],
      }),
    },
  },
  {
    addressId: '2',
    summary: {
      totalMeters: 3,
      activeMeters: 3,
      pendingReadings: 1,
    },
    groups: {
      electricity: createGroup('electricity', {
        meters: [
          {
            id: 'el-lviv',
            name: 'Загальний лічильник',
            meterNumber: 'EL-99123',
            location: 'Коридор',
            installedAt: '2023-02-01',
            providerName: 'ЛьвівЕнерго',
            status: 'active',
            lastSubmission: '10 лютого 2025',
          },
        ],
        latestReadings: [
          buildLatest('Лютий 2025', 2620, 112, 'up'),
          buildLatest('Січень 2025', 2508, 74, 'down'),
          buildLatest('Грудень 2024', 2582, 96, 'up'),
        ],
        quickDraft: {
          meterId: 'el-lviv',
          monthLabel: 'Березень 2025',
          previousValue: 2620,
          unit: METER_TYPE_UNITS.electricity,
        },
        history: [
          buildHistory('Лютий 2025', {
            submittedAt: '10.02.2025 08:45',
            value: 2620,
            consumption: 112,
            status: 'accepted',
          }),
          buildHistory('Січень 2025', {
            submittedAt: '10.01.2025 08:40',
            value: 2508,
            consumption: 74,
            status: 'accepted',
          }),
        ],
      }),
      hotWater: createGroup('hotWater', {
        meters: [
          {
            id: 'hw-kitchen',
            name: 'Кухня',
            meterNumber: 'HW-2991',
            location: 'Кухня',
            installedAt: '2020-07-14',
            providerName: 'ЛьвівТепло',
            status: 'active',
            lastSubmission: '04 лютого 2025',
          },
        ],
        latestReadings: [
          buildLatest('Лютий 2025', 84, -3, 'down'),
          buildLatest('Січень 2025', 87, 1, 'up'),
          buildLatest('Грудень 2024', 86, -2, 'down'),
        ],
        quickDraft: {
          meterId: 'hw-kitchen',
          monthLabel: 'Березень 2025',
          previousValue: 84,
          unit: METER_TYPE_UNITS.hotWater,
        },
        history: [
          buildHistory('Лютий 2025', {
            submittedAt: '04.02.2025 17:05',
            value: 84,
            consumption: -3,
            status: 'accepted',
          }),
          buildHistory('Січень 2025', {
            submittedAt: '04.01.2025 17:03',
            value: 87,
            consumption: 1,
            status: 'accepted',
          }),
        ],
      }),
      heat: createGroup('heat', {
        meters: [
          {
            id: 'heat-central',
            name: 'Будинковий теплолічильник',
            meterNumber: 'HT-0023',
            location: 'Підвал',
            installedAt: '2018-10-02',
            providerName: 'ЛьвівТепло',
            status: 'active',
            lastSubmission: '28 січня 2025',
          },
        ],
        latestReadings: [
          buildLatest('Січень 2025', 34.2, 4.1, 'up'),
          buildLatest('Грудень 2024', 30.1, 2.4, 'down'),
          buildLatest('Листопад 2024', 32.5, 3.0, 'up'),
        ],
        quickDraft: {
          meterId: 'heat-central',
          monthLabel: 'Березень 2025',
          previousValue: 34.2,
          unit: METER_TYPE_UNITS.heat,
        },
        history: [
          buildHistory('Січень 2025', {
            submittedAt: '28.01.2025 19:42',
            value: 34.2,
            consumption: 4.1,
            status: 'processing',
            note: 'Підтверджуємо дані з провайдером',
          }),
          buildHistory('Грудень 2024', {
            submittedAt: '28.12.2024 19:33',
            value: 30.1,
            consumption: 2.4,
            status: 'accepted',
          }),
        ],
      }),
    },
  },
  {
    addressId: '13',
    summary: {
      totalMeters: 2,
      activeMeters: 2,
      pendingReadings: 0,
    },
    groups: {
      electricity: createGroup('electricity', {
        meters: [
          {
            id: 'el-kharkiv',
            name: 'Основний',
            meterNumber: 'EL-55210',
            location: 'Коридор',
            installedAt: '2024-03-18',
            providerName: 'ХарківЕнерго',
            status: 'active',
            lastSubmission: '15 лютого 2025',
          },
        ],
        latestReadings: [
          buildLatest('Лютий 2025', 820, 65, 'up'),
          buildLatest('Січень 2025', 755, 40, 'down'),
          buildLatest('Грудень 2024', 795, 55, 'up'),
        ],
        quickDraft: {
          meterId: 'el-kharkiv',
          monthLabel: 'Березень 2025',
          previousValue: 820,
          unit: METER_TYPE_UNITS.electricity,
        },
        history: [
          buildHistory('Лютий 2025', {
            submittedAt: '15.02.2025 11:30',
            value: 820,
            consumption: 65,
            status: 'accepted',
          }),
          buildHistory('Січень 2025', {
            submittedAt: '15.01.2025 11:21',
            value: 755,
            consumption: 40,
            status: 'accepted',
          }),
        ],
      }),
      gas: createGroup('gas', {
        meters: [
          {
            id: 'gas-kharkiv',
            name: 'Плита',
            meterNumber: 'GS-12345',
            location: 'Кухня',
            installedAt: '2021-08-09',
            providerName: 'ХарківГаз',
            status: 'active',
            lastSubmission: '03 лютого 2025',
          },
        ],
        latestReadings: [
          buildLatest('Лютий 2025', 210, 5, 'up'),
          buildLatest('Січень 2025', 205, 7, 'up'),
          buildLatest('Грудень 2024', 198, 3, 'down'),
        ],
        quickDraft: {
          meterId: 'gas-kharkiv',
          monthLabel: 'Березень 2025',
          previousValue: 210,
          unit: METER_TYPE_UNITS.gas,
        },
        history: [
          buildHistory('Лютий 2025', {
            submittedAt: '03.02.2025 14:20',
            value: 210,
            consumption: 5,
            status: 'accepted',
          }),
          buildHistory('Січень 2025', {
            submittedAt: '03.01.2025 14:10',
            value: 205,
            consumption: 7,
            status: 'accepted',
          }),
        ],
      }),
    },
  },
]
