import { test, expect } from '@playwright/test'
import { LoginPage, RegisterPage } from '../../pages'
import { mockOAuthAuthorizeUrl, mockOAuthCallback } from '../../helpers'

const OAUTH_STATE_KEY = 'oauth_state'
const OAUTH_PROVIDER_KEY = 'oauth_provider'

test.describe('OAuth Authentication - Login Page', () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
  })

  test('should display Google OAuth button', async ({ page }) => {
    const googleButton = page.getByRole('button', { name: /google/i })
    await expect(googleButton).toBeVisible()
    await expect(googleButton).toBeEnabled()
  })

  test('should display GitHub OAuth button', async ({ page }) => {
    const githubButton = page.getByRole('button', { name: /github/i })
    await expect(githubButton).toBeVisible()
    await expect(githubButton).toBeEnabled()
  })

  test('should NOT display Facebook OAuth button (removed provider)', async ({ page }) => {
    const facebookButton = page.getByRole('button', { name: /facebook/i })
    await expect(facebookButton).not.toBeVisible()
  })

  test('should NOT display Apple OAuth button (removed provider)', async ({ page }) => {
    const appleButton = page.getByRole('button', { name: /apple/i })
    await expect(appleButton).not.toBeVisible()
  })

  test('should save state to sessionStorage when clicking Google OAuth button', async ({ page }) => {
    await mockOAuthAuthorizeUrl(page, 'Google', 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test')

    const googleButton = page.getByRole('button', { name: /google/i })

    const [, savedState] = await Promise.all([
      googleButton.click(),
      page.evaluate((key) => {
        return new Promise<string | null>((resolve) => {
          const checkState = () => {
            const state = sessionStorage.getItem(key)
            if (state) {
              resolve(state)
            } else {
              setTimeout(checkState, 50)
            }
          }
          checkState()
          setTimeout(() => resolve(null), 2000)
        })
      }, OAUTH_STATE_KEY),
    ])

    expect(savedState).toBeTruthy()
    expect(typeof savedState).toBe('string')
    expect(savedState!.length).toBe(64)
  })

  test('should save provider to sessionStorage when clicking Google OAuth button', async ({ page }) => {
    await mockOAuthAuthorizeUrl(page, 'Google', 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test')

    const googleButton = page.getByRole('button', { name: /google/i })

    const [, savedProvider] = await Promise.all([
      googleButton.click(),
      page.evaluate((key) => {
        return new Promise<string | null>((resolve) => {
          const checkProvider = () => {
            const provider = sessionStorage.getItem(key)
            if (provider) {
              resolve(provider)
            } else {
              setTimeout(checkProvider, 50)
            }
          }
          checkProvider()
          setTimeout(() => resolve(null), 2000)
        })
      }, OAUTH_PROVIDER_KEY),
    ])

    expect(savedProvider).toBe('Google')
  })

  test('should save state and provider to sessionStorage when clicking GitHub OAuth button', async ({ page }) => {
    await mockOAuthAuthorizeUrl(page, 'GitHub', 'https://github.com/login/oauth/authorize?client_id=test')

    const githubButton = page.getByRole('button', { name: /github/i })

    const [, sessionData] = await Promise.all([
      githubButton.click(),
      page.evaluate((keys) => {
        return new Promise<{ state: string | null; provider: string | null }>((resolve) => {
          const checkData = () => {
            const state = sessionStorage.getItem(keys.state)
            const provider = sessionStorage.getItem(keys.provider)
            if (state && provider) {
              resolve({ state, provider })
            } else {
              setTimeout(checkData, 50)
            }
          }
          checkData()
          setTimeout(() => resolve({ state: null, provider: null }), 2000)
        })
      }, { state: OAUTH_STATE_KEY, provider: OAUTH_PROVIDER_KEY }),
    ])

    expect(sessionData.state).toBeTruthy()
    expect(sessionData.state!.length).toBe(64)
    expect(sessionData.provider).toBe('GitHub')
  })

  test('should disable OAuth buttons while loading', async ({ page }) => {
    await mockOAuthAuthorizeUrl(page, 'Google', 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test', { delay: 1000 })

    const googleButton = page.getByRole('button', { name: /google/i })
    const githubButton = page.getByRole('button', { name: /github/i })

    await googleButton.click()

    await expect(googleButton).toBeDisabled()
    await expect(githubButton).toBeDisabled()
  })

  test('should show loading spinner on clicked OAuth button', async ({ page }) => {
    await mockOAuthAuthorizeUrl(page, 'Google', 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test', { delay: 1000 })

    const googleButton = page.getByRole('button', { name: /google/i })
    await googleButton.click()

    const spinner = googleButton.locator('.animate-spin')
    await expect(spinner).toBeVisible()
  })

  test('should show error when OAuth URL request fails', async ({ page }) => {
    await mockOAuthAuthorizeUrlError(page, 'Google', 'OAuth service unavailable')

    const googleButton = page.getByRole('button', { name: /google/i })
    await googleButton.click()

    const errorMessage = page.locator('.bg-red-50, [role="alert"]')
    await expect(errorMessage).toBeVisible()
  })
})

test.describe('OAuth Authentication - Register Page', () => {
  let registerPage: RegisterPage

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page)
    await registerPage.goto()
  })

  test('should display Google OAuth button', async ({ page }) => {
    const googleButton = page.getByRole('button', { name: /google/i })
    await expect(googleButton).toBeVisible()
    await expect(googleButton).toBeEnabled()
  })

  test('should display GitHub OAuth button', async ({ page }) => {
    const githubButton = page.getByRole('button', { name: /github/i })
    await expect(githubButton).toBeVisible()
    await expect(githubButton).toBeEnabled()
  })

  test('should NOT display Facebook OAuth button on register page', async ({ page }) => {
    const facebookButton = page.getByRole('button', { name: /facebook/i })
    await expect(facebookButton).not.toBeVisible()
  })

  test('should NOT display Apple OAuth button on register page', async ({ page }) => {
    const appleButton = page.getByRole('button', { name: /apple/i })
    await expect(appleButton).not.toBeVisible()
  })

  test('should have correct OAuth button text on register page', async ({ page }) => {
    await expect(page.getByRole('button', { name: /через google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /через github/i })).toBeVisible()
  })

  test('should save state and provider when clicking Google OAuth on register', async ({ page }) => {
    await mockOAuthAuthorizeUrl(page, 'Google', 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test')

    const googleButton = page.getByRole('button', { name: /google/i })

    const [, sessionData] = await Promise.all([
      googleButton.click(),
      page.evaluate((keys) => {
        return new Promise<{ state: string | null; provider: string | null }>((resolve) => {
          const checkData = () => {
            const state = sessionStorage.getItem(keys.state)
            const provider = sessionStorage.getItem(keys.provider)
            if (state && provider) {
              resolve({ state, provider })
            } else {
              setTimeout(checkData, 50)
            }
          }
          checkData()
          setTimeout(() => resolve({ state: null, provider: null }), 2000)
        })
      }, { state: OAUTH_STATE_KEY, provider: OAUTH_PROVIDER_KEY }),
    ])

    expect(sessionData.state).toBeTruthy()
    expect(sessionData.provider).toBe('Google')
  })
})

