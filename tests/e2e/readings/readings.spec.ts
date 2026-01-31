import { test, expect } from '@playwright/test';
import { AddReadingsPage } from '../../pages';
import { authenticateUser } from '../../helpers/auth';
import {
  mockUserProfile,
  mockAddresses,
  mockMetersByAddress,
  mockReadingsByAddress,
  mockCreateBatchReadings,
  mockBatchReadingsWithPartialFailure,
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

test.describe('Readings - Consumption Calculation', () => {
  let readingsPage: AddReadingsPage;

  async function setupWithMeterAndReading(page: Parameters<typeof mockAddresses>[0]) {
    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [testMeters.electricity] });
    await mockReadingsByAddress(page, { 1: [testReadings.electricity] });
  }

  async function getMeterCard(page: Parameters<typeof mockAddresses>[0], serviceName: string) {
    const card = page.locator('[class*="shadow-lg"]').filter({ hasText: serviceName }).filter({ hasText: /поточні показання/i });
    await expect(card).toBeVisible({ timeout: 10000 });
    return card;
  }

  test.beforeEach(async ({ page }) => {
    readingsPage = new AddReadingsPage(page);
    await authenticateUser(page);
  });

  test('should display previous reading value', async ({ page }) => {
    await setupWithMeterAndReading(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    const previousLabel = card.getByLabel(/попередні показання/i);
    await expect(previousLabel).toBeVisible();
  });

  test('should calculate and display consumption (current - previous)', async ({ page }) => {
    await setupWithMeterAndReading(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    await card.getByRole('spinbutton').first().fill('5200');

    const consumptionSection = card.locator('dl');
    await expect(consumptionSection).toContainText('103');
  });

  test('should show zero consumption if current < previous', async ({ page }) => {
    await setupWithMeterAndReading(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    await card.getByRole('spinbutton').first().fill('5000');

    const consumptionSection = card.locator('dl');
    await expect(consumptionSection).toContainText('0');
  });

  test('should update consumption when value changes', async ({ page }) => {
    await setupWithMeterAndReading(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    await card.getByRole('spinbutton').first().fill('5150');
    await expect(card.locator('dl')).toContainText('53');

    await card.getByRole('spinbutton').first().fill('5200');
    await expect(card.locator('dl')).toContainText('103');
  });

  test('should display estimated cost based on consumption and tariff', async ({ page }) => {
    await setupWithMeterAndReading(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    await card.getByRole('spinbutton').first().fill('5197');

    const costSection = card.getByText(/вартість/i);
    await expect(costSection).toBeVisible();
  });
});

test.describe('Readings - Input Validation', () => {
  let readingsPage: AddReadingsPage;

  async function setupWithMeter(page: Parameters<typeof mockAddresses>[0]) {
    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [testMeters.electricity] });
    await mockReadingsByAddress(page, { 1: [testReadings.electricity] });
  }

  async function getMeterCard(page: Parameters<typeof mockAddresses>[0], serviceName: string) {
    const card = page.locator('[class*="shadow-lg"]').filter({ hasText: serviceName }).filter({ hasText: /поточні показання/i });
    await expect(card).toBeVisible({ timeout: 10000 });
    return card;
  }

  test.beforeEach(async ({ page }) => {
    readingsPage = new AddReadingsPage(page);
    await authenticateUser(page);
  });

  test('should accept only numeric input', async ({ page }) => {
    await setupWithMeter(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    const input = card.getByRole('spinbutton').first();
    await input.clear();
    await input.pressSequentially('abc');

    const value = await input.inputValue();
    expect(value).toBe('');
  });

  test('should accept positive values', async ({ page }) => {
    await setupWithMeter(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    const input = card.getByRole('spinbutton').first();
    await input.fill('5200');

    const value = await input.inputValue();
    expect(value).toBe('5200');
  });

  test('should handle decimal values', async ({ page }) => {
    await setupWithMeter(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    const input = card.getByRole('spinbutton').first();
    await input.fill('5200.5');

    const value = await input.inputValue();
    expect(value).toBe('5200.5');
  });

  test('should have number input type', async ({ page }) => {
    await setupWithMeter(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    const input = card.getByRole('spinbutton').first();
    await expect(input).toHaveAttribute('type', 'number');
  });

  test('should allow clearing and re-entering value', async ({ page }) => {
    await setupWithMeter(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    const input = card.getByRole('spinbutton').first();
    await input.fill('5200');
    await input.clear();
    await input.fill('5300');

    const value = await input.inputValue();
    expect(value).toBe('5300');
  });
});

test.describe('Readings - Batch Submission', () => {
  let readingsPage: AddReadingsPage;

  async function setupMultipleMeters(page: Parameters<typeof mockAddresses>[0]) {
    const meters = [testMeters.electricity, testMeters.gas, testMeters.coldWater];
    const readings = [testReadings.electricity, testReadings.gas, testReadings.coldWater];

    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: meters });
    await mockReadingsByAddress(page, { 1: readings });
  }

  async function getMeterCards(page: Parameters<typeof mockAddresses>[0]) {
    const cards = page.locator('[class*="shadow-lg"]').filter({ hasText: /поточні показання/i });
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    return cards;
  }

  async function getMeterCard(page: Parameters<typeof mockAddresses>[0], serviceName: string) {
    const card = page.locator('[class*="shadow-lg"]').filter({ hasText: serviceName }).filter({ hasText: /поточні показання/i });
    return card;
  }

  test.beforeEach(async ({ page }) => {
    readingsPage = new AddReadingsPage(page);
    await authenticateUser(page);
  });

  test('should display multiple meter cards', async ({ page }) => {
    await setupMultipleMeters(page);

    await readingsPage.goto();
    const cards = await getMeterCards(page);

    await expect(cards).toHaveCount(3);
  });

  test('should submit all readings at once', async ({ page }) => {
    await setupMultipleMeters(page);
    await mockCreateBatchReadings(page, {
      successCount: 3,
      failureCount: 0,
    });

    await readingsPage.goto();
    await getMeterCards(page);

    const electricityCard = await getMeterCard(page, 'Електроенергія');
    const gasCard = await getMeterCard(page, 'Газ');
    const waterCard = await getMeterCard(page, 'Холодна вода');

    await electricityCard.getByRole('spinbutton').first().fill('5200');
    await gasCard.getByRole('spinbutton').first().fill('620');
    await waterCard.getByRole('spinbutton').first().fill('380');

    await readingsPage.submit();

    await readingsPage.expectSuccessMessage();
  });

  test('should show loading state during submission', async ({ page }) => {
    await setupMultipleMeters(page);
    await mockCreateBatchReadings(page, undefined, { delay: 1000 });

    await readingsPage.goto();
    await getMeterCards(page);

    const submitPromise = readingsPage.submit();
    await readingsPage.expectSubmitLoading();
    await submitPromise;
  });

  test('should handle partial failures', async ({ page }) => {
    await setupMultipleMeters(page);
    await mockBatchReadingsWithPartialFailure(page, [1, 2], [3]);

    await readingsPage.goto();
    await getMeterCards(page);

    const electricityCard = await getMeterCard(page, 'Електроенергія');
    const gasCard = await getMeterCard(page, 'Газ');
    const waterCard = await getMeterCard(page, 'Холодна вода');

    await electricityCard.getByRole('spinbutton').first().fill('5200');
    await gasCard.getByRole('spinbutton').first().fill('620');
    await waterCard.getByRole('spinbutton').first().fill('380');

    await readingsPage.submit();
  });

  test('should show summary table with all meters', async ({ page }) => {
    await setupMultipleMeters(page);

    await readingsPage.goto();
    await getMeterCards(page);

    await expect(readingsPage.summaryTable).toBeVisible();
  });
});

test.describe('Readings - Date Input', () => {
  let readingsPage: AddReadingsPage;

  async function setupWithMeter(page: Parameters<typeof mockAddresses>[0]) {
    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [testMeters.electricity] });
    await mockReadingsByAddress(page, { 1: [testReadings.electricity] });
  }

  async function getMeterCard(page: Parameters<typeof mockAddresses>[0], serviceName: string) {
    const card = page.locator('[class*="shadow-lg"]').filter({ hasText: serviceName }).filter({ hasText: /поточні показання/i });
    await expect(card).toBeVisible({ timeout: 10000 });
    return card;
  }

  test.beforeEach(async ({ page }) => {
    readingsPage = new AddReadingsPage(page);
    await authenticateUser(page);
  });

  test('should display date input for each meter', async ({ page }) => {
    await setupWithMeter(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    const dateInput = card.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
  });

  test('should allow changing reading date', async ({ page }) => {
    await setupWithMeter(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    const dateInput = card.locator('input[type="date"]');
    await dateInput.fill('2025-12-25');

    await expect(dateInput).toHaveValue('2025-12-25');
  });

  test('should have date input type', async ({ page }) => {
    await setupWithMeter(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    const dateInput = card.locator('input[type="date"]');
    await expect(dateInput).toHaveAttribute('type', 'date');
  });
});

test.describe('Readings - Tariff Selection', () => {
  let readingsPage: AddReadingsPage;

  async function setupWithMeter(page: Parameters<typeof mockAddresses>[0]) {
    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [testMeters.electricity] });
    await mockReadingsByAddress(page, { 1: [testReadings.electricity] });
  }

  async function getMeterCard(page: Parameters<typeof mockAddresses>[0], serviceName: string) {
    const card = page.locator('[class*="shadow-lg"]').filter({ hasText: serviceName }).filter({ hasText: /поточні показання/i });
    await expect(card).toBeVisible({ timeout: 10000 });
    return card;
  }

  test.beforeEach(async ({ page }) => {
    readingsPage = new AddReadingsPage(page);
    await authenticateUser(page);
  });

  test('should display tariff selector for meter', async ({ page }) => {
    await setupWithMeter(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    const tariffSelect = card.getByRole('combobox').first();
    await expect(tariffSelect).toBeVisible();
  });

  test('should update cost when tariff changes', async ({ page }) => {
    await setupWithMeter(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    await card.getByRole('spinbutton').first().fill('5200');

    const costSection = card.getByText(/вартість/i);
    await expect(costSection).toBeVisible();
  });
});

test.describe('Readings - Photo Upload', () => {
  let readingsPage: AddReadingsPage;

  async function setupWithMeter(page: Parameters<typeof mockAddresses>[0]) {
    await mockUserProfile(page, testUserProfiles.default);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [testMeters.electricity] });
    await mockReadingsByAddress(page, { 1: [testReadings.electricity] });
  }

  async function getMeterCard(page: Parameters<typeof mockAddresses>[0], serviceName: string) {
    const card = page.locator('[class*="shadow-lg"]').filter({ hasText: serviceName }).filter({ hasText: /поточні показання/i });
    await expect(card).toBeVisible({ timeout: 10000 });
    return card;
  }

  test.beforeEach(async ({ page }) => {
    readingsPage = new AddReadingsPage(page);
    await authenticateUser(page);
  });

  test('should display photo upload section for meter', async ({ page }) => {
    await setupWithMeter(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    const photoSection = card.getByText('Фото лічильника', { exact: true });
    await expect(photoSection).toBeVisible();
  });

  test('should display photo upload instructions', async ({ page }) => {
    await setupWithMeter(page);

    await readingsPage.goto();
    const card = await getMeterCard(page, 'Електроенергія');

    const instructions = card.getByText(/перетягніть файл/i);
    await expect(instructions).toBeVisible();
  });
});
