import { Page } from '@playwright/test';
import { mockLoginSuccess } from './api-mocks';

export async function authenticateUser(page: Page): Promise<void> {
  await mockLoginSuccess(page);

  await page.evaluate(() => {
    localStorage.setItem('accessToken', 'mock-jwt-token');
    localStorage.setItem('refreshToken', 'mock-refresh-token');
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }));
  });
}

export async function clearAuth(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  });
}

export async function isAuthenticated(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return !!localStorage.getItem('accessToken');
  });
}
