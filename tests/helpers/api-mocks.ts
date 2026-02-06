import { Page, Route } from '@playwright/test'
import { MOCK_JWT_TOKEN } from './constants'

const API_BASE_URL = 'https://localhost:7095/api/v1'

interface MockOptions {
  status?: number;
  delay?: number;
}

interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: PaginationMeta;
}

function createPaginatedResponse<T>(
  data: T[],
  path: string,
  page = 1,
  perPage = 10
): PaginatedResponse<T> {
  const total = data.length
  const lastPage = Math.ceil(total / perPage) || 1
  const from = total > 0 ? (page - 1) * perPage + 1 : 0
  const to = Math.min(page * perPage, total)

  return {
    data,
    links: {
      first: `${API_BASE_URL}${path}?page=1&perPage=${perPage}`,
      last: `${API_BASE_URL}${path}?page=${lastPage}&perPage=${perPage}`,
      prev: page > 1 ? `${API_BASE_URL}${path}?page=${page - 1}&perPage=${perPage}` : null,
      next: page < lastPage ? `${API_BASE_URL}${path}?page=${page + 1}&perPage=${perPage}` : null,
    },
    meta: {
      current_page: page,
      from,
      last_page: lastPage,
      path: `${API_BASE_URL}${path}`,
      per_page: perPage,
      to,
      total,
    },
  }
}

export async function mockLoginSuccess(page: Page, token = MOCK_JWT_TOKEN): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await page.route(`${API_BASE_URL}/auth/login`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token,
        refreshToken: 'mock-refresh-token-abc123',
        expiration: expiresAt.toISOString(),
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Олена',
          lastName: 'Петренко',
        },
      }),
    })
  })
}

export async function mockLoginFailure(page: Page, message = 'Invalid credentials'): Promise<void> {
  await page.route(`${API_BASE_URL}/auth/login`, async (route: Route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 401,
        message,
      }),
    })
  })
}

export async function mockRegisterSuccess(page: Page, token = MOCK_JWT_TOKEN): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await page.route(`${API_BASE_URL}/auth/register`, async (route: Route) => {
    const requestBody = route.request().postDataJSON()
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        token,
        refreshToken: 'mock-refresh-token-abc123',
        expiration: expiresAt.toISOString(),
        user: {
          id: 1,
          username: requestBody?.username ?? 'testuser',
          email: requestBody?.email ?? 'test@example.com',
          firstName: requestBody?.firstName ?? 'Test',
          lastName: requestBody?.lastName ?? 'User',
        },
      }),
    })
  })
}

export async function mockRegisterFailure(page: Page, message = 'Email already exists'): Promise<void> {
  await page.route(`${API_BASE_URL}/auth/register`, async (route: Route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 400,
        message,
      }),
    })
  })
}

export async function mockRefreshToken(page: Page, newToken = MOCK_JWT_TOKEN): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await page.route(`${API_BASE_URL}/auth/refresh-token`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: newToken,
        refreshToken: 'mock-new-refresh-token-xyz789',
        expiration: expiresAt.toISOString(),
      }),
    })
  })
}

export async function mockRevokeToken(page: Page): Promise<void> {
  await page.route(`${API_BASE_URL}/auth/revoke-token`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  })
}

export async function mockValidateToken(page: Page, isValid = true): Promise<void> {
  await page.route(`${API_BASE_URL}/auth/validate-token`, async (route: Route) => {
    if (isValid) {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isValid: true,
          expiresAt: expiresAt.toISOString(),
          claims: ['sub', 'email', 'role'],
        }),
      })
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          isValid: false,
          message: 'Token is invalid or expired',
        }),
      })
    }
  })
}

export interface MockUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email: string;
  avatarUrl?: string | null;
  avatarThumbnailUrl?: string | null;
  addresses?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MockUserProfileOptions extends MockOptions {
  enableUpdate?: boolean;
}

