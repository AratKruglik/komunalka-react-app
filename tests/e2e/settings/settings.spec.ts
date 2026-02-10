import { test, expect } from '@playwright/test'
import { SettingsPage } from '../../pages'
import { authenticateUser } from '../../helpers/auth'
import {
  mockUserProfile,
  mockAddresses,
  mockMetersByAddress,
  mockReadingsByAddress,
  mockChangePassword,
} from '../../helpers/api-mocks'
import { testUsers, testAddresses } from '../../fixtures/test-data'

async function setupMocks(
  page: Parameters<Parameters<typeof test>[1]>[0]['page'],
  options: { profileOptions?: { delay?: number; status?: number } } = {}
) {
  await mockUserProfile(page, testUsers.profileUser, options.profileOptions)
  await mockAddresses(page, [testAddresses.primary])
  await mockMetersByAddress(page, { 1: [] })
  await mockReadingsByAddress(page, { 1: [] })
}

test.describe('Settings - Navigation', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display settings page with sidebar tabs', async () => {
    await settingsPage.goto()

    await expect(settingsPage.pageHeading).toBeVisible()
    await expect(settingsPage.sidebar).toBeVisible()
    await expect(settingsPage.getTabButton('profile')).toBeVisible()
    await expect(settingsPage.getTabButton('security')).toBeVisible()
    await expect(settingsPage.getTabButton('appearance')).toBeVisible()
    await expect(settingsPage.getTabButton('account')).toBeVisible()
  })

  test('should default to profile tab when accessing /settings', async () => {
    await settingsPage.goto()

    await settingsPage.expectTabActive('profile')
    await expect(settingsPage.firstNameInput).toBeVisible()
  })

  test('should switch tabs via sidebar clicks', async () => {
    await settingsPage.goto()

    await settingsPage.selectTab('security')
    await expect(settingsPage.currentPasswordInput).toBeVisible()

    await settingsPage.selectTab('appearance')
    await expect(settingsPage.themeRadioGroup).toBeVisible()

    await settingsPage.selectTab('account')
    await expect(settingsPage.exportButton).toBeVisible()

    await settingsPage.selectTab('profile')
    await expect(settingsPage.firstNameInput).toBeVisible()
  })

  test('should update URL when switching tabs', async ({ page }) => {
    await settingsPage.goto()

    await settingsPage.selectTab('security')
    await expect(page).toHaveURL(/tab=security/)

    await settingsPage.selectTab('appearance')
    await expect(page).toHaveURL(/tab=appearance/)

    await settingsPage.selectTab('account')
    await expect(page).toHaveURL(/tab=account/)
  })

  test('should navigate directly to a tab via URL query param', async () => {
    await settingsPage.gotoTab('security')

    await settingsPage.expectTabActive('security')
    await expect(settingsPage.currentPasswordInput).toBeVisible()
  })

  test('should redirect /profile to /settings?tab=profile', async ({ page }) => {
    await page.goto('/profile')

    await expect(page).toHaveURL(/\/settings\?tab=profile/)
    await expect(settingsPage.firstNameInput).toBeVisible()
  })
})

test.describe('Settings - Profile Tab', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display profile form with user data pre-filled', async () => {
    await settingsPage.gotoTab('profile')

    await settingsPage.expectFormFieldValues({
      firstName: testUsers.profileUser.firstName,
      lastName: testUsers.profileUser.lastName,
      email: testUsers.profileUser.email,
    })
  })

  test('should show validation errors for empty required fields', async () => {
    await settingsPage.gotoTab('profile')

    await settingsPage.firstNameInput.clear()
    await settingsPage.lastNameInput.clear()
    await settingsPage.submit()

    await expect(settingsPage.page.getByText("Ім'я обов'язкове")).toBeVisible()
    await expect(settingsPage.page.getByText("Прізвище обовʼязкове")).toBeVisible()
  })

  test('should save profile changes successfully', async () => {
    await settingsPage.gotoTab('profile')

    await settingsPage.fillBasicInfo({
      firstName: 'Нове',
      lastName: 'Прізвище',
    })
    await settingsPage.submit()

    await settingsPage.expectSuccessMessage()
  })
})

