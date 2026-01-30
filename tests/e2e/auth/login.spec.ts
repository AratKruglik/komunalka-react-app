import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages';
import { mockLoginSuccess, mockLoginFailure } from '../../helpers';
import { testUsers } from '../../fixtures/test-data';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login form', async ({ page }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await mockLoginSuccess(page);

    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);

    await expect(page).toHaveURL(/\/(dashboard|addresses)/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await mockLoginFailure(page, 'Невірний email або пароль');

    await loginPage.login(testUsers.invalidUser.email, testUsers.invalidUser.password);

    await loginPage.expectError();
  });

  test('should navigate to registration page', async ({ page }) => {
    await loginPage.goToRegister();

    await expect(page).toHaveURL(/\/register/);
  });

  test('should validate required fields', async ({ page }) => {
    await loginPage.submitButton.click();

    const emailInput = loginPage.emailInput;
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should preserve email after failed login', async ({ page }) => {
    await mockLoginFailure(page);

    await loginPage.login(testUsers.validUser.email, 'wrongpassword');

    await expect(loginPage.emailInput).toHaveValue(testUsers.validUser.email);
  });
});
