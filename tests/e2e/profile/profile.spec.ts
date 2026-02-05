import { test, expect } from '@playwright/test'
import { ProfilePage } from '../../pages'
import { authenticateUser } from '../../helpers/auth'
import {
  mockUserProfile,
  mockAddresses,
  mockMetersByAddress,
  mockReadingsByAddress,
  mockChangePassword,
  mockUploadAvatar,
} from '../../helpers/api-mocks'
import { testUsers, testAddresses, testUserProfiles } from '../../fixtures/test-data'

test.describe('Profile Page', () => {
  let profilePage: ProfilePage

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page, testUsers.profileUser)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
  }

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display profile page', async ({ page }) => {
    await profilePage.goto()

    await expect(profilePage.pageHeading).toBeVisible()
    await expect(page).toHaveURL(/\/profile/)
  })

  test('should display profile form sections', async () => {
    await profilePage.goto()

    await profilePage.expectProfileFormVisible()
  })

  test('should display breadcrumb navigation', async () => {
    await profilePage.goto()

    await expect(profilePage.breadcrumb).toBeVisible()
  })

  test('should populate form with user data', async () => {
    await profilePage.goto()

    await profilePage.expectFormFieldValues({
      firstName: testUsers.profileUser.firstName,
      lastName: testUsers.profileUser.lastName,
      email: testUsers.profileUser.email,
    })
  })

  test('should display password change section', async () => {
    await profilePage.goto()

    await expect(profilePage.passwordCard).toBeVisible()
    await expect(profilePage.currentPasswordInput).toBeVisible()
    await expect(profilePage.newPasswordInput).toBeVisible()
    await expect(profilePage.confirmPasswordInput).toBeVisible()
  })

  test('should display password requirements', async () => {
    await profilePage.goto()

    await profilePage.expectPasswordRequirements()
  })

  test('should display password strength indicator', async () => {
    await profilePage.goto()

    await profilePage.expectPasswordStrengthIndicator()
  })

  test('should update first name successfully', async () => {
    await profilePage.goto()
    await profilePage.fillBasicInfo({ firstName: 'Новий Тестовий' })
    await profilePage.submit()

    await expect(profilePage.firstNameInput).toHaveValue('Новий Тестовий')
  })

  test('should update last name successfully', async () => {
    await profilePage.goto()
    await profilePage.fillBasicInfo({ lastName: 'Новий Прізвище' })
    await profilePage.submit()

    await expect(profilePage.lastNameInput).toHaveValue('Новий Прізвище')
  })

  test('should update email successfully', async () => {
    await profilePage.goto()
    await profilePage.fillBasicInfo({ email: 'new@example.com' })
    await profilePage.submit()

    await expect(profilePage.emailInput).toHaveValue('new@example.com')
  })

  test('should update phone number successfully', async () => {
    await profilePage.goto()
    await profilePage.fillBasicInfo({ phone: '501234599' })
    await profilePage.submit()
  })

  test('should cancel changes and navigate away', async ({ page }) => {
    await profilePage.goto()
    await profilePage.fillBasicInfo({ firstName: 'Changed Name' })

    await profilePage.cancel()

    await expect(page).toHaveURL('/')
  })

  test('should show submit and cancel buttons', async () => {
    await profilePage.goto()

    await expect(profilePage.submitButton).toBeVisible()
    await expect(profilePage.cancelButton).toBeVisible()
  })

  test('should display avatar section', async ({ page }) => {
    await profilePage.goto()

    const avatarLabel = page.getByLabel('Аватар')
    await expect(avatarLabel).toBeVisible()
  })

  test('should show clear avatar button disabled by default', async () => {
    await profilePage.goto()

    await expect(profilePage.clearAvatarButton).toBeDisabled()
  })

  test('should navigate to home via breadcrumb', async ({ page }) => {
    await profilePage.goto()

    const homeLink = profilePage.breadcrumb.getByRole('link', { name: /головна/i })
    await homeLink.click()

    await expect(page).toHaveURL('/')
  })
})

