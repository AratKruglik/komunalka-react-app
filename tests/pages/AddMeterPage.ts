import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export type MeterType = 'electricity' | 'gas' | 'coldWater' | 'hotWater' | 'heat';

export interface MeterFormData {
  addressId?: string;
  meterType?: MeterType;
  serialNumber?: string;
  installationLocation?: string;
  manufacturer?: string;
  installationDate?: string;
  initialReading?: string;
  providerId?: string;
  tariffValue?: string;
  notes?: string;
}

export class AddMeterPage extends BasePage {
  readonly url = '/meters/new'

  readonly pageTitle: Locator
  readonly breadcrumb: Locator
  readonly formHeading: Locator

  readonly addressSelect: Locator
  readonly serialNumberInput: Locator
  readonly installationLocationInput: Locator
  readonly manufacturerInput: Locator
  readonly installationDateInput: Locator
  readonly initialReadingInput: Locator
  readonly providerSelect: Locator
  readonly tariffValueInput: Locator
  readonly notesInput: Locator

  readonly photoDropzone: Locator
  readonly uploadPhotoButton: Locator
  readonly clearPhotoButton: Locator

  readonly cancelButton: Locator
  readonly clearFormButton: Locator
  readonly saveDraftButton: Locator
  readonly submitButton: Locator

  readonly progressBar: Locator
  readonly progressText: Locator
  readonly tipsSection: Locator

  readonly successMessage: Locator
  readonly errorMessage: Locator
  readonly loadingIndicator: Locator

  constructor(page: Page) {
    super(page)

    this.pageTitle = page.getByRole('heading', { name: /додати лічильник/i, level: 1 })
    this.breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' })
    this.formHeading = page.getByRole('heading', { name: /додати новий лічильник/i })

    this.addressSelect = page.locator('select#addressId')
    this.serialNumberInput = page.getByLabel(/серійний номер/i)
    this.installationLocationInput = page.getByLabel(/розташування лічильника/i)
    this.manufacturerInput = page.getByLabel(/модель.*виробник/i)
    this.installationDateInput = page.getByLabel(/дата встановлення/i)
    this.initialReadingInput = page.getByLabel(/початкові показання/i)
    this.providerSelect = page.locator('select#providerId')
    this.tariffValueInput = page.getByLabel(/поточний тариф/i)
    this.notesInput = page.getByLabel(/додаткові примітки/i)

    this.photoDropzone = page.locator('[class*="PhotoDropzone"]').or(
      page.getByText(/перетягніть фото сюди/i).locator('..')
    )
    this.uploadPhotoButton = page.getByRole('button', { name: /завантажити фото/i })
    this.clearPhotoButton = page.getByRole('button', { name: /видалити фото/i })

    this.cancelButton = page.getByRole('button', { name: /скасувати/i })
    this.clearFormButton = page.getByRole('button', { name: /очистити форму/i })
    this.saveDraftButton = page.getByRole('button', { name: /зберегти чернетку/i })
    this.submitButton = page.getByRole('button', { name: /зберегти лічильник/i })

    this.progressBar = page.locator('[class*="h-full rounded-full bg-primary"]')
    this.progressText = page.getByText(/% завершено/)
    this.tipsSection = page.getByText(/поради щодо заповнення/i)

    this.successMessage = page.getByText(/лічильник успішно створено/i)
    this.errorMessage = page.locator('[class*="text-red"]').filter({ hasText: /.+/ })
    this.loadingIndicator = page.getByRole('button', { name: /збереження/i })
  }

  getMeterTypeCard(type: MeterType): Locator {
    const typeLabels: Record<MeterType, string> = {
      electricity: 'Електролічильник',
      gas: 'Газовий лічильник',
      coldWater: 'Лічильник холодної води',
      hotWater: 'Лічильник гарячої води',
      heat: 'Лічильник тепла',
    }
    return this.page.getByRole('button', { name: new RegExp(typeLabels[type], 'i') })
  }

  async selectMeterType(type: MeterType): Promise<void> {
    const card = this.getMeterTypeCard(type)
    await card.click()
  }

  async selectAddress(addressId: string): Promise<void> {
    await this.addressSelect.selectOption(addressId)
  }

  async selectAddressByLabel(label: string): Promise<void> {
    await this.addressSelect.selectOption({ label })
  }

  async selectProvider(providerId: string): Promise<void> {
    await this.providerSelect.selectOption(providerId)
  }

  async selectProviderByLabel(label: string): Promise<void> {
    await this.providerSelect.selectOption({ label: new RegExp(label) })
  }

