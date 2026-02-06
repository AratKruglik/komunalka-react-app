import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

const OAUTH_STATE_KEY = 'oauth_state'
const OAUTH_PROVIDER_KEY = 'oauth_provider'

export type OAuthProvider = 'Google' | 'GitHub'

export class OAuthCallbackPage extends BasePage {
  readonly url = '/auth/callback'

  readonly errorHeading: Locator
  readonly errorMessage: Locator
  readonly returnToLoginButton: Locator
  readonly loadingSpinner: Locator
  readonly loadingText: Locator

  constructor(page: Page) {
    super(page)
    this.errorHeading = page.getByText(/помилка авторизації/i)
    this.errorMessage = page.locator('.text-red-700, .dark\\:text-red-400')
    this.returnToLoginButton = page.getByRole('button', { name: /повернутися до входу/i })
    this.loadingSpinner = page.locator('[class*="animate-spin"]')
    this.loadingText = page.getByText(/авторизація|обробка/i)
  }

  async gotoWithParams(params: { code?: string; state?: string; error?: string; error_description?: string }): Promise<void> {
    const searchParams = new URLSearchParams()
    if (params.code) searchParams.set('code', params.code)
    if (params.state) searchParams.set('state', params.state)
    if (params.error) searchParams.set('error', params.error)
    if (params.error_description) searchParams.set('error_description', params.error_description)

    const queryString = searchParams.toString()
    const url = queryString ? `${this.url}?${queryString}` : this.url
    await this.page.goto(url)
  }

  async setupSessionStorage(state: string, provider: OAuthProvider): Promise<void> {
    await this.page.evaluate((data) => {
      sessionStorage.setItem(data.stateKey, data.state)
      sessionStorage.setItem(data.providerKey, data.provider)
    }, { stateKey: OAUTH_STATE_KEY, providerKey: OAUTH_PROVIDER_KEY, state, provider })
  }

  async getSessionStorageData(): Promise<{ state: string | null; provider: string | null }> {
    return this.page.evaluate((keys) => ({
      state: sessionStorage.getItem(keys.state),
      provider: sessionStorage.getItem(keys.provider),
    }), { state: OAUTH_STATE_KEY, provider: OAUTH_PROVIDER_KEY })
  }

  async clearSessionStorage(): Promise<void> {
    await this.page.evaluate((keys) => {
      sessionStorage.removeItem(keys.state)
      sessionStorage.removeItem(keys.provider)
    }, { state: OAUTH_STATE_KEY, provider: OAUTH_PROVIDER_KEY })
  }

  async expectError(messagePattern?: RegExp): Promise<void> {
    await expect(this.errorHeading).toBeVisible()
    if (messagePattern) {
      await expect(this.errorMessage).toContainText(messagePattern)
    }
  }

  async expectLoading(): Promise<void> {
    await expect(this.loadingText).toBeVisible()
  }

  async returnToLogin(): Promise<void> {
    await this.returnToLoginButton.click()
    await expect(this.page).toHaveURL(/\/login/)
  }
}
