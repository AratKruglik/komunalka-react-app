/**
 * Centralized mock database for the entire application.
 *
 * NOTE: This mock data is preserved for testing purposes.
 * Production components use real API calls via hooks (useMeters, useReadings).
 *
 * Language conventions:
 * - All object keys, fields, and enum values - ENGLISH
 * - Ukrainian texts - ONLY in display fields (name, description, location, etc.)
 *
 * Structure:
 * - 13 addresses with realistic Ukrainian data
 * - 4 utility service providers
 * - 41 meters across all addresses (2-5 per address)
 * - Historical readings (6 months per meter)
 *
 * Foreign Key relationships:
 * - Meter.addressId → Address.id
 * - Meter.providerId → Provider.id
 * - Reading.meterId → Meter.id
 *
 * Numeric ID ranges:
 * - Address: 1-13
 * - Provider: 1-4
 * - Meter: 100-140
 * - Reading: auto-generated
 */

import type {
  Address,
  Provider,
  Meter,
  Reading,
  Region,
  AddressType,
} from '../types/entities'
import type { MeterType } from '../constants/meterTypes'
import { METER_TYPE_TO_UTILITY_TYPE_ID } from '../types/entities'
import {
  generateAddressId,
  generateProviderId,
  generateMeterId,
  generateReadingId,
} from '../utils/mockIdGenerator'

const UTILITY_TYPE_NAMES: Record<number, string> = {
  1: 'Електроенергія',
  2: 'Газ',
  3: 'Холодна вода',
  4: 'Гаряча вода',
  5: 'Опалення',
}

const UTILITY_UNITS: Record<number, string> = {
  1: 'кВт·год',
  2: 'м³',
  3: 'м³',
  4: 'м³',
  5: 'Гкал',
}

const PROVIDER_NAMES: Record<number, string> = {
  1: 'ДТЕК Київські енергомережі',
  2: 'Київгаз',
  3: 'Київводоканал',
  4: 'Київтеплоенерго',
}

interface LegacyMeterInput {
  id: number
  addressId: number
  providerId: number
  type: MeterType
  name: string
  meterNumber: string
  location: string
  installedAt: string
  status: 'active' | 'maintenance' | 'inactive'
  nextCheckDate?: string
}

function transformLegacyMeter(legacy: LegacyMeterInput): Meter {
  const utilityTypeId = METER_TYPE_TO_UTILITY_TYPE_ID[legacy.type]
  const now = new Date().toISOString()
  return {
    id: legacy.id,
    addressId: legacy.addressId,
    utilityTypeId,
    serialNumber: legacy.meterNumber,
    name: legacy.name,
    description: null,
    modelName: null,
    location: legacy.location,
    photoPath: null,
    installationDate: legacy.installedAt,
    initialReading: null,
    serviceProviderId: legacy.providerId,
    notes: null,
    isActive: legacy.status === 'active',
    createdAt: now,
    updatedAt: now,
    utilityTypeName: UTILITY_TYPE_NAMES[utilityTypeId],
    serviceProviderName: PROVIDER_NAMES[legacy.providerId] ?? null,
  }
}

interface LegacyReadingInput {
  id: number
  meterId: number
  date: string
  value: number
  consumption?: number
  submittedAt: string
  status: 'accepted' | 'processing' | 'rejected'
  note?: string
}

function transformLegacyReading(
  legacy: LegacyReadingInput,
  meterName: string,
  utilityTypeId: number,
): Reading {
  return {
    id: legacy.id,
    meterId: legacy.meterId,
    readingValue: legacy.value,
    readingDate: legacy.date,
    previousReadingValue: null,
    consumption: legacy.consumption ?? null,
    notes: legacy.note ?? null,
    isEstimated: false,
    createdAt: legacy.submittedAt,
    updatedAt: legacy.submittedAt,
    meterName,
    utilityTypeName: UTILITY_TYPE_NAMES[utilityTypeId],
    unit: UTILITY_UNITS[utilityTypeId],
    photos: [],
  }
}

