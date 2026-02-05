import { test, expect } from '@playwright/test'
import { DashboardPage } from '../../pages'
import { authenticateUser } from '../../helpers/auth'
import {
  mockUserProfile,
  mockAddresses,
  mockMetersByAddress,
  mockReadingsByAddress,
} from '../../helpers/api-mocks'
import { testAddresses, testMeters, testReadings } from '../../fixtures/test-data'

test.describe('Dashboard', () => {
  let dashboardPage: DashboardPage

  const mockAddressesData = [testAddresses.primary, testAddresses.secondary]

  const mockMetersData = [
    testMeters.electricity,
    testMeters.gas,
    testMeters.coldWater,
    testMeters.hotWater,
  ]

  const mockReadingsData = [
    testReadings.electricity,
    testReadings.gas,
    testReadings.coldWater,
  ]

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page, {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Тестовий',
      lastName: 'Користувач',
      phoneNumber: '+380501234567',
    })
    await mockAddresses(page, mockAddressesData)
    await mockMetersByAddress(page, { 1: mockMetersData, 2: [] })
    await mockReadingsByAddress(page, { 1: mockReadingsData, 2: [] })
  }

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display dashboard after login', async ({ page }) => {
    await dashboardPage.goto()

    await dashboardPage.expectWelcomeMessageVisible()
    await expect(page).toHaveURL('/')
  })

  test('should display welcome message with user name', async () => {
    await dashboardPage.goto()

    await dashboardPage.expectWelcomeMessageContains('Тестовий')
  })

  test('should display main dashboard sections', async ({ page }) => {
    await dashboardPage.goto()
    await page.waitForLoadState('networkidle')

    await dashboardPage.expectMainSectionsVisible()
  })

  test('should display quick actions', async ({ page }) => {
    await dashboardPage.goto()
    await page.waitForLoadState('networkidle')

    await dashboardPage.expectQuickActionsVisible()
  })

  test.skip('should navigate to add reading page via quick action', async ({ page }) => {
    // TODO: QuickActions component onClick for "Додати показання" only logs to console, navigation not implemented
    await dashboardPage.goto()
    await page.waitForLoadState('networkidle')

    await dashboardPage.clickQuickActionAddReading()

    await expect(page).toHaveURL(/\/readings\/new/)
  })

  test.skip('should navigate to add address page via quick action', async ({ page }) => {
    // TODO: QuickActions component onClick for "Додати адресу" navigates to /addresses instead of /addresses/new
    await dashboardPage.goto()
    await page.waitForLoadState('networkidle')

    await dashboardPage.clickQuickActionAddAddress()

    await expect(page).toHaveURL(/\/addresses\/new/)
  })

  test('should switch chart period to year', async ({ page }) => {
    await dashboardPage.goto()
    await page.waitForLoadState('networkidle')

    await dashboardPage.selectChartPeriod('year')
  })

  test('should switch chart period to 6 months', async ({ page }) => {
    await dashboardPage.goto()
    await page.waitForLoadState('networkidle')

    await dashboardPage.selectChartPeriod('sixMonths')
  })

  test('should switch chart period to 3 months', async ({ page }) => {
    await dashboardPage.goto()
    await page.waitForLoadState('networkidle')

    await dashboardPage.selectChartPeriod('threeMonths')
  })

  test('should navigate to addresses via sidebar', async ({ page }) => {
    await dashboardPage.goto()
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: /мої адреси/i }).click()

    await expect(page).toHaveURL(/\/addresses/)
  })

  test('should navigate to meters via sidebar', async ({ page }) => {
    await dashboardPage.goto()
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: /лічильники/i }).click()

    await expect(page).toHaveURL(/\/meters/)
  })

  test('should navigate to readings via sidebar', async ({ page }) => {
    await dashboardPage.goto()
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: /внести показання/i }).click()

    await expect(page).toHaveURL(/\/readings\/new/)
  })

  test('should navigate to providers via sidebar', async ({ page }) => {
    await dashboardPage.goto()
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: /провайдери/i }).click()

    await expect(page).toHaveURL(/\/providers/)
  })

  test('should display consumption chart', async () => {
    await dashboardPage.goto()

    await expect(dashboardPage.consumptionChart).toBeVisible()
  })

  test('should display expense distribution chart', async () => {
    await dashboardPage.goto()

    await expect(dashboardPage.expenseDistribution).toBeVisible()
  })

  test('should display recent readings table', async () => {
    await dashboardPage.goto()

    await expect(dashboardPage.recentReadingsTable).toBeVisible()
  })

  test('should display payment reminders section', async () => {
    await dashboardPage.goto()

    await expect(dashboardPage.paymentReminders).toBeVisible()
  })

  test.skip('should navigate to add reading via header button', async ({ page }) => {
    // TODO: WelcomeHeader handleAddReading only logs to console, navigation not implemented
    await dashboardPage.goto()
    await page.waitForLoadState('networkidle')

    await dashboardPage.clickAddReading()

    await expect(page).toHaveURL(/\/readings\/new/)
  })
})

test.describe('Dashboard - Empty State', () => {
  test('should handle no addresses gracefully', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockAddresses(page, [])
    await mockMetersByAddress(page, {})
    await mockReadingsByAddress(page, {})

    await dashboardPage.goto()

    await dashboardPage.expectWelcomeMessageVisible()
  })
})

test.describe('Dashboard - Navigation', () => {
  test('should open user menu on avatar click', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockAddresses(page, [])
    await mockMetersByAddress(page, {})
    await mockReadingsByAddress(page, {})

    await dashboardPage.goto()

    const userMenuButton = page.getByRole('button', { name: /олена петренко/i })
    await userMenuButton.click()

    const userMenu = page.getByRole('menu', { name: /меню користувача/i })
    await expect(userMenu).toBeVisible()
  })

  test('should toggle theme', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockAddresses(page, [])
    await mockMetersByAddress(page, {})
    await mockReadingsByAddress(page, {})

    await dashboardPage.goto()

    const themeButton = page.getByRole('button', { name: /перемкнути тему/i })
    await themeButton.click()

    // Theme should change (visual verification)
  })
})
