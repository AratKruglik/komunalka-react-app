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
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
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
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
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
    avatarUrl: undefined,
    avatarThumbnailUrl: undefined,
    ...overrides,
  }
}

export function createMockAddress(overrides: Partial<Address> = {}): Address {
  const id = overrides.id ?? nextId()
  return {
    id,
    userId: 1,
    regionId: 9,
    city: 'Київ',
    street: 'вул. Тестова',
    buildingNumber: '1',
    apartmentNumber: '10',
    zipCode: '01001',
    notes: '',
    isPrimary: id === 1,
    addressTypeId: 1,
    region: createMockRegion(overrides.region),
    addressType: createMockAddressType(overrides.addressType),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockMeter(overrides: Partial<Meter> = {}): Meter {
  const id = overrides.id ?? nextId()
  return {
    id,
    addressId: 1,
    providerId: 1,
    type: 'electricity',
    name: 'Electricity Meter',
    meterNumber: `M-${String(id).padStart(6, '0')}`,
    location: 'Entrance hall',
    installedAt: new Date().toISOString(),
    status: 'active',
    nextCheckDate: undefined,
    ...overrides,
  }
}

export function createMockReading(overrides: Partial<Reading> = {}): Reading {
  const id = overrides.id ?? nextId()
  return {
    id,
    meterId: 1,
    date: new Date().toISOString().split('T')[0],
    value: 1000 + id * 50,
    consumption: 50,
    submittedAt: new Date().toISOString(),
    status: 'accepted',
    note: undefined,
    photoUrl: undefined,
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