// =============================================================================
// REGIONS (довідник регіонів)
// =============================================================================

export const MOCK_REGIONS: Region[] = [
  { id: 1, name: 'Вінницька область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 2, name: 'Волинська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 3, name: 'Дніпропетровська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 4, name: 'Донецька область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 5, name: 'Житомирська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 6, name: 'Закарпатська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 7, name: 'Запорізька область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 8, name: 'Івано-Франківська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 9, name: 'Київська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 10, name: 'Кіровоградська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 11, name: 'Луганська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 12, name: 'Львівська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 13, name: 'Миколаївська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 14, name: 'Одеська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 15, name: 'Полтавська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 16, name: 'Рівненська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 17, name: 'Сумська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 18, name: 'Тернопільська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 19, name: 'Харківська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 20, name: 'Херсонська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 21, name: 'Хмельницька область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 22, name: 'Черкаська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 23, name: 'Чернівецька область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 24, name: 'Чернігівська область', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 25, name: 'м. Київ', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 26, name: 'Автономна Республіка Крим', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
]

// =============================================================================
// ADDRESS TYPES (типи адрес)
// =============================================================================

export const MOCK_ADDRESS_TYPES: AddressType[] = [
  { id: 1, name: 'Квартира', description: 'Багатоквартирний будинок у місті', icon: 'apartment', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 2, name: 'Приватний будинок', description: 'Окрема садиба або дача', icon: 'house', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 3, name: 'Офіс', description: 'Комерційне або офісне приміщення', icon: 'office', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
]

const getRegion = (id: number): Region => MOCK_REGIONS.find(r => r.id === id) || MOCK_REGIONS[24]
const getAddressType = (id: number): AddressType => MOCK_ADDRESS_TYPES.find(t => t.id === id) || MOCK_ADDRESS_TYPES[0]

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
    userId: 1,
    regionId: 25,
    city: 'Київ',
    street: 'вул. Хрещатик',
    buildingNumber: '22',
    apartmentNumber: '15',
    zipCode: '01001',
    notes: 'Центр міста',
    isPrimary: true,
    addressTypeId: 1,
    region: getRegion(25),
    addressType: getAddressType(1),
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-01-15T10:00:00Z',
  },
  {
    id: generateAddressId(), // 2
    userId: 1,
    regionId: 25,
    city: 'Київ',
    street: 'вул. Дарницька',
    buildingNumber: '5',
    apartmentNumber: '42',
    zipCode: '02091',
    notes: '',
    isPrimary: false,
    addressTypeId: 1,
    region: getRegion(25),
    addressType: getAddressType(1),
    createdAt: '2023-02-20T14:30:00Z',
    updatedAt: '2023-02-20T14:30:00Z',
  },
  {
    id: generateAddressId(), // 3
    userId: 1,
    regionId: 12,
    city: 'Львів',
    street: 'вул. Незалежності',
    buildingNumber: '10',
    apartmentNumber: '7',
    zipCode: '79000',
    notes: '',
    isPrimary: false,
    addressTypeId: 1,
    region: getRegion(12),
    addressType: getAddressType(1),
    createdAt: '2023-03-15T09:15:00Z',
    updatedAt: '2023-03-15T09:15:00Z',
  },
  {
    id: generateAddressId(), // 4
    userId: 1,
    regionId: 25,
    city: 'Київ',
    street: 'вул. Прорізна',
    buildingNumber: '18',
    apartmentNumber: '101',
    zipCode: '01001',
    notes: '',
    isPrimary: false,
    addressTypeId: 1,
    region: getRegion(25),
    addressType: getAddressType(1),
    createdAt: '2023-04-10T11:45:00Z',
    updatedAt: '2023-04-10T11:45:00Z',
  },
  {
    id: generateAddressId(), // 5
    userId: 1,
    regionId: 19,
    city: 'Харків',
    street: 'вул. Сумська',
    buildingNumber: '64',
    apartmentNumber: '23',
    zipCode: '61000',
    notes: '',
    isPrimary: false,
    addressTypeId: 1,
    region: getRegion(19),
    addressType: getAddressType(1),
    createdAt: '2023-05-05T16:20:00Z',
    updatedAt: '2023-05-05T16:20:00Z',
  },
  {
    id: generateAddressId(), // 6
    userId: 1,
    regionId: 14,
    city: 'Одеса',
    street: 'вул. Дерибасівська',
    buildingNumber: '12',
    apartmentNumber: '5',
    zipCode: '65000',
    notes: '',
    isPrimary: false,
    addressTypeId: 1,
    region: getRegion(14),
    addressType: getAddressType(1),
    createdAt: '2023-06-01T08:30:00Z',
    updatedAt: '2023-06-01T08:30:00Z',
  },
  {
    id: generateAddressId(), // 7
    userId: 1,
    regionId: 3,
    city: 'Дніпро',
    street: 'вул. Шевченка',
    buildingNumber: '45',
    apartmentNumber: '88',
    zipCode: '49000',
    notes: '',
    isPrimary: false,
    addressTypeId: 1,
    region: getRegion(3),
    addressType: getAddressType(1),
    createdAt: '2023-07-12T13:00:00Z',
    updatedAt: '2023-07-12T13:00:00Z',
  },
  {
    id: generateAddressId(), // 8
    userId: 1,
    regionId: 12,
    city: 'Львів',
    street: 'вул. Січових Стрільців',
    buildingNumber: '33',
    apartmentNumber: '12',
    zipCode: '79000',
    notes: '',
    isPrimary: false,
    addressTypeId: 1,
    region: getRegion(12),
    addressType: getAddressType(1),
    createdAt: '2023-08-20T10:15:00Z',
    updatedAt: '2023-08-20T10:15:00Z',
  },
  {
    id: generateAddressId(), // 9
    userId: 1,
    regionId: 25,
    city: 'Київ',
    street: 'просп. Бандери',
    buildingNumber: '28',
    apartmentNumber: '56',
    zipCode: '04073',
    notes: '',
    isPrimary: false,
    addressTypeId: 1,
    region: getRegion(25),
    addressType: getAddressType(1),
    createdAt: '2023-09-05T15:45:00Z',
    updatedAt: '2023-09-05T15:45:00Z',
  },
  {
    id: generateAddressId(), // 10
    userId: 1,
    regionId: 1,
    city: 'Вінниця',
    street: 'вул. Соборна',
    buildingNumber: '7',
    apartmentNumber: '34',
    zipCode: '21000',
    notes: '',
    isPrimary: false,
    addressTypeId: 1,
    region: getRegion(1),
    addressType: getAddressType(1),
    createdAt: '2023-10-10T12:20:00Z',
    updatedAt: '2023-10-10T12:20:00Z',
  },
  {
    id: generateAddressId(), // 11
    userId: 1,
    regionId: 15,
    city: 'Полтава',
    street: 'вул. Героїв Крут',
    buildingNumber: '51',
    apartmentNumber: '19',
    zipCode: '36000',
    notes: '',
    isPrimary: false,
    addressTypeId: 1,
    region: getRegion(15),
    addressType: getAddressType(1),
    createdAt: '2023-11-15T09:30:00Z',
    updatedAt: '2023-11-15T09:30:00Z',
  },
  {
    id: generateAddressId(), // 12
    userId: 1,
    regionId: 24,
    city: 'Чернігів',
    street: 'вул. Мазепи',
    buildingNumber: '15',
    apartmentNumber: '3',
    zipCode: '14000',
    notes: '',
    isPrimary: false,
    addressTypeId: 1,
    region: getRegion(24),
    addressType: getAddressType(1),
    createdAt: '2023-12-01T14:00:00Z',
    updatedAt: '2023-12-01T14:00:00Z',
  },
  {
    id: generateAddressId(), // 13
    userId: 1,
    regionId: 19,
    city: 'Харків',
    street: 'вул. Науки',
    buildingNumber: '45',
    apartmentNumber: '88',
    zipCode: '61000',
    notes: '',
    isPrimary: false,
    addressTypeId: 1,
    region: getRegion(19),
    addressType: getAddressType(1),
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-10T11:00:00Z',
  },
]

