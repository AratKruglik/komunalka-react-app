import { Page } from '@playwright/test';
import { mockLoginSuccess } from './api-mocks';

const BASE_DOMAIN = 'localhost';

function getFutureExpirationDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}

export function getAuthStorageState() {
  const expiresAt = getFutureExpirationDate();

  return {
    cookies: [
      {
        name: 'jwt_token',
        value: 'mock-jwt-token',
        domain: BASE_DOMAIN,
        path: '/',
        expires: -1,
        httpOnly: false,
        secure: false,
        sameSite: 'Lax' as const,
      },
      {
        name: 'refresh_token',
        value: 'mock-refresh-token',
        domain: BASE_DOMAIN,
        path: '/',
        expires: -1,
        httpOnly: false,
        secure: false,
        sameSite: 'Lax' as const,
      },
      {
        name: 'expires_at',
        value: expiresAt,
        domain: BASE_DOMAIN,
        path: '/',
        expires: -1,
        httpOnly: false,
        secure: false,
        sameSite: 'Lax' as const,
      },
    ],
    origins: [],
  };
}

export async function authenticateUser(page: Page): Promise<void> {
  await mockLoginSuccess(page);

  const context = page.context();
  const expiresAt = getFutureExpirationDate();

  await context.addCookies([
    {
      name: 'jwt_token',
      value: 'mock-jwt-token',
      domain: BASE_DOMAIN,
      path: '/',
    },
    {
      name: 'refresh_token',
      value: 'mock-refresh-token',
      domain: BASE_DOMAIN,
      path: '/',
    },
    {
      name: 'expires_at',
      value: expiresAt,
      domain: BASE_DOMAIN,
      path: '/',
    },
  ]);
}

export async function clearAuth(page: Page): Promise<void> {
  const context = page.context();
  await context.clearCookies();
}

export async function isAuthenticated(page: Page): Promise<boolean> {
  const context = page.context();
  const cookies = await context.cookies();
  return cookies.some(cookie => cookie.name === 'jwt_token');
}