export async function mockUserProfile(page: Page, user?: Partial<MockUser>, options: MockUserProfileOptions = {}): Promise<void> {
  const now = new Date().toISOString()
  const defaultUser: MockUser = {
    id: 1,
    username: 'testuser',
    firstName: 'Олена',
    lastName: 'Петренко',
    phoneNumber: '+380501234567',
    email: 'test@example.com',
    avatarUrl: null,
    avatarThumbnailUrl: null,
    addresses: [],
    createdAt: now,
    updatedAt: now,
  }

  const userData = { ...defaultUser, ...user }
  const { enableUpdate = true } = options

  await page.route(`${API_BASE_URL}/users/*`, async (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()

    // Skip avatar and password endpoints - let them be handled by their own mocks
    if (url.includes('/avatar') || url.includes('/password')) {
      await route.fallback()
      return
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(userData),
      })
    } else if (enableUpdate && (method === 'PUT' || method === 'PATCH')) {
      if (options.delay) {
        await new Promise(resolve => setTimeout(resolve, options.delay))
      }

      if (options.status && options.status !== 200) {
        await route.fulfill({
          status: options.status,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Update failed' }),
        })
        return
      }

      const contentType = route.request().headers()['content-type'] || ''
      let requestData: Record<string, unknown> = {}
      if (contentType.includes('application/json')) {
        requestData = route.request().postDataJSON() || {}
      }

      const match = url.match(/\/users\/(\d+)/)
      const userId = match ? parseInt(match[1], 10) : userData.id

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...userData,
          ...requestData,
          id: userId,
          updatedAt: new Date().toISOString(),
        }),
      })
    } else {
      await route.fallback()
    }
  })
}

/**
 * @deprecated Use mockUserProfile with enableUpdate option instead.
 * This function is kept for backwards compatibility but may cause issues
 * when used together with mockUserProfile due to route handler ordering.
 */
export async function mockUpdateProfile(page: Page, options: MockOptions = {}): Promise<void> {
  await page.route(`${API_BASE_URL}/users/*`, async (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()

    // Skip avatar and password endpoints
    if (url.includes('/avatar') || url.includes('/password')) {
      await route.fallback()
      return
    }

    if (method !== 'PUT' && method !== 'PATCH') {
      await route.fallback()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const match = url.match(/\/users\/(\d+)/)
    const userId = match ? parseInt(match[1], 10) : 1

    if (options.status && options.status !== 200) {
      await route.fulfill({
        status: options.status,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Update failed' }),
      })
      return
    }

    const contentType = route.request().headers()['content-type'] || ''
    let requestData: Record<string, unknown> = {}

    if (contentType.includes('application/json')) {
      requestData = route.request().postDataJSON() || {}
    }

    const now = new Date().toISOString()

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: userId,
        username: requestData.username ?? 'testuser',
        firstName: requestData.firstName ?? 'Олена',
        lastName: requestData.lastName ?? 'Петренко',
        phoneNumber: requestData.phoneNumber ?? '+380501234567',
        email: requestData.email ?? 'test@example.com',
        avatarUrl: `${API_BASE_URL}/users/${userId}/avatar`,
        avatarThumbnailUrl: `${API_BASE_URL}/users/${userId}/avatar/thumbnail`,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: now,
      }),
    })
  })
}

export interface MockAddress {
  id: number;
  userId?: number;
  regionId: number;
  region?: { id: number; name: string };
  city: string;
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  zipCode?: string;
  notes?: string;
  isPrimary: boolean;
  addressTypeId: number;
  addressType?: { id: number; name: string; description: string; icon?: string };
  createdAt?: string;
  updatedAt?: string;
}

export async function mockAddresses(
  page: Page,
  addresses: MockAddress[],
  options: MockOptions = {}
): Promise<void> {
  await page.route(`${API_BASE_URL}/address`, async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const url = new URL(route.request().url())
    const page_num = parseInt(url.searchParams.get('page') ?? '1', 10)
    const perPage = parseInt(url.searchParams.get('perPage') ?? url.searchParams.get('pageSize') ?? '10', 10)

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(createPaginatedResponse(addresses, '/address', page_num, perPage)),
    })
  })

  await page.route(new RegExp(`${API_BASE_URL}/address\\?`), async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const url = new URL(route.request().url())
    const page_num = parseInt(url.searchParams.get('page') ?? '1', 10)
    const perPage = parseInt(url.searchParams.get('perPage') ?? url.searchParams.get('pageSize') ?? '10', 10)

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(createPaginatedResponse(addresses, '/address', page_num, perPage)),
    })
  })
}

