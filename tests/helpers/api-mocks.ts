import { Page, Route } from '@playwright/test';

const API_BASE_URL = 'http://localhost:8080/api/v1';

interface MockOptions {
  status?: number;
  delay?: number;
}

export async function mockLoginSuccess(page: Page, token = 'mock-jwt-token'): Promise<void> {
  await page.route(`${API_BASE_URL}/auth/login`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          accessToken: token,
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
        },
      }),
    });
  });
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
    });
  });
}

export async function mockAddresses(page: Page, addresses: unknown[], options: MockOptions = {}): Promise<void> {
  await page.route(`${API_BASE_URL}/addresses*`, async (route: Route) => {
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: addresses,
        pagination: {
          page: 1,
          pageSize: 10,
          totalCount: addresses.length,
          totalPages: 1,
        },
      }),
    });
  });
}

export async function mockMeters(page: Page, meters: unknown[], options: MockOptions = {}): Promise<void> {
  await page.route(`${API_BASE_URL}/meter/**`, async (route: Route) => {
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: meters,
      }),
    });
  });

  await page.route(new RegExp(`${API_BASE_URL}/meter$`), async (route: Route) => {
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: meters,
      }),
    });
  });
}

export async function mockMetersByAddress(
  page: Page,
  metersMap: Record<number, unknown[]>,
  options: MockOptions = {}
): Promise<void> {
  await page.route(`${API_BASE_URL}/meter/address/*`, async (route: Route) => {
    const url = route.request().url();
    const match = url.match(/\/meter\/address\/(\d+)/);
    const addressId = match ? parseInt(match[1], 10) : null;

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }

    const meters = addressId !== null ? metersMap[addressId] ?? [] : [];

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: meters,
      }),
    });
  });
}

export async function mockReadings(page: Page, readings: unknown[], options: MockOptions = {}): Promise<void> {
  await page.route(`${API_BASE_URL}/meter-readings/**`, async (route: Route) => {
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: readings,
      }),
    });
  });
}

export async function mockReadingsByAddress(
  page: Page,
  readingsMap: Record<number, unknown[]>,
  options: MockOptions = {}
): Promise<void> {
  await page.route(`${API_BASE_URL}/meter-readings/address/*`, async (route: Route) => {
    const url = route.request().url();
    const match = url.match(/\/meter-readings\/address\/(\d+)/);
    const addressId = match ? parseInt(match[1], 10) : null;

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }

    const readings = addressId !== null ? readingsMap[addressId] ?? [] : [];

    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: readings,
      }),
    });
  });
}

export async function mockCreateReading(page: Page, options: MockOptions = {}): Promise<void> {
  await page.route(`${API_BASE_URL}/meter-readings/batch`, async (route: Route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }

    const requestBody = route.request().postDataJSON();

    await route.fulfill({
      status: options.status ?? 201,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: Date.now(),
          ...requestBody,
          status: 'processing',
          submissionDate: new Date().toISOString(),
        },
      }),
    });
  });
}

export async function mockApiError(page: Page, urlPattern: string, statusCode = 500, message = 'Internal Server Error'): Promise<void> {
  await page.route(`${API_BASE_URL}${urlPattern}`, async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        status: statusCode,
        message,
      }),
    });
  });
}

export async function mockNetworkError(page: Page, urlPattern: string): Promise<void> {
  await page.route(`${API_BASE_URL}${urlPattern}`, async (route: Route) => {
    await route.abort('failed');
  });
}

export async function mockAllMeterPageData(
  page: Page,
  data: {
    addresses: unknown[];
    meters: unknown[];
    readings: unknown[];
  },
  options: MockOptions = {}
): Promise<void> {
  await mockAddresses(page, data.addresses, options);

  const defaultAddressId = (data.addresses[0] as { id: number })?.id ?? 1;
  const metersMap: Record<number, unknown[]> = { [defaultAddressId]: data.meters };
  await mockMetersByAddress(page, metersMap, options);

  const readingsMap: Record<number, unknown[]> = { [defaultAddressId]: data.readings };
  await mockReadingsByAddress(page, readingsMap, options);
}
