import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class ReadingsPage extends BasePage {
  readonly url = '/readings/new'

  readonly pageTitle: Locator
  readonly addressSelect: Locator
  readonly addMeterButton: Locator
  readonly meterCards: Locator
  readonly summaryTable: Locator
  readonly saveButton: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    super(page)
    this.pageTitle = page.getByText(/внести показання/i).first()
    this.addressSelect = page.locator('#address-select')
    this.addMeterButton = page.getByRole('button', { name: /додати лічильник/i })
    this.meterCards = page.locator('[class*="Card"]').filter({ has: page.locator('input[type="number"]') })
    this.summaryTable = page.locator('table, [class*="Table"]').first()
    this.saveButton = page.getByRole('button', { name: /зберегти/i }).last()
    this.emptyState = page.getByText(/немає лічильників для вибраної адреси/i)
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL('/readings/new')
    await expect(this.pageTitle).toBeVisible()
  }

  async selectAddress(addressLabel: string): Promise<void> {
    await this.addressSelect.selectOption({ label: addressLabel })
  }

  async clickAddMeter(): Promise<void> {
    await this.addMeterButton.click()
    await this.page.waitForURL('/meters/new')
  }

  getMeterCard(serviceName: string | RegExp): Locator {
    return this.page.locator('[class*="Card"]').filter({ hasText: serviceName })
  }

  async fillCurrentReading(serviceName: string | RegExp, value: string): Promise<void> {
    const card = this.getMeterCard(serviceName)
    const input = card.locator('input[type="number"]').first()
    await input.fill(value)
  }

  async setReadingDate(serviceName: string | RegExp, date: string): Promise<void> {
    const card = this.getMeterCard(serviceName)
    const dateInput = card.locator('input[type="date"]')
    await dateInput.fill(date)
  }

  async selectTariff(serviceName: string | RegExp, tariffLabel: string): Promise<void> {
    const card = this.getMeterCard(serviceName)
    const select = card.locator('select').first()
    await select.selectOption({ label: tariffLabel })
  }

  async getPreviousReading(serviceName: string | RegExp): Promise<string> {
    const card = this.getMeterCard(serviceName)
    const previousInput = card.locator('input[readonly]').first()
    return (await previousInput.inputValue()) ?? '0'
  }

  async expectConsumptionCalculated(serviceName: string | RegExp, expectedConsumption: number): Promise<void> {
    const card = this.getMeterCard(serviceName)
    const consumptionText = card.getByText(/споживання/i).locator('..').locator('dd')
    const consumptionValue = await consumptionText.textContent()
    expect(consumptionValue).toContain(String(expectedConsumption))
  }

  async expectEstimatedCost(serviceName: string | RegExp): Promise<void> {
    const card = this.getMeterCard(serviceName)
    const costText = card.getByText(/вартість/i)
    await expect(costText).toBeVisible()
  }

  async submitReadings(): Promise<void> {
    await this.saveButton.click()
  }

  async expectSubmissionSuccess(): Promise<void> {
    await expect(this.page.getByText(/успішно збережено/i)).toBeVisible()
  }

  async expectSummaryTable(): Promise<void> {
    const tableHeader = this.page.getByText(/підсумок|summary/i)
    await expect(tableHeader.first()).toBeVisible()
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible()
  }

  async expectMeterCardVisible(serviceName: string | RegExp): Promise<void> {
    const card = this.getMeterCard(serviceName)
    await expect(card).toBeVisible()
  }

  async uploadPhoto(serviceName: string | RegExp, filePath: string): Promise<void> {
    const card = this.getMeterCard(serviceName)
    const fileInput = card.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)
  }

  async expectPhotoUploaded(serviceName: string | RegExp): Promise<void> {
    const card = this.getMeterCard(serviceName)
    const uploadedIndicator = card.getByText(/завантажено|uploaded/i)
    await expect(uploadedIndicator).toBeVisible()
  }

  async getAllMeterServicesNames(): Promise<string[]> {
    const cards = this.page.locator('[class*="CardTitle"]')
    const count = await cards.count()
    const names: string[] = []
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).textContent()
      if (text) names.push(text)
    }
    return names
  }
}
