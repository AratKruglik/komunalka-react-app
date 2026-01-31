import { test, expect } from '@playwright/test'
import { LoginPage } from './pages'
import { loginAsTestUser, validateTestCredentials } from './fixtures/auth'
import { InvalidCredentials, ValidationErrors } from './fixtures/test-data'

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD

test.describe('Authentication', () => {
  test.beforeEach(() => {
    validateTestCredentials()
  })

  test.describe('Login Flow', () => {
    test('successful login with valid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()
      await loginPage.expectOnLoginPage()

      await loginPage.login(TEST_USER_EMAIL!, TEST_USER_PASSWORD!)
      await loginPage.expectLoginSuccess()

      const userMenu = page.locator('header button[aria-haspopup="menu"]')
      await expect(userMenu).toBeVisible()
    })

    test('login with "remember me" option', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()
      await loginPage.login(TEST_USER_EMAIL!, TEST_USER_PASSWORD!, true)
      await loginPage.expectLoginSuccess()
    })

    test('shows error for invalid email', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()
      await loginPage.login(InvalidCredentials.email, InvalidCredentials.password)

      await loginPage.expectGeneralError(/помилка|invalid|невірн/i)
    })

    test('shows error for wrong password', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()
      await loginPage.login(TEST_USER_EMAIL!, 'wrongpassword123')

      await loginPage.expectGeneralError(/помилка|invalid|невірн/i)
    })

    test('shows validation error for empty email', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()
      await loginPage.passwordInput.fill('somepassword')
      await loginPage.loginButton.click()

      await loginPage.expectEmailError(ValidationErrors.emptyEmail)
    })

    test('shows validation error for invalid email format', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()
      await loginPage.emailInput.fill('invalid-email')
      await loginPage.passwordInput.fill('somepassword')
      await loginPage.loginButton.click()

      await loginPage.expectEmailError(ValidationErrors.invalidEmail)
    })

    test('shows validation error for empty password', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()
      await loginPage.emailInput.fill('test@example.com')
      await loginPage.loginButton.click()

      await loginPage.expectPasswordError(ValidationErrors.emptyPassword)
    })

    test('shows validation error for short password', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()
      await loginPage.emailInput.fill('test@example.com')
      await loginPage.passwordInput.fill('12345')
      await loginPage.loginButton.click()

      await loginPage.expectPasswordError(ValidationErrors.shortPassword)
    })

    test('password visibility toggle works', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()
      await loginPage.passwordInput.fill('testpassword')

      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password')

      const toggleButton = page.getByRole('button', { name: /показати пароль/i })
      await toggleButton.click()

      await expect(loginPage.passwordInput).toHaveAttribute('type', 'text')

      const hideButton = page.getByRole('button', { name: /приховати пароль/i })
      await hideButton.click()

      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password')
    })
  })

  test.describe('Logout Flow', () => {
    test('successful logout', async ({ page }) => {
      await loginAsTestUser(page)

      await page.goto('/logout')

      await expect(page).toHaveURL('/login')

      const loginButton = page.getByRole('button', { name: 'Увійти' })
      await expect(loginButton).toBeVisible()
    })

    test('user cannot access protected routes after logout', async ({ page }) => {
      await loginAsTestUser(page)

      await page.goto('/logout')
      await expect(page).toHaveURL('/login')

      await page.goto('/')

      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('Protected Routes Redirect', () => {
    test('redirects to login when accessing dashboard without auth', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveURL('/login')
    })

    test('redirects to login when accessing addresses without auth', async ({ page }) => {
      await page.goto('/addresses')
      await expect(page).toHaveURL('/login')
    })

    test('redirects to login when accessing meters without auth', async ({ page }) => {
      await page.goto('/meters')
      await expect(page).toHaveURL('/login')
    })

    test('redirects to login when accessing readings without auth', async ({ page }) => {
      await page.goto('/readings/new')
      await expect(page).toHaveURL('/login')
    })

    test('redirects to login when accessing profile without auth', async ({ page }) => {
      await page.goto('/profile')
      await expect(page).toHaveURL('/login')
    })

    test('authenticated user is redirected from login to dashboard', async ({ page }) => {
      await loginAsTestUser(page)

      await page.goto('/login')

      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Session Persistence', () => {
    test('session persists after page refresh', async ({ page }) => {
      await loginAsTestUser(page)

      await page.reload()

      await expect(page).toHaveURL('/')
      const userMenu = page.locator('header button[aria-haspopup="menu"]')
      await expect(userMenu).toBeVisible()
    })

    test('session persists across navigation', async ({ page }) => {
      await loginAsTestUser(page)

      await page.goto('/addresses')
      await expect(page).toHaveURL('/addresses')

      await page.goto('/meters')
      await expect(page).toHaveURL('/meters')

      await page.goto('/')
      await expect(page).toHaveURL('/')

      const userMenu = page.locator('header button[aria-haspopup="menu"]')
      await expect(userMenu).toBeVisible()
    })
  })
})