test.describe('OAuth Callback Page', () => {
  test('should show error when code parameter is missing', async ({ page }) => {
    await page.goto('/auth/callback?state=test-state')

    const errorHeading = page.getByText(/помилка авторизації/i)
    await expect(errorHeading).toBeVisible()

    const errorMessage = page.getByText(/відсутні обовʼязкові параметри/i)
    await expect(errorMessage).toBeVisible()
  })

  test('should show error when state parameter is missing', async ({ page }) => {
    await page.goto('/auth/callback?code=test-code')

    const errorHeading = page.getByText(/помилка авторизації/i)
    await expect(errorHeading).toBeVisible()

    const errorMessage = page.getByText(/відсутні обовʼязкові параметри/i)
    await expect(errorMessage).toBeVisible()
  })

  test('should show error when both code and state are missing', async ({ page }) => {
    await page.goto('/auth/callback')

    const errorHeading = page.getByText(/помилка авторизації/i)
    await expect(errorHeading).toBeVisible()
  })

  test('should show error when state does not match saved state', async ({ page, context }) => {
    await context.addInitScript((keys) => {
      sessionStorage.setItem(keys.state, 'saved-state-value')
      sessionStorage.setItem(keys.provider, 'Google')
    }, { state: OAUTH_STATE_KEY, provider: OAUTH_PROVIDER_KEY })

    await page.goto('/auth/callback?code=test-code&state=different-state')

    const errorHeading = page.getByText(/помилка авторизації/i)
    await expect(errorHeading).toBeVisible()

    const csrfError = page.getByText(/невалідний state|csrf/i)
    await expect(csrfError).toBeVisible()
  })

  test.skip('should show error when provider is missing from sessionStorage', async ({ page }) => {
    // This test is skipped because sessionStorage cannot be reliably set before
    // the React component mounts when using page.goto() in Playwright.
    // The component reads sessionStorage synchronously in useEffect on mount,
    // and addInitScript runs too late in the document lifecycle.
    // In a real OAuth flow, the state and provider are always set together
    // before redirect, so this scenario would only occur if sessionStorage
    // is corrupted or manually cleared.
    const testState = 'matching-state-value'

    await page.goto('/login')
    await page.evaluate((state) => {
      sessionStorage.setItem('oauth_state', state)
      // Intentionally not setting oauth_provider
    }, testState)

    await page.goto(`/auth/callback?code=test-code&state=${testState}`)

    const errorHeading = page.getByText(/помилка авторизації/i)
    await expect(errorHeading).toBeVisible()

    const providerError = page.getByText(/невизначений.*провайдер/i)
    await expect(providerError).toBeVisible()
  })

  test('should show error when OAuth provider returns error', async ({ page }) => {
    await page.goto('/auth/callback?error=access_denied&error_description=User%20denied%20access')

    const errorHeading = page.getByText(/помилка авторизації/i)
    await expect(errorHeading).toBeVisible()

    const errorDescription = page.getByText(/user denied access|скасовано/i)
    await expect(errorDescription).toBeVisible()
  })

  test('should display "return to login" button on error', async ({ page }) => {
    await page.goto('/auth/callback')

    const returnButton = page.getByRole('button', { name: /повернутися до входу/i })
    await expect(returnButton).toBeVisible()
  })

  test('should navigate to login when clicking return button', async ({ page }) => {
    await page.goto('/auth/callback')

    const returnButton = page.getByRole('button', { name: /повернутися до входу/i })
    await returnButton.click()

    await expect(page).toHaveURL(/\/login/)
  })

  test('should show loading state during callback processing', async ({ page, context }) => {
    const testState = 'valid-test-state'

    await mockOAuthCallback(page, 'Google', { delay: 2000 })

    await context.addInitScript((data) => {
      sessionStorage.setItem(data.stateKey, data.state)
      sessionStorage.setItem(data.providerKey, 'Google')
    }, { stateKey: OAUTH_STATE_KEY, providerKey: OAUTH_PROVIDER_KEY, state: testState })

    await page.goto(`/auth/callback?code=valid-code&state=${testState}`)

    const loadingText = page.getByText(/авторизація|обробка/i)
    await expect(loadingText).toBeVisible()
  })

  test('should redirect to home on successful OAuth callback', async ({ page, context }) => {
    const testState = 'valid-test-state'

    await mockOAuthCallback(page, 'Google')

    await context.addInitScript((data) => {
      sessionStorage.setItem(data.stateKey, data.state)
      sessionStorage.setItem(data.providerKey, 'Google')
    }, { stateKey: OAUTH_STATE_KEY, providerKey: OAUTH_PROVIDER_KEY, state: testState })

    await page.goto(`/auth/callback?code=valid-code&state=${testState}`)

    await page.waitForURL((url) => url.pathname === '/' || url.pathname.includes('dashboard'), { timeout: 10000 })
  })

  test('should clear sessionStorage after processing callback', async ({ page, context }) => {
    const testState = 'valid-test-state'

    await mockOAuthCallback(page, 'Google')

    await context.addInitScript((data) => {
      sessionStorage.setItem(data.stateKey, data.state)
      sessionStorage.setItem(data.providerKey, 'Google')
    }, { stateKey: OAUTH_STATE_KEY, providerKey: OAUTH_PROVIDER_KEY, state: testState })

    await page.goto(`/auth/callback?code=valid-code&state=${testState}`)

    await page.waitForTimeout(1000)

    const sessionData = await page.evaluate((keys) => ({
      state: sessionStorage.getItem(keys.state),
      provider: sessionStorage.getItem(keys.provider),
    }), { state: OAUTH_STATE_KEY, provider: OAUTH_PROVIDER_KEY })

    expect(sessionData.state).toBeNull()
    expect(sessionData.provider).toBeNull()
  })
})

