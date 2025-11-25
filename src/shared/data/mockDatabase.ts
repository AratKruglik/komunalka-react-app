/**
 * Централізована база mock-даних для всього додатку.
 *
 * ВАЖЛИВО ПРО МОВИ:
 * - Всі ключі об'єктів, поля та enum values - АНГЛІЙСЬКОЮ
 * - Українські тексти - ТІЛЬКИ в полях для відображення (name, description, location, etc.)
 *
 * Структура:
 * - 13 адрес з реалістичними українськими даними
 * - 4 провайдери комунальних послуг
 * - 41 лічильник для всіх адрес (2-5 на адресу)
 * - Історичні показники (6 місяців для кожного лічильника, мінімізовано з 12)
 *
 * Foreign Key зв'язки:
 * - Meter.addressId → Address.id
 * - Meter.providerId → Provider.id
 * - Reading.meterId → Meter.id
 *
 * Використання числових ID:
 * - Address: 1-13
 * - Provider: 1-4
 * - Meter: 100-140
 * - Reading: auto-generated
 */

import type { Address, Provider, Meter, Reading } from '../types/entities'
import {
  generateAddressId,
  generateProviderId,
  generateMeterId,
  generateReadingId,
} from '../utils/mockIdGenerator'

// =============================================================================
// PROVIDERS (4 провайдери)
// =============================================================================

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: generateProviderId(), // 1
    name: 'YASNO',
    serviceType: 'electricity',
    serviceLabel: 'Електроенергія',
    unitLabel: 'грн/кВт·год',
    tariffs: [
      { id: 'yasno-day', name: 'Денний', price: 4.32 },
      { id: 'yasno-night', name: 'Нічний', price: 2.64 },
      { id: 'yasno-weekend', name: 'Вихідний', price: 3.85 },
    ],
    billingCycle: 'monthly',
    supportPhone: '+380 44 594 77 77',
    supportEmail: 'support@yasno.com.ua',
    website: 'https://yasno.com.ua',
    description: 'Постачальник електроенергії для Києва та області',
    reminderDay: 25,
  },
  {
    id: generateProviderId(), // 2
    name: 'Київгаз',
    serviceType: 'gas',
    serviceLabel: 'Газ',
    unitLabel: 'грн/м³',
    tariffs: [
      { id: 'kyivgas-standard', name: 'Побутовий', price: 7.96 },
      { id: 'kyivgas-heating', name: 'Опалення', price: 6.5 },
    ],
    billingCycle: 'monthly',
    supportPhone: '+380 44 454 00 00',
    supportEmail: 'info@kyivgaz.ua',
    website: 'https://www.kyivgaz.ua',
    description: 'Постачання природного газу для споживачів Києва',
    reminderDay: 20,
  },
  {
    id: generateProviderId(), // 3
    name: 'Київводоканал',
    serviceType: 'coldWater',
    serviceLabel: 'Холодна вода',
    unitLabel: 'грн/м³',
    tariffs: [
      { id: 'vodokanal-water', name: 'Водопостачання', price: 25.98 },
      { id: 'vodokanal-drain', name: 'Водовідведення', price: 19.72 },
    ],
    billingCycle: 'monthly',
    supportPhone: '+380 44 278 43 33',
    supportEmail: 'info@vodokanal.kiev.ua',
    website: 'https://vodokanal.kiev.ua',
    description: 'Водопостачання та водовідведення для м. Києва',
    reminderDay: 15,
  },
  {
    id: generateProviderId(), // 4
    name: 'Київтеплоенерго',
    serviceType: 'heat',
    serviceLabel: 'Опалення',
    unitLabel: 'грн/Гкал',
    tariffs: [
      { id: 'kte-heat', name: 'Опалення', price: 1800.0 },
      { id: 'kte-hot-water', name: 'Гаряча вода', price: 120.45 },
    ],
    billingCycle: 'monthly',
    supportPhone: '+380 44 454 03 03',
    supportEmail: 'callcenter@kyivenergo.ua',
    website: 'https://www.kyivenergo.ua',
    description: 'Централізоване теплопостачання для м. Києва',
  },
]

