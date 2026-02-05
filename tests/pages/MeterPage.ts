import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export type MeterType = 'electricity' | 'gas' | 'coldWater' | 'hotWater' | 'heat';

export class MeterPage extends BasePage {
  readonly url = '/meters'

  readonly addressSelect: Locator
  readonly addMeterButton: Locator
  readonly loadingIndicator: Locator
  readonly noMetersMessage: Locator

  readonly totalMetersCount: Locator
  readonly activeMetersCount: Locator
  readonly pendingReadingsCount: Locator

  readonly meterTypeTabs: Locator
  readonly currentMeterTypeTitle: Locator
  readonly metersList: Locator

  readonly quickFormMeterSelect: Locator
  readonly quickFormPeriodSelect: Locator
  readonly quickFormValueInput: Locator
  readonly quickFormSubmitButton: Locator
  readonly quickFormSuccessMessage: Locator
  readonly quickFormPreviousValue: Locator

  readonly historyTable: Locator
  readonly downloadPdfButton: Locator

  constructor(page: Page) {
    super(page)

    this.addressSelect = page.getByRole('combobox', { name: /адреса/i })
    this.addMeterButton = page.getByRole('button', { name: /додати лічильник/i })
    this.loadingIndicator = page.getByText(/завантаження/i)
    this.noMetersMessage = page.getByText(/немає збережених лічильників/i)

    this.totalMetersCount = page.getByText('Всього лічильників').locator('..').locator('p').nth(1)
    this.activeMetersCount = page.getByText('Активні').locator('..').locator('p').nth(1)
    this.pendingReadingsCount = page.getByText('Очікують показань').locator('..').locator('p').nth(1)

    this.meterTypeTabs = page.locator('[class*="flex min-w-max gap-3"]')
    this.currentMeterTypeTitle = page.locator('section h3')
    this.metersList = page.locator('section').filter({ hasText: /лічильники?$/ }).locator('[class*="space-y-4"]')

    this.quickFormMeterSelect = page.getByRole('combobox', { name: /лічильник/i })
    this.quickFormPeriodSelect = page.getByRole('combobox', { name: /місяць/i })
    this.quickFormValueInput = page.getByRole('spinbutton', { name: /нові показання/i })
    this.quickFormSubmitButton = page.getByRole('button', { name: /зберегти показання/i })
    this.quickFormSuccessMessage = page.getByText(/збережено як чернетку/i)
    this.quickFormPreviousValue = page.getByText(/останнє значення/i)

    this.historyTable = page.locator('[class*="divide-y divide-gray-100"]')
    this.downloadPdfButton = page.getByRole('button', { name: /завантажити pdf/i })
  }

  async selectAddress(addressLabel: string): Promise<void> {
    await this.addressSelect.selectOption({ label: addressLabel })
  }

  async selectAddressByIndex(index: number): Promise<void> {
    const options = await this.page.locator('select[id="address-select"] option').all()
    if (index < options.length) {
      const value = await options[index].getAttribute('value')
      if (value) {
        await this.addressSelect.selectOption(value)
      }
    }
  }

  async getAddressOptions(): Promise<string[]> {
    const options = await this.page.locator('select[id="address-select"] option').allTextContents()
    return options
  }

  async clickAddMeter(): Promise<void> {
    await this.addMeterButton.click()
  }

  async getTotalMeters(): Promise<string> {
    return await this.totalMetersCount.textContent() ?? '0'
  }

  async getActiveMeters(): Promise<string> {
    return await this.activeMetersCount.textContent() ?? '0'
  }

  async getPendingReadings(): Promise<string> {
    return await this.pendingReadingsCount.textContent() ?? '0'
  }

  async expectStatistics(total: number, active: number, pending: number): Promise<void> {
    await expect(this.totalMetersCount).toHaveText(String(total))
    await expect(this.activeMetersCount).toHaveText(String(active))
    await expect(this.pendingReadingsCount).toHaveText(String(pending))
  }

  getMeterTypeTab(type: MeterType): Locator {
    const tabLabels: Record<MeterType, string> = {
      electricity: 'Електролічильник',
      gas: 'Газовий лічильник',
      coldWater: 'Лічильник холодної води',
      hotWater: 'Лічильник гарячої води',
      heat: 'Лічильник тепла',
    }
    return this.page.getByRole('button', { name: new RegExp(tabLabels[type], 'i') })
  }

