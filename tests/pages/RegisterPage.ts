import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms?: boolean;
  agreeToPrivacy?: boolean;
  agreeToNews?: boolean;
}

export class RegisterPage extends BasePage {
  readonly url = '/register'

  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly emailInput: Locator
  readonly phoneInput: Locator
  readonly passwordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly termsCheckbox: Locator
  readonly privacyCheckbox: Locator
  readonly newsCheckbox: Locator
  readonly submitButton: Locator
  readonly loginLink: Locator
  readonly generalError: Locator
  readonly googleButton: Locator
  readonly facebookButton: Locator
  readonly appleButton: Locator

  constructor(page: Page) {
    super(page)
    this.firstNameInput = page.getByLabel(/ім'я/i)
    this.lastNameInput = page.getByLabel(/прізвище/i)
    this.emailInput = page.getByLabel(/електронна пошта/i)
    this.phoneInput = page.getByLabel(/номер телефону/i)
    this.passwordInput = page.locator('#password')
    this.confirmPasswordInput = page.locator('#confirmPassword')
    this.termsCheckbox = page.getByRole('checkbox').filter({ has: page.locator('~ span:has-text("умовами використання")') }).first()
    this.privacyCheckbox = page.getByRole('checkbox').filter({ has: page.locator('~ span:has-text("політикою конфіденційності")') }).first()
    this.newsCheckbox = page.getByRole('checkbox').filter({ has: page.locator('~ span:has-text("новини")') }).first()
    this.submitButton = page.getByRole('button', { name: /створити акаунт/i })
    this.loginLink = page.getByRole('link', { name: /увійти/i })
    this.generalError = page.locator('.bg-red-50, .dark\\:bg-red-900\\/20')
    this.googleButton = page.getByRole('button', { name: /google/i })
    this.facebookButton = page.getByRole('button', { name: /facebook/i })
    this.appleButton = page.getByRole('button', { name: /apple/i })
  }

  async fillRegistrationForm(data: RegistrationData): Promise<void> {
    await this.firstNameInput.fill(data.firstName)
    await this.lastNameInput.fill(data.lastName)
    await this.emailInput.fill(data.email)
    await this.phoneInput.fill(data.phone)
    await this.passwordInput.fill(data.password)
    await this.confirmPasswordInput.fill(data.confirmPassword)

    if (data.agreeToTerms !== false) {
      const termsLabel = this.page.locator('label').filter({ hasText: 'умовами використання' })
      await termsLabel.click()
    }

    if (data.agreeToPrivacy !== false) {
      const privacyLabel = this.page.locator('label').filter({ hasText: 'політикою конфіденційності' })
      await privacyLabel.click()
    }

    if (data.agreeToNews) {
      const newsLabel = this.page.locator('label').filter({ hasText: 'новини' })
      await newsLabel.click()
    }
  }

  async submitForm(): Promise<void> {
    await this.submitButton.click()
  }

  async register(data: RegistrationData): Promise<void> {
    await this.fillRegistrationForm(data)
    await this.submitForm()
  }

  async expectValidationError(field: string, message: string): Promise<void> {
    const errorElement = this.page.locator(`text="${message}"`)
    await expect(errorElement).toBeVisible()
  }

  async expectGeneralError(message?: string): Promise<void> {
    await expect(this.generalError).toBeVisible()
    if (message) {
      await expect(this.generalError).toContainText(message)
    }
  }

  async expectFieldError(fieldId: string): Promise<void> {
    const field = this.page.locator(`#${fieldId}`)
    const errorText = field.locator('..').locator('.text-red-500')
    await expect(errorText).toBeVisible()
  }

  async goToLogin(): Promise<void> {
    await this.loginLink.click()
  }

  getFieldErrorLocator(errorText: string): Locator {
    return this.page.locator('.text-red-500', { hasText: errorText })
  }
}
