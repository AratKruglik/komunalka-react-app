import type { User, AuthState } from '@shared/types/auth'
import type { Address, Meter, Reading, Region, AddressType } from '@shared/types/entities'

let idCounter = 1

function nextId(): number {
  return idCounter++
}

export function resetIdCounter(): void {
  idCounter = 1
}

export function createMockRegion(overrides: Partial<Region> = {}): Region {
  const id = overrides.id ?? 9
  return {
    id,
    name: 'Київська область',
    ...overrides,
  }
}

export function createMockAddressType(overrides: Partial<AddressType> = {}): AddressType {
  const id = overrides.id ?? 1
  return {
    id,
    name: 'Квартира',
    description: 'Багатоквартирний будинок у місті',
    icon: 'apartment',
    ...overrides,
  }
}

export function createMockUser(overrides: Partial<User> = {}): User {
  const id = overrides.id ?? nextId()
  return {
    id,
    username: `testuser${id}`,
    email: `test${id}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '+380501234567',
    role: 'user',
    authProvider: null,
    emailVerified: false,
    lastLoginAt: null,
    avatarOptimizedUrl: null,
    avatarThumbnailUrl: null,
    addresses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockAddress(overrides: Partial<Address> = {}): Address {
  const id = overrides.id ?? nextId()
  return {
    id,
    city: 'Київ',
    street: 'вул. Тестова',
    buildingNumber: '1',
    apartmentNumber: '10',
    zipCode: '01001',
    notes: null,
    isPrimary: id === 1,
    region: createMockRegion(overrides.region),
    addressType: createMockAddressType(overrides.addressType),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockMeter(overrides: Partial<Meter> = {}): Meter {
  const id = overrides.id ?? nextId()
  const now = new Date().toISOString()
  return {
    id,
    addressId: 1,
    serialNumber: `M-${String(id).padStart(6, '0')}`,
    name: 'Electricity Meter',
    description: null,
    modelName: null,
    location: 'Entrance hall',
    installationDate: now,
    initialReading: null,
    notes: null,
    isActive: true,
    utilityType: { id: 1, slug: 'gas', displayName: 'Газ', unit: 'м³' },
    serviceProvider: { id: 1, name: 'Київгаз' },
    photoUrl: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function createMockReading(overrides: Partial<Reading> = {}): Reading {
  const id = overrides.id ?? nextId()
  const now = new Date().toISOString()
  return {
    id,
    readingValue: 1000 + id * 50,
    readingDate: now.split('T')[0],
    previousReadingValue: null,
    consumption: 50,
    notes: null,
    isEstimated: false,
    meter: { id: 1, serialNumber: 'M-000001' },
    tariff: null,
    photos: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function createMockAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    user: null,
    token: null,
    refreshToken: null,
    expiresAt: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    ...overrides,
  }
}

export function createAuthenticatedState(
  userOverrides: Partial<User> = {},
  stateOverrides: Partial<AuthState> = {}
): AuthState {
  const user = createMockUser(userOverrides)
  const futureDate = new Date()
  futureDate.setHours(futureDate.getHours() + 1)

  return createMockAuthState({
    user,
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: futureDate.toISOString(),
    isAuthenticated: true,
    isLoading: false,
    error: null,
    ...stateOverrides,
  })
}