  async selectMeterType(type: MeterType): Promise<void> {
    const tab = this.getMeterTypeTab(type)
    await tab.click()
  }

  async expectMeterTypeActive(type: MeterType): Promise<void> {
    const tab = this.getMeterTypeTab(type)
    await expect(tab).toHaveAttribute('class', /ring-2/)
  }

  async getMeterCards(): Promise<Locator[]> {
    return await this.page.locator('[class*="rounded-xl border border-gray-100 bg-gray-50 p-4"]').all()
  }

  async getMeterCardBySerial(serialNumber: string): Promise<Locator> {
    return this.page.locator('[class*="rounded-xl border border-gray-100 bg-gray-50 p-4"]').filter({
      hasText: serialNumber,
    })
  }

  async expectMeterCardVisible(serialNumber: string): Promise<void> {
    const card = await this.getMeterCardBySerial(serialNumber)
    await expect(card).toBeVisible()
  }

  async expectMeterDetails(
    serialNumber: string,
    details: { name?: string; location?: string; provider?: string; status?: string }
  ): Promise<void> {
    const card = await this.getMeterCardBySerial(serialNumber)
    await expect(card).toBeVisible()

    if (details.name) {
      await expect(card.getByText(details.name)).toBeVisible()
    }
    if (details.location) {
      await expect(card.getByText(new RegExp(`Локація:.*${details.location}`))).toBeVisible()
    }
    if (details.provider) {
      await expect(card.getByText(new RegExp(`Провайдер:.*${details.provider}`))).toBeVisible()
    }
    if (details.status) {
      await expect(card.getByText(details.status)).toBeVisible()
    }
  }

  async fillQuickReadingForm(value: string, options?: { meterId?: string; period?: string }): Promise<void> {
    if (options?.meterId) {
      await this.quickFormMeterSelect.selectOption(options.meterId)
    }
    if (options?.period) {
      await this.quickFormPeriodSelect.selectOption(options.period)
    }
    await this.quickFormValueInput.fill(value)
  }

  async submitQuickReading(): Promise<void> {
    await this.quickFormSubmitButton.click()
  }

  async submitReading(value: string, options?: { meterId?: string; period?: string }): Promise<void> {
    await this.fillQuickReadingForm(value, options)
    await this.submitQuickReading()
  }

  async expectQuickFormSubmitDisabled(): Promise<void> {
    await expect(this.quickFormSubmitButton).toBeDisabled()
  }

  async expectQuickFormSubmitEnabled(): Promise<void> {
    await expect(this.quickFormSubmitButton).toBeEnabled()
  }

  async expectQuickFormSuccess(): Promise<void> {
    await expect(this.page.getByText(/збережено як чернетку/i)).toBeVisible()
  }

  async expectPreviousValueDisplayed(): Promise<void> {
    await expect(this.quickFormPreviousValue).toBeVisible()
  }

  async getHistoryRows(): Promise<Locator[]> {
    return await this.historyTable.locator('> div').all()
  }

  async expectHistoryRowCount(count: number): Promise<void> {
    const rows = await this.getHistoryRows()
    expect(rows.length).toBe(count)
  }

  async expectHistoryContains(period: string, value: string, status: string): Promise<void> {
    const row = this.historyTable.locator('> div').filter({ hasText: period })
    await expect(row).toBeVisible()
    await expect(row.getByText(new RegExp(value))).toBeVisible()
    await expect(row.getByText(status)).toBeVisible()
  }

  async clickDownloadPdf(): Promise<void> {
    await this.downloadPdfButton.click()
  }

  async expectLoading(): Promise<void> {
    await expect(this.loadingIndicator).toBeVisible()
  }

  async expectNoMeters(): Promise<void> {
    await expect(this.noMetersMessage).toBeVisible()
  }

  async waitForMetersLoad(): Promise<void> {
    await this.page.waitForResponse((response) =>
      response.url().includes('/meters') && response.status() === 200
    )
  }

  async expectMeterTypeTabCount(type: MeterType, count: number): Promise<void> {
    const tab = this.getMeterTypeTab(type)
    await expect(tab.getByText(new RegExp(`${count}\\s*ліч`))).toBeVisible()
  }
}