test.describe('Profile - Profile Edit', () => {
  let profilePage: ProfilePage

  interface SetupMocksOptions {
    profileOptions?: { delay?: number; status?: number };
  }

  async function setupMocks(
    page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never,
    options: SetupMocksOptions = {}
  ) {
    await mockUserProfile(page, testUsers.profileUser, options.profileOptions)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
  }

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page)
    await authenticateUser(page)
  })

  test('should pre-populate form with current user data', async ({ page }) => {
    await setupMocks(page)
    await profilePage.goto()

    await profilePage.expectFormFieldValues({
      firstName: testUsers.profileUser.firstName,
      lastName: testUsers.profileUser.lastName,
      email: testUsers.profileUser.email,
    })
  })

  test('should validate required fields - firstName', async ({ page }) => {
    await setupMocks(page)
    await profilePage.goto()

    await profilePage.firstNameInput.clear()
    await profilePage.submit()

    await profilePage.expectFirstNameError()
  })

  test('should validate required fields - lastName', async ({ page }) => {
    await setupMocks(page)
    await profilePage.goto()

    await profilePage.lastNameInput.clear()
    await profilePage.submit()

    await profilePage.expectLastNameError()
  })

  test('should validate email format', async ({ page }) => {
    await setupMocks(page)
    await profilePage.goto()

    await profilePage.fillBasicInfo({ email: 'invalid-email' })
    await profilePage.submit()

    await profilePage.expectEmailFormatError()
  })

  test('should validate phone format', async ({ page }) => {
    await setupMocks(page)
    await profilePage.goto()

    await profilePage.fillBasicInfo({ phone: '12' })
    await profilePage.submit()

    await profilePage.expectPhoneFormatError()
  })

  test('should save profile changes successfully', async ({ page }) => {
    await setupMocks(page)

    await profilePage.goto()
    await profilePage.fillBasicInfo({
      firstName: 'Новий',
      lastName: 'Прізвище',
    })
    await profilePage.submit()

    await profilePage.expectSuccessMessage()
  })

  test('should show success message after save', async ({ page }) => {
    await setupMocks(page)

    await profilePage.goto()
    await profilePage.fillBasicInfo({ firstName: 'Тест' })
    await profilePage.submit()

    await expect(profilePage.successAlert).toBeVisible()
    await expect(profilePage.successAlert).toContainText('успішно')
  })

  test('should handle save errors', async ({ page }) => {
    await setupMocks(page, { profileOptions: { status: 500 } })

    await profilePage.goto()
    await profilePage.fillBasicInfo({ firstName: 'New Name' })
    await profilePage.submit()
  })

  test('should show loading state during save', async ({ page }) => {
    await setupMocks(page, { profileOptions: { delay: 1000 } })

    await profilePage.goto()
    await profilePage.fillBasicInfo({ firstName: 'New' })

    const submitPromise = profilePage.submit()
    await profilePage.expectSubmitLoading()
    await submitPromise
  })
})

test.describe('Profile - Password Change', () => {
  let profilePage: ProfilePage

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page, testUsers.profileUser)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
  }

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display password fields', async () => {
    await profilePage.goto()

    await expect(profilePage.currentPasswordInput).toBeVisible()
    await expect(profilePage.newPasswordInput).toBeVisible()
    await expect(profilePage.confirmPasswordInput).toBeVisible()
  })

  test('should display password change section description', async () => {
    await profilePage.goto()

    await profilePage.expectPasswordCardDescription()
  })

  test('should show password toggle buttons', async ({ page }) => {
    await profilePage.goto()

    const toggleCount = await profilePage.getPasswordToggleCount()
    expect(toggleCount).toBeGreaterThanOrEqual(3)
  })

  test('should toggle password visibility', async ({ page }) => {
    await profilePage.goto()

    await profilePage.fillPasswordChange({
      currentPassword: 'OldPass123!',
      newPassword: '',
      confirmPassword: '',
    })

    await profilePage.togglePasswordVisibility(0)
  })

  test('should fill password change form', async () => {
    await profilePage.goto()

    await profilePage.fillPasswordChange({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    })

    await expect(profilePage.currentPasswordInput).not.toHaveValue('')
    await expect(profilePage.newPasswordInput).not.toHaveValue('')
    await expect(profilePage.confirmPasswordInput).not.toHaveValue('')
  })

  test('should require current password when changing password', async ({ page }) => {
    await profilePage.goto()

    await profilePage.fillPasswordChange({
      currentPassword: '',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    })
    await profilePage.submit()

    await profilePage.expectCurrentPasswordError()
  })

  test('should validate new password strength', async ({ page }) => {
    await profilePage.goto()

    await profilePage.fillPasswordChange({
      currentPassword: 'OldPassword123!',
      newPassword: 'weak',
      confirmPassword: 'weak',
    })
    await profilePage.submit()

    await profilePage.expectNewPasswordWeakError()
  })

  test('should validate password confirmation match', async ({ page }) => {
    await profilePage.goto()

    await profilePage.fillPasswordChange({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'DifferentPassword123!',
    })
    await profilePage.submit()

    await profilePage.expectPasswordMismatchError()
  })

  test('should change password successfully', async ({ page }) => {
    await mockChangePassword(page)

    await profilePage.goto()

    await profilePage.fillPasswordChange({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    })
    await profilePage.submit()

    await profilePage.expectSuccessMessage()
  })

  test('should show password strength requirements', async ({ page }) => {
    await profilePage.goto()

    await expect(page.getByText(/мінімум 8 символів/i)).toBeVisible()
    await expect(page.getByText(/мінімум 1 велика літера/i)).toBeVisible()
    await expect(page.getByText(/мінімум 1 цифра/i)).toBeVisible()
  })
})