// =============================================================================
// ADDRESSES (13 адрес)
// =============================================================================

export const MOCK_ADDRESSES: Address[] = [
  {
    id: generateAddressId(), // 1
    street: 'вул. Хрещатик',
    building: '22',
    apartment: '15',
    city: 'Київ',
    district: 'Шевченківський',
    isPrimary: true,
    createdAt: '2023-01-15T10:00:00Z',
  },
  {
    id: generateAddressId(), // 2
    street: 'вул. Дарницька',
    building: '5',
    apartment: '42',
    city: 'Київ',
    district: 'Дарницький',
    isPrimary: false,
    createdAt: '2023-02-20T14:30:00Z',
  },
  {
    id: generateAddressId(), // 3
    street: 'вул. Незалежності',
    building: '10',
    apartment: '7',
    city: 'Львів',
    district: 'Шевченківський',
    isPrimary: false,
    createdAt: '2023-03-15T09:15:00Z',
  },
  {
    id: generateAddressId(), // 4
    street: 'вул. Прорізна',
    building: '18',
    apartment: '101',
    city: 'Київ',
    district: 'Печерський',
    isPrimary: false,
    createdAt: '2023-04-10T11:45:00Z',
  },
  {
    id: generateAddressId(), // 5
    street: 'вул. Сумська',
    building: '64',
    apartment: '23',
    city: 'Харків',
    district: 'Дзержинський',
    isPrimary: false,
    createdAt: '2023-05-05T16:20:00Z',
  },
  {
    id: generateAddressId(), // 6
    street: 'вул. Дерибасівська',
    building: '12',
    apartment: '5',
    city: 'Одеса',
    district: 'Приморський',
    isPrimary: false,
    createdAt: '2023-06-01T08:30:00Z',
  },
  {
    id: generateAddressId(), // 7
    street: 'вул. Шевченка',
    building: '45',
    apartment: '88',
    city: 'Дніпро',
    district: 'Центральний',
    isPrimary: false,
    createdAt: '2023-07-12T13:00:00Z',
  },
  {
    id: generateAddressId(), // 8
    street: 'вул. Січових Стрільців',
    building: '33',
    apartment: '12',
    city: 'Львів',
    district: 'Галицький',
    isPrimary: false,
    createdAt: '2023-08-20T10:15:00Z',
  },
  {
    id: generateAddressId(), // 9
    street: 'просп. Бандери',
    building: '28',
    apartment: '56',
    city: 'Київ',
    district: 'Оболонський',
    isPrimary: false,
    createdAt: '2023-09-05T15:45:00Z',
  },
  {
    id: generateAddressId(), // 10
    street: 'вул. Соборна',
    building: '7',
    apartment: '34',
    city: 'Вінниця',
    district: 'Ленінський',
    isPrimary: false,
    createdAt: '2023-10-10T12:20:00Z',
  },
  {
    id: generateAddressId(), // 11
    street: 'вул. Героїв Крут',
    building: '51',
    apartment: '19',
    city: 'Полтава',
    district: 'Київський',
    isPrimary: false,
    createdAt: '2023-11-15T09:30:00Z',
  },
  {
    id: generateAddressId(), // 12
    street: 'вул. Мазепи',
    building: '15',
    apartment: '3',
    city: 'Чернігів',
    district: 'Деснянський',
    isPrimary: false,
    createdAt: '2023-12-01T14:00:00Z',
  },
  {
    id: generateAddressId(), // 13
    street: 'вул. Науки',
    building: '45',
    apartment: '88',
    city: 'Харків',
    district: 'Київський',
    isPrimary: false,
    createdAt: '2024-01-10T11:00:00Z',
  },
]

// =============================================================================
// METERS (3-5 лічильників на адресу)
// =============================================================================