export async function mockGetAddress(
  page: Page,
  address: MockAddress,
  options: MockOptions = {}
): Promise<void> {
  await page.route(new RegExp(`${API_BASE_URL}/address/\\d+$`), async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(address),
    })
  })
}

export async function mockCreateAddress(page: Page, options: MockOptions = {}): Promise<void> {
  await page.route(`${API_BASE_URL}/address`, async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const requestBody = route.request().postDataJSON()
    const now = new Date().toISOString()

    await route.fulfill({
      status: options.status ?? 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: Date.now(),
        ...requestBody,
        createdAt: now,
        updatedAt: now,
      }),
    })
  })
}

export async function mockUpdateAddress(page: Page, options: MockOptions = {}): Promise<void> {
  await page.route(new RegExp(`${API_BASE_URL}/address/\\d+$`), async (route: Route) => {
    if (route.request().method() !== 'PUT') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const requestBody = route.request().postDataJSON()
    const url = route.request().url()
    const match = url.match(/\/address\/(\d+)/)
    const addressId = match ? parseInt(match[1], 10) : 1
    const now = new Date().toISOString()

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: addressId,
        ...requestBody,
        updatedAt: now,
      }),
    })
  })
}

export async function mockDeleteAddress(page: Page, options: MockOptions = {}): Promise<void> {
  await page.route(new RegExp(`${API_BASE_URL}/address/\\d+$`), async (route: Route) => {
    if (route.request().method() !== 'DELETE') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    await route.fulfill({
      status: options.status ?? 204,
      body: '',
    })
  })
}

export interface MockRegion {
  id: number;
  name: string;
}

export async function mockRegions(page: Page, regions?: MockRegion[]): Promise<void> {
  const defaultRegions: MockRegion[] = [
    { id: 1, name: 'Вінницька область' },
    { id: 2, name: 'Волинська область' },
    { id: 3, name: 'Дніпропетровська область' },
    { id: 4, name: 'Донецька область' },
    { id: 5, name: 'Житомирська область' },
    { id: 6, name: 'Закарпатська область' },
    { id: 7, name: 'Запорізька область' },
    { id: 8, name: 'Івано-Франківська область' },
    { id: 9, name: 'Київська область' },
    { id: 10, name: 'Кіровоградська область' },
    { id: 11, name: 'Луганська область' },
    { id: 12, name: 'Львівська область' },
    { id: 13, name: 'Миколаївська область' },
    { id: 14, name: 'Одеська область' },
    { id: 15, name: 'Полтавська область' },
    { id: 16, name: 'Рівненська область' },
    { id: 17, name: 'Сумська область' },
    { id: 18, name: 'Тернопільська область' },
    { id: 19, name: 'Харківська область' },
    { id: 20, name: 'Херсонська область' },
    { id: 21, name: 'Хмельницька область' },
    { id: 22, name: 'Черкаська область' },
    { id: 23, name: 'Чернівецька область' },
    { id: 24, name: 'Чернігівська область' },
    { id: 25, name: 'м. Київ' },
    { id: 26, name: 'Автономна Республіка Крим' },
  ]

  await page.route(`${API_BASE_URL}/region`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(regions ?? defaultRegions),
    })
  })

  await page.route(new RegExp(`${API_BASE_URL}/region/\\d+$`), async (route: Route) => {
    const url = route.request().url()
    const match = url.match(/\/region\/(\d+)/)
    const regionId = match ? parseInt(match[1], 10) : 1
    const regionList = regions ?? defaultRegions
    const region = regionList.find(r => r.id === regionId) ?? regionList[0]

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(region),
    })
  })
}