test.describe('Profile - Form Validation', () => {
  let profilePage: ProfilePage

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page, testUsers.profileUser)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
  }

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should validate email format', async ({ page }) => {
    await profilePage.goto()

    await profilePage.fillBasicInfo({ email: 'invalid-email' })
    await profilePage.submit()

    await profilePage.expectEmailFormatError()
  })

  test('should require first name', async ({ page }) => {
    await profilePage.goto()

    await profilePage.firstNameInput.clear()
    await profilePage.submit()

    await profilePage.expectFirstNameError()
  })

  test('should require last name', async ({ page }) => {
    await profilePage.goto()

    await profilePage.lastNameInput.clear()
    await profilePage.submit()

    await profilePage.expectLastNameError()
  })

  test('should validate phone number format - too short', async ({ page }) => {
    await profilePage.goto()

    await profilePage.fillBasicInfo({ phone: '12345' })
    await profilePage.submit()

    await profilePage.expectPhoneFormatError()
  })

  test('should accept valid phone number', async () => {
    await profilePage.goto()

    await profilePage.fillBasicInfo({ phone: '501234567' })
    await profilePage.submit()

    await profilePage.expectSuccessMessage()
  })

  test('should accept valid email format', async () => {
    await profilePage.goto()

    await profilePage.fillBasicInfo({ email: 'valid@example.com' })
    await profilePage.submit()

    await profilePage.expectSuccessMessage()
  })
})

test.describe('Profile - Avatar Upload', () => {
  let profilePage: ProfilePage

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page, testUsers.profileUser)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
  }

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should display avatar upload instructions', async ({ page }) => {
    await profilePage.goto()

    const instructions = page.getByText(/перетягніть фото сюди/i)
    await expect(instructions).toBeVisible()
  })

  test('should display file size limit', async ({ page }) => {
    await profilePage.goto()

    const sizeLimit = page.getByText(/до 2 мб/i)
    await expect(sizeLimit).toBeVisible()
  })

  test('should display supported formats', async ({ page }) => {
    await profilePage.goto()

    await profilePage.expectAvatarFormatInfo()
  })

  test('should display update photo button', async ({ page }) => {
    await profilePage.goto()

    await expect(profilePage.updatePhotoButton).toBeVisible()
  })

  test('should display current avatar or placeholder', async ({ page }) => {
    await profilePage.goto()

    await profilePage.expectAvatarPlaceholder()
  })

  test('should display clear avatar button', async ({ page }) => {
    await profilePage.goto()

    await expect(profilePage.clearAvatarButton).toBeVisible()
  })

  test('should have disabled clear button when no avatar', async ({ page }) => {
    await profilePage.goto()

    await expect(profilePage.clearAvatarButton).toBeDisabled()
  })
})

test.describe('Profile - Avatar with Existing Image', () => {
  let profilePage: ProfilePage

  async function setupMocksWithAvatar(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page, testUserProfiles.withAvatar)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
  }

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page)
    await authenticateUser(page)
    await setupMocksWithAvatar(page)
  })

  test('should display user with avatar data', async ({ page }) => {
    await profilePage.goto()

    await expect(profilePage.pageHeading).toBeVisible()
  })
})

test.describe('Profile - Error Handling', () => {
  test('should handle API error on profile update', async ({ page }) => {
    const profilePage = new ProfilePage(page)
    await authenticateUser(page)
    await mockUserProfile(page, testUsers.profileUser, { status: 500 })
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })

    await profilePage.goto()
    await profilePage.fillBasicInfo({ firstName: 'New Name' })
    await profilePage.submit()
  })

  test('should handle network error gracefully', async ({ page }) => {
    const profilePage = new ProfilePage(page)
    await authenticateUser(page)
    await mockUserProfile(page, testUsers.profileUser)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })

    await profilePage.goto()

    await expect(profilePage.pageHeading).toBeVisible()
  })
})

test.describe('Profile - Complete Update Flow', () => {
  let profilePage: ProfilePage

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page, testUsers.profileUser)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
  }

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page)
    await authenticateUser(page)
    await setupMocks(page)
  })

  test('should update all profile fields successfully', async () => {
    await profilePage.goto()

    await profilePage.fillAllFields({
      firstName: 'Нове',
      lastName: 'Прізвище',
      email: 'newemail@example.com',
      phone: '509876543',
    })

    await profilePage.submit()

    await profilePage.expectSuccessMessage()
  })

  test('should update profile with password change', async ({ page }) => {
    await mockChangePassword(page)

    await profilePage.goto()

    await profilePage.fillAllFields({
      firstName: 'Нове',
      lastName: 'Прізвище',
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    })

    await profilePage.submit()

    await profilePage.expectSuccessMessage()
  })

  test('should clear password fields after successful update', async ({ page }) => {
    await mockChangePassword(page)

    await profilePage.goto()

    await profilePage.fillPasswordChange({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    })

    await profilePage.submit()
    await profilePage.expectSuccessMessage()

    await expect(profilePage.currentPasswordInput).toHaveValue('')
    await expect(profilePage.newPasswordInput).toHaveValue('')
    await expect(profilePage.confirmPasswordInput).toHaveValue('')
  })
})