test.describe('Settings - Security Tab', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display password change section', async () => {
    await settingsPage.gotoTab('security')

    await expect(settingsPage.currentPasswordInput).toBeVisible()
    await expect(settingsPage.newPasswordInput).toBeVisible()
    await expect(settingsPage.confirmPasswordInput).toBeVisible()
  })

  test('should display connected accounts section', async () => {
    await settingsPage.gotoTab('security')

    await expect(settingsPage.connectedAccountsHeading).toBeVisible()
    await expect(settingsPage.page.getByText('Google')).toBeVisible()
    await expect(settingsPage.page.getByText('GitHub')).toBeVisible()
  })

  test('should show validation errors for password mismatch', async () => {
    await settingsPage.gotoTab('security')

    await settingsPage.fillPasswordChange({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'DifferentPassword123!',
    })
    await settingsPage.submit()

    await expect(settingsPage.page.getByText('Паролі не співпадають')).toBeVisible()
  })

  test('should change password successfully', async ({ page }) => {
    await mockChangePassword(page)

    await settingsPage.gotoTab('security')

    await settingsPage.fillPasswordChange({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    })
    await settingsPage.submit()

    await settingsPage.expectSuccessMessage()
  })
})

test.describe('Settings - Appearance Tab', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display theme selection cards', async () => {
    await settingsPage.gotoTab('appearance')

    await expect(settingsPage.themeRadioGroup).toBeVisible()
    await expect(settingsPage.getThemeCard('Світла')).toBeVisible()
    await expect(settingsPage.getThemeCard('Темна')).toBeVisible()
    await expect(settingsPage.getThemeCard('Системна')).toBeVisible()
  })

  test('should highlight the currently active theme', async () => {
    await settingsPage.gotoTab('appearance')

    const lightCard = settingsPage.getThemeCard('Світла')
    const darkCard = settingsPage.getThemeCard('Темна')
    const systemCard = settingsPage.getThemeCard('Системна')

    const lightChecked = await lightCard.getAttribute('aria-checked')
    const darkChecked = await darkCard.getAttribute('aria-checked')
    const systemChecked = await systemCard.getAttribute('aria-checked')

    const hasActiveTheme = [lightChecked, darkChecked, systemChecked].includes('true')
    expect(hasActiveTheme).toBe(true)
  })

  test('should switch theme when clicking a theme card', async () => {
    await settingsPage.gotoTab('appearance')

    await settingsPage.getThemeCard('Темна').click()
    await settingsPage.expectThemeSelected('Темна')

    await settingsPage.getThemeCard('Світла').click()
    await settingsPage.expectThemeSelected('Світла')
  })

  test('should display language selector', async () => {
    await settingsPage.gotoTab('appearance')

    await expect(settingsPage.languageSelect).toBeVisible()
    await expect(settingsPage.page.getByText('Наразі доступна лише українська мова')).toBeVisible()
  })
})

test.describe('Settings - Account Tab', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display export data button', async () => {
    await settingsPage.gotoTab('account')

    await expect(settingsPage.exportButton).toBeVisible()
  })

  test('should display delete account section in danger zone styling', async () => {
    await settingsPage.gotoTab('account')

    await expect(settingsPage.dangerZoneHeading).toBeVisible()
    await expect(settingsPage.deleteAccountButton).toBeVisible()
  })

  test('should show confirmation dialog when clicking delete', async () => {
    await settingsPage.gotoTab('account')

    await settingsPage.openDeleteConfirmation()

    await settingsPage.expectConfirmDialogVisible()
    await expect(settingsPage.page.getByText('Видалити акаунт?')).toBeVisible()
    await expect(settingsPage.confirmDeleteButton).toBeVisible()
  })

  test('should close confirmation dialog on cancel', async () => {
    await settingsPage.gotoTab('account')

    await settingsPage.openDeleteConfirmation()
    await settingsPage.expectConfirmDialogVisible()

    await settingsPage.cancelDeleteConfirmation()
    await settingsPage.expectConfirmDialogHidden()
  })
})