export interface MockAddressType {
  id: number;
  name: string;
  description: string;
}

export async function mockAddressTypes(page: Page, types?: MockAddressType[]): Promise<void> {
  const defaultTypes: MockAddressType[] = [
    { id: 1, name: 'Квартира', description: 'Багатоквартирний будинок у місті' },
    { id: 2, name: 'Приватний будинок', description: 'Окрема садиба або дача' },
    { id: 3, name: 'Офіс', description: 'Комерційне або офісне приміщення' },
  ]

  await page.route(`${API_BASE_URL}/addresstype`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(types ?? defaultTypes),
    })
  })

  await page.route(new RegExp(`${API_BASE_URL}/addresstype/\\d+$`), async (route: Route) => {
    const url = route.request().url()
    const match = url.match(/\/addresstype\/(\d+)/)
    const typeId = match ? parseInt(match[1], 10) : 1
    const typeList = types ?? defaultTypes
    const addressType = typeList.find(t => t.id === typeId) ?? typeList[0]

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(addressType),
    })
  })
}

export interface MockCurrency {
  id: number;
  name: string;
  code: string;
  symbol: string;
}

export async function mockCurrencies(page: Page, currencies?: MockCurrency[]): Promise<void> {
  const defaultCurrencies: MockCurrency[] = [
    { id: 1, name: 'Українська гривня', code: 'UAH', symbol: '₴' },
    { id: 2, name: 'US Dollar', code: 'USD', symbol: '$' },
    { id: 3, name: 'Euro', code: 'EUR', symbol: '€' },
  ]

  await page.route(`${API_BASE_URL}/currency`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currencies ?? defaultCurrencies),
    })
  })

  await page.route(new RegExp(`${API_BASE_URL}/currency/\\d+$`), async (route: Route) => {
    const url = route.request().url()
    const match = url.match(/\/currency\/(\d+)/)
    const currencyId = match ? parseInt(match[1], 10) : 1
    const currencyList = currencies ?? defaultCurrencies
    const currency = currencyList.find(c => c.id === currencyId) ?? currencyList[0]

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currency),
    })
  })
}

export interface MockMeter {
  id: number;
  addressId: number;
  utilityTypeId: number;
  utilityType?: { id: number; name: string };
  name: string;
  serialNumber: string;
  modelName?: string;
  location?: string;
  installationDate?: string;
  initialReading?: number;
  serviceProviderId?: number;
  notes?: string;
  isActive: boolean;
  photoUrl?: string | null;
  photoThumbnailUrl?: string | null;
  lastReading?: number;
  lastReadingDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function mockMeters(page: Page, meters: MockMeter[], options: MockOptions = {}): Promise<void> {
  await page.route(`${API_BASE_URL}/meter`, async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(meters),
    })
  })

  await page.route(`${API_BASE_URL}/meter/active`, async (route: Route) => {
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const activeMeters = meters.filter(m => m.isActive)

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(activeMeters),
    })
  })
}

export async function mockGetMeter(page: Page, meter: MockMeter, options: MockOptions = {}): Promise<void> {
  await page.route(new RegExp(`${API_BASE_URL}/meter/\\d+$`), async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(meter),
    })
  })
}

const UTILITY_TYPE_TO_METER_TYPE: Record<number, string> = {
  1: 'electricity',
  2: 'gas',
  3: 'coldWater',
  4: 'hotWater',
  5: 'heat',
}

