import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
  readonly url = '/login'

  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly rememberMeCheckbox: Locator
  readonly forgotPasswordLink: Locator
  readonly registerLink: Locator
  readonly generalError: Locator
  readonly emailError: Locator
  readonly passwordError: Locator

  constructor(page: Page) {
    super(page)
    this.emailInput = page.locator('#email')
    this.passwordInput = page.locator('#password')
    this.loginButton = page.getByRole('button', { name: 'Увійти' })
    this.rememberMeCheckbox = page.locator('#remember')
    this.forgotPasswordLink = page.getByRole('link', { name: /забули пароль/i })
    this.registerLink = page.getByRole('link', { name: /реєстрація|зареєструватися/i })
    this.generalError = page.locator('.bg-red-50, [class*="bg-red"]').first()
    this.emailError = page.locator('#email + p.text-red-500, #email ~ p.text-red-500').first()
    this.passwordError = page.locator('[id="password"]').locator('..').locator('..').locator('p.text-red-500').first()
  }

  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)

    if (rememberMe) {
      await this.rememberMeCheckbox.check()
    }

    await this.loginButton.click()
  }

  async expectLoginSuccess(): Promise<void> {
    await this.page.waitForURL('/')
    const userMenu = this.page.locator('header button[aria-haspopup="menu"]')
    await expect(userMenu).toBeVisible()
  }

  async expectGeneralError(errorText?: string | RegExp): Promise<void> {
    await expect(this.generalError).toBeVisible()
    if (errorText) {
      await expect(this.generalError).toContainText(errorText)
    }
  }

  async expectEmailError(errorText: string | RegExp): Promise<void> {
    const errorElement = this.page.locator('p.text-red-500').filter({ hasText: errorText })
    await expect(errorElement).toBeVisible()
  }

  async expectPasswordError(errorText: string | RegExp): Promise<void> {
    const errorElement = this.page.locator('p.text-red-500').filter({ hasText: errorText })
    await expect(errorElement).toBeVisible()
  }

  async expectOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL('/login')
    await expect(this.loginButton).toBeVisible()
    await expect(this.emailInput).toBeVisible()
    await expect(this.passwordInput).toBeVisible()
  }

  async clearForm(): Promise<void> {
    await this.emailInput.clear()
    await this.passwordInput.clear()
  }
}
