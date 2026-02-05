import { test, expect } from '@playwright/test'
import { authenticateUser, clearAuth, isAuthenticated, mockUserProfile, mockAddresses } from '../../helpers'

test.describe('Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockAddresses(page, [])
  })

  test('should logout from user menu', async ({ page }) => {
    await page.goto('/addresses')
    await page.waitForLoadState('networkidle')

    const userMenuButton = page.getByRole('button', { name: /олена петренко/i })
    await userMenuButton.click()

    const logoutMenuItem = page.getByRole('menuitem', { name: /вийти/i })
    await logoutMenuItem.click()

    await expect(page).toHaveURL(/\/login/)
  })

  test('should redirect to login page after logout', async ({ page }) => {
    await page.goto('/logout')

    await expect(page).toHaveURL(/\/login/)
  })

  test('should clear authentication tokens after logout', async ({ page }) => {
    await page.goto('/addresses')
    await page.waitForLoadState('networkidle')

    const isAuthBefore = await isAuthenticated(page)
    expect(isAuthBefore).toBe(true)

    await page.goto('/logout')
    await page.waitForURL(/\/login/)

    const isAuthAfter = await isAuthenticated(page)
    expect(isAuthAfter).toBe(false)
  })

  test('should redirect to login when accessing protected route after logout', async ({ page }) => {
    await page.goto('/addresses')
    await page.waitForLoadState('networkidle')

    await page.goto('/logout')
    await page.waitForURL(/\/login/)

    await clearAuth(page)

    await page.goto('/addresses')

    await expect(page).toHaveURL(/\/login/)
  })

  test('should not allow back navigation to protected page after logout', async ({ page }) => {
    await page.goto('/addresses')
    await page.waitForLoadState('networkidle')

    await page.goto('/logout')
    await page.waitForURL(/\/login/)

    await clearAuth(page)

    await page.goBack()

    await expect(page).toHaveURL(/\/login/)
  })

  test('should clear user data from storage after logout', async ({ page }) => {
    await page.goto('/addresses')
    await page.waitForLoadState('networkidle')

    await page.goto('/logout')
    await page.waitForURL(/\/login/)

    const cookies = await page.context().cookies()
    const jwtCookie = cookies.find(c => c.name === 'jwt_token')
    const refreshCookie = cookies.find(c => c.name === 'refresh_token')

    expect(jwtCookie).toBeUndefined()
    expect(refreshCookie).toBeUndefined()
  })
})
