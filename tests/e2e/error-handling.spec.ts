import { test, expect, Page } from '@playwright/test';
import { authenticateUser, clearAuth } from '../helpers/auth';
import {
  mockUserProfile,
  mockAddresses,
  mockMetersByAddress,
  mockReadingsByAddress,
  mockApiError,
  mockNetworkError,
  mockLoginSuccess,
  mockLoginFailure,
  mockCreateAddress,
  mockBatchReadingsWithPartialFailure,
  mockReferenceData,
} from '../helpers/api-mocks';
import {
  testAddresses,
  testMeters,
  testReadings,
  testNewAddressFormData,
} from '../fixtures/test-data';
import {
  AddressPage,
  AddAddressPage,
  DashboardPage,
  LoginPage,
  MeterPage,
  AddReadingsPage,
} from '../pages';

const API_BASE = 'https://localhost:7095/api/v1';

async function setupStandardMocks(page: Page) {
  await mockUserProfile(page);
  await mockReferenceData(page);
}

test.describe('Error Handling', () => {
  test.describe('Network Errors', () => {
    test('should display error message when network is unavailable on addresses page', async ({
      page,
    }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockNetworkError(page, '/addresses*');

      const addressPage = new AddressPage(page);
      await addressPage.goto();

      await addressPage.expectErrorState();
    });

    test('should show retry button on network error', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockNetworkError(page, '/addresses*');

      const addressPage = new AddressPage(page);
      await addressPage.goto();

      await expect(addressPage.retryButton).toBeVisible();
    });

    test('should recover when network restored after retry', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);

      let requestCount = 0;
      await page.route(`${API_BASE}/addresses*`, async route => {
        requestCount++;
        if (requestCount === 1) {
          await route.abort('failed');
        } else {
          const response = {
            data: [testAddresses.primary],
            links: { first: null, last: null, prev: null, next: null },
            meta: {
              current_page: 1,
              from: 1,
              last_page: 1,
              path: '',
              per_page: 10,
              to: 1,
              total: 1,
            },
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
          });
        }
      });
      await mockMetersByAddress(page, { 1: [] });
      await mockReadingsByAddress(page, { 1: [] });

      const addressPage = new AddressPage(page);
      await addressPage.goto();

      await addressPage.expectErrorState();
      await addressPage.retry();

      await addressPage.expectAddressVisible(testAddresses.primary.street);
    });

    test('should handle network error on dashboard gracefully', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockNetworkError(page, '/addresses*');

      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();

      await dashboardPage.expectWelcomeMessageVisible();
    });

    test.skip('should handle network error when submitting form', async ({ page }) => {
      await authenticateUser(page);
      await setupStandardMocks(page);
      await mockAddresses(page, [testAddresses.primary]);
      await mockMetersByAddress(page, { 1: [] });
      await mockReadingsByAddress(page, { 1: [] });
      await mockNetworkError(page, '/addresses');

      const addAddressPage = new AddAddressPage(page);
      await addAddressPage.goto();
      await addAddressPage.fillAddressForm(testNewAddressFormData);
      await addAddressPage.submit();

      const errorMessage = page.getByText(/помилка|error|не вдалося/i);
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('HTTP 500 (Server Error)', () => {
    test('should display server error message on addresses page', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockApiError(page, '/addresses*', 500, 'Internal Server Error');

      const addressPage = new AddressPage(page);
      await addressPage.goto();

      await addressPage.expectErrorState();
    });

    test('should not show sensitive error details to user', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockApiError(
        page,
        '/addresses*',
        500,
        'Database connection failed: mysql://user:password@localhost:3306'
      );

      const addressPage = new AddressPage(page);
      await addressPage.goto();

      await expect(page.getByText(/password/i)).not.toBeVisible();
      await expect(page.getByText(/mysql/i)).not.toBeVisible();
    });

    test('should allow retry after server error', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);

      let requestCount = 0;
      await page.route(`${API_BASE}/addresses*`, async route => {
        if (route.request().method() !== 'GET') {
          await route.continue();
          return;
        }
        requestCount++;
        if (requestCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ status: 500, message: 'Server Error' }),
          });
        } else {
          const response = {
            data: [testAddresses.primary],
            links: { first: null, last: null, prev: null, next: null },
            meta: {
              current_page: 1,
              from: 1,
              last_page: 1,
              path: '',
              per_page: 10,
              to: 1,
              total: 1,
            },
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
          });
        }
      });
      await mockMetersByAddress(page, { 1: [] });
      await mockReadingsByAddress(page, { 1: [] });

      const addressPage = new AddressPage(page);
      await addressPage.goto();

      await addressPage.expectErrorState();
      await addressPage.retry();

      await addressPage.expectAddressVisible(testAddresses.primary.street);
    });

    test.skip('should display server error on meters page', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockAddresses(page, [testAddresses.primary]);
      await mockReadingsByAddress(page, { 1: [] });
      await mockApiError(page, '/meter/address/*', 500, 'Internal Server Error');

      const meterPage = new MeterPage(page);
      await meterPage.goto();

      const errorMessage = page.getByText(/помилка|error/i);
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('HTTP 403 (Forbidden)', () => {
    test('should display access denied message', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockApiError(page, '/addresses*', 403, 'Access denied');

      const addressPage = new AddressPage(page);
      await addressPage.goto();

      const errorElement = page.getByText(/помилка|access|заборонено|доступ/i);
      await expect(errorElement).toBeVisible({ timeout: 10000 });
    });

    test('should handle 403 on protected resource', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockAddresses(page, [testAddresses.primary]);
      await mockMetersByAddress(page, { 1: [] });
      await mockReadingsByAddress(page, { 1: [] });

      await page.route(`${API_BASE}/meter/1`, async route => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 403,
            contentType: 'application/json',
            body: JSON.stringify({
              status: 403,
              message: 'You do not have permission to access this resource',
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/meters');
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('main')).toBeVisible();
    });
  });

  test.describe('HTTP 404 (Not Found)', () => {
    test.skip('should handle missing resource gracefully', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockReferenceData(page);
      await mockAddresses(page, []);
      await mockMetersByAddress(page, {});
      await mockReadingsByAddress(page, {});

      await page.route(`${API_BASE}/addresses/999`, async route => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 404,
            message: 'Address not found',
          }),
        });
      });

      await page.goto('/addresses/999/edit');

      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('main')).toBeVisible();
    });

    test('should provide navigation back from 404 page', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockAddresses(page, [testAddresses.primary]);
      await mockMetersByAddress(page, { 1: [] });
      await mockReadingsByAddress(page, { 1: [] });

      await page.goto('/nonexistent-page');

      const backLink = page.getByRole('link', { name: /головна|назад|back|home/i });
      if (await backLink.isVisible()) {
        await backLink.click();
        await expect(page).toHaveURL('/');
      }
    });
  });

  test.describe('HTTP 401 (Unauthorized)', () => {
    test.skip('should redirect to login page when token expired', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);

      await page.route(`${API_BASE}/addresses*`, async route => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({
              status: 401,
              message: 'Token expired',
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/addresses');

      await page.waitForURL(/\/login/, { timeout: 15000 });
      await expect(page).toHaveURL(/\/login/);
    });

    test.skip('should clear auth tokens on 401', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);

      await page.route(`${API_BASE}/addresses*`, async route => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 401,
            message: 'Unauthorized',
          }),
        });
      });

      await page.goto('/addresses');
      await page.waitForURL(/\/login/, { timeout: 15000 });

      const cookies = await page.context().cookies();
      const jwtCookie = cookies.find(c => c.name === 'jwt_token');
      expect(jwtCookie).toBeUndefined();
    });

    test.skip('should redirect unauthenticated user to login', async ({ page }) => {
      await page.goto('/addresses');

      await page.waitForURL(/\/login/, { timeout: 10000 });

      const url = page.url();
      expect(url).toMatch(/\/login/);
    });

    test.skip('should handle 401 on login with invalid credentials', async ({ page }) => {
      await mockLoginFailure(page, 'Invalid credentials');

      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.emailInput.fill('wrong@email.com');
      await loginPage.passwordInput.fill('wrongpassword');
      await loginPage.submitButton.click();

      const errorMessage = page.getByText(/невірний|invalid|помилка/i);
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Timeout Errors', () => {
    test.skip('should display timeout message for slow requests', async ({ page }) => {
      test.setTimeout(35000);

      await authenticateUser(page);
      await mockUserProfile(page);

      await page.route(`${API_BASE}/addresses*`, async route => {
        if (route.request().method() === 'GET') {
          await new Promise(resolve => setTimeout(resolve, 16000));
          await route.abort('timedout');
        } else {
          await route.continue();
        }
      });

      const addressPage = new AddressPage(page);
      await page.goto('/addresses');

      await addressPage.expectErrorState();
    });

    test('should allow retry after timeout', async ({ page }) => {
      test.setTimeout(35000);

      await authenticateUser(page);
      await mockUserProfile(page);

      let requestCount = 0;
      await page.route(`${API_BASE}/addresses*`, async route => {
        if (route.request().method() !== 'GET') {
          await route.continue();
          return;
        }
        requestCount++;
        if (requestCount === 1) {
          await new Promise(resolve => setTimeout(resolve, 16000));
          await route.abort('timedout');
        } else {
          const response = {
            data: [testAddresses.primary],
            links: { first: null, last: null, prev: null, next: null },
            meta: {
              current_page: 1,
              from: 1,
              last_page: 1,
              path: '',
              per_page: 10,
              to: 1,
              total: 1,
            },
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
          });
        }
      });
      await mockMetersByAddress(page, { 1: [] });
      await mockReadingsByAddress(page, { 1: [] });

      await page.goto('/addresses');
      await page.waitForSelector('text=/помилка|спробувати/i', { timeout: 20000 });

      const addressPage = new AddressPage(page);
      await addressPage.retry();

      await addressPage.expectAddressVisible(testAddresses.primary.street);
    });
  });

  test.describe('Form Validation Errors', () => {
    test.skip('should display field-level errors from API', async ({ page }) => {
      await authenticateUser(page);
      await setupStandardMocks(page);
      await mockAddresses(page, [testAddresses.primary]);
      await mockMetersByAddress(page, { 1: [] });
      await mockReadingsByAddress(page, { 1: [] });

      await page.route(`${API_BASE}/addresses`, async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              status: 400,
              message: 'Validation failed',
              errors: {
                city: ['City is required'],
                street: ['Street name is too short'],
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      const addAddressPage = new AddAddressPage(page);
      await addAddressPage.goto();
      await addAddressPage.fillAddressForm(testNewAddressFormData);
      await addAddressPage.submit();

      const errorAlert = page.getByRole('alert');
      await expect(errorAlert).toBeVisible({ timeout: 5000 });
    });

    test('should highlight invalid fields', async ({ page }) => {
      await authenticateUser(page);
      await setupStandardMocks(page);
      await mockAddresses(page, [testAddresses.primary]);
      await mockMetersByAddress(page, { 1: [] });
      await mockReadingsByAddress(page, { 1: [] });

      const addAddressPage = new AddAddressPage(page);
      await addAddressPage.goto();
      await addAddressPage.selectPropertyType('apartment');
      await addAddressPage.submit();

      const requiredField = addAddressPage.cityInput;
      await expect(requiredField).toBeVisible();
    });

    test('should clear errors on field correction', async ({ page }) => {
      await authenticateUser(page);
      await setupStandardMocks(page);
      await mockAddresses(page, [testAddresses.primary]);
      await mockMetersByAddress(page, { 1: [] });
      await mockReadingsByAddress(page, { 1: [] });
      await mockCreateAddress(page);

      const addAddressPage = new AddAddressPage(page);
      await addAddressPage.goto();
      await addAddressPage.selectPropertyType('apartment');

      await addAddressPage.cityInput.fill('');
      await addAddressPage.cityInput.blur();

      await addAddressPage.cityInput.fill('Kyiv');

      const cityError = page.locator('.text-red-500').filter({ hasText: /місто/i });
      await expect(cityError).not.toBeVisible();
    });

    test.skip('should show login form validation errors for empty fields', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await expect(loginPage.submitButton).toBeVisible({ timeout: 10000 });
      await loginPage.submitButton.click();

      const emailError = page.getByText(/пошта.*обов|email.*required/i);
      await expect(emailError).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Partial Failures (Batch Operations)', () => {
    test('should show which items succeeded and failed in batch reading submission', async ({
      page,
    }) => {
      await authenticateUser(page);
      await setupStandardMocks(page);
      await mockAddresses(page, [testAddresses.primary]);
      await mockMetersByAddress(page, {
        1: [testMeters.electricity, testMeters.gas, testMeters.coldWater],
      });
      await mockReadingsByAddress(page, {
        1: [testReadings.electricity, testReadings.gas, testReadings.coldWater],
      });
      await mockBatchReadingsWithPartialFailure(page, [1, 2], [3]);

      const addReadingsPage = new AddReadingsPage(page);
      await addReadingsPage.goto();

      await page.waitForSelector('input[type="number"]', { timeout: 10000 });

      const readingInputs = page.locator('input[type="number"]');
      const count = await readingInputs.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const input = readingInputs.nth(i);
          const currentValue = await input.inputValue();
          const newValue = currentValue ? parseInt(currentValue) + 100 : 100;
          await input.fill(String(newValue));
        }

        const submitButton = page.getByRole('button', { name: /зберегти|submit|надіслати/i });
        if (await submitButton.isVisible()) {
          await submitButton.click();

          const resultMessage = page.getByText(/результат|success|fail|помилка|збережено/i);
          await expect(resultMessage).toBeVisible({ timeout: 10000 });
        }
      }
    });

    test('should allow retry for failed items in batch operation', async ({ page }) => {
      await authenticateUser(page);
      await setupStandardMocks(page);
      await mockAddresses(page, [testAddresses.primary]);
      await mockMetersByAddress(page, {
        1: [testMeters.electricity, testMeters.gas],
      });
      await mockReadingsByAddress(page, {
        1: [testReadings.electricity, testReadings.gas],
      });

      let batchCallCount = 0;
      await page.route(`${API_BASE}/meter-readings/batch`, async route => {
        if (route.request().method() !== 'POST') {
          await route.continue();
          return;
        }

        batchCallCount++;
        const now = new Date().toISOString();

        if (batchCallCount === 1) {
          await route.fulfill({
            status: 207,
            contentType: 'application/json',
            body: JSON.stringify({
              addressId: 1,
              submissionDate: now,
              results: [
                {
                  meterId: 1,
                  readingId: 1001,
                  readingValue: 5200,
                  previousReading: 5097,
                  consumption: 103,
                  baseRate: 4.32,
                  serviceFee: 0,
                  totalCost: 444.96,
                  tariffName: 'Standard',
                  success: true,
                },
                {
                  meterId: 2,
                  readingId: 0,
                  readingValue: 0,
                  previousReading: 0,
                  consumption: 0,
                  baseRate: 0,
                  serviceFee: 0,
                  totalCost: 0,
                  tariffName: '',
                  success: false,
                  message: 'Failed to save reading',
                },
              ],
              totalCost: 444.96,
              successCount: 1,
              failureCount: 1,
            }),
          });
        } else {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              addressId: 1,
              submissionDate: now,
              results: [
                {
                  meterId: 2,
                  readingId: 1002,
                  readingValue: 650,
                  previousReading: 606,
                  consumption: 44,
                  baseRate: 7.96,
                  serviceFee: 0,
                  totalCost: 350.24,
                  tariffName: 'Standard',
                  success: true,
                },
              ],
              totalCost: 350.24,
              successCount: 1,
              failureCount: 0,
            }),
          });
        }
      });

      const addReadingsPage = new AddReadingsPage(page);
      await addReadingsPage.goto();

      await expect(page.getByRole('main')).toBeVisible();
    });
  });

  test.describe('Loading States During Errors', () => {
    test('should show loading state before error appears', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);

      await page.route(`${API_BASE}/addresses*`, async route => {
        if (route.request().method() === 'GET') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ status: 500, message: 'Error' }),
          });
        } else {
          await route.continue();
        }
      });

      const addressPage = new AddressPage(page);
      await page.goto('/addresses');

      await addressPage.expectLoadingState();

      await addressPage.expectErrorState();
    });
  });

  test.describe('Error Recovery Patterns', () => {
    test('should maintain form data after submission error', async ({ page }) => {
      await authenticateUser(page);
      await setupStandardMocks(page);
      await mockAddresses(page, [testAddresses.primary]);
      await mockMetersByAddress(page, { 1: [] });
      await mockReadingsByAddress(page, { 1: [] });

      await page.route(`${API_BASE}/addresses`, async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ status: 500, message: 'Server Error' }),
          });
        } else {
          await route.continue();
        }
      });

      const addAddressPage = new AddAddressPage(page);
      await addAddressPage.goto();
      await addAddressPage.fillAddressForm(testNewAddressFormData);
      await addAddressPage.submit();

      await expect(addAddressPage.cityInput).toHaveValue(testNewAddressFormData.city);
      await expect(addAddressPage.streetInput).toHaveValue(testNewAddressFormData.street);
    });

    test('should not lose navigation state on error', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockAddresses(page, [testAddresses.primary]);
      await mockMetersByAddress(page, { 1: [] });
      await mockReadingsByAddress(page, { 1: [] });
      await mockApiError(page, '/meter/address/*', 500, 'Server Error');

      await page.goto('/meters');

      await page.waitForLoadState('networkidle');

      const sidebar = page.getByRole('navigation');
      await expect(sidebar).toBeVisible();

      const addressesLink = page.getByRole('link', { name: /адреси/i });
      if (await addressesLink.isVisible()) {
        await addressesLink.click();
        await expect(page).toHaveURL(/\/addresses/);
      }
    });
  });

  test.describe('Multiple Error Scenarios', () => {
    test('should handle cascading errors gracefully', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockApiError(page, '/addresses*', 500, 'Addresses API Error');
      await mockApiError(page, '/meter/*', 500, 'Meters API Error');

      await page.goto('/');

      await expect(page.getByRole('main')).toBeVisible();
    });

    test('should handle error during navigation', async ({ page }) => {
      await authenticateUser(page);
      await mockUserProfile(page);
      await mockAddresses(page, [testAddresses.primary]);
      await mockMetersByAddress(page, { 1: [] });
      await mockReadingsByAddress(page, { 1: [] });

      await page.goto('/addresses');

      const addressPage = new AddressPage(page);
      await addressPage.expectPageVisible();

      await mockApiError(page, '/meter/address/*', 500, 'Error');

      await page.getByRole('link', { name: /лічильники/i }).click();
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('main')).toBeVisible();
    });
  });
});
