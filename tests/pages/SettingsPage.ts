import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

type SettingsTab = 'profile' | 'security' | 'appearance' | 'account'

const TAB_LABELS: Record<SettingsTab, string> = {
  profile: 'Профіль',
  security: 'Безпека',
  appearance: 'Зовнішній вигляд',
  account: 'Акаунт',
}

export class SettingsPage extends BasePage {
  readonly url = '/settings'

  readonly pageHeading: Locator
  readonly pageSubtitle: Locator
  readonly sidebar: Locator
  readonly tabPanel: Locator

  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly usernameInput: Locator
  readonly emailInput: Locator
  readonly phoneInput: Locator
  readonly submitButton: Locator
  readonly cancelButton: Locator
  readonly successAlert: Locator

  readonly currentPasswordInput: Locator
  readonly newPasswordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly connectedAccountsHeading: Locator

  readonly themeRadioGroup: Locator
  readonly languageSelect: Locator

  readonly exportButton: Locator
  readonly deleteAccountButton: Locator
  readonly dangerZoneHeading: Locator
  readonly confirmDialog: Locator
  readonly confirmDeleteButton: Locator
  readonly cancelDeleteButton: Locator

  constructor(page: Page) {
    super(page)

    this.pageHeading = page.getByRole('heading', { name: /налаштування/i, level: 1 })
    this.pageSubtitle = page.getByText(/керуйте параметрами вашого акаунта/i)
    this.sidebar = page.getByRole('navigation', { name: /розділи налаштувань/i }).first()
    this.tabPanel = page.getByRole('tabpanel')

    this.firstNameInput = page.getByLabel(/імʼя/i)
    this.lastNameInput = page.getByLabel(/прізвище/i)
    this.usernameInput = page.getByLabel(/ім'я користувача/i)
    this.emailInput = page.getByLabel(/електронна пошта/i)
    this.phoneInput = page.getByLabel(/номер телефону/i)
    this.submitButton = page.getByRole('button', { name: /зберегти зміни/i })
    this.cancelButton = page.getByRole('button', { name: /скасувати/i })
    this.successAlert = page.getByRole('alert').filter({ hasText: /готово/i })

    this.currentPasswordInput = page.getByLabel('Поточний пароль')
    this.newPasswordInput = page.getByLabel('Новий пароль', { exact: true })
    this.confirmPasswordInput = page.getByLabel('Підтвердити новий пароль')
    this.connectedAccountsHeading = page.getByRole('heading', { name: /під'єднані акаунти/i })

    this.themeRadioGroup = page.getByRole('radiogroup', { name: /тема оформлення/i })
    this.languageSelect = page.getByRole('combobox', { name: /мова інтерфейсу/i })

    this.exportButton = page.getByRole('button', { name: /експортувати дані/i })
    this.deleteAccountButton = page.getByRole('button', { name: /видалити акаунт/i })
    this.dangerZoneHeading = page.getByText('Небезпечна зона')
    this.confirmDialog = page.getByRole('alertdialog')
    this.confirmDeleteButton = page.getByRole('button', { name: /так, видалити акаунт/i })
    this.cancelDeleteButton = this.confirmDialog.getByRole('button', { name: /скасувати/i })
  }

  async gotoTab(tab: SettingsTab): Promise<void> {
    await this.page.goto(`/settings?tab=${tab}`)
  }

  async selectTab(tab: SettingsTab): Promise<void> {
    const label = TAB_LABELS[tab]
    await this.sidebar.getByRole('tab', { name: label }).click()
  }

  async expectTabActive(tab: SettingsTab): Promise<void> {
    const label = TAB_LABELS[tab]
    const tabButton = this.sidebar.getByRole('tab', { name: label })
    await expect(tabButton).toHaveAttribute('aria-selected', 'true')
  }

  getTabButton(tab: SettingsTab): Locator {
    const label = TAB_LABELS[tab]
    return this.sidebar.getByRole('tab', { name: label })
  }

  getThemeCard(label: string): Locator {
    return this.themeRadioGroup.getByRole('radio', { name: label })
  }

  async expectThemeSelected(label: string): Promise<void> {
    const card = this.getThemeCard(label)
    await expect(card).toHaveAttribute('aria-checked', 'true')
  }

  getConnectedAccountRow(provider: string): Locator {
    return this.page.locator('div').filter({ hasText: new RegExp(`^${provider}$`) }).first()
      .locator('..')
  }

  getConnectButton(provider: string): Locator {
    return this.page.getByText(provider).locator('..').locator('..').getByRole('button', { name: /під'єднати/i })
  }

  getDisconnectButton(provider: string): Locator {
    return this.page.getByText(provider).locator('..').locator('..').getByRole('button', { name: /від'єднати/i })
  }

  async fillBasicInfo(data: {
    firstName?: string
    lastName?: string
    username?: string
    email?: string
    phone?: string
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
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<void> {
    await this.currentPasswordInput.fill(data.currentPassword)
    await this.newPasswordInput.fill(data.newPassword)
    await this.confirmPasswordInput.fill(data.confirmPassword)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.successAlert).toBeVisible()
  }

  async expectFormFieldValues(data: {
    firstName?: string
    lastName?: string
    username?: string
    email?: string
    phone?: string
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

  async openDeleteConfirmation(): Promise<void> {
    await this.deleteAccountButton.click()
  }

  async expectConfirmDialogVisible(): Promise<void> {
    await expect(this.confirmDialog).toBeVisible()
  }

  async expectConfirmDialogHidden(): Promise<void> {
    await expect(this.confirmDialog).not.toBeVisible()
  }

  async cancelDeleteConfirmation(): Promise<void> {
    await this.cancelDeleteButton.click()
  }
}
