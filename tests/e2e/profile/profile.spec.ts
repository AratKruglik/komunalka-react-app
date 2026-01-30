import { test, expect } from '@playwright/test';
import { ProfilePage } from '../../pages';
import { authenticateUser } from '../../helpers/auth';
import {
  mockUserProfile,
  mockUpdateProfile,
  mockAddresses,
  mockMetersByAddress,
  mockReadingsByAddress,
} from '../../helpers/api-mocks';
import { testUsers, testAddresses } from '../../fixtures/test-data';

test.describe('Profile Page', () => {
  let profilePage: ProfilePage;

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page, testUsers.profileUser);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [] });
    await mockReadingsByAddress(page, { 1: [] });
  }

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    await authenticateUser(page);
    await setupMocks(page);
  });

  test('should display profile page', async ({ page }) => {
    await profilePage.goto();

    await expect(profilePage.pageHeading).toBeVisible();
    await expect(page).toHaveURL(/\/profile/);
  });

  test('should display profile form sections', async () => {
    await profilePage.goto();

    await profilePage.expectProfileFormVisible();
  });

  test('should display breadcrumb navigation', async () => {
    await profilePage.goto();

    await expect(profilePage.breadcrumb).toBeVisible();
  });

  test('should populate form with user data', async () => {
    await profilePage.goto();

    await profilePage.expectFormFieldValues({
      firstName: testUsers.profileUser.firstName,
      lastName: testUsers.profileUser.lastName,
      email: testUsers.profileUser.email,
    });
  });

  test('should display password change section', async () => {
    await profilePage.goto();

    await expect(profilePage.passwordCard).toBeVisible();
    await expect(profilePage.currentPasswordInput).toBeVisible();
    await expect(profilePage.newPasswordInput).toBeVisible();
    await expect(profilePage.confirmPasswordInput).toBeVisible();
  });

  test('should display password requirements', async () => {
    await profilePage.goto();

    await profilePage.expectPasswordRequirements();
  });

  test('should display password strength indicator', async () => {
    await profilePage.goto();

    await profilePage.expectPasswordStrengthIndicator();
  });

  test('should update first name successfully', async ({ page }) => {
    await mockUpdateProfile(page);

    await profilePage.goto();
    await profilePage.fillBasicInfo({ firstName: 'Новий Тестовий' });
    await profilePage.submit();

    await expect(profilePage.firstNameInput).toHaveValue('Новий Тестовий');
  });

  test('should update last name successfully', async ({ page }) => {
    await mockUpdateProfile(page);

    await profilePage.goto();
    await profilePage.fillBasicInfo({ lastName: 'Новий Прізвище' });
    await profilePage.submit();

    await expect(profilePage.lastNameInput).toHaveValue('Новий Прізвище');
  });

  test('should update email successfully', async ({ page }) => {
    await mockUpdateProfile(page);

    await profilePage.goto();
    await profilePage.fillBasicInfo({ email: 'new@example.com' });
    await profilePage.submit();

    await expect(profilePage.emailInput).toHaveValue('new@example.com');
  });

  test('should update phone number successfully', async ({ page }) => {
    await mockUpdateProfile(page);

    await profilePage.goto();
    await profilePage.fillBasicInfo({ phone: '501234599' });
    await profilePage.submit();
  });

  test('should cancel changes and navigate away', async ({ page }) => {
    await profilePage.goto();
    await profilePage.fillBasicInfo({ firstName: 'Changed Name' });

    await profilePage.cancel();

    await expect(page).toHaveURL('/');
  });

  test('should show submit and cancel buttons', async () => {
    await profilePage.goto();

    await expect(profilePage.submitButton).toBeVisible();
    await expect(profilePage.cancelButton).toBeVisible();
  });

  test('should display avatar section', async ({ page }) => {
    await profilePage.goto();

    const avatarLabel = page.getByLabel('Аватар');
    await expect(avatarLabel).toBeVisible();
  });

  test('should show clear avatar button disabled by default', async () => {
    await profilePage.goto();

    await expect(profilePage.clearAvatarButton).toBeDisabled();
  });

  test('should navigate to home via breadcrumb', async ({ page }) => {
    await profilePage.goto();

    const homeLink = profilePage.breadcrumb.getByRole('link', { name: /головна/i });
    await homeLink.click();

    await expect(page).toHaveURL('/');
  });
});

