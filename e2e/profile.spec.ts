import { test, expect } from '@playwright/test'

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD

test.describe('User Profile Display', () => {
  test.beforeEach(() => {
    if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
      throw new Error(
        'Missing required environment variables: TEST_USER_EMAIL and TEST_USER_PASSWORD must be set'
      )
    }
  })

  test('displays real user name in topbar after login', async ({ page }) => {
    await page.goto('/login')

    await page.locator('#email').fill(TEST_USER_EMAIL!)
    await page.locator('#password').fill(TEST_USER_PASSWORD!)
    await page.getByRole('button', { name: 'Увійти' }).click()

    await page.waitForURL('/')

    const userMenu = page.locator('header').getByRole('button', { name: /menu/i }).or(
      page.locator('header button[aria-haspopup="menu"]')
    )
    await expect(userMenu).toBeVisible()

    const userNameElement = userMenu.locator('span.text-sm.font-medium').first()
    await expect(userNameElement).toBeVisible()

    const userName = await userNameElement.textContent()

    expect(userName).toBeTruthy()
    expect(userName?.trim()).not.toBe('')
    expect(userName?.trim().toLowerCase()).not.toBe('користувач')
    expect(userName?.trim().toLowerCase()).not.toBe('user')
    expect(userName?.trim().toLowerCase()).not.toBe('guest')
    expect(userName?.trim().toLowerCase()).not.toMatch(/^placeholder/i)
  })

  test('user name persists after page refresh', async ({ page }) => {
    await page.goto('/login')

    await page.locator('#email').fill(TEST_USER_EMAIL!)
    await page.locator('#password').fill(TEST_USER_PASSWORD!)
    await page.getByRole('button', { name: 'Увійти' }).click()

    await page.waitForURL('/')

    const userMenu = page.locator('header button[aria-haspopup="menu"]')
    await expect(userMenu).toBeVisible()

    const userNameElement = userMenu.locator('span.text-sm.font-medium').first()
    const userNameBeforeRefresh = await userNameElement.textContent()

    await page.reload()

    await expect(userMenu).toBeVisible()
    const userNameAfterRefresh = await userNameElement.textContent()

    expect(userNameAfterRefresh).toBe(userNameBeforeRefresh)
    expect(userNameAfterRefresh?.trim().toLowerCase()).not.toBe('користувач')
  })
})