export const MOCK_METERS: Meter[] = [
  // === Адреса 1: Київ, Хрещатик, 22 (4 лічильники) ===
  {
    id: generateMeterId(), // 100
    addressId: 1,
    providerId: 1,
    type: 'electricity',
    name: 'Основний тариф',
    meterNumber: 'EL-238923',
    location: 'Щитова, коридор',
    installedAt: '2021-04-15',
    status: 'active',
    nextCheckDate: '2026-04-15',
  },
  {
    id: generateMeterId(), // 101
    addressId: 1,
    providerId: 2,
    type: 'gas',
    name: 'Плита на кухні',
    meterNumber: 'GS-88342',
    location: 'Кухня',
    installedAt: '2019-11-05',
    status: 'active',
    nextCheckDate: '2025-11-05',
  },
  {
    id: generateMeterId(), // 102
    addressId: 1,
    providerId: 3,
    type: 'coldWater',
    name: 'Ванна кімната',
    meterNumber: 'CW-55231',
    location: 'Санвузол',
    installedAt: '2020-05-10',
    status: 'active',
    nextCheckDate: '2025-08-19',
  },
  {
    id: generateMeterId(), // 103
    addressId: 1,
    providerId: 3,
    type: 'hotWater',
    name: 'Кухня',
    meterNumber: 'HW-99331',
    location: 'Кухня',
    installedAt: '2020-05-10',
    status: 'active',
    nextCheckDate: '2025-08-19',
  },

  // === Адреса 2: Львів, Галицька, 12 (5 лічильників) ===
  {
    id: generateMeterId(), // 104
    addressId: 2,
    providerId: 1,
    type: 'electricity',
    name: 'Загальний лічильник',
    meterNumber: 'EL-99123',
    location: 'Коридор',
    installedAt: '2023-02-01',
    status: 'active',
    nextCheckDate: '2028-02-01',
  },
  {
    id: generateMeterId(), // 105
    addressId: 2,
    providerId: 2,
    type: 'gas',
    name: 'Котел опалення',
    meterNumber: 'GS-44521',
    location: 'Котельня',
    installedAt: '2022-10-12',
    status: 'active',
    nextCheckDate: '2027-10-12',
  },
  {
    id: generateMeterId(), // 106
    addressId: 2,
    providerId: 3,
    type: 'coldWater',
    name: 'Основний',
    meterNumber: 'CW-77234',
    location: 'Ванна',
    installedAt: '2023-01-15',
    status: 'active',
    nextCheckDate: '2028-01-15',
  },
  {
    id: generateMeterId(), // 107
    addressId: 2,
    providerId: 3,
    type: 'hotWater',
    name: 'Основний',
    meterNumber: 'HW-77235',
    location: 'Ванна',
    installedAt: '2023-01-15',
    status: 'active',
    nextCheckDate: '2028-01-15',
  },
  {
    id: generateMeterId(), // 108
    addressId: 2,
    providerId: 4,
    type: 'heat',
    name: 'Будинковий теплолічильник',
    meterNumber: 'HT-0023',
    location: 'Підвал',
    installedAt: '2018-10-02',
    status: 'active',
    nextCheckDate: '2026-10-02',
  },

  // === Адреса 3: Харків, Науки, 45 (3 лічильники) ===
  {
    id: generateMeterId(), // 109
    addressId: 3,
    providerId: 1,
    type: 'electricity',
    name: 'Основний',
    meterNumber: 'EL-55210',
    location: 'Коридор',
    installedAt: '2024-03-18',
    status: 'active',
    nextCheckDate: '2029-03-18',
  },
  {
    id: generateMeterId(), // 110
    addressId: 3,
    providerId: 2,
    type: 'gas',
    name: 'Плита',
    meterNumber: 'GS-12345',
    location: 'Кухня',
    installedAt: '2021-08-09',
    status: 'active',
    nextCheckDate: '2026-08-09',
  },
  {
    id: generateMeterId(), // 111
    addressId: 3,
    providerId: 3,
    type: 'coldWater',
    name: 'Загальний',
    meterNumber: 'CW-88776',
    location: 'Санвузол',
    installedAt: '2022-06-22',
    status: 'active',
    nextCheckDate: '2027-06-22',
  },

  // === Адреса 4: Одеса, Дерибасівська, 8 (4 лічильники) ===
  {
    id: generateMeterId(), // 112
    addressId: 4,
    providerId: 1,
    type: 'electricity',
    name: 'Квартирний',
    meterNumber: 'EL-67890',
    location: 'Прихожа',
    installedAt: '2023-07-15',
    status: 'active',
    nextCheckDate: '2028-07-15',
  },
  {
    id: generateMeterId(), // 113
    addressId: 4,
    providerId: 2,
    type: 'gas',
    name: 'Плита + колонка',
    meterNumber: 'GS-33221',
    location: 'Кухня',
    installedAt: '2023-08-01',
    status: 'active',
    nextCheckDate: '2028-08-01',
  },
  {
    id: generateMeterId(), // 114
    addressId: 4,
    providerId: 3,
    type: 'coldWater',
    name: 'Основний',
    meterNumber: 'CW-11223',
    location: 'Ванна',
    installedAt: '2023-07-20',
    status: 'active',
    nextCheckDate: '2028-07-20',
  },
  {
    id: generateMeterId(), // 115
    addressId: 4,
    providerId: 3,
    type: 'hotWater',
    name: 'Від газової колонки',
    meterNumber: 'HW-11224',
    location: 'Ванна',
    installedAt: '2023-07-20',
    status: 'active',
    nextCheckDate: '2028-07-20',
  },

  // === Адреса 5: Харків, Сумська, 64 (4 лічильники) ===
  {
    id: generateMeterId(), // 116
    addressId: 5,
    providerId: 1,
    type: 'electricity',
    name: 'Основний',
    meterNumber: 'EL-44556',
    location: 'Прихожа',
    installedAt: '2023-05-15',
    status: 'active',
    nextCheckDate: '2028-05-15',
  },
  {
    id: generateMeterId(), // 117
    addressId: 5,
    providerId: 2,
    type: 'gas',
    name: 'Плита',
    meterNumber: 'GS-88991',
    location: 'Кухня',
    installedAt: '2023-06-01',
    status: 'active',
    nextCheckDate: '2028-06-01',
  },
  {
    id: generateMeterId(), // 118
    addressId: 5,
    providerId: 3,
    type: 'coldWater',
    name: 'Загальний',
    meterNumber: 'CW-99887',
    location: 'Ванна',
    installedAt: '2023-06-10',
    status: 'active',
    nextCheckDate: '2028-06-10',
  },
  {
    id: generateMeterId(), // 119
    addressId: 5,
    providerId: 3,
    type: 'hotWater',
    name: 'Загальний',
    meterNumber: 'HW-99888',
    location: 'Ванна',
    installedAt: '2023-06-10',
    status: 'active',
    nextCheckDate: '2028-06-10',
  },

  // === Адреса 6: Одеса, Дерибасівська, 12 (2 лічильники) ===
  {
    id: generateMeterId(), // 120
    addressId: 6,
    providerId: 1,
    type: 'electricity',
    name: 'Основний',
    meterNumber: 'EL-66001',
    location: 'Коридор',
    installedAt: '2023-06-15',
    status: 'active',
    nextCheckDate: '2028-06-15',
  },
  {
    id: generateMeterId(), // 121
    addressId: 6,
    providerId: 3,
    type: 'coldWater',
    name: 'Загальний',
    meterNumber: 'CW-66002',
    location: 'Санвузол',
    installedAt: '2023-06-20',
    status: 'active',
    nextCheckDate: '2028-06-20',
  },

  // === Адреса 7: Дніпро, Шевченка, 45 (3 лічильники) ===
  {
    id: generateMeterId(), // 122
    addressId: 7,
    providerId: 1,
    type: 'electricity',
    name: 'Квартирний',
    meterNumber: 'EL-77001',
    location: 'Електрощитова',
    installedAt: '2023-07-20',
    status: 'active',
    nextCheckDate: '2028-07-20',
  },
  {
    id: generateMeterId(), // 123
    addressId: 7,
    providerId: 2,
    type: 'gas',
    name: 'Плита + котел',
    meterNumber: 'GS-77002',
    location: 'Кухня',
    installedAt: '2023-07-25',
    status: 'active',
    nextCheckDate: '2028-07-25',
  },
  {
    id: generateMeterId(), // 124
    addressId: 7,
    providerId: 3,
    type: 'hotWater',
    name: 'Від газової колонки',
    meterNumber: 'HW-77003',
    location: 'Ванна',
    installedAt: '2023-08-01',
    status: 'active',
    nextCheckDate: '2028-08-01',
  },

  // === Адреса 8: Львів, Січових Стрільців, 33 (5 лічильників) ===
  {
    id: generateMeterId(), // 125
    addressId: 8,
    providerId: 1,
    type: 'electricity',
    name: 'Загальний',
    meterNumber: 'EL-88001',
    location: 'Коридор',
    installedAt: '2023-08-25',
    status: 'active',
    nextCheckDate: '2028-08-25',
  },
  {
    id: generateMeterId(), // 126
    addressId: 8,
    providerId: 2,
    type: 'gas',
    name: 'Плита',
    meterNumber: 'GS-88002',
    location: 'Кухня',
    installedAt: '2023-08-30',
    status: 'active',
    nextCheckDate: '2028-08-30',
  },
  {
    id: generateMeterId(), // 127
    addressId: 8,
    providerId: 3,
    type: 'coldWater',
    name: 'Основний',
    meterNumber: 'CW-88003',
    location: 'Санвузол',
    installedAt: '2023-09-01',
    status: 'active',
    nextCheckDate: '2028-09-01',
  },
  {
    id: generateMeterId(), // 128
    addressId: 8,
    providerId: 3,
    type: 'hotWater',
    name: 'Основний',
    meterNumber: 'HW-88004',
    location: 'Санвузол',
    installedAt: '2023-09-01',
    status: 'active',
    nextCheckDate: '2028-09-01',
  },
  {
    id: generateMeterId(), // 129
    addressId: 8,
    providerId: 4,
    type: 'heat',
    name: 'Квартирний',
    meterNumber: 'HT-88005',
    location: 'Коридор',
    installedAt: '2023-09-05',
    status: 'active',
    nextCheckDate: '2028-09-05',
  },

  // === Адреса 9: Київ, просп. Бандери, 28 (2 лічильники) ===
  {
    id: generateMeterId(), // 130
    addressId: 9,
    providerId: 1,
    type: 'electricity',
    name: 'Основний',
    meterNumber: 'EL-99001',
    location: 'Прихожа',
    installedAt: '2023-09-10',
    status: 'active',
    nextCheckDate: '2028-09-10',
  },
  {
    id: generateMeterId(), // 131
    addressId: 9,
    providerId: 2,
    type: 'gas',
    name: 'Плита',
    meterNumber: 'GS-99002',
    location: 'Кухня',
    installedAt: '2023-09-15',
    status: 'active',
    nextCheckDate: '2028-09-15',
  },

  // === Адреса 10: Вінниця, Соборна, 7 (3 лічильники) ===
  {
    id: generateMeterId(), // 132
    addressId: 10,
    providerId: 1,
    type: 'electricity',
    name: 'Квартирний',
    meterNumber: 'EL-10001',
    location: 'Коридор',
    installedAt: '2023-10-15',
    status: 'active',
    nextCheckDate: '2028-10-15',
  },
  {
    id: generateMeterId(), // 133
    addressId: 10,
    providerId: 3,
    type: 'coldWater',
    name: 'Загальний',
    meterNumber: 'CW-10002',
    location: 'Ванна',
    installedAt: '2023-10-20',
    status: 'active',
    nextCheckDate: '2028-10-20',
  },
  {
    id: generateMeterId(), // 134
    addressId: 10,
    providerId: 3,
    type: 'hotWater',
    name: 'Загальний',
    meterNumber: 'HW-10003',
    location: 'Ванна',
    installedAt: '2023-10-20',
    status: 'active',
    nextCheckDate: '2028-10-20',
  },

  // === Адреса 11: Полтава, Героїв Крут, 51 (4 лічильники) ===
  {
    id: generateMeterId(), // 135
    addressId: 11,
    providerId: 1,
    type: 'electricity',
    name: 'Основний',
    meterNumber: 'EL-11001',
    location: 'Електрощитова',
    installedAt: '2023-11-20',
    status: 'active',
    nextCheckDate: '2028-11-20',
  },
  {
    id: generateMeterId(), // 136
    addressId: 11,
    providerId: 2,
    type: 'gas',
    name: 'Плита',
    meterNumber: 'GS-11002',
    location: 'Кухня',
    installedAt: '2023-11-25',
    status: 'active',
    nextCheckDate: '2028-11-25',
  },
  {
    id: generateMeterId(), // 137
    addressId: 11,
    providerId: 3,
    type: 'coldWater',
    name: 'Основний',
    meterNumber: 'CW-11003',
    location: 'Санвузол',
    installedAt: '2023-12-01',
    status: 'active',
    nextCheckDate: '2028-12-01',
  },
  {
    id: generateMeterId(), // 138
    addressId: 11,
    providerId: 3,
    type: 'hotWater',
    name: 'Основний',
    meterNumber: 'HW-11004',
    location: 'Санвузол',
    installedAt: '2023-12-01',
    status: 'active',
    nextCheckDate: '2028-12-01',
  },

  // === Адреса 12: Чернігів, Мазепи, 15 (2 лічильники) ===
  {
    id: generateMeterId(), // 139
    addressId: 12,
    providerId: 1,
    type: 'electricity',
    name: 'Основний',
    meterNumber: 'EL-12001',
    location: 'Коридор',
    installedAt: '2023-12-05',
    status: 'active',
    nextCheckDate: '2028-12-05',
  },
  {
    id: generateMeterId(), // 140
    addressId: 12,
    providerId: 3,
    type: 'coldWater',
    name: 'Загальний',
    meterNumber: 'CW-12002',
    location: 'Ванна',
    installedAt: '2023-12-10',
    status: 'active',
    nextCheckDate: '2028-12-10',
  },

  // === Адреса 13: Харків, Науки, 45 (переміщено з адреси 3) - вже є meters 109-111 ===
  // Ці лічильники вже створені вище як 109, 110, 111
]