export async function mockMetersByAddress(
  page: Page,
  metersMap: Record<number, MockMeter[]>,
  options: MockOptions = {}
): Promise<void> {
  await page.route(`${API_BASE_URL}/meter/address/*`, async (route: Route) => {
    const url = route.request().url()
    const match = url.match(/\/meter\/address\/(\d+)/)
    const addressId = match ? parseInt(match[1], 10) : null

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const mockMeters = addressId !== null ? metersMap[addressId] ?? [] : []

    const meters = mockMeters.map(meter => ({
      id: meter.id,
      addressId: meter.addressId,
      providerId: meter.serviceProviderId ?? 1,
      type: UTILITY_TYPE_TO_METER_TYPE[meter.utilityTypeId] ?? 'electricity',
      name: meter.name,
      meterNumber: meter.serialNumber,
      location: meter.location ?? '',
      installedAt: meter.installationDate ?? '',
      status: meter.isActive ? 'active' : 'inactive',
      nextCheckDate: undefined,
    }))

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(meters),
    })
  })
}

export async function mockCreateMeter(page: Page, options: MockOptions = {}): Promise<void> {
  await page.route(`${API_BASE_URL}/meter`, async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const now = new Date().toISOString()
    const newId = Date.now()

    await route.fulfill({
      status: options.status ?? 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: newId,
        isActive: true,
        photoUrl: null,
        photoThumbnailUrl: null,
        createdAt: now,
        updatedAt: now,
      }),
    })
  })
}

export async function mockUpdateMeter(page: Page, options: MockOptions = {}): Promise<void> {
  await page.route(new RegExp(`${API_BASE_URL}/meter/\\d+$`), async (route: Route) => {
    if (route.request().method() !== 'PUT') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const requestBody = route.request().postDataJSON()
    const url = route.request().url()
    const match = url.match(/\/meter\/(\d+)/)
    const meterId = match ? parseInt(match[1], 10) : 1
    const now = new Date().toISOString()

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: meterId,
        ...requestBody,
        updatedAt: now,
      }),
    })
  })
}

export async function mockDeleteMeter(page: Page, options: MockOptions = {}): Promise<void> {
  await page.route(new RegExp(`${API_BASE_URL}/meter/\\d+$`), async (route: Route) => {
    if (route.request().method() !== 'DELETE') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    await route.fulfill({
      status: options.status ?? 204,
      body: '',
    })
  })
}

export interface MockMeterReading {
  id: number;
  meterId: number;
  meter?: MockMeter;
  readingValue: number;
  readingDate: string;
  consumption?: number;
  baseRate?: number;
  serviceFee?: number;
  totalCost?: number;
  notes?: string;
  isEstimated: boolean;
  photoUrl?: string | null;
  photoThumbnailUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BatchReadingResult {
  meterId: number;
  readingId: number;
  readingValue: number;
  previousReading: number;
  consumption: number;
  baseRate: number;
  serviceFee: number;
  totalCost: number;
  tariffName: string;
  success: boolean;
  message?: string;
}

export interface BatchReadingsResponse {
  addressId: number;
  submissionDate: string;
  results: BatchReadingResult[];
  totalCost: number;
  successCount: number;
  failureCount: number;
}

export async function mockReadings(
  page: Page,
  readings: MockMeterReading[],
  options: MockOptions = {}
): Promise<void> {
  await page.route(new RegExp(`${API_BASE_URL}/meter-readings/\\d+$`), async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const url = route.request().url()
    const match = url.match(/\/meter-readings\/(\d+)$/)
    const readingId = match ? parseInt(match[1], 10) : null
    const reading = readings.find(r => r.id === readingId) ?? readings[0]

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(reading),
    })
  })
}

export async function mockReadingsByAddress(
  page: Page,
  readingsMap: Record<number, MockMeterReading[]>,
  options: MockOptions = {}
): Promise<void> {
  await page.route(`${API_BASE_URL}/meter-readings/address/*`, async (route: Route) => {
    const url = route.request().url()
    const match = url.match(/\/meter-readings\/address\/(\d+)/)
    const addressId = match ? parseInt(match[1], 10) : null

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const mockReadings = addressId !== null ? readingsMap[addressId] ?? [] : []

    const readings = mockReadings.map(reading => ({
      id: reading.id,
      meterId: reading.meterId,
      date: reading.readingDate,
      value: reading.readingValue,
      consumption: reading.consumption,
      submittedAt: reading.createdAt ?? reading.readingDate,
      status: 'accepted' as const,
      note: reading.notes,
      photoUrl: reading.photoUrl ?? undefined,
    }))

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(readings),
    })
  })
}