// =============================================================================
// METERS (3-5 meters per address)
// =============================================================================

const LEGACY_METERS: LegacyMeterInput[] = [
  // === Address 1: Kyiv, Khreshchatyk, 22 (4 meters) ===
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

  // === Address 2: Kyiv, Darnytska, 5 (5 meters) ===
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

  // === Address 3: Lviv, Nezalezhnosti, 10 (3 meters) ===
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

  // === Address 4: Kyiv, Prorizna, 18 (4 meters) ===
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

  // === Address 5: Kharkiv, Sumska, 64 (4 meters) ===
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

  // === Address 6: Odesa, Derybasivska, 12 (2 meters) ===
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

  // === Address 7: Dnipro, Shevchenka, 45 (3 meters) ===
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

  // === Address 8: Lviv, Sichovykh Striltsiv, 33 (5 meters) ===
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

  // === Address 9: Kyiv, Bandery Ave, 28 (2 meters) ===
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

  // === Address 10: Vinnytsia, Soborna, 7 (3 meters) ===
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

  // === Address 11: Poltava, Heroiv Krut, 51 (4 meters) ===
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

  // === Address 12: Chernihiv, Mazepy, 15 (2 meters) ===
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
]

export const MOCK_METERS: Meter[] = LEGACY_METERS.map(transformLegacyMeter)