// =============================================================================
// READINGS (мінімальна історія - 6 місяців замість 12)
// =============================================================================

/**
 * Helper функція для створення показників за період
 */
function createReadingsForMeter(
  meterId: number,
  startValue: number,
  monthlyIncrements: number[],
): Reading[] {
  const readings: Reading[] = []
  let currentValue = startValue
  const now = new Date()

  // Створюємо показники за останні N місяців (кількість = довжина monthlyIncrements)
  for (let i = monthlyIncrements.length - 1; i >= 0; i--) {
    const monthsAgo = i
    const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 25)
    const increment = monthlyIncrements[monthlyIncrements.length - 1 - i]

    currentValue += increment

    readings.push({
      id: generateReadingId(),
      meterId,
      date: date.toISOString().split('T')[0],
      value: currentValue,
      consumption: increment,
      submittedAt: new Date(date.getTime() + 3600000).toISOString(), // +1 година
      status: i === 0 ? 'processing' : 'accepted',
      note: i === 0 ? 'Очікує підтвердження' : undefined,
    })
  }

  return readings
}

export const MOCK_READINGS: Reading[] = [
  // Meter 100: Адреса 1 - Електроенергія (6 місяців)
  ...createReadingsForMeter(100, 4200, [151, 144, 147, 152, 149, 154]),

  // Meter 101: Адреса 1 - Газ (6 місяців)
  ...createReadingsForMeter(101, 560, [6, 5, 7, 9, 11, 8]),

  // Meter 102: Адреса 1 - Холодна вода (6 місяців)
  ...createReadingsForMeter(102, 103, [2, 3, 2, 3, 2, 3]),

  // Meter 103: Адреса 1 - Гаряча вода (6 місяців)
  ...createReadingsForMeter(103, 67, [5, 6, 5, 6, 5, 5]),

  // Meter 104: Адреса 2 - Електроенергія (6 місяців)
  ...createReadingsForMeter(104, 2300, [107, 114, 109, 112, 108, 115]),

  // Meter 105: Адреса 2 - Газ (6 місяців)
  ...createReadingsForMeter(105, 180, [24, 20, 18, 16, 22, 19]),

  // Meter 106: Адреса 2 - Холодна вода (6 місяців)
  ...createReadingsForMeter(106, 45, [3, 4, 3, 4, 3, 4]),

  // Meter 107: Адреса 2 - Гаряча вода (6 місяців)
  ...createReadingsForMeter(107, 58, [1, 2, 1, 2, 1, 2]),

  // Meter 108: Адреса 2 - Опалення (6 місяців)
  ...createReadingsForMeter(108, 28, [3.0, 4.1, 4.5, 3.8, 3.2, 2.8]),

  // Meter 109: Адреса 3 - Електроенергія (6 місяців)
  ...createReadingsForMeter(109, 680, [63, 65, 70, 58, 62, 67]),

  // Meter 110: Адреса 3 - Газ (6 місяців)
  ...createReadingsForMeter(110, 175, [5, 7, 8, 6, 9, 7]),

  // Meter 111: Адреса 3 - Холодна вода (6 місяців)
  ...createReadingsForMeter(111, 88, [4, 5, 4, 5, 4, 4]),

  // Meter 112: Адреса 4 - Електроенергія (6 місяців)
  ...createReadingsForMeter(112, 420, [88, 92, 85, 90, 95, 87]),

  // Meter 113: Адреса 4 - Газ (6 місяців)
  ...createReadingsForMeter(113, 65, [6, 8, 7, 9, 8, 7]),

  // Meter 114: Адреса 4 - Холодна вода (6 місяців)
  ...createReadingsForMeter(114, 32, [3, 3, 4, 3, 4, 3]),

  // Meter 115: Адреса 4 - Гаряча вода (6 місяців)
  ...createReadingsForMeter(115, 18, [2, 2, 3, 2, 3, 2]),

  // Meter 116: Адреса 5 - Електроенергія (6 місяців)
  ...createReadingsForMeter(116, 2850, [102, 98, 105, 100, 97, 103]),

  // Meter 117: Адреса 5 - Газ (6 місяців)
  ...createReadingsForMeter(117, 340, [8, 7, 9, 8, 10, 7]),

  // Meter 118: Адреса 5 - Холодна вода (6 місяців)
  ...createReadingsForMeter(118, 112, [3, 4, 3, 4, 3, 3]),

  // Meter 119: Адреса 5 - Гаряча вода (6 місяців)
  ...createReadingsForMeter(119, 45, [2, 3, 2, 3, 2, 2]),

  // Meter 120: Адреса 6 - Електроенергія (6 місяців)
  ...createReadingsForMeter(120, 1240, [85, 88, 82, 90, 87, 85]),

  // Meter 121: Адреса 6 - Холодна вода (6 місяців)
  ...createReadingsForMeter(121, 67, [2, 3, 2, 3, 2, 3]),

  // Meter 122: Адреса 7 - Електроенергія (6 місяців)
  ...createReadingsForMeter(122, 1560, [95, 92, 98, 94, 96, 93]),

  // Meter 123: Адреса 7 - Газ (6 місяців)
  ...createReadingsForMeter(123, 285, [7, 8, 6, 9, 7, 8]),

  // Meter 124: Адреса 7 - Гаряча вода (6 місяців)
  ...createReadingsForMeter(124, 52, [3, 4, 3, 4, 3, 3]),

  // Meter 125: Адреса 8 - Електроенергія (6 місяців)
  ...createReadingsForMeter(125, 1890, [110, 115, 108, 112, 114, 111]),

  // Meter 126: Адреса 8 - Газ (6 місяців)
  ...createReadingsForMeter(126, 420, [12, 10, 14, 11, 13, 12]),

  // Meter 127: Адреса 8 - Холодна вода (6 місяців)
  ...createReadingsForMeter(127, 98, [4, 5, 4, 5, 4, 4]),

  // Meter 128: Адреса 8 - Гаряча вода (6 місяців)
  ...createReadingsForMeter(128, 73, [2, 3, 2, 3, 2, 3]),

  // Meter 129: Адреса 8 - Опалення (6 місяців)
  ...createReadingsForMeter(129, 15, [2.8, 3.5, 3.2, 2.9, 3.1, 2.7]),

  // Meter 130: Адреса 9 - Електроенергія (6 місяців)
  ...createReadingsForMeter(130, 950, [68, 72, 65, 70, 69, 71]),

  // Meter 131: Адреса 9 - Газ (6 місяців)
  ...createReadingsForMeter(131, 190, [5, 6, 7, 5, 6, 6]),

  // Meter 132: Адреса 10 - Електроенергія (6 місяців)
  ...createReadingsForMeter(132, 1340, [88, 92, 85, 90, 89, 91]),

  // Meter 133: Адреса 10 - Холодна вода (6 місяців)
  ...createReadingsForMeter(133, 78, [3, 4, 3, 4, 3, 4]),

  // Meter 134: Адреса 10 - Гаряча вода (6 місяців)
  ...createReadingsForMeter(134, 56, [2, 3, 2, 3, 2, 2]),

  // Meter 135: Адреса 11 - Електроенергія (6 місяців)
  ...createReadingsForMeter(135, 1680, [98, 102, 95, 100, 99, 101]),

  // Meter 136: Адреса 11 - Газ (6 місяців)
  ...createReadingsForMeter(136, 310, [8, 9, 7, 10, 8, 9]),

  // Meter 137: Адреса 11 - Холодна вода (6 місяців)
  ...createReadingsForMeter(137, 92, [4, 5, 4, 5, 4, 4]),

  // Meter 138: Адреса 11 - Гаряча вода (6 місяців)
  ...createReadingsForMeter(138, 64, [3, 4, 3, 4, 3, 3]),

  // Meter 139: Адреса 12 - Електроенергія (6 місяців)
  ...createReadingsForMeter(139, 780, [55, 58, 52, 60, 57, 56]),

  // Meter 140: Адреса 12 - Холодна вода (6 місяців)
  ...createReadingsForMeter(140, 43, [2, 3, 2, 3, 2, 2]),
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Отримати всі лічильники для конкретної адреси
 */
export function getMetersByAddressId(addressId: number): Meter[] {
  return MOCK_METERS.filter((meter) => meter.addressId === addressId)
}

/**
 * Отримати всі показники для конкретного лічильника
 */
export function getReadingsByMeterId(meterId: number): Reading[] {
  return MOCK_READINGS.filter((reading) => reading.meterId === meterId).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

/**
 * Отримати останній показник для лічильника
 */
export function getLatestReadingByMeterId(meterId: number): Reading | undefined {
  const readings = getReadingsByMeterId(meterId)
  return readings[0] // Вже відсортовано по даті (найновіший перший)
}

/**
 * Отримати провайдера за ID
 */
export function getProviderById(providerId: number): Provider | undefined {
  return MOCK_PROVIDERS.find((provider) => provider.id === providerId)
}

/**
 * Отримати адресу за ID
 */
export function getAddressById(addressId: number): Address | undefined {
  return MOCK_ADDRESSES.find((address) => address.id === addressId)
}

/**
 * Отримати лічильник за ID
 */
export function getMeterById(meterId: number): Meter | undefined {
  return MOCK_METERS.find((meter) => meter.id === meterId)
}

/**
 * Отримати всі показники для адреси (через всі лічильники цієї адреси)
 */
export function getReadingsByAddressId(addressId: number): Reading[] {
  const meters = getMetersByAddressId(addressId)
  const meterIds = meters.map((m) => m.id)

  return MOCK_READINGS.filter((reading) => meterIds.includes(reading.meterId)).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

/**
 * Отримати статистику для адреси
 */
export function getAddressStats(addressId: number): {
  totalMeters: number
  activeMeters: number
  pendingReadings: number
} {
  const meters = getMetersByAddressId(addressId)
  const activeMeters = meters.filter((m) => m.status === 'active').length

  const readings = getReadingsByAddressId(addressId)
  const pendingReadings = readings.filter((r) => r.status === 'processing').length

  return {
    totalMeters: meters.length,
    activeMeters,
    pendingReadings,
  }
}