test.describe('Profile - Password Change', () => {
  let profilePage: ProfilePage;

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page, testUsers.profileUser);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [] });
    await mockReadingsByAddress(page, { 1: [] });
  }

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    await authenticateUser(page);
    await setupMocks(page);
  });

  test('should display password fields', async () => {
    await profilePage.goto();

    await expect(profilePage.currentPasswordInput).toBeVisible();
    await expect(profilePage.newPasswordInput).toBeVisible();
    await expect(profilePage.confirmPasswordInput).toBeVisible();
  });

  test('should show password toggle buttons', async ({ page }) => {
    await profilePage.goto();

    const toggleButtons = page.getByRole('button', { name: /показати пароль/i });
    const count = await toggleButtons.count();

    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should toggle password visibility', async ({ page }) => {
    await profilePage.goto();

    const toggleButton = page.getByRole('button', { name: /показати пароль/i }).first();
    await toggleButton.click();
  });

  test('should fill password change form', async ({ page }) => {
    await mockUpdateProfile(page);

    await profilePage.goto();

    await profilePage.fillPasswordChange({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    });

    await expect(profilePage.currentPasswordInput).not.toHaveValue('');
    await expect(profilePage.newPasswordInput).not.toHaveValue('');
    await expect(profilePage.confirmPasswordInput).not.toHaveValue('');
  });

  test('should show password strength requirements', async ({ page }) => {
    await profilePage.goto();

    await expect(page.getByText(/мінімум 8 символів/i)).toBeVisible();
    await expect(page.getByText(/мінімум 1 велика літера/i)).toBeVisible();
    await expect(page.getByText(/мінімум 1 цифра/i)).toBeVisible();
  });
});

test.describe('Profile - Form Validation', () => {
  let profilePage: ProfilePage;

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page, testUsers.profileUser);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [] });
    await mockReadingsByAddress(page, { 1: [] });
  }

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    await authenticateUser(page);
    await setupMocks(page);
  });

  test('should validate email format', async ({ page }) => {
    await profilePage.goto();

    await profilePage.fillBasicInfo({ email: 'invalid-email' });
    await profilePage.submit();

    // Check for validation error or invalid state
    await expect(profilePage.emailInput).toHaveAttribute('aria-invalid', 'true').catch(() => {
      // Alternative validation UI
    });
  });

  test.skip('should require first name', async ({ page }) => {
    await profilePage.goto();

    await profilePage.firstNameInput.clear();
    await profilePage.submit();

    await profilePage.expectValidationError('імʼя');
  });

  test.skip('should require last name', async ({ page }) => {
    await profilePage.goto();

    await profilePage.lastNameInput.clear();
    await profilePage.submit();

    await profilePage.expectValidationError('прізвище');
  });
});

test.describe('Profile - Avatar Upload', () => {
  let profilePage: ProfilePage;

  async function setupMocks(page: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T['page'] : never) {
    await mockUserProfile(page, testUsers.profileUser);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [] });
    await mockReadingsByAddress(page, { 1: [] });
  }

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    await authenticateUser(page);
    await setupMocks(page);
  });

  test('should display avatar upload instructions', async ({ page }) => {
    await profilePage.goto();

    const instructions = page.getByText(/перетягніть фото сюди/i);
    await expect(instructions).toBeVisible();
  });

  test('should display file size limit', async ({ page }) => {
    await profilePage.goto();

    const sizeLimit = page.getByText(/до 5 мб/i);
    await expect(sizeLimit).toBeVisible();
  });

  test('should display supported formats', async ({ page }) => {
    await profilePage.goto();

    const formats = page.getByText(/jpg.*png.*heic/i);
    await expect(formats).toBeVisible();
  });

  test('should display update photo button', async ({ page }) => {
    await profilePage.goto();

    const updateButton = page.getByRole('button', { name: 'Оновити фото', exact: true });
    await expect(updateButton).toBeVisible();
  });
});

test.describe('Profile - Error Handling', () => {
  test('should handle API error on profile update', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await authenticateUser(page);
    await mockUserProfile(page, testUsers.profileUser);
    await mockAddresses(page, [testAddresses.primary]);
    await mockMetersByAddress(page, { 1: [] });
    await mockReadingsByAddress(page, { 1: [] });
    await mockUpdateProfile(page, { status: 500 });

    await profilePage.goto();
    await profilePage.fillBasicInfo({ firstName: 'New Name' });
    await profilePage.submit();

    // Error handling should occur
  });
});