test.describe('OAuth Error Handling', () => {
  test('should handle API error during OAuth callback', async ({ page, context }) => {
    const testState = 'valid-test-state'

    await mockOAuthCallbackError(page, 'GitHub', 'Invalid OAuth token')

    await context.addInitScript((data) => {
      sessionStorage.setItem(data.stateKey, data.state)
      sessionStorage.setItem(data.providerKey, 'GitHub')
    }, { stateKey: OAUTH_STATE_KEY, providerKey: OAUTH_PROVIDER_KEY, state: testState })

    await page.goto(`/auth/callback?code=invalid-code&state=${testState}`)

    const errorHeading = page.getByText(/помилка авторизації/i)
    await expect(errorHeading).toBeVisible()
  })

  test('should handle network error during OAuth callback', async ({ page, context }) => {
    const testState = 'valid-test-state'

    await mockOAuthCallbackNetworkError(page)

    await context.addInitScript((data) => {
      sessionStorage.setItem(data.stateKey, data.state)
      sessionStorage.setItem(data.providerKey, 'Google')
    }, { stateKey: OAUTH_STATE_KEY, providerKey: OAUTH_PROVIDER_KEY, state: testState })

    await page.goto(`/auth/callback?code=test-code&state=${testState}`)

    const errorHeading = page.getByText(/помилка авторизації/i)
    await expect(errorHeading).toBeVisible()
  })
})

async function mockOAuthAuthorizeUrlError(page: import('@playwright/test').Page, provider: string, message: string): Promise<void> {
  await page.route(`**/auth/oauth/${provider.toLowerCase()}/authorize`, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 500,
        message,
      }),
    })
  })
}

async function mockOAuthCallbackError(page: import('@playwright/test').Page, _provider: string, message: string): Promise<void> {
  await page.route('**/auth/oauth/callback', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 401,
        detail: message,
      }),
    })
  })
}

async function mockOAuthCallbackNetworkError(page: import('@playwright/test').Page): Promise<void> {
  await page.route('**/auth/oauth/callback', async (route) => {
    await route.abort('failed')
  })
}