  async fillMeterForm(data: MeterFormData): Promise<void> {
    if (data.addressId) {
      await this.selectAddress(data.addressId)
    }

    if (data.meterType) {
      await this.selectMeterType(data.meterType)
    }

    if (data.serialNumber) {
      await this.serialNumberInput.fill(data.serialNumber)
    }

    if (data.installationLocation) {
      await this.installationLocationInput.fill(data.installationLocation)
    }

    if (data.manufacturer) {
      await this.manufacturerInput.fill(data.manufacturer)
    }

    if (data.installationDate) {
      await this.installationDateInput.fill(data.installationDate)
    }

    if (data.initialReading) {
      await this.initialReadingInput.fill(data.initialReading)
    }

    if (data.providerId) {
      await this.selectProvider(data.providerId)
    }

    if (data.tariffValue) {
      await this.tariffValueInput.fill(data.tariffValue)
    }

    if (data.notes) {
      await this.notesInput.fill(data.notes)
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async saveDraft(): Promise<void> {
    await this.saveDraftButton.click()
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click()
  }

  async clearForm(): Promise<void> {
    await this.clearFormButton.click()
  }

  async expectPageVisible(): Promise<void> {
    await expect(this.formHeading).toBeVisible()
  }

  async expectBreadcrumbVisible(): Promise<void> {
    await expect(this.breadcrumb).toBeVisible()
    await expect(this.breadcrumb.getByText('Лічильники')).toBeVisible()
    await expect(this.breadcrumb.getByText('Додати лічильник')).toBeVisible()
  }

  async expectAllMeterTypeCardsVisible(): Promise<void> {
    await expect(this.getMeterTypeCard('electricity')).toBeVisible()
    await expect(this.getMeterTypeCard('gas')).toBeVisible()
    await expect(this.getMeterTypeCard('coldWater')).toBeVisible()
    await expect(this.getMeterTypeCard('hotWater')).toBeVisible()
    await expect(this.getMeterTypeCard('heat')).toBeVisible()
  }

  async expectMeterTypeSelected(type: MeterType): Promise<void> {
    const card = this.getMeterTypeCard(type)
    await expect(card).toHaveAttribute('class', /ring-2|border-primary/)
  }

  async expectAddressOptions(expectedOptions: string[]): Promise<void> {
    const options = await this.addressSelect.locator('option').allTextContents()
    for (const expected of expectedOptions) {
      expect(options.some(opt => opt.includes(expected))).toBeTruthy()
    }
  }

  async expectProviderSelectDisabled(): Promise<void> {
    await expect(this.providerSelect).toBeDisabled()
  }

  async expectProviderSelectEnabled(): Promise<void> {
    await expect(this.providerSelect).toBeEnabled()
  }

  async expectProviderOptions(count: number): Promise<void> {
    const options = await this.providerSelect.locator('option').all()
    expect(options.length).toBeGreaterThanOrEqual(count)
  }

  async expectSubmitButtonDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled()
  }

  async expectSubmitButtonEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled()
  }

  async expectValidationError(message: string): Promise<void> {
    const error = this.page.locator('p.text-red-500').filter({ hasText: new RegExp(message, 'i') })
    await expect(error.first()).toBeVisible()
  }

  async expectFieldValidationError(fieldLabel: string, errorMessage: string): Promise<void> {
    const field = this.page.getByLabel(new RegExp(fieldLabel, 'i'))
    const fieldContainer = field.locator('..').locator('..')
    const error = fieldContainer.getByText(new RegExp(errorMessage, 'i'))
    await expect(error).toBeVisible()
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.successMessage).toBeVisible()
  }

  async expectErrorMessage(message?: string): Promise<void> {
    if (message) {
      await expect(this.page.getByText(new RegExp(message, 'i'))).toBeVisible()
    } else {
      await expect(this.errorMessage.first()).toBeVisible()
    }
  }

  async expectLoadingState(): Promise<void> {
    await expect(this.loadingIndicator).toBeVisible()
  }

  async expectProgress(percentage: number): Promise<void> {
    await expect(this.page.getByText(`${percentage}% завершено`)).toBeVisible()
  }

  async expectTipsSectionVisible(): Promise<void> {
    await expect(this.tipsSection).toBeVisible()
  }

  async getProgress(): Promise<string | null> {
    return await this.progressText.textContent()
  }

  async expectFormElements(): Promise<void> {
    await expect(this.addressSelect).toBeVisible()
    await this.expectAllMeterTypeCardsVisible()
    await expect(this.serialNumberInput).toBeVisible()
    await expect(this.installationLocationInput).toBeVisible()
    await expect(this.manufacturerInput).toBeVisible()
    await expect(this.installationDateInput).toBeVisible()
    await expect(this.initialReadingInput).toBeVisible()
    await expect(this.providerSelect).toBeVisible()
    await expect(this.tariffValueInput).toBeVisible()
    await expect(this.notesInput).toBeVisible()
    await expect(this.cancelButton).toBeVisible()
    await expect(this.submitButton).toBeVisible()
  }

  async expectInitialReadingHasMinAttribute(): Promise<void> {
    await expect(this.initialReadingInput).toHaveAttribute('min', '0')
  }

  async expectTariffAutoFilled(value: string): Promise<void> {
    await expect(this.tariffValueInput).toHaveValue(value)
  }

  async expectAddressSelectHasOptions(): Promise<void> {
    const options = await this.addressSelect.locator('option').count()
    expect(options).toBeGreaterThan(1)
  }
}