export async function mockCreateBatchReadings(
  page: Page,
  response?: Partial<BatchReadingsResponse>,
  options: MockOptions = {}
): Promise<void> {
  await page.route(`${API_BASE_URL}/meter-readings/batch`, async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const now = new Date().toISOString()

    const defaultResponse: BatchReadingsResponse = {
      addressId: 1,
      submissionDate: now,
      results: [
        {
          meterId: 1,
          readingId: Date.now(),
          readingValue: 5100,
          previousReading: 5000,
          consumption: 100,
          baseRate: 4.32,
          serviceFee: 0,
          totalCost: 432.0,
          tariffName: 'Денний тариф',
          success: true,
        },
      ],
      totalCost: 432.0,
      successCount: 1,
      failureCount: 0,
    }

    await route.fulfill({
      status: options.status ?? 201,
      contentType: 'application/json',
      body: JSON.stringify({ ...defaultResponse, ...response }),
    })
  })
}

export async function mockDeleteReading(page: Page, options: MockOptions = {}): Promise<void> {
  await page.route(new RegExp(`${API_BASE_URL}/meter-readings/\\d+$`), async (route: Route) => {
    if (route.request().method() !== 'DELETE') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    await route.fulfill({
      status: options.status ?? 204,
      body: '',
    })
  })
}

export async function mockApiError(
  page: Page,
  urlPattern: string,
  statusCode = 500,
  message = 'Internal Server Error'
): Promise<void> {
  await page.route(`${API_BASE_URL}${urlPattern}`, async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        status: statusCode,
        message,
      }),
    })
  })
}

export async function mockNetworkError(page: Page, urlPattern: string): Promise<void> {
  await page.route(`${API_BASE_URL}${urlPattern}`, async (route: Route) => {
    await route.abort('failed')
  })
}

export async function mockTimeout(page: Page, urlPattern: string, delayMs = 30000): Promise<void> {
  await page.route(`${API_BASE_URL}${urlPattern}`, async (route: Route) => {
    await new Promise(resolve => setTimeout(resolve, delayMs))
    await route.abort('timedout')
  })
}

export async function mockApiErrorWithDetails(
  page: Page,
  urlPattern: string,
  statusCode: number,
  errors: Record<string, string[]>
): Promise<void> {
  await page.route(`${API_BASE_URL}${urlPattern}`, async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        status: statusCode,
        message: 'Validation failed',
        errors,
      }),
    })
  })
}

export async function mockApiErrorAllMethods(
  page: Page,
  urlPattern: string | RegExp,
  statusCode = 500,
  message = 'Internal Server Error'
): Promise<void> {
  const pattern = typeof urlPattern === 'string' ? `${API_BASE_URL}${urlPattern}` : urlPattern
  await page.route(pattern, async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        status: statusCode,
        message,
      }),
    })
  })
}

export async function mockNetworkErrorAllRoutes(page: Page, urlPatterns: string[]): Promise<void> {
  for (const pattern of urlPatterns) {
    await page.route(`${API_BASE_URL}${pattern}`, async (route: Route) => {
      await route.abort('failed')
    })
  }
}

export async function mockReferenceData(page: Page): Promise<void> {
  await mockRegions(page)
  await mockAddressTypes(page)
  await mockCurrencies(page)
}

export async function mockAllMeterPageData(
  page: Page,
  data: {
    addresses: MockAddress[];
    meters: MockMeter[];
    readings: MockMeterReading[];
  },
  options: MockOptions = {}
): Promise<void> {
  await mockReferenceData(page)
  await mockAddresses(page, data.addresses, options)

  const defaultAddressId = data.addresses[0]?.id ?? 1
  const metersMap: Record<number, MockMeter[]> = { [defaultAddressId]: data.meters }
  await mockMetersByAddress(page, metersMap, options)

  const readingsMap: Record<number, MockMeterReading[]> = { [defaultAddressId]: data.readings }
  await mockReadingsByAddress(page, readingsMap, options)
}

