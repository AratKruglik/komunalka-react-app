import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

type PropertyType = 'apartment' | 'house' | 'office'

export class AddAddressPage extends BasePage {
  readonly url = '/addresses/new'

  readonly pageTitle: Locator
  readonly propertyTypeCards: Record<PropertyType, Locator>
  readonly regionSelect: Locator
  readonly cityInput: Locator
  readonly streetInput: Locator
  readonly buildingNumberInput: Locator
  readonly unitNumberInput: Locator
  readonly postalCodeInput: Locator
  readonly notesTextarea: Locator
  readonly isPrimaryCheckbox: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator
  readonly formErrors: Locator

  constructor(page: Page) {
    super(page)
    this.pageTitle = page.getByRole('heading', { name: /додати нову адресу/i })
    this.propertyTypeCards = {
      apartment: page.getByText('Квартира').locator('..'),
      house: page.getByText('Приватний будинок').locator('..'),
      office: page.getByText('Офіс').locator('..'),
    }
    this.regionSelect = page.locator('#region')
    this.cityInput = page.locator('#city')
    this.streetInput = page.locator('#street')
    this.buildingNumberInput = page.locator('#buildingNumber')
    this.unitNumberInput = page.locator('#unitNumber')
    this.postalCodeInput = page.locator('#postalCode')
    this.notesTextarea = page.locator('#notes')
    this.isPrimaryCheckbox = page.locator('#isPrimary')
    this.saveButton = page.getByRole('button', { name: /зберегти адресу/i })
    this.cancelButton = page.getByRole('button', { name: /скасувати/i })
    this.formErrors = page.locator('[class*="text-red"]')
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL('/addresses/new')
    await expect(this.pageTitle).toBeVisible()
  }

  async selectPropertyType(type: PropertyType): Promise<void> {
    await this.propertyTypeCards[type].click()
  }

  async fillAddressForm(data: {
    propertyType: PropertyType
    region: string
    city: string
    street: string
    buildingNumber: string
    unitNumber: string
    postalCode: string
    notes?: string
    isPrimary?: boolean
  }): Promise<void> {
    await this.selectPropertyType(data.propertyType)

    await this.regionSelect.selectOption(data.region)
    await this.cityInput.fill(data.city)
    await this.streetInput.fill(data.street)
    await this.buildingNumberInput.fill(data.buildingNumber)
    await this.unitNumberInput.fill(data.unitNumber)
    await this.postalCodeInput.fill(data.postalCode)

    if (data.notes) {
      await this.notesTextarea.fill(data.notes)
    }

    if (data.isPrimary) {
      await this.isPrimaryCheckbox.check()
    }
  }

  async submitForm(): Promise<void> {
    await this.saveButton.click()
  }

  async cancelForm(): Promise<void> {
    await this.cancelButton.click()
    await this.page.waitForURL('/addresses')
  }

  async expectSaveButtonDisabled(): Promise<void> {
    await expect(this.saveButton).toBeDisabled()
  }

  async expectSaveButtonEnabled(): Promise<void> {
    await expect(this.saveButton).toBeEnabled()
  }

  async expectFormFieldsDisabled(): Promise<void> {
    await expect(this.regionSelect).toBeDisabled()
    await expect(this.cityInput).toBeDisabled()
    await expect(this.streetInput).toBeDisabled()
  }

  async expectFormFieldsEnabled(): Promise<void> {
    await expect(this.regionSelect).toBeEnabled()
    await expect(this.cityInput).toBeEnabled()
    await expect(this.streetInput).toBeEnabled()
  }

  async expectValidationError(errorText: string | RegExp): Promise<void> {
    await expect(this.page.getByText(errorText)).toBeVisible()
  }

  async expectSuccessRedirect(): Promise<void> {
    await this.page.waitForURL('/addresses')
  }

  async expectPropertyTypeSelected(type: PropertyType): Promise<void> {
    const card = this.propertyTypeCards[type]
    await expect(card).toHaveAttribute('aria-selected', 'true')
  }

  async expectStepCompleted(stepName: string): Promise<void> {
    const step = this.page.getByText(stepName)
    await expect(step).toBeVisible()
  }
}
