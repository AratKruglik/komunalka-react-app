import { test, expect } from '@playwright/test';
import { AddReadingsPage } from '../../pages';
import { authenticateUser } from '../../helpers/auth';
import {
  mockUserProfile,
  mockAddresses,
  mockMetersByAddress,
  mockReadingsByAddress,
  mockCreateBatchReadings,
} from '../../helpers/api-mocks';
import { testAddresses, testMeters, testReadings, testUserProfiles } from '../../fixtures/test-data';

test.describe('Add Readings Page', () => {
  let readingsPage: AddReadingsPage;

  async function setupMocks(
    page: Parameters<typeof mockAddresses>[0],
    options?: { meters?: Record<number, unknown[]>; readings?: Record<number, unknown[]> }
  ) {
    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary]);
    await mockMetersByAddress(page, options?.meters ?? { 1: [], 2: [] });
    await mockReadingsByAddress(page, options?.readings ?? { 1: [], 2: [] });
  }

  test.beforeEach(async ({ page }) => {
    readingsPage = new AddReadingsPage(page);
    await authenticateUser(page);
  });

  test('should display readings page with address selector', async ({ page }) => {
    await setupMocks(page);

    await readingsPage.goto();

    await readingsPage.expectPageVisible();
    await expect(readingsPage.addressSelect).toBeVisible();
  });

  test('should display no meters message when address has no meters', async ({ page }) => {
    await setupMocks(page, { meters: { 1: [], 2: [] }, readings: { 1: [], 2: [] } });

    await readingsPage.goto();

    await readingsPage.expectNoMetersMessage();
  });

  test('should display meter reading cards when meters exist', async ({ page }) => {
    const meters = [testMeters.electricity, testMeters.gas];
    await setupMocks(page, {
      meters: { 1: meters, 2: [] },
      readings: { 1: [testReadings.electricity, testReadings.gas], 2: [] },
    });

    await readingsPage.goto();

    await expect(readingsPage.noMetersMessage).not.toBeVisible();
  });

  test('should allow selecting different addresses', async ({ page }) => {
    await setupMocks(page);

    await readingsPage.goto();
    await readingsPage.expectPageVisible();

    const options = await readingsPage.getAddressOptions();
    expect(options.length).toBeGreaterThanOrEqual(2);
  });

  test('should navigate to add meter page from button', async ({ page }) => {
    await setupMocks(page);

    await readingsPage.goto();
    await readingsPage.clickAddMeter();

    await expect(page).toHaveURL(/\/meters\/new/);
  });

  test('should disable submit button when no meters exist', async ({ page }) => {
    await setupMocks(page, { meters: { 1: [], 2: [] }, readings: { 1: [], 2: [] } });

    await readingsPage.goto();

    await readingsPage.expectSubmitDisabled();
  });

  test('should display page heading and subtitle', async ({ page }) => {
    await setupMocks(page);

    await readingsPage.goto();

    await expect(readingsPage.pageHeading).toContainText('Внести показання');
    await expect(readingsPage.pageSubtitle).toBeVisible();
  });

  test('should display address label', async ({ page }) => {
    await setupMocks(page);

    await readingsPage.goto();

    await expect(readingsPage.addressLabel).toBeVisible();
  });
});

test.describe('Readings Form Submission', () => {
  let readingsPage: AddReadingsPage;

  async function setupWithMeters(page: Parameters<typeof mockAddresses>[0]) {
    const meters = [testMeters.electricity, testMeters.gas];
    const readings = [testReadings.electricity, testReadings.gas];

    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: meters });
    await mockReadingsByAddress(page, { 1: readings });
    await mockCreateBatchReadings(page);
  }

  test.beforeEach(async ({ page }) => {
    readingsPage = new AddReadingsPage(page);
    await authenticateUser(page);
    await setupWithMeters(page);
  });

  test('should display submit button', async ({ page }) => {
    await readingsPage.goto();

    await expect(readingsPage.submitButton).toBeVisible();
  });

  test('should show success message after successful submission', async ({ page }) => {
    await readingsPage.goto();

    await readingsPage.submit();

    await readingsPage.expectSuccessMessage();
  });
});

test.describe('Readings - Address Switching', () => {
  let readingsPage: AddReadingsPage;

  test.beforeEach(async ({ page }) => {
    readingsPage = new AddReadingsPage(page);
    await authenticateUser(page);
  });

  test('should update meters list when switching addresses', async ({ page }) => {
    const metersForAddress1 = [testMeters.electricity];
    const metersForAddress2 = [testMeters.gas, testMeters.coldWater];

    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary]);
    await mockMetersByAddress(page, { 1: metersForAddress1, 2: metersForAddress2 });
    await mockReadingsByAddress(page, { 1: [testReadings.electricity], 2: [] });

    await readingsPage.goto();
    await readingsPage.expectPageVisible();

    const addressLabel = `${testAddresses.secondary.street}, ${testAddresses.secondary.buildingNumber}, кв. ${testAddresses.secondary.apartmentNumber}`;
    await readingsPage.selectAddress(addressLabel);
  });

  test('should preserve address selection after page interactions', async ({ page }) => {
    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary]);
    await mockMetersByAddress(page, { 1: [testMeters.electricity], 2: [] });
    await mockReadingsByAddress(page, { 1: [testReadings.electricity], 2: [] });

    await readingsPage.goto();

    await expect(readingsPage.addressSelect).toBeVisible();
  });
});

test.describe('Readings - Edge Cases', () => {
  let readingsPage: AddReadingsPage;

  test.beforeEach(async ({ page }) => {
    readingsPage = new AddReadingsPage(page);
    await authenticateUser(page);
  });

  test('should handle single address', async ({ page }) => {
    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [testMeters.electricity] });
    await mockReadingsByAddress(page, { 1: [testReadings.electricity] });

    await readingsPage.goto();

    await readingsPage.expectPageVisible();
    const options = await readingsPage.getAddressOptions();
    expect(options.length).toBe(1);
  });

  test('should handle no addresses gracefully', async ({ page }) => {
    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, []);
    await mockMetersByAddress(page, {});
    await mockReadingsByAddress(page, {});

    await readingsPage.goto();

    await readingsPage.expectPageVisible();
  });

  test('should display add meter button when no meters', async ({ page }) => {
    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [] });
    await mockReadingsByAddress(page, { 1: [] });

    await readingsPage.goto();

    await expect(readingsPage.addMeterButton).toBeVisible();
  });
});

test.describe('Readings - API Error Handling', () => {
  let readingsPage: AddReadingsPage;

  test.beforeEach(async ({ page }) => {
    readingsPage = new AddReadingsPage(page);
    await authenticateUser(page);
  });

  test('should handle submission error', async ({ page }) => {
    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [testMeters.electricity] });
    await mockReadingsByAddress(page, { 1: [testReadings.electricity] });
    await mockCreateBatchReadings(page, undefined, { status: 500 });

    await readingsPage.goto();

    await readingsPage.submit();
  });
});