export async function mockDashboardData(
  page: Page,
  data: {
    user?: Partial<MockUser>;
    addresses: MockAddress[];
    meters: Record<number, MockMeter[]>;
    readings: Record<number, MockMeterReading[]>;
  },
  options: MockOptions = {}
): Promise<void> {
  await mockReferenceData(page)
  await mockUserProfile(page, data.user)
  await mockAddresses(page, data.addresses, options)
  await mockMetersByAddress(page, data.meters, options)
  await mockReadingsByAddress(page, data.readings, options)
}

export const UTILITY_TYPES = {
  ELECTRICITY: 1,
  GAS: 2,
  COLD_WATER: 3,
  HOT_WATER: 4,
  HEATING: 5,
} as const

export const ADDRESS_TYPES = {
  APARTMENT: 1,
  PRIVATE_HOUSE: 2,
  OFFICE: 3,
} as const

export interface MockTariff {
  id: number;
  serviceProviderId: number;
  utilityTypeId: number;
  currencyId: number;
  name: string;
  baseRate: number;
  serviceFee: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  utilityTypeName: string;
  currencyCode: string;
  currencySymbol: string;
}

export interface MockServiceProvider {
  id: number;
  addressId: number;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tariffs: MockTariff[];
}

export async function mockProviders(
  page: Page,
  providers: MockServiceProvider[],
  options: MockOptions = {}
): Promise<void> {
  await page.route(`${API_BASE_URL}/service-providers*`, async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }
    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: providers,
      }),
    })
  })
}

export async function mockCreateProvider(page: Page, options: MockOptions = {}): Promise<void> {
  await page.route(`${API_BASE_URL}/service-providers`, async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const requestBody = route.request().postDataJSON()
    const now = new Date().toISOString()

    await route.fulfill({
      status: options.status ?? 201,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: Date.now(),
          ...requestBody,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      }),
    })
  })
}

export interface MockUtilityType {
  id: number;
  name?: string;
  slug: string;
  displayName: string;
  unit: string;
  isActive: boolean;
}

export async function mockUtilityTypes(page: Page, types?: MockUtilityType[]): Promise<void> {
  const defaultTypes: MockUtilityType[] = [
    { id: UTILITY_TYPES.ELECTRICITY, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год', isActive: true },
    { id: UTILITY_TYPES.GAS, slug: 'gas', displayName: 'Газ', unit: 'м³', isActive: true },
    { id: UTILITY_TYPES.COLD_WATER, slug: 'cold_water', displayName: 'Холодна вода', unit: 'м³', isActive: true },
    { id: UTILITY_TYPES.HOT_WATER, slug: 'hot_water', displayName: 'Гаряча вода', unit: 'м³', isActive: true },
    { id: UTILITY_TYPES.HEATING, slug: 'heating', displayName: 'Опалення', unit: 'Гкал', isActive: true },
  ]

  await page.route(`${API_BASE_URL}/utility-type*`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: types ?? defaultTypes }),
    })
  })
}

export async function mockCreateMeterError(
  page: Page,
  statusCode = 400,
  message = 'Помилка при створенні лічильника'
): Promise<void> {
  await page.route(`${API_BASE_URL}/meter`, async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }

    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        status: statusCode,
        message,
      }),
    })
  })
}

export async function mockAddMeterPageData(
  page: Page,
  data: {
    addresses: MockAddress[];
    providers?: MockServiceProvider[];
  },
  options: MockOptions = {}
): Promise<void> {
  await mockReferenceData(page)
  await mockAddresses(page, data.addresses, options)
  await mockUtilityTypes(page)
  if (data.providers) {
    await mockProviders(page, data.providers, options)
  }
}

