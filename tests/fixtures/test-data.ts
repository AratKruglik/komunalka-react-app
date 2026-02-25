import type {
  MockUser,
  MockAddress,
  MockMeter,
  MockMeterReading,
  MockRegion,
  MockAddressType,
  MockCurrency,
  MockServiceProvider,
} from '../helpers'
import { UTILITY_TYPES, ADDRESS_TYPES } from '../helpers'

export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'Password123',
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
  newUser: {
    username: 'testuser2',
    firstName: 'Олена',
    lastName: 'Петренко',
    phone: '501234567',
    phoneNumber: '+380501234567',
    email: 'test2@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
  },
  existingUser: {
    username: 'existing',
    firstName: 'Existing',
    lastName: 'User',
    phone: '501234568',
    phoneNumber: '+380501234568',
    email: 'existing@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
  },
  profileUser: {
    id: 1,
    username: 'testuser',
    firstName: 'Олена',
    lastName: 'Петренко',
    phoneNumber: '+380501234567',
    email: 'test@example.com',
    avatarOptimizedUrl: null,
    avatarThumbnailUrl: null,
    addresses: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
}

export const testUserProfiles: Record<string, MockUser> = {
  default: {
    id: 1,
    username: 'testuser',
    firstName: 'Олена',
    lastName: 'Петренко',
    phoneNumber: '+380501234567',
    email: 'test@example.com',
    avatarOptimizedUrl: null,
    avatarThumbnailUrl: null,
    addresses: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  withAvatar: {
    id: 1,
    username: 'testuser',
    firstName: 'Олена',
    lastName: 'Петренко',
    phoneNumber: '+380501234567',
    email: 'test@example.com',
    avatarOptimizedUrl: 'https://localhost:7095/api/v1/users/1/avatar',
    avatarThumbnailUrl: 'https://localhost:7095/api/v1/users/1/avatar/thumbnail',
    addresses: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
}

export const testRegions: MockRegion[] = [
  { id: 1, name: 'Вінницька область' },
  { id: 9, name: 'Київська область' },
  { id: 12, name: 'Львівська область' },
  { id: 25, name: 'м. Київ' },
]

export const testAddressTypes: (MockAddressType & { icon?: string })[] = [
  { id: ADDRESS_TYPES.APARTMENT, name: 'Квартира', description: 'Багатоквартирний будинок у місті', icon: 'apartment' },
  { id: ADDRESS_TYPES.PRIVATE_HOUSE, name: 'Приватний будинок', description: 'Окрема садиба або дача', icon: 'house' },
  { id: ADDRESS_TYPES.OFFICE, name: 'Офіс', description: 'Комерційне або офісне приміщення', icon: 'office' },
]

export const testCurrencies: MockCurrency[] = [
  { id: 1, name: 'Українська гривня', code: 'UAH', symbol: '₴' },
  { id: 2, name: 'US Dollar', code: 'USD', symbol: '$' },
  { id: 3, name: 'Euro', code: 'EUR', symbol: '€' },
]

export const testAddresses: Record<string, MockAddress> = {
  primary: {
    id: 1,
    regionId: 9,
    region: { id: 9, name: 'Київська область' },
    city: 'Київ',
    street: 'вул. Хрещатик',
    buildingNumber: '1',
    apartmentNumber: '101',
    zipCode: '01001',
    notes: 'Центр міста',
    isPrimary: true,
    addressTypeId: ADDRESS_TYPES.APARTMENT,
    addressType: { id: ADDRESS_TYPES.APARTMENT, name: 'Квартира', description: 'Багатоквартирний будинок у місті', icon: 'apartment' },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  secondary: {
    id: 2,
    regionId: 9,
    region: { id: 9, name: 'Київська область' },
    city: 'Бровари',
    street: 'вул. Лісова',
    buildingNumber: '15',
    apartmentNumber: '1',
    zipCode: '07400',
    notes: '',
    isPrimary: false,
    addressTypeId: ADDRESS_TYPES.PRIVATE_HOUSE,
    addressType: { id: ADDRESS_TYPES.PRIVATE_HOUSE, name: 'Приватний будинок', description: 'Окрема садиба або дача', icon: 'house' },
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
  },
  office: {
    id: 3,
    regionId: 9,
    region: { id: 9, name: 'Київська область' },
    city: 'Київ',
    street: 'вул. Богдана Хмельницького',
    buildingNumber: '50',
    apartmentNumber: '301',
    zipCode: '01030',
    notes: 'Офіс компанії',
    isPrimary: false,
    addressTypeId: ADDRESS_TYPES.OFFICE,
    addressType: { id: ADDRESS_TYPES.OFFICE, name: 'Офіс', description: 'Комерційне або офісне приміщення', icon: 'office' },
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
}

export const testNewAddressInput = {
  regionId: 9,
  city: 'Київ',
  street: 'вул. Шевченка',
  buildingNumber: '25',
  apartmentNumber: '42',
  zipCode: '01001',
  notes: 'Тестова адреса',
  isPrimary: false,
  addressTypeId: ADDRESS_TYPES.APARTMENT,
}

export const testNewAddressFormData = {
  propertyType: 'apartment' as const,
  region: 'Київська область',
  city: 'Київ',
  street: 'вул. Шевченка',
  building: '25',
  unit: '42',
  postalCode: '01001',
  notes: 'Тестова адреса',
  isPrimary: false,
}

export const testEditedAddressFormData = {
  propertyType: 'apartment' as const,
  region: 'Київська область',
  city: 'Київ',
  street: 'вул. Хрещатик',
  building: '10',
  unit: '55',
  postalCode: '01002',
  notes: 'Оновлена адреса',
  isPrimary: false,
}

type FrontendCompatibleMeter = MockMeter & {
  meterNumber: string;
  type: 'electricity' | 'gas' | 'coldWater' | 'hotWater' | 'heating';
  status: 'active' | 'maintenance' | 'inactive';
  providerId: number;
  serviceProvider?: { id: number; name: string } | null;
  installedAt: string;
  nextCheckDate?: string;
};

export const testMeters: Record<string, FrontendCompatibleMeter> = {
  electricity: {
    id: 1,
    addressId: 1,
    utilityTypeId: UTILITY_TYPES.ELECTRICITY,
    utilityType: { id: UTILITY_TYPES.ELECTRICITY, name: 'Електроенергія', slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' },
    name: 'Лічильник електроенергії',
    serialNumber: 'EL-001-2024',
    meterNumber: 'EL-001-2024',
    modelName: 'НІК 2102',
    location: 'На кухні біля дверей',
    installationDate: '2024-01-15',
    installedAt: '2024-01-15',
    initialReading: 1500.5,
    serviceProviderId: 1,
    serviceProvider: { id: 1, name: 'YASNO' },
    providerId: 1,
    notes: 'Перевірено та опломбовано',
    isActive: true,
    type: 'electricity',
    status: 'active',
    nextCheckDate: '2025-01-15',
    photoUrl: null,
    photoThumbnailUrl: null,
    lastReading: 5097,
    lastReadingDate: '2025-11-25T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-11-25T00:00:00Z',
  },
  gas: {
    id: 2,
    addressId: 1,
    utilityTypeId: UTILITY_TYPES.GAS,
    utilityType: { id: UTILITY_TYPES.GAS, name: 'Газ', slug: 'gas', displayName: 'Газ', unit: 'м³' },
    name: 'Лічильник газу',
    serialNumber: 'GZ-001-2024',
    meterNumber: 'GZ-001-2024',
    modelName: 'Metrix G4',
    location: 'У коридорі на стіні',
    installationDate: '2024-02-20',
    installedAt: '2024-02-20',
    initialReading: 250.0,
    serviceProviderId: 1,
    serviceProvider: { id: 2, name: 'Київгаз' },
    providerId: 2,
    notes: 'Встановлено та опломбовано газовою службою',
    isActive: true,
    type: 'gas',
    status: 'active',
    nextCheckDate: '2024-06-01',
    photoUrl: null,
    photoThumbnailUrl: null,
    lastReading: 606,
    lastReadingDate: '2025-11-25T00:00:00Z',
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2025-11-25T00:00:00Z',
  },
  coldWater: {
    id: 3,
    addressId: 1,
    utilityTypeId: UTILITY_TYPES.COLD_WATER,
    utilityType: { id: UTILITY_TYPES.COLD_WATER, name: 'Холодна вода', slug: 'cold_water', displayName: 'Холодна вода', unit: 'м³' },
    name: 'Холодна вода ванна',
    serialNumber: 'CW-001-2024',
    meterNumber: 'CW-001-2024',
    modelName: 'Baylan KK-12',
    location: 'Ванна кімната',
    installationDate: '2023-03-10',
    installedAt: '2023-03-10',
    initialReading: 0,
    serviceProviderId: 1,
    serviceProvider: { id: 3, name: 'Київводоканал' },
    providerId: 3,
    notes: '',
    isActive: true,
    type: 'coldWater',
    status: 'active',
    nextCheckDate: '2025-03-10',
    photoUrl: null,
    photoThumbnailUrl: null,
    lastReading: 365,
    lastReadingDate: '2025-11-25T00:00:00Z',
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2025-11-25T00:00:00Z',
  },
  hotWater: {
    id: 4,
    addressId: 1,
    utilityTypeId: UTILITY_TYPES.HOT_WATER,
    utilityType: { id: UTILITY_TYPES.HOT_WATER, name: 'Гаряча вода', slug: 'hot_water', displayName: 'Гаряча вода', unit: 'м³' },
    name: 'Гаряча вода ванна',
    serialNumber: 'HW-001-2024',
    meterNumber: 'HW-001-2024',
    modelName: 'Baylan KK-12',
    location: 'Ванна кімната',
    installationDate: '2023-03-10',
    installedAt: '2023-03-10',
    initialReading: 0,
    serviceProviderId: 1,
    serviceProvider: { id: 4, name: 'Київтеплоенерго' },
    providerId: 4,
    notes: '',
    isActive: true,
    type: 'hotWater',
    status: 'active',
    nextCheckDate: '2025-03-10',
    photoUrl: null,
    photoThumbnailUrl: null,
    lastReading: 99,
    lastReadingDate: '2025-11-25T00:00:00Z',
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2025-11-25T00:00:00Z',
  },
  heating: {
    id: 5,
    addressId: 1,
    utilityTypeId: UTILITY_TYPES.HEATING,
    utilityType: { id: UTILITY_TYPES.HEATING, name: 'Опалення', slug: 'heating', displayName: 'Опалення', unit: 'Гкал' },
    name: 'Лічильник опалення',
    serialNumber: 'HT-001-2024',
    meterNumber: 'HT-001-2024',
    modelName: 'Apator Powogaz',
    location: 'Коридор',
    installationDate: '2023-10-01',
    installedAt: '2023-10-01',
    initialReading: 0,
    serviceProviderId: 1,
    serviceProvider: { id: 4, name: 'Київтеплоенерго' },
    providerId: 4,
    notes: 'Сезонний',
    isActive: true,
    type: 'heating',
    status: 'active',
    photoUrl: null,
    photoThumbnailUrl: null,
    lastReading: 15.5,
    lastReadingDate: '2025-11-25T00:00:00Z',
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2025-11-25T00:00:00Z',
  },
  inactiveMeter: {
    id: 6,
    addressId: 1,
    utilityTypeId: UTILITY_TYPES.ELECTRICITY,
    utilityType: { id: UTILITY_TYPES.ELECTRICITY, name: 'Електроенергія', slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' },
    name: 'Старий електролічильник',
    serialNumber: 'EL-OLD-2020',
    meterNumber: 'EL-OLD-2020',
    modelName: 'СО-505',
    location: 'Коридор',
    installationDate: '2015-01-01',
    installedAt: '2015-01-01',
    initialReading: 0,
    serviceProviderId: 1,
    serviceProvider: { id: 1, name: 'YASNO' },
    providerId: 1,
    type: 'electricity',
    status: 'inactive',
    notes: 'Замінено на новий',
    isActive: false,
    photoUrl: null,
    photoThumbnailUrl: null,
    createdAt: '2015-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
}

export const testNewMeterInput = {
  addressId: 1,
  utilityTypeId: UTILITY_TYPES.ELECTRICITY,
  name: 'Новий лічильник',
  serialNumber: 'NEW-001-2025',
  modelName: 'НІК 2102-02',
  location: 'Коридор',
  installationDate: '2025-01-01',
  initialReading: 0,
  serviceProviderId: 1,
  notes: 'Тестовий лічильник',
  isActive: true,
}

export const testReadings: Record<string, MockMeterReading> = {
  electricity: {
    id: 1,
    meterId: 1,
    readingValue: 5097,
    readingDate: '2025-11-25T00:00:00Z',
    consumption: 97,
    baseRate: 4.32,
    serviceFee: 0,
    totalCost: 419.04,
    notes: 'Електроенергія',
    isEstimated: false,
    photoUrl: null,
    photoThumbnailUrl: null,
    createdAt: '2025-11-25T10:30:00Z',
    updatedAt: '2025-11-25T10:30:00Z',
  },
  gas: {
    id: 2,
    meterId: 2,
    readingValue: 606,
    readingDate: '2025-11-25T00:00:00Z',
    consumption: 6,
    baseRate: 7.96,
    serviceFee: 0,
    totalCost: 47.76,
    notes: 'Газ',
    isEstimated: false,
    photoUrl: null,
    photoThumbnailUrl: null,
    createdAt: '2025-11-25T10:35:00Z',
    updatedAt: '2025-11-25T10:35:00Z',
  },
  hotWater: {
    id: 3,
    meterId: 4,
    readingValue: 99,
    readingDate: '2025-11-25T00:00:00Z',
    consumption: 4,
    baseRate: 45.0,
    serviceFee: 0,
    totalCost: 180.0,
    notes: 'Гаряча вода',
    isEstimated: false,
    photoUrl: null,
    photoThumbnailUrl: null,
    createdAt: '2025-11-25T10:40:00Z',
    updatedAt: '2025-11-25T10:40:00Z',
  },
  coldWater: {
    id: 4,
    meterId: 3,
    readingValue: 365,
    readingDate: '2025-11-25T00:00:00Z',
    consumption: 5,
    baseRate: 25.98,
    serviceFee: 19.72,
    totalCost: 228.5,
    notes: 'Холодна вода',
    isEstimated: false,
    photoUrl: null,
    photoThumbnailUrl: null,
    createdAt: '2025-11-25T10:45:00Z',
    updatedAt: '2025-11-25T10:45:00Z',
  },
  estimated: {
    id: 5,
    meterId: 1,
    readingValue: 5200,
    readingDate: '2025-12-25T00:00:00Z',
    consumption: 103,
    baseRate: 4.32,
    serviceFee: 0,
    totalCost: 444.96,
    notes: 'Оціночне значення',
    isEstimated: true,
    photoUrl: null,
    photoThumbnailUrl: null,
    createdAt: '2025-12-25T10:00:00Z',
    updatedAt: '2025-12-25T10:00:00Z',
  },
}

export const testBatchReadingsInput = {
  addressId: 1,
  readings: [
    {
      meterId: 1,
      readingValue: 5200,
      readingDate: '2025-12-25T00:00:00Z',
      notes: 'Електроенергія грудень',
      isEstimated: false,
    },
    {
      meterId: 2,
      readingValue: 615,
      readingDate: '2025-12-25T00:00:00Z',
      notes: 'Газ грудень',
      isEstimated: false,
    },
    {
      meterId: 4,
      readingValue: 105,
      readingDate: '2025-12-25T00:00:00Z',
      notes: 'Гаряча вода грудень',
      isEstimated: false,
    },
  ],
}

export function getActiveMeters(): MockMeter[] {
  return Object.values(testMeters).filter(m => m.isActive)
}

export function getMetersByAddressId(addressId: number): MockMeter[] {
  return Object.values(testMeters).filter(m => m.addressId === addressId && m.isActive)
}

export function getReadingsByMeterId(meterId: number): MockMeterReading[] {
  return Object.values(testReadings).filter(r => r.meterId === meterId)
}

export function getAllAddresses(): MockAddress[] {
  return Object.values(testAddresses)
}

export function getAllReadings(): MockMeterReading[] {
  return Object.values(testReadings)
}

export function formatAddressLabel(address: MockAddress): string {
  const apartment = address.apartmentNumber ? `, кв. ${address.apartmentNumber}` : ''
  return `${address.street}, ${address.buildingNumber}${apartment}`
}

export function getUtilityTypeName(utilityTypeId: number): string {
  const names: Record<number, string> = {
    [UTILITY_TYPES.ELECTRICITY]: 'Електроенергія',
    [UTILITY_TYPES.GAS]: 'Газ',
    [UTILITY_TYPES.COLD_WATER]: 'Холодна вода',
    [UTILITY_TYPES.HOT_WATER]: 'Гаряча вода',
    [UTILITY_TYPES.HEATING]: 'Опалення',
  }
  return names[utilityTypeId] ?? 'Невідомо'
}

export function getAddressTypeName(addressTypeId: number): string {
  const names: Record<number, string> = {
    [ADDRESS_TYPES.APARTMENT]: 'Квартира',
    [ADDRESS_TYPES.PRIVATE_HOUSE]: 'Приватний будинок',
    [ADDRESS_TYPES.OFFICE]: 'Офіс',
  }
  return names[addressTypeId] ?? 'Невідомо'
}

const electricityType = { id: UTILITY_TYPES.ELECTRICITY, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год', description: 'Електроенергія', isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }
const gasType = { id: UTILITY_TYPES.GAS, slug: 'gas', displayName: 'Газ', unit: 'м³', description: 'Газ', isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }
const coldWaterType = { id: UTILITY_TYPES.COLD_WATER, slug: 'cold_water', displayName: 'Холодна вода', unit: 'м³', description: 'Холодна вода', isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }
const hotWaterType = { id: UTILITY_TYPES.HOT_WATER, slug: 'hot_water', displayName: 'Гаряча вода', unit: 'м³', description: 'Гаряча вода', isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }
const uahCurrencyFixture = { id: 1, code: 'UAH', name: 'Українська гривня', symbol: '₴', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }

export const testProviders: MockServiceProvider[] = [
  {
    id: 1,
    addressId: 1,
    name: 'YASNO',
    description: 'Постачальник електроенергії для Києва та області',
    phone: null,
    email: null,
    website: 'https://yasno.com.ua',
    isActive: true,
    utilityType: electricityType,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    tariffs: [
      {
        id: 1,
        name: 'Денний',
        baseRate: 4.32,
        serviceFee: 0,
        effectiveFrom: '2025-01-01T00:00:00Z',
        effectiveTo: null,
        notes: 'Денний',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        utilityType: electricityType,
        currency: uahCurrencyFixture,
      },
      {
        id: 2,
        name: 'Нічний',
        baseRate: 2.64,
        serviceFee: 0,
        effectiveFrom: '2025-01-01T00:00:00Z',
        effectiveTo: null,
        notes: 'Нічний',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        utilityType: electricityType,
        currency: uahCurrencyFixture,
      },
    ],
  },
  {
    id: 2,
    addressId: 1,
    name: 'Київгаз',
    description: 'Постачання природного газу для споживачів Києва',
    phone: null,
    email: null,
    website: 'https://www.kyivgaz.ua',
    isActive: true,
    utilityType: gasType,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    tariffs: [
      {
        id: 3,
        name: 'Побутовий',
        baseRate: 7.96,
        serviceFee: 0,
        effectiveFrom: '2025-01-01T00:00:00Z',
        effectiveTo: null,
        notes: 'Побутовий',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        utilityType: gasType,
        currency: uahCurrencyFixture,
      },
    ],
  },
  {
    id: 3,
    addressId: 1,
    name: 'Київводоканал',
    description: 'Водопостачання та водовідведення для м. Києва',
    phone: null,
    email: null,
    website: 'https://vodokanal.kiev.ua',
    isActive: true,
    utilityType: coldWaterType,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    tariffs: [
      {
        id: 4,
        name: 'Водопостачання',
        baseRate: 25.98,
        serviceFee: 0,
        effectiveFrom: '2025-01-01T00:00:00Z',
        effectiveTo: null,
        notes: 'Водопостачання',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        utilityType: coldWaterType,
        currency: uahCurrencyFixture,
      },
      {
        id: 5,
        name: 'Водовідведення',
        baseRate: 19.72,
        serviceFee: 0,
        effectiveFrom: '2025-01-01T00:00:00Z',
        effectiveTo: null,
        notes: 'Водовідведення',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        utilityType: coldWaterType,
        currency: uahCurrencyFixture,
      },
    ],
  },
  {
    id: 4,
    addressId: 1,
    name: 'Київтеплоенерго',
    description: 'Централізоване теплопостачання для м. Києва',
    phone: null,
    email: null,
    website: 'https://www.kyivenergo.ua',
    isActive: true,
    utilityType: hotWaterType,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    tariffs: [
      {
        id: 6,
        name: 'Гаряча вода',
        baseRate: 45.0,
        serviceFee: 0,
        effectiveFrom: '2025-01-01T00:00:00Z',
        effectiveTo: null,
        notes: 'Гаряча вода',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        utilityType: hotWaterType,
        currency: uahCurrencyFixture,
      },
    ],
  },
]

export const testNewProvider = {
  name: 'Новий провайдер',
  utilityTypeId: UTILITY_TYPES.ELECTRICITY,
  website: 'https://example.com',
  description: 'Тестовий опис провайдера',
  tariffs: [{ name: 'Базовий', price: '5.00' }],
}
