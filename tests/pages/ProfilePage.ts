import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class ProfilePage extends BasePage {
  readonly url = '/profile'

  readonly breadcrumb: Locator
  readonly pageHeading: Locator

  readonly basicInfoCard: Locator
  readonly passwordCard: Locator

  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly usernameInput: Locator
  readonly emailInput: Locator
  readonly phoneInput: Locator

  readonly currentPasswordInput: Locator
  readonly newPasswordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly passwordToggleButtons: Locator

  readonly avatarDropzone: Locator
  readonly avatarFileInput: Locator
  readonly avatarPreview: Locator
  readonly clearAvatarButton: Locator
  readonly updatePhotoButton: Locator

  readonly cancelButton: Locator
  readonly submitButton: Locator

  readonly successAlert: Locator
  readonly errorAlert: Locator
  readonly loadingIndicator: Locator

  readonly firstNameError: Locator
  readonly lastNameError: Locator
  readonly emailError: Locator
  readonly phoneError: Locator
  readonly currentPasswordError: Locator
  readonly newPasswordError: Locator
  readonly confirmPasswordError: Locator
  readonly avatarError: Locator

  constructor(page: Page) {
    super(page)

    this.breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' })
    this.pageHeading = page.getByRole('heading', { name: /профіль користувача/i, level: 1 })

    this.basicInfoCard = page.getByRole('heading', { name: /основна інформація/i })
    this.passwordCard = page.getByRole('heading', { name: /зміна паролю/i })

    this.firstNameInput = page.getByLabel(/імʼя/i)
    this.lastNameInput = page.getByLabel(/прізвище/i)
    this.usernameInput = page.getByLabel(/ім'я користувача/i)
    this.emailInput = page.getByLabel(/електронна пошта/i)
    this.phoneInput = page.getByLabel(/номер телефону/i)

    this.currentPasswordInput = page.getByLabel('Поточний пароль')
    this.newPasswordInput = page.getByLabel('Новий пароль', { exact: true })
    this.confirmPasswordInput = page.getByLabel('Підтвердити новий пароль')
    this.passwordToggleButtons = page.getByRole('button', { name: /показати пароль/i })

    this.avatarDropzone = page.locator('[class*="dropzone"]').first()
    this.avatarFileInput = page.locator('input[type="file"][accept*="image"]')
    this.avatarPreview = page.locator('img[alt*="preview"], img[alt*="avatar"]').first()
    this.clearAvatarButton = page.getByRole('button', { name: /очистити аватар/i })
    this.updatePhotoButton = page.getByRole('button', { name: 'Оновити фото', exact: true })

    this.cancelButton = page.getByRole('button', { name: /скасувати/i })
    this.submitButton = page.getByRole('button', { name: /зберегти зміни/i })

    this.successAlert = page.getByRole('alert').filter({ hasText: /готово/i })
    this.errorAlert = page.getByRole('alert').filter({ hasText: /помилка/i })
    this.loadingIndicator = page.getByText(/збереження/i)

    this.firstNameError = page.locator('.text-red-500').filter({ hasText: /ім.*обов/i })
    this.lastNameError = page.locator('.text-red-500').filter({ hasText: /прізвище.*обов/i })
    this.emailError = page.locator('.text-red-500').filter({ hasText: /пошт/i })
    this.phoneError = page.locator('.text-red-500').filter({ hasText: /телефон/i })
    this.currentPasswordError = page.locator('.text-red-500').filter({ hasText: /поточний пароль/i })
    this.newPasswordError = page.locator('.text-red-500').filter({ hasText: /новий пароль|слабкий/i })
    this.confirmPasswordError = page.locator('.text-red-500').filter({ hasText: /підтвердіть|співпадають/i })
    this.avatarError = page.locator('.text-red-500').filter({ hasText: /файл|мб/i })
  }

  async fillBasicInfo(data: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
  }): Promise<void> {
    if (data.firstName !== undefined) {
      await this.firstNameInput.clear()
      await this.firstNameInput.fill(data.firstName)
    }
    if (data.lastName !== undefined) {
      await this.lastNameInput.clear()
      await this.lastNameInput.fill(data.lastName)
    }
    if (data.username !== undefined) {
      await this.usernameInput.clear()
      await this.usernameInput.fill(data.username)
    }
    if (data.email !== undefined) {
      await this.emailInput.clear()
      await this.emailInput.fill(data.email)
    }
    if (data.phone !== undefined) {
      await this.phoneInput.clear()
      await this.phoneInput.fill(data.phone)
    }
  }

  async fillPasswordChange(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    await this.currentPasswordInput.fill(data.currentPassword)
    await this.newPasswordInput.fill(data.newPassword)
    await this.confirmPasswordInput.fill(data.confirmPassword)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click()
  }

  async expectProfileFormVisible(): Promise<void> {
    await expect(this.basicInfoCard).toBeVisible()
    await expect(this.passwordCard).toBeVisible()
    await expect(this.firstNameInput).toBeVisible()
    await expect(this.lastNameInput).toBeVisible()
    await expect(this.emailInput).toBeVisible()
  }

  async expectFormFieldValues(data: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
  }): Promise<void> {
    if (data.firstName !== undefined) {
      await expect(this.firstNameInput).toHaveValue(data.firstName)
    }
    if (data.lastName !== undefined) {
      await expect(this.lastNameInput).toHaveValue(data.lastName)
    }
    if (data.username !== undefined) {
      await expect(this.usernameInput).toHaveValue(data.username)
    }
    if (data.email !== undefined) {
      await expect(this.emailInput).toHaveValue(data.email)
    }
    if (data.phone !== undefined) {
      await expect(this.phoneInput).toHaveValue(data.phone)
    }
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.successAlert).toBeVisible()
  }

  async expectErrorMessage(message?: string): Promise<void> {
    await expect(this.errorAlert).toBeVisible()
    if (message) {
      await expect(this.errorAlert).toContainText(message)
    }
  }

  async expectValidationError(fieldLabel: string): Promise<void> {
    const errorMessage = this.page.locator('.text-red-500').filter({ hasText: new RegExp(fieldLabel, 'i') })
    await expect(errorMessage).toBeVisible()
  }

  async expectPasswordStrengthIndicator(): Promise<void> {
    const strengthIndicator = this.page.getByText(/надійність паролю/i)
    await expect(strengthIndicator).toBeVisible()
  }

  async expectPasswordRequirements(): Promise<void> {
    await expect(this.page.getByText(/мінімум 8 символів/i)).toBeVisible()
    await expect(this.page.getByText(/мінімум 1 велика літера/i)).toBeVisible()
    await expect(this.page.getByText(/мінімум 1 цифра/i)).toBeVisible()
  }

  async togglePasswordVisibility(index: number = 0): Promise<void> {
    const toggleButton = this.passwordToggleButtons.nth(index)
    await toggleButton.click()
  }

  async expectPasswordVisible(inputLocator: Locator): Promise<void> {
    await expect(inputLocator).toHaveAttribute('type', 'text')
  }

  async expectPasswordHidden(inputLocator: Locator): Promise<void> {
    await expect(inputLocator).toHaveAttribute('type', 'password')
  }

  async uploadAvatar(filePath: string): Promise<void> {
    await this.avatarFileInput.setInputFiles(filePath)
  }

  async expectAvatarPreviewVisible(): Promise<void> {
    await expect(this.avatarPreview).toBeVisible()
  }

  async expectAvatarPlaceholder(): Promise<void> {
    const placeholder = this.page.getByText(/перетягніть фото сюди/i)
    await expect(placeholder).toBeVisible()
  }

  async expectAvatarSizeError(): Promise<void> {
    const sizeError = this.page.locator('[class*="error"]').filter({ hasText: /5 мб/i })
    await expect(sizeError).toBeVisible()
  }

  async expectAvatarFormatInfo(): Promise<void> {
    const formatInfo = this.page.getByText(/jpg.*png.*heic/i)
    await expect(formatInfo).toBeVisible()
  }

  async clearAvatar(): Promise<void> {
    await this.clearAvatarButton.click()
  }

  async expectFirstNameError(): Promise<void> {
    const error = this.page.getByText("Ім'я обов'язкове")
    await expect(error).toBeVisible()
  }

  async expectLastNameError(): Promise<void> {
    const error = this.page.getByText("Прізвище обовʼязкове")
    await expect(error).toBeVisible()
  }

  async expectEmailFormatError(): Promise<void> {
    const error = this.page.getByText('Невірний формат електронної пошти')
    await expect(error).toBeVisible()
  }

  async expectPhoneFormatError(): Promise<void> {
    const error = this.page.getByText('Введіть коректний номер телефону (9 цифр)')
    await expect(error).toBeVisible()
  }

  async expectCurrentPasswordError(): Promise<void> {
    const error = this.page.getByText('Введіть поточний пароль')
    await expect(error).toBeVisible()
  }

  async expectNewPasswordWeakError(): Promise<void> {
    const error = this.page.getByText('Пароль занадто слабкий')
    await expect(error).toBeVisible()
  }

  async expectPasswordMismatchError(): Promise<void> {
    const error = this.page.getByText('Паролі не співпадають')
    await expect(error).toBeVisible()
  }

  async expectSubmitLoading(): Promise<void> {
    await expect(this.loadingIndicator).toBeVisible()
  }

  async expectSubmitNotLoading(): Promise<void> {
    await expect(this.loadingIndicator).not.toBeVisible()
  }

  async fillAllFields(data: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }): Promise<void> {
    await this.fillBasicInfo({
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      phone: data.phone,
    })
    if (data.currentPassword || data.newPassword || data.confirmPassword) {
      await this.fillPasswordChange({
        currentPassword: data.currentPassword || '',
        newPassword: data.newPassword || '',
        confirmPassword: data.confirmPassword || '',
      })
    }
  }

  async getPasswordToggleCount(): Promise<number> {
    return await this.passwordToggleButtons.count()
  }

  async expectPasswordCardDescription(): Promise<void> {
    const description = this.page.getByText(/залиште поля порожніми.*якщо не хочете змінювати пароль/i)
    await expect(description).toBeVisible()
  }
}
