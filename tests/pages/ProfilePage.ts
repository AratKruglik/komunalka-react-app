import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  readonly url = '/profile';

  readonly breadcrumb: Locator;
  readonly pageHeading: Locator;

  readonly basicInfoCard: Locator;
  readonly passwordCard: Locator;

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;

  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;

  readonly avatarDropzone: Locator;
  readonly clearAvatarButton: Locator;

  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  readonly successAlert: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    super(page);

    this.breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    this.pageHeading = page.getByRole('heading', { name: /профіль користувача/i, level: 1 });

    this.basicInfoCard = page.getByRole('heading', { name: /основна інформація/i });
    this.passwordCard = page.getByRole('heading', { name: /зміна паролю/i });

    this.firstNameInput = page.getByLabel(/імʼя/i);
    this.lastNameInput = page.getByLabel(/прізвище/i);
    this.usernameInput = page.getByLabel(/ім'я користувача/i);
    this.emailInput = page.getByLabel(/електронна пошта/i);
    this.phoneInput = page.getByLabel(/номер телефону/i);

    this.currentPasswordInput = page.getByLabel('Поточний пароль');
    this.newPasswordInput = page.getByLabel('Новий пароль', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Підтвердити новий пароль');

    this.avatarDropzone = page.locator('[class*="dropzone"]').first();
    this.clearAvatarButton = page.getByRole('button', { name: /очистити аватар/i });

    this.cancelButton = page.getByRole('button', { name: /скасувати/i });
    this.submitButton = page.getByRole('button', { name: /зберегти зміни/i });

    this.successAlert = page.getByRole('alert').filter({ hasText: /готово/i });
    this.errorAlert = page.getByRole('alert').filter({ hasText: /помилка/i });
  }

  async fillBasicInfo(data: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
  }): Promise<void> {
    if (data.firstName !== undefined) {
      await this.firstNameInput.clear();
      await this.firstNameInput.fill(data.firstName);
    }
    if (data.lastName !== undefined) {
      await this.lastNameInput.clear();
      await this.lastNameInput.fill(data.lastName);
    }
    if (data.username !== undefined) {
      await this.usernameInput.clear();
      await this.usernameInput.fill(data.username);
    }
    if (data.email !== undefined) {
      await this.emailInput.clear();
      await this.emailInput.fill(data.email);
    }
    if (data.phone !== undefined) {
      await this.phoneInput.clear();
      await this.phoneInput.fill(data.phone);
    }
  }

  async fillPasswordChange(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    await this.currentPasswordInput.fill(data.currentPassword);
    await this.newPasswordInput.fill(data.newPassword);
    await this.confirmPasswordInput.fill(data.confirmPassword);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectProfileFormVisible(): Promise<void> {
    await expect(this.basicInfoCard).toBeVisible();
    await expect(this.passwordCard).toBeVisible();
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
  }

  async expectFormFieldValues(data: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
  }): Promise<void> {
    if (data.firstName !== undefined) {
      await expect(this.firstNameInput).toHaveValue(data.firstName);
    }
    if (data.lastName !== undefined) {
      await expect(this.lastNameInput).toHaveValue(data.lastName);
    }
    if (data.username !== undefined) {
      await expect(this.usernameInput).toHaveValue(data.username);
    }
    if (data.email !== undefined) {
      await expect(this.emailInput).toHaveValue(data.email);
    }
    if (data.phone !== undefined) {
      await expect(this.phoneInput).toHaveValue(data.phone);
    }
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.successAlert).toBeVisible();
  }

  async expectErrorMessage(message?: string): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
    if (message) {
      await expect(this.errorAlert).toContainText(message);
    }
  }

  async expectValidationError(fieldLabel: string): Promise<void> {
    const errorMessage = this.page.locator('.text-red-500, [class*="error"]').filter({ hasText: new RegExp(fieldLabel, 'i') });
    await expect(errorMessage).toBeVisible();
  }

  async expectPasswordStrengthIndicator(): Promise<void> {
    const strengthIndicator = this.page.getByText(/надійність паролю/i);
    await expect(strengthIndicator).toBeVisible();
  }

  async expectPasswordRequirements(): Promise<void> {
    await expect(this.page.getByText(/мінімум 8 символів/i)).toBeVisible();
    await expect(this.page.getByText(/мінімум 1 велика літера/i)).toBeVisible();
    await expect(this.page.getByText(/мінімум 1 цифра/i)).toBeVisible();
  }
}
