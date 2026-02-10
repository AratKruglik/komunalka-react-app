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
import { testUsers, testAddresses, testUserProfiles } from '../../fixtures/test-data'

async function setupMocks(
  page: Parameters<Parameters<typeof test>[1]>[0]['page'],
  options: { profileOptions?: { delay?: number; status?: number } } = {}
) {
  await mockUserProfile(page, testUsers.profileUser, options.profileOptions)
  await mockAddresses(page, [testAddresses.primary])
  await mockMetersByAddress(page, { 1: [] })
  await mockReadingsByAddress(page, { 1: [] })
}

test.describe('Profile via Settings', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should redirect /profile to /settings?tab=profile', async ({ page }) => {
    await page.goto('/profile')

    await expect(page).toHaveURL(/\/settings\?tab=profile/)
  })

  test('should display profile form with basic info card', async () => {
    await settingsPage.gotoTab('profile')

    await expect(settingsPage.firstNameInput).toBeVisible()
    await expect(settingsPage.lastNameInput).toBeVisible()
    await expect(settingsPage.emailInput).toBeVisible()
  })

  test('should populate form with user data', async () => {
    await settingsPage.gotoTab('profile')

    await settingsPage.expectFormFieldValues({
      firstName: testUsers.profileUser.firstName,
      lastName: testUsers.profileUser.lastName,
      email: testUsers.profileUser.email,
    })
  })

  test('should update first name successfully', async () => {
    await settingsPage.gotoTab('profile')
    await settingsPage.fillBasicInfo({ firstName: 'Новий Тестовий' })
    await settingsPage.submit()

    await expect(settingsPage.firstNameInput).toHaveValue('Новий Тестовий')
  })

  test('should update last name successfully', async () => {
    await settingsPage.gotoTab('profile')
    await settingsPage.fillBasicInfo({ lastName: 'Новий Прізвище' })
    await settingsPage.submit()

    await expect(settingsPage.lastNameInput).toHaveValue('Новий Прізвище')
  })

  test('should update email successfully', async () => {
    await settingsPage.gotoTab('profile')
    await settingsPage.fillBasicInfo({ email: 'new@example.com' })
    await settingsPage.submit()

    await expect(settingsPage.emailInput).toHaveValue('new@example.com')
  })

  test('should update phone number successfully', async () => {
    await settingsPage.gotoTab('profile')
    await settingsPage.fillBasicInfo({ phone: '501234599' })
    await settingsPage.submit()
  })

  test('should show submit button', async () => {
    await settingsPage.gotoTab('profile')

    await expect(settingsPage.submitButton).toBeVisible()
  })

  test('should display avatar section', async ({ page }) => {
    await settingsPage.gotoTab('profile')

    const avatarLabel = page.getByLabel('Аватар')
    await expect(avatarLabel).toBeVisible()
  })
})

test.describe('Profile - Edit Validation', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should validate required fields - firstName', async () => {
    await settingsPage.gotoTab('profile')

    await settingsPage.firstNameInput.clear()
    await settingsPage.submit()

    await expect(settingsPage.page.getByText("Ім'я обов'язкове")).toBeVisible()
  })

  test('should validate required fields - lastName', async () => {
    await settingsPage.gotoTab('profile')

    await settingsPage.lastNameInput.clear()
    await settingsPage.submit()

    await expect(settingsPage.page.getByText('Прізвище обовʼязкове')).toBeVisible()
  })

  test('should validate email format', async () => {
    await settingsPage.gotoTab('profile')

    await settingsPage.fillBasicInfo({ email: 'invalid-email' })
    await settingsPage.submit()

    await expect(settingsPage.page.getByText('Невірний формат електронної пошти')).toBeVisible()
  })

  test('should validate phone format', async () => {
    await settingsPage.gotoTab('profile')

    await settingsPage.fillBasicInfo({ phone: '12' })
    await settingsPage.submit()

    await expect(settingsPage.page.getByText('Введіть коректний номер телефону (9 цифр)')).toBeVisible()
  })

  test('should save profile changes successfully', async () => {
    await settingsPage.gotoTab('profile')

    await settingsPage.fillBasicInfo({
      firstName: 'Новий',
      lastName: 'Прізвище',
    })
    await settingsPage.submit()

    await settingsPage.expectSuccessMessage()
  })

  test('should show success message after save', async () => {
    await settingsPage.gotoTab('profile')

    await settingsPage.fillBasicInfo({ firstName: 'Тест' })
    await settingsPage.submit()

    await expect(settingsPage.successAlert).toBeVisible()
    await expect(settingsPage.successAlert).toContainText('успішно')
  })

  test('should handle save errors', async ({ page }) => {
    await mockUserProfile(page, testUsers.profileUser, { status: 500 })
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })

    await settingsPage.gotoTab('profile')
    await settingsPage.fillBasicInfo({ firstName: 'New Name' })
    await settingsPage.submit()
  })
})

test.describe('Profile - Password Change via Security Tab', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display password fields in security tab', async () => {
    await settingsPage.gotoTab('security')

    await expect(settingsPage.currentPasswordInput).toBeVisible()
    await expect(settingsPage.newPasswordInput).toBeVisible()
    await expect(settingsPage.confirmPasswordInput).toBeVisible()
  })

  test('should validate password confirmation match', async () => {
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

test.describe('Profile - Avatar Upload', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display avatar upload instructions', async ({ page }) => {
    await settingsPage.gotoTab('profile')

    const instructions = page.getByText(/перетягніть фото сюди/i)
    await expect(instructions).toBeVisible()
  })

  test('should display file size limit', async ({ page }) => {
    await settingsPage.gotoTab('profile')

    const sizeLimit = page.getByText(/до 2 мб/i)
    await expect(sizeLimit).toBeVisible()
  })

  test('should display supported formats', async ({ page }) => {
    await settingsPage.gotoTab('profile')

    await expect(page.getByText(/jpg.*png.*heic/i)).toBeVisible()
  })
})

test.describe('Profile - Avatar with Existing Image', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page)
    await authenticateUser(page)
    await mockUserProfile(page, testUserProfiles.withAvatar)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
  })

  test('should display settings page with avatar user data', async () => {
    await settingsPage.gotoTab('profile')

    await expect(settingsPage.pageHeading).toBeVisible()
  })
})

test.describe('Profile - Complete Update Flow', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should update all profile fields successfully', async () => {
    await settingsPage.gotoTab('profile')

    await settingsPage.fillBasicInfo({
      firstName: 'Нове',
      lastName: 'Прізвище',
      email: 'newemail@example.com',
      phone: '509876543',
    })

    await settingsPage.submit()

    await settingsPage.expectSuccessMessage()
  })
})
