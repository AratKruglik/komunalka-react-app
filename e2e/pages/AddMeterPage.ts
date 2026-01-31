import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

type MeterType = 'electricity' | 'gas' | 'coldWater' | 'hotWater'

export class AddMeterPage extends BasePage {
  readonly url = '/meters/new'

  readonly pageTitle: Locator
  readonly addressSelect: Locator
  readonly meterTypeCards: Record<MeterType, Locator>
  readonly serialNumberInput: Locator
  readonly installationLocationInput: Locator
  readonly manufacturerInput: Locator
  readonly installationDateInput: Locator
  readonly initialReadingInput: Locator
  readonly tariffValueInput: Locator
  readonly providerSelect: Locator
  readonly notesTextarea: Locator
  readonly photoUpload: Locator
  readonly saveButton: Locator
  readonly saveDraftButton: Locator
  readonly cancelButton: Locator
  readonly clearFormButton: Locator
  readonly progressBar: Locator

  constructor(page: Page) {
    super(page)
    this.pageTitle = page.getByRole('heading', { name: /додати новий лічильник/i })
    this.addressSelect = page.locator('#addressId')
    this.meterTypeCards = {
      electricity: page.getByText('Електроенергія').locator('..'),
      gas: page.getByText('Газ').locator('..'),
      coldWater: page.getByText('Холодна вода').locator('..'),
      hotWater: page.getByText('Гаряча вода').locator('..'),
    }
    this.serialNumberInput = page.locator('#serialNumber')
    this.installationLocationInput = page.locator('#installationLocation')
    this.manufacturerInput = page.locator('#manufacturer')
    this.installationDateInput = page.locator('#installationDate')
    this.initialReadingInput = page.locator('#initialReading')
    this.tariffValueInput = page.locator('#tariffValue')
    this.providerSelect = page.locator('#providerId')
    this.notesTextarea = page.locator('#notes')
    this.photoUpload = page.locator('#photoUpload')
    this.saveButton = page.getByRole('button', { name: /зберегти лічильник/i })
    this.saveDraftButton = page.getByRole('button', { name: /зберегти чернетку/i })
    this.cancelButton = page.getByRole('button', { name: /скасувати/i })
    this.clearFormButton = page.getByRole('button', { name: /очистити форму/i })
    this.progressBar = page.locator('[class*="progress"], [role="progressbar"]')
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL('/meters/new')
    await expect(this.pageTitle).toBeVisible()
  }

  async selectAddress(addressLabel: string): Promise<void> {
    await this.addressSelect.selectOption({ label: addressLabel })
  }

  async selectMeterType(type: MeterType): Promise<void> {
    await this.meterTypeCards[type].click()
  }

  async fillMeterForm(data: {
    addressLabel: string
    meterType: MeterType
    serialNumber: string
    installationLocation?: string
    manufacturer?: string
    installationDate: string
    initialReading: string
    tariffValue: string
    notes?: string
  }): Promise<void> {
    await this.selectAddress(data.addressLabel)
    await this.selectMeterType(data.meterType)

    await this.serialNumberInput.fill(data.serialNumber)

    if (data.installationLocation) {
      await this.installationLocationInput.fill(data.installationLocation)
    }

    if (data.manufacturer) {
      await this.manufacturerInput.fill(data.manufacturer)
    }

    await this.installationDateInput.fill(data.installationDate)
    await this.initialReadingInput.fill(data.initialReading)
    await this.tariffValueInput.fill(data.tariffValue)

    if (data.notes) {
      await this.notesTextarea.fill(data.notes)
    }
  }

  async submitForm(): Promise<void> {
    await this.saveButton.click()
  }

  async saveDraft(): Promise<void> {
    await this.saveDraftButton.click()
  }

  async cancelForm(): Promise<void> {
    await this.cancelButton.click()
  }

  async clearForm(): Promise<void> {
    await this.clearFormButton.click()
  }

  async expectValidationError(errorText: string | RegExp): Promise<void> {
    await expect(this.page.getByText(errorText)).toBeVisible()
  }

  async expectProgressPercentage(percentage: number): Promise<void> {
    await expect(this.page.getByText(`${percentage}% завершено`)).toBeVisible()
  }

  async expectProviderSelectEnabled(): Promise<void> {
    await expect(this.providerSelect).toBeEnabled()
  }

  async expectProviderSelectDisabled(): Promise<void> {
    await expect(this.providerSelect).toBeDisabled()
  }

  async selectProvider(providerLabel: string): Promise<void> {
    await this.providerSelect.selectOption({ label: providerLabel })
  }

  async expectTariffAutoFilled(): Promise<void> {
    const tariffValue = await this.tariffValueInput.inputValue()
    expect(parseFloat(tariffValue)).toBeGreaterThan(0)
  }

  async uploadPhoto(filePath: string): Promise<void> {
    await this.photoUpload.setInputFiles(filePath)
  }

  async expectPhotoUploaded(fileName: string | RegExp): Promise<void> {
    await expect(this.page.getByText(fileName)).toBeVisible()
  }
}