export async function mockChangePassword(
  page: Page,
  options: MockOptions & { wrongCurrentPassword?: boolean } = {}
): Promise<void> {
  await page.route(`${API_BASE_URL}/users/*/password`, async (route: Route) => {
    if (route.request().method() !== 'PUT' && route.request().method() !== 'POST') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    if (options.wrongCurrentPassword) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 400,
          message: 'Невірний поточний пароль',
        }),
      })
      return
    }

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Пароль успішно змінено',
      }),
    })
  })
}

export async function mockUploadAvatar(
  page: Page,
  options: MockOptions & { fileTooLarge?: boolean; invalidFormat?: boolean } = {}
): Promise<void> {
  await page.route(`${API_BASE_URL}/users/*/avatar`, async (route: Route) => {
    if (route.request().method() !== 'POST' && route.request().method() !== 'PUT') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    if (options.fileTooLarge) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 400,
          message: 'Розмір файлу перевищує допустимий ліміт (5 МБ)',
        }),
      })
      return
    }

    if (options.invalidFormat) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 400,
          message: 'Невірний формат файлу. Дозволені формати: JPG, PNG',
        }),
      })
      return
    }

    const url = route.request().url()
    const match = url.match(/\/users\/(\d+)/)
    const userId = match ? parseInt(match[1], 10) : 1

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({
        avatarUrl: `${API_BASE_URL}/users/${userId}/avatar`,
        avatarThumbnailUrl: `${API_BASE_URL}/users/${userId}/avatar/thumbnail`,
      }),
    })
  })
}

export async function mockDeleteAvatar(page: Page, options: MockOptions = {}): Promise<void> {
  await page.route(`${API_BASE_URL}/users/*/avatar`, async (route: Route) => {
    if (route.request().method() !== 'DELETE') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    await route.fulfill({
      status: options.status ?? 204,
      body: '',
    })
  })
}

export async function mockBatchReadingsWithPartialFailure(
  page: Page,
  successMeterIds: number[],
  failureMeterIds: number[],
  options: MockOptions = {}
): Promise<void> {
  await page.route(`${API_BASE_URL}/meter-readings/batch`, async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    const now = new Date().toISOString()

    const results: BatchReadingResult[] = [
      ...successMeterIds.map(meterId => ({
        meterId,
        readingId: Date.now() + meterId,
        readingValue: 5100 + meterId * 10,
        previousReading: 5000 + meterId * 10,
        consumption: 100,
        baseRate: 4.32,
        serviceFee: 0,
        totalCost: 432.0,
        tariffName: 'Денний тариф',
        success: true,
      })),
      ...failureMeterIds.map(meterId => ({
        meterId,
        readingId: 0,
        readingValue: 0,
        previousReading: 0,
        consumption: 0,
        baseRate: 0,
        serviceFee: 0,
        totalCost: 0,
        tariffName: '',
        success: false,
        message: 'Помилка збереження показання',
      })),
    ]

    const response: BatchReadingsResponse = {
      addressId: 1,
      submissionDate: now,
      results,
      totalCost: successMeterIds.length * 432.0,
      successCount: successMeterIds.length,
      failureCount: failureMeterIds.length,
    }

    await route.fulfill({
      status: 207,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}

export type OAuthProvider = 'Google' | 'GitHub'

export async function mockOAuthAuthorizeUrl(
  page: Page,
  provider: OAuthProvider,
  authorizationUrl: string,
  options: MockOptions = {}
): Promise<void> {
  await page.route(`**/auth/oauth/${provider.toLowerCase()}/authorize`, async (route: Route) => {
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        authorizationUrl,
      }),
    })
  })
}

export async function mockOAuthCallback(
  page: Page,
  provider: OAuthProvider,
  options: MockOptions = {}
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await page.route('**/auth/oauth/callback', async (route: Route) => {
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: MOCK_JWT_TOKEN,
        refreshToken: 'mock-oauth-refresh-token',
        expiration: expiresAt.toISOString(),
        user: {
          id: 1,
          username: `${provider.toLowerCase()}user`,
          email: `user@${provider.toLowerCase()}.com`,
          firstName: 'OAuth',
          lastName: 'User',
          authProvider: provider,
        },
      }),
    })
  })
}