// =============================================================================
// READINGS (6 months of history per meter)
// =============================================================================

function createLegacyReadingsForMeter(
  meterId: number,
  startValue: number,
  monthlyIncrements: number[],
): LegacyReadingInput[] {
  const readings: LegacyReadingInput[] = []
  let currentValue = startValue
  const now = new Date()

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
      submittedAt: new Date(date.getTime() + 3600000).toISOString(),
      status: i === 0 ? 'processing' : 'accepted',
      note: i === 0 ? 'Очікує підтвердження' : undefined,
    })
  }

  return readings
}

function getMeterInfo(meterId: number): { name: string; utilityTypeId: number } {
  const meter = MOCK_METERS.find((m) => m.id === meterId)
  return {
    name: meter?.name ?? 'Unknown',
    utilityTypeId: meter?.utilityTypeId ?? 1,
  }
}

const LEGACY_READINGS: LegacyReadingInput[] = [
  // Meter 100: Address 1 - Electricity (6 months)
  ...createLegacyReadingsForMeter(100, 4200, [151, 144, 147, 152, 149, 154]),

  // Meter 101: Address 1 - Gas (6 months)
  ...createLegacyReadingsForMeter(101, 560, [6, 5, 7, 9, 11, 8]),

  // Meter 102: Address 1 - Cold Water (6 months)
  ...createLegacyReadingsForMeter(102, 103, [2, 3, 2, 3, 2, 3]),

  // Meter 103: Address 1 - Hot Water (6 months)
  ...createLegacyReadingsForMeter(103, 67, [5, 6, 5, 6, 5, 5]),

  // Meter 104: Address 2 - Electricity (6 months)
  ...createLegacyReadingsForMeter(104, 2300, [107, 114, 109, 112, 108, 115]),

  // Meter 105: Address 2 - Gas (6 months)
  ...createLegacyReadingsForMeter(105, 180, [24, 20, 18, 16, 22, 19]),

  // Meter 106: Address 2 - Cold Water (6 months)
  ...createLegacyReadingsForMeter(106, 45, [3, 4, 3, 4, 3, 4]),

  // Meter 107: Address 2 - Hot Water (6 months)
  ...createLegacyReadingsForMeter(107, 58, [1, 2, 1, 2, 1, 2]),

  // Meter 108: Address 2 - Heat (6 months)
  ...createLegacyReadingsForMeter(108, 28, [3.0, 4.1, 4.5, 3.8, 3.2, 2.8]),

  // Meter 109: Address 3 - Electricity (6 months)
  ...createLegacyReadingsForMeter(109, 680, [63, 65, 70, 58, 62, 67]),

  // Meter 110: Address 3 - Gas (6 months)
  ...createLegacyReadingsForMeter(110, 175, [5, 7, 8, 6, 9, 7]),

  // Meter 111: Address 3 - Cold Water (6 months)
  ...createLegacyReadingsForMeter(111, 88, [4, 5, 4, 5, 4, 4]),

  // Meter 112: Address 4 - Electricity (6 months)
  ...createLegacyReadingsForMeter(112, 420, [88, 92, 85, 90, 95, 87]),

  // Meter 113: Address 4 - Gas (6 months)
  ...createLegacyReadingsForMeter(113, 65, [6, 8, 7, 9, 8, 7]),

  // Meter 114: Address 4 - Cold Water (6 months)
  ...createLegacyReadingsForMeter(114, 32, [3, 3, 4, 3, 4, 3]),

  // Meter 115: Address 4 - Hot Water (6 months)
  ...createLegacyReadingsForMeter(115, 18, [2, 2, 3, 2, 3, 2]),

  // Meter 116: Address 5 - Electricity (6 months)
  ...createLegacyReadingsForMeter(116, 2850, [102, 98, 105, 100, 97, 103]),

  // Meter 117: Address 5 - Gas (6 months)
  ...createLegacyReadingsForMeter(117, 340, [8, 7, 9, 8, 10, 7]),

  // Meter 118: Address 5 - Cold Water (6 months)
  ...createLegacyReadingsForMeter(118, 112, [3, 4, 3, 4, 3, 3]),

  // Meter 119: Address 5 - Hot Water (6 months)
  ...createLegacyReadingsForMeter(119, 45, [2, 3, 2, 3, 2, 2]),

  // Meter 120: Address 6 - Electricity (6 months)
  ...createLegacyReadingsForMeter(120, 1240, [85, 88, 82, 90, 87, 85]),

  // Meter 121: Address 6 - Cold Water (6 months)
  ...createLegacyReadingsForMeter(121, 67, [2, 3, 2, 3, 2, 3]),

  // Meter 122: Address 7 - Electricity (6 months)
  ...createLegacyReadingsForMeter(122, 1560, [95, 92, 98, 94, 96, 93]),

  // Meter 123: Address 7 - Gas (6 months)
  ...createLegacyReadingsForMeter(123, 285, [7, 8, 6, 9, 7, 8]),

  // Meter 124: Address 7 - Hot Water (6 months)
  ...createLegacyReadingsForMeter(124, 52, [3, 4, 3, 4, 3, 3]),

  // Meter 125: Address 8 - Electricity (6 months)
  ...createLegacyReadingsForMeter(125, 1890, [110, 115, 108, 112, 114, 111]),

  // Meter 126: Address 8 - Gas (6 months)
  ...createLegacyReadingsForMeter(126, 420, [12, 10, 14, 11, 13, 12]),

  // Meter 127: Address 8 - Cold Water (6 months)
  ...createLegacyReadingsForMeter(127, 98, [4, 5, 4, 5, 4, 4]),

  // Meter 128: Address 8 - Hot Water (6 months)
  ...createLegacyReadingsForMeter(128, 73, [2, 3, 2, 3, 2, 3]),

  // Meter 129: Address 8 - Heat (6 months)
  ...createLegacyReadingsForMeter(129, 15, [2.8, 3.5, 3.2, 2.9, 3.1, 2.7]),

  // Meter 130: Address 9 - Electricity (6 months)
  ...createLegacyReadingsForMeter(130, 950, [68, 72, 65, 70, 69, 71]),

  // Meter 131: Address 9 - Gas (6 months)
  ...createLegacyReadingsForMeter(131, 190, [5, 6, 7, 5, 6, 6]),

  // Meter 132: Address 10 - Electricity (6 months)
  ...createLegacyReadingsForMeter(132, 1340, [88, 92, 85, 90, 89, 91]),

  // Meter 133: Address 10 - Cold Water (6 months)
  ...createLegacyReadingsForMeter(133, 78, [3, 4, 3, 4, 3, 4]),

  // Meter 134: Address 10 - Hot Water (6 months)
  ...createLegacyReadingsForMeter(134, 56, [2, 3, 2, 3, 2, 2]),

  // Meter 135: Address 11 - Electricity (6 months)
  ...createLegacyReadingsForMeter(135, 1680, [98, 102, 95, 100, 99, 101]),

  // Meter 136: Address 11 - Gas (6 months)
  ...createLegacyReadingsForMeter(136, 310, [8, 9, 7, 10, 8, 9]),

  // Meter 137: Address 11 - Cold Water (6 months)
  ...createLegacyReadingsForMeter(137, 92, [4, 5, 4, 5, 4, 4]),

  // Meter 138: Address 11 - Hot Water (6 months)
  ...createLegacyReadingsForMeter(138, 64, [3, 4, 3, 4, 3, 3]),

  // Meter 139: Address 12 - Electricity (6 months)
  ...createLegacyReadingsForMeter(139, 780, [55, 58, 52, 60, 57, 56]),

  // Meter 140: Address 12 - Cold Water (6 months)
  ...createLegacyReadingsForMeter(140, 43, [2, 3, 2, 3, 2, 2]),
]

