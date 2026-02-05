import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
  readonly url = '/login'

  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly registerLink: Locator
  readonly googleOAuthButton: Locator
  readonly githubOAuthButton: Locator

  constructor(page: Page) {
    super(page)
    this.emailInput = page.getByLabel(/електронна пошта/i)
    this.passwordInput = page.getByLabel(/пароль/i).first()
    this.submitButton = page.getByRole('button', { name: 'Увійти', exact: true })
    this.errorMessage = page.locator('.bg-red-50, [role="alert"]')
    this.registerLink = page.getByRole('link', { name: /реєстрація/i })
    this.googleOAuthButton = page.getByRole('button', { name: /google/i })
    this.githubOAuthButton = page.getByRole('button', { name: /github/i })
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectError(message?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible()
    if (message) {
      await expect(this.errorMessage).toContainText(message)
    }
  }

  async goToRegister(): Promise<void> {
    await this.registerLink.click()
  }
}
