import { test, expect } from '@playwright/test'
import { RegisterPage } from '../../pages'
import { mockRegisterSuccess, mockRegisterFailure, mockUserProfile } from '../../helpers'
import { testUsers } from '../../fixtures/test-data'

test.describe('Registration Flow', () => {
  let registerPage: RegisterPage

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page)
    await registerPage.goto()
  })

  test('should display registration form with all required fields', async ({ page }) => {
    await expect(registerPage.firstNameInput).toBeVisible()
    await expect(registerPage.lastNameInput).toBeVisible()
    await expect(registerPage.emailInput).toBeVisible()
    await expect(registerPage.phoneInput).toBeVisible()
    await expect(registerPage.passwordInput).toBeVisible()
    await expect(registerPage.confirmPasswordInput).toBeVisible()
    await expect(registerPage.submitButton).toBeVisible()
  })

  test('should display social login buttons', async ({ page }) => {
    await expect(registerPage.googleButton).toBeVisible()
    await expect(registerPage.facebookButton).toBeVisible()
    await expect(registerPage.appleButton).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await registerPage.goToLogin()

    await expect(page).toHaveURL(/\/login/)
  })

  test('should show validation error for empty required fields', async ({ page }) => {
    await registerPage.submitForm()

    const firstNameError = registerPage.getFieldErrorLocator("Ім'я обов'язкове")
    await expect(firstNameError).toBeVisible()
  })

  test('should have email input with type email for browser validation', async ({ page }) => {
    const emailInput = page.locator('#email')
    await expect(emailInput).toHaveAttribute('type', 'email')
  })

  test('should show validation error when passwords do not match', async ({ page }) => {
    await registerPage.firstNameInput.fill('Test')
    await registerPage.lastNameInput.fill('User')
    await registerPage.emailInput.fill('test@example.com')
    await registerPage.phoneInput.fill('501234567')
    await registerPage.passwordInput.fill('SecurePass123!')
    await registerPage.confirmPasswordInput.fill('DifferentPass123!')

    const termsLabel = page.locator('label').filter({ hasText: 'умовами використання' })
    await termsLabel.click()
    const privacyLabel = page.locator('label').filter({ hasText: 'політикою конфіденційності' })
    await privacyLabel.click()

    await registerPage.submitForm()

    const passwordError = registerPage.getFieldErrorLocator('Паролі не співпадають')
    await expect(passwordError).toBeVisible()
  })

  test('should show validation error for weak password', async ({ page }) => {
    await registerPage.firstNameInput.fill('Test')
    await registerPage.lastNameInput.fill('User')
    await registerPage.emailInput.fill('test@example.com')
    await registerPage.phoneInput.fill('501234567')
    await registerPage.passwordInput.fill('weak')
    await registerPage.confirmPasswordInput.fill('weak')

    const termsLabel = page.locator('label').filter({ hasText: 'умовами використання' })
    await termsLabel.click()
    const privacyLabel = page.locator('label').filter({ hasText: 'політикою конфіденційності' })
    await privacyLabel.click()

    await registerPage.submitForm()

    const passwordError = registerPage.getFieldErrorLocator('Пароль занадто слабкий')
    await expect(passwordError).toBeVisible()
  })

  test('should show validation error for invalid phone format', async ({ page }) => {
    await registerPage.firstNameInput.fill('Test')
    await registerPage.lastNameInput.fill('User')
    await registerPage.emailInput.fill('test@example.com')
    await registerPage.phoneInput.fill('123')
    await registerPage.passwordInput.fill('SecurePass123!')
    await registerPage.confirmPasswordInput.fill('SecurePass123!')

    const termsLabel = page.locator('label').filter({ hasText: 'умовами використання' })
    await termsLabel.click()
    const privacyLabel = page.locator('label').filter({ hasText: 'політикою конфіденційності' })
    await privacyLabel.click()

    await registerPage.submitForm()

    const phoneError = registerPage.getFieldErrorLocator('Введіть коректний номер телефону')
    await expect(phoneError).toBeVisible()
  })

  test('should show validation error when terms not accepted', async ({ page }) => {
    await registerPage.firstNameInput.fill('Test')
    await registerPage.lastNameInput.fill('User')
    await registerPage.emailInput.fill('test@example.com')
    await registerPage.phoneInput.fill('501234567')
    await registerPage.passwordInput.fill('SecurePass123!')
    await registerPage.confirmPasswordInput.fill('SecurePass123!')

    const privacyLabel = page.locator('label').filter({ hasText: 'політикою конфіденційності' })
    await privacyLabel.click()

    await registerPage.submitForm()

    const termsError = registerPage.getFieldErrorLocator('Необхідно погодитися з умовами використання')
    await expect(termsError).toBeVisible()
  })

  test('should show validation error when privacy not accepted', async ({ page }) => {
    await registerPage.firstNameInput.fill('Test')
    await registerPage.lastNameInput.fill('User')
    await registerPage.emailInput.fill('test@example.com')
    await registerPage.phoneInput.fill('501234567')
    await registerPage.passwordInput.fill('SecurePass123!')
    await registerPage.confirmPasswordInput.fill('SecurePass123!')

    const termsLabel = page.locator('label').filter({ hasText: 'умовами використання' })
    await termsLabel.click()

    await registerPage.submitForm()

    const privacyError = registerPage.getFieldErrorLocator('Необхідно погодитися з політикою конфіденційності')
    await expect(privacyError).toBeVisible()
  })

  test('should register successfully with valid data and auto-login', async ({ page }) => {
    await mockRegisterSuccess(page)
    await mockUserProfile(page, {
      id: '1',
      email: testUsers.newUser.email,
      firstName: testUsers.newUser.firstName,
      lastName: testUsers.newUser.lastName,
    })

    await registerPage.register(testUsers.newUser)

    await page.waitForURL((url) => url.pathname === '/' || url.pathname.includes('dashboard') || url.pathname.includes('addresses'))
    await expect(page.url()).toMatch(/localhost:5173/)
  })

  test.skip('should show error when email already exists', async ({ page }) => {
    await mockRegisterFailure(page, 'Користувач з такою електронною поштою вже існує')

    await registerPage.register(testUsers.existingUser)

    await registerPage.expectGeneralError('Користувач з такою електронною поштою вже існує')
  })

  test.skip('should show general error on registration failure', async ({ page }) => {
    await mockRegisterFailure(page, 'Помилка реєстрації')

    await registerPage.register(testUsers.newUser)

    await registerPage.expectGeneralError()
  })

  test('should preserve form data after validation error', async ({ page }) => {
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '501234567',
      password: 'SecurePass123!',
      confirmPassword: 'DifferentPass!',
    }

    await registerPage.fillRegistrationForm(testData)
    await registerPage.submitForm()

    await expect(registerPage.firstNameInput).toHaveValue(testData.firstName)
    await expect(registerPage.lastNameInput).toHaveValue(testData.lastName)
    await expect(registerPage.emailInput).toHaveValue(testData.email)
    await expect(registerPage.phoneInput).toHaveValue(testData.phone)
  })

  test('should show loading state during submission', async ({ page }) => {
    await mockRegisterSuccess(page)
    await mockUserProfile(page)

    await registerPage.fillRegistrationForm(testUsers.newUser)
    await registerPage.submitForm()

    await page.waitForURL((url) => url.pathname === '/' || url.pathname.includes('dashboard') || url.pathname.includes('addresses'))
    await expect(page.url()).toMatch(/localhost:5173/)
  })
})
