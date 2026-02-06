import { test, expect } from '@playwright/test'
import { ProvidersPage, AddProviderPage } from '../../pages'
import { authenticateUser } from '../../helpers/auth'
import {
  mockUserProfile,
  mockProviders,
  mockCreateProvider,
  mockAddresses,
  mockMetersByAddress,
  mockReadingsByAddress,
  mockUtilityTypes,
} from '../../helpers/api-mocks'
import { testProviders, testNewProvider, testAddresses } from '../../fixtures/test-data'

test.describe('Providers List', () => {
  let providersPage: ProvidersPage

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page)
    await mockProviders(page, testProviders)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
  }

  test.beforeEach(async ({ page }) => {
    providersPage = new ProvidersPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display providers page', async ({ page }) => {
    await providersPage.goto()

    await providersPage.expectPageVisible()
    await expect(page).toHaveURL(/\/providers/)
  })

  test('should display page title and subtitle', async () => {
    await providersPage.goto()

    await expect(providersPage.pageHeading).toBeVisible()
    await expect(providersPage.pageSubtitle).toBeVisible()
  })

  test('should display add provider button', async () => {
    await providersPage.goto()

    await expect(providersPage.addProviderButton).toBeVisible()
  })

  test('should display providers journal heading', async () => {
    await providersPage.goto()

    await expect(providersPage.journalHeading).toBeVisible()
  })

  test('should display whats next info section', async () => {
    await providersPage.goto()

    await expect(providersPage.whatsNextInfo).toBeVisible()
  })

  test('should display security info section', async () => {
    await providersPage.goto()

    await expect(providersPage.securityInfo).toBeVisible()
  })

  test('should display electricity provider YASNO', async () => {
    await providersPage.goto()

    await providersPage.expectProviderVisible('YASNO')
  })

  test('should display gas provider Київгаз', async () => {
    await providersPage.goto()

    await providersPage.expectProviderVisible('Київгаз')
  })

  test('should display water provider Київводоканал', async () => {
    await providersPage.goto()

    await providersPage.expectProviderVisible('Київводоканал')
  })

  test('should display heating provider Київтеплоенерго', async () => {
    await providersPage.goto()

    await providersPage.expectProviderVisible('Київтеплоенерго')
  })

  test('should display provider tariff names', async () => {
    await providersPage.goto()

    const card = await providersPage.getProviderCard('YASNO')
    await expect(card).toContainText('Денний')
    await expect(card).toContainText('Нічний')
  })

  test('should display tariff name for single-tariff provider', async () => {
    await providersPage.goto()

    const card = await providersPage.getProviderCard('Київгаз')
    await expect(card).toContainText('Побутовий')
  })

  test('should display edit button for provider', async () => {
    await providersPage.goto()

    const editButton = await providersPage.getEditButton('YASNO')
    await expect(editButton).toBeVisible()
  })

  test('should display delete button for provider', async () => {
    await providersPage.goto()

    const deleteButton = await providersPage.getDeleteButton('YASNO')
    await expect(deleteButton).toBeVisible()
  })

  test('should display provider website link', async () => {
    await providersPage.goto()

    await providersPage.expectProviderWebsiteLink('YASNO', 'https://yasno.com.ua')
  })

  test('should navigate to add provider page', async ({ page }) => {
    await providersPage.goto()

    await providersPage.clickAddProvider()

    await expect(page).toHaveURL(/\/providers\/new/)
  })
})

test.describe('Provider Card Actions', () => {
  let providersPage: ProvidersPage

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page)
    await mockProviders(page, testProviders)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
  }

  test.beforeEach(async ({ page }) => {
    providersPage = new ProvidersPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should click edit button on provider card', async () => {
    await providersPage.goto()

    await providersPage.clickEditProvider('YASNO')
  })

  test('should click delete button on provider card', async () => {
    await providersPage.goto()

    await providersPage.clickDeleteProvider('YASNO')
  })

  test('should display provider description', async () => {
    await providersPage.goto()

    const card = await providersPage.getProviderCard('YASNO')
    await expect(card).toContainText('Постачальник електроенергії')
  })

  test('should display tariff prices', async () => {
    await providersPage.goto()

    const card = await providersPage.getProviderCard('YASNO')
    await expect(card).toContainText('4.32')
    await expect(card).toContainText('2.64')
  })

  test('should display tariff currency and unit', async () => {
    await providersPage.goto()

    const card = await providersPage.getProviderCard('YASNO')
    await expect(card).toContainText('₴/кВт·год')
  })
})

