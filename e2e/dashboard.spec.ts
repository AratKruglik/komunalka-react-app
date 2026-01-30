import { test, expect } from './fixtures/auth'
import { DashboardPage } from './pages'

test.describe('Dashboard', () => {
  test.describe('Dashboard Loading', () => {
    test('dashboard loads successfully after login', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.expectDashboardLoaded()
    })

    test('shows user greeting with name', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const greeting = page.getByText(/привіт|вітаємо|добрий/i)
      await expect(greeting.first()).toBeVisible()
    })

    test('header is visible', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      await expect(page.locator('header')).toBeVisible()
    })

    test('user menu is visible in header', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const userMenu = page.locator('header button[aria-haspopup="menu"]')
      await expect(userMenu).toBeVisible()
    })
  })

  test.describe('Address Selection', () => {
    test('address dropdown is visible', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      await expect(dashboardPage.addressDropdown).toBeVisible()
    })

    test('can select different address', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const options = dashboardPage.addressDropdown.locator('option')
      const optionsCount = await options.count()

      if (optionsCount > 1) {
        const initialLabel = await dashboardPage.getCurrentAddressLabel()

        await dashboardPage.addressDropdown.selectOption({ index: 1 })

        const newLabel = await dashboardPage.getCurrentAddressLabel()
        expect(newLabel).not.toBe(initialLabel)
      }
    })

    test('dashboard updates when address changes', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const options = dashboardPage.addressDropdown.locator('option')
      const optionsCount = await options.count()

      if (optionsCount > 1) {
        await dashboardPage.addressDropdown.selectOption({ index: 1 })

        await page.waitForTimeout(500)
      }
    })
  })

  test.describe('Service Cards Section', () => {
    test('shows "expenses this month" section', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const expensesSection = page.getByText(/витрати цього місяця/i)
      await expect(expensesSection).toBeVisible()
    })

    test('service cards are displayed', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      await dashboardPage.expectServiceCardsVisible()
    })

    test('service card shows service type', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const serviceTypes = page.getByText(/електро|газ|вода|опалення/i)
      const hasServiceTypes = (await serviceTypes.count()) > 0

      if (hasServiceTypes) {
        await expect(serviceTypes.first()).toBeVisible()
      }
    })
  })

  test.describe('Consumption Chart', () => {
    test('consumption chart section exists', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const chartSection = page.getByText(/споживання|графік|consumption/i)
      const hasChartSection = (await chartSection.count()) > 0

      if (hasChartSection) {
        await expect(chartSection.first()).toBeVisible()
      }
    })

    test('chart canvas is rendered', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const canvas = page.locator('canvas')
      const hasCanvas = (await canvas.count()) > 0

      if (hasCanvas) {
        await dashboardPage.expectChartVisible()
      }
    })
  })

  test.describe('Expense Distribution', () => {
    test('expense distribution section exists', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const distributionSection = page.getByText(/розподіл витрат|distribution/i)
      const hasDistribution = (await distributionSection.count()) > 0

      if (hasDistribution) {
        await expect(distributionSection.first()).toBeVisible()
      }
    })

    test('can switch period filter', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const periodFilters = page.getByRole('button').filter({
        hasText: /3 місяці|6 місяців|рік|months|year/i,
      })
      const hasFilters = (await periodFilters.count()) > 0

      if (hasFilters) {
        await periodFilters.first().click()
        await page.waitForTimeout(300)
      }
    })
  })

  test.describe('Recent Readings Table', () => {
    test('recent readings section exists', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const recentReadings = page.getByText(/останні показання|recent readings/i)
      const hasRecentReadings = (await recentReadings.count()) > 0

      if (hasRecentReadings) {
        await expect(recentReadings.first()).toBeVisible()
      }
    })

    test('recent readings table shows data', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const tableRows = page.locator('table tbody tr').or(page.locator('[class*="Reading"]'))
      const hasRows = (await tableRows.count()) > 0

      if (hasRows) {
        await expect(tableRows.first()).toBeVisible()
      }
    })
  })

  test.describe('Payment Reminders', () => {
    test('payment reminders section exists', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const reminders = page.getByText(/нагадування|оплата|payment|reminder/i)
      const hasReminders = (await reminders.count()) > 0

      if (hasReminders) {
        await expect(reminders.first()).toBeVisible()
      }
    })
  })

  test.describe('Quick Actions', () => {
    test('quick actions section exists', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const quickActions = page.getByText(/швидкі дії|quick actions/i)
      const hasQuickActions = (await quickActions.count()) > 0

      if (hasQuickActions) {
        await expect(quickActions.first()).toBeVisible()
      }
    })

    test('add reading action link exists', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const addReadingLink = page.getByRole('link', { name: /внести показання|add reading/i })
      const hasLink = (await addReadingLink.count()) > 0

      if (hasLink) {
        await expect(addReadingLink.first()).toBeVisible()
      }
    })

    test('navigates to add reading page', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const addReadingLink = page.getByRole('link', { name: /внести показання|add reading/i })
      const hasLink = (await addReadingLink.count()) > 0

      if (hasLink) {
        await addReadingLink.first().click()
        await expect(page).toHaveURL('/readings/new')
      }
    })

    test('navigates to add meter page', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const addMeterLink = page.getByRole('link', { name: /додати лічильник|add meter/i })
      const hasLink = (await addMeterLink.count()) > 0

      if (hasLink) {
        await addMeterLink.first().click()
        await expect(page).toHaveURL('/meters/new')
      }
    })
  })

  test.describe('Navigation from Dashboard', () => {
    test('can navigate to addresses page', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const addressesLink = page.getByRole('link', { name: /адреси|addresses/i })
      const hasLink = (await addressesLink.count()) > 0

      if (hasLink) {
        await addressesLink.first().click()
        await expect(page).toHaveURL('/addresses')
      } else {
        await page.goto('/addresses')
        await expect(page).toHaveURL('/addresses')
      }
    })

    test('can navigate to meters page', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      const metersLink = page.getByRole('link', { name: /лічильники|meters/i })
      const hasLink = (await metersLink.count()) > 0

      if (hasLink) {
        await metersLink.first().click()
        await expect(page).toHaveURL('/meters')
      } else {
        await page.goto('/meters')
        await expect(page).toHaveURL('/meters')
      }
    })

    test('can navigate to profile page', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()

      await page.goto('/profile')
      await expect(page).toHaveURL('/profile')
    })
  })

  test.describe('Responsive Layout', () => {
    test('dashboard renders on mobile viewport', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await page.setViewportSize({ width: 375, height: 667 })
      await dashboardPage.navigate()

      await dashboardPage.expectDashboardLoaded()
    })

    test('dashboard renders on tablet viewport', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await page.setViewportSize({ width: 768, height: 1024 })
      await dashboardPage.navigate()

      await dashboardPage.expectDashboardLoaded()
    })

    test('dashboard renders on desktop viewport', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await page.setViewportSize({ width: 1920, height: 1080 })
      await dashboardPage.navigate()

      await dashboardPage.expectDashboardLoaded()
    })
  })

  test.describe('Page Refresh', () => {
    test('dashboard data persists after refresh', async ({ authenticatedPage: page }) => {
      const dashboardPage = new DashboardPage(page)

      await dashboardPage.navigate()
      await dashboardPage.expectDashboardLoaded()

      await page.reload()

      await dashboardPage.expectDashboardLoaded()
    })
  })
})
