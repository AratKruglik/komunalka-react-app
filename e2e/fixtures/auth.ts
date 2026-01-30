import { test as base, expect, type Page } from '@playwright/test'

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD

export function validateTestCredentials(): void {
  if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
    throw new Error(
      'Missing required environment variables: TEST_USER_EMAIL and TEST_USER_PASSWORD must be set'
    )
  }
}

export async function loginAsTestUser(page: Page): Promise<void> {
  validateTestCredentials()

  await page.goto('/login')
  await page.locator('#email').fill(TEST_USER_EMAIL!)
  await page.locator('#password').fill(TEST_USER_PASSWORD!)
  await page.getByRole('button', { name: 'Увійти' }).click()
  await page.waitForURL('/')
}

export async function expectToBeLoggedIn(page: Page): Promise<void> {
  const userMenu = page.locator('header button[aria-haspopup="menu"]')
  await expect(userMenu).toBeVisible()
}

export async function expectToBeOnLoginPage(page: Page): Promise<void> {
  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('button', { name: 'Увійти' })).toBeVisible()
}

export async function logout(page: Page): Promise<void> {
  await page.goto('/logout')
  await page.waitForURL('/login')
}

interface AuthFixtures {
  authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    validateTestCredentials()
    await loginAsTestUser(page)
    await use(page)
  },
})

export { expect }