test.describe('Add Provider', () => {
  let addProviderPage: AddProviderPage

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page)
    await mockProviders(page, testProviders)
    await mockCreateProvider(page)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
    await mockUtilityTypes(page)
  }

  test.beforeEach(async ({ page }) => {
    addProviderPage = new AddProviderPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display add provider form', async () => {
    await addProviderPage.goto()

    await addProviderPage.expectFormVisible()
  })

  test('should display breadcrumb navigation', async () => {
    await addProviderPage.goto()

    await addProviderPage.expectBreadcrumbVisible()
  })

  test('should display provider name input', async () => {
    await addProviderPage.goto()

    await expect(addProviderPage.nameInput).toBeVisible()
  })

  test('should fill provider form', async () => {
    await addProviderPage.goto()

    await addProviderPage.fillProviderForm({
      name: testNewProvider.name,
      website: testNewProvider.website,
      description: testNewProvider.description,
    })

    await expect(addProviderPage.nameInput).toHaveValue(testNewProvider.name)
  })

  test('should fill tariff name and rate', async () => {
    await addProviderPage.goto()

    const tariff = testNewProvider.tariffs[0]
    await addProviderPage.fillTariff(0, {
      name: tariff.name,
      baseRate: tariff.price,
    })

    await expect(addProviderPage.getTariffNameInput(0)).toHaveValue(tariff.name)
    await expect(addProviderPage.getTariffBaseRateInput(0)).toHaveValue(tariff.price)
  })

  test('should add second tariff to provider', async () => {
    await addProviderPage.goto()

    await addProviderPage.addTariff('Нічний', '2.64')

    await expect(addProviderPage.getTariffNameInput(1)).toHaveValue('Нічний')
    await expect(addProviderPage.getTariffBaseRateInput(1)).toHaveValue('2.64')
  })

  test('should cancel form and return to providers list', async ({ page }) => {
    await addProviderPage.goto()

    await addProviderPage.cancel()

    await expect(page).toHaveURL(/\/providers$/)
  })

  test('should submit valid provider form', async ({ page }) => {
    await addProviderPage.goto()

    await addProviderPage.selectUtilityType('Електроенергія')
    await addProviderPage.fillProviderForm({
      name: testNewProvider.name,
    })
    await addProviderPage.fillTariff(0, {
      name: 'Базовий',
      baseRate: '5.00',
    })
    await addProviderPage.submit()

    await expect(page).toHaveURL(/\/providers$/)
  })

  test('should create provider with day/night tariffs', async ({ page }) => {
    await addProviderPage.goto()

    await addProviderPage.selectUtilityType('Електроенергія')
    await addProviderPage.fillProviderForm({
      name: 'Тестовий провайдер',
      website: 'https://test-provider.ua',
    })

    await addProviderPage.fillTariff(0, {
      name: 'Денний',
      baseRate: '4.32',
    })

    await addProviderPage.addTariff('Нічний', '2.64')

    await expect(addProviderPage.getTariffNameInput(0)).toHaveValue('Денний')
    await expect(addProviderPage.getTariffBaseRateInput(0)).toHaveValue('4.32')

    await expect(addProviderPage.getTariffNameInput(1)).toHaveValue('Нічний')
    await expect(addProviderPage.getTariffBaseRateInput(1)).toHaveValue('2.64')

    await addProviderPage.submit()

    await expect(page).toHaveURL(/\/providers$/)
  })
})

test.describe('Providers - Empty State', () => {
  test('should display empty state when no custom providers', async ({ page }) => {
    const providersPage = new ProvidersPage(page)
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockProviders(page, [])
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })

    await providersPage.goto()

    await providersPage.expectPageVisible()
    await expect(providersPage.addProviderButton).toBeVisible()
  })
})

test.describe('Providers - Navigation', () => {
  test('should navigate via sidebar', async ({ page }) => {
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockProviders(page, testProviders)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const providersLink = page.getByRole('link', { name: /провайдери/i })
    await providersLink.click()

    await expect(page).toHaveURL(/\/providers/)
  })
})

test.describe('Providers - Provider Details', () => {
  let providersPage: ProvidersPage

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page)
    await mockProviders(page, testProviders)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
  }

  test.beforeEach(async ({ page }) => {
    providersPage = new ProvidersPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display provider count for address', async ({ page }) => {
    await providersPage.goto()

    const providerCount = page.getByText(/4 провайдерів/i).first()
    await expect(providerCount).toBeVisible()
  })

  test('should display all tariffs for multi-tariff provider', async () => {
    await providersPage.goto()

    const card = await providersPage.getProviderCard('Київводоканал')
    await expect(card).toContainText('Водопостачання')
    await expect(card).toContainText('Водовідведення')
  })

  test('should display provider external website link', async ({ page }) => {
    await providersPage.goto()

    const link = page.getByRole('link', { name: /yasno\.com\.ua/i })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', 'https://yasno.com.ua')
  })

  test('should display address for provider group', async ({ page }) => {
    await providersPage.goto()

    await expect(page.getByText('вул. Хрещатик')).toBeVisible()
  })
})