export const MOCK_READINGS: Reading[] = LEGACY_READINGS.map((legacy) => {
  const { name, utilityTypeId } = getMeterInfo(legacy.meterId)
  return transformLegacyReading(legacy, name, utilityTypeId)
})

// =============================================================================
// HELPER FUNCTIONS (for testing purposes)
// =============================================================================

export function getMetersByAddressId(addressId: number): Meter[] {
  return MOCK_METERS.filter((meter) => meter.addressId === addressId)
}

export function getReadingsByMeterId(meterId: number): Reading[] {
  return MOCK_READINGS.filter((reading) => reading.meterId === meterId).sort(
    (a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime(),
  )
}

export function getLatestReadingByMeterId(meterId: number): Reading | undefined {
  const readings = getReadingsByMeterId(meterId)
  return readings[0]
}

/**
 * Get provider by ID
 */
export function getProviderById(providerId: number): Provider | undefined {
  return MOCK_PROVIDERS.find((provider) => provider.id === providerId)
}

/**
 * Get address by ID
 */
export function getAddressById(addressId: number): Address | undefined {
  return MOCK_ADDRESSES.find((address) => address.id === addressId)
}

export function getMeterById(meterId: number): Meter | undefined {
  return MOCK_METERS.find((meter) => meter.id === meterId)
}

export function getReadingsByAddressId(addressId: number): Reading[] {
  const meters = getMetersByAddressId(addressId)
  const meterIds = meters.map((m) => m.id)

  return MOCK_READINGS.filter((reading) => meterIds.includes(reading.meterId)).sort(
    (a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime(),
  )
}

export function getAddressStats(addressId: number): {
  totalMeters: number
  activeMeters: number
  pendingReadings: number
} {
  const meters = getMetersByAddressId(addressId)
  const activeMeters = meters.filter((m) => m.isActive).length

  return {
    totalMeters: meters.length,
    activeMeters,
    pendingReadings: 0,
  }
}

