import { Page, Route } from '@playwright/test';

const API_BASE_URL = 'http://localhost:5000/api';

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
  await page.route(`${API_BASE_URL}/meters*`, async (route: Route) => {
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

export async function mockReadings(page: Page, readings: unknown[], options: MockOptions = {}): Promise<void> {
  await page.route(`${API_BASE_URL}/readings*`, async (route: Route) => {
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
