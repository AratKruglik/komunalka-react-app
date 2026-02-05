import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class AddReadingsPage extends BasePage {
  readonly url = '/readings/new'

  readonly pageHeading: Locator
  readonly pageSubtitle: Locator

  readonly addressSelect: Locator
  readonly addressLabel: Locator
  readonly addMeterButton: Locator

  readonly noMetersMessage: Locator
  readonly readingCards: Locator
  readonly summaryTable: Locator

  readonly submitButton: Locator
  readonly successMessage: Locator
  readonly errorMessage: Locator
  readonly loadingIndicator: Locator

  constructor(page: Page) {
    super(page)

    this.pageHeading = page.getByRole('heading', { name: /внести показання/i, level: 1 })
    this.pageSubtitle = page.getByText(/заповніть форму для кожного лічильника/i)

    this.addressSelect = page.getByRole('combobox', { name: /адреса/i })
    this.addressLabel = page.getByText('Адреса').first()
    this.addMeterButton = page.getByRole('button', { name: /додати лічильник/i })

    this.noMetersMessage = page.getByText(/немає лічильників для вибраної адреси/i)
    this.readingCards = page.locator('[class*="rounded-xl"]').filter({ hasText: /показання/i })
    this.summaryTable = page.locator('table')

    this.submitButton = page.getByRole('button', { name: /зберегти/i })
    this.successMessage = page.getByText('Показання успішно збережено!')
    this.errorMessage = page.locator('[class*="error"]')
    this.loadingIndicator = page.getByText(/збереження/i)
  }

  async selectAddress(addressLabel: string): Promise<void> {
    await this.addressSelect.selectOption({ label: addressLabel })
  }

  async selectAddressByIndex(index: number): Promise<void> {
    const options = await this.page.locator('select option').allTextContents()
    if (index < options.length) {
      await this.addressSelect.selectOption({ index })
    }
  }

  async clickAddMeter(): Promise<void> {
    await this.addMeterButton.click()
  }

  async getReadingCard(meterName: string): Promise<Locator> {
    return this.page.locator('[class*="rounded-xl"]').filter({ hasText: meterName })
  }

  async fillReadingValue(meterName: string, value: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    const input = card.getByRole('spinbutton').or(card.getByRole('textbox'))
    await input.fill(value)
  }

  async fillReadingDate(meterName: string, date: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    const dateInput = card.locator('input[type="date"]')
    await dateInput.fill(date)
  }

  async selectTariff(meterName: string, tariffLabel: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    const select = card.getByRole('combobox')
    await select.selectOption({ label: tariffLabel })
  }

  async uploadPhoto(meterName: string, filePath: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    const fileInput = card.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async expectPageVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible()
    await expect(this.addressSelect).toBeVisible()
  }

  async expectNoMetersMessage(): Promise<void> {
    await expect(this.noMetersMessage).toBeVisible()
    await expect(this.submitButton).toBeDisabled()
  }

  async expectReadingCardVisible(meterName: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    await expect(card).toBeVisible()
  }

  async expectPreviousValueDisplayed(meterName: string, value: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    const previousValue = card.getByText(new RegExp(value))
    await expect(previousValue).toBeVisible()
  }

  async expectSummaryTableVisible(): Promise<void> {
    await expect(this.summaryTable).toBeVisible()
  }

  async expectSummaryRow(service: string, consumption: string): Promise<void> {
    const row = this.summaryTable.locator('tr').filter({ hasText: service })
    await expect(row.getByText(consumption)).toBeVisible()
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled()
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled()
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.successMessage).toBeVisible()
  }

  async expectErrorMessage(message?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible()
    if (message) {
      await expect(this.errorMessage).toContainText(message)
    }
  }

  async expectConsumptionCalculated(meterName: string, consumption: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    const consumptionText = card.getByText(new RegExp(`споживання.*${consumption}`, 'i'))
    await expect(consumptionText).toBeVisible()
  }

  async expectEstimatedCost(meterName: string, cost: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    const costText = card.getByText(new RegExp(cost))
    await expect(costText).toBeVisible()
  }

  async getAddressOptions(): Promise<string[]> {
    return await this.page.locator('select#address-select option').allTextContents()
  }

  async expectAddressOptionCount(count: number): Promise<void> {
    const options = await this.getAddressOptions()
    expect(options.length).toBe(count)
  }

  async getReadingInput(meterName: string): Promise<Locator> {
    const card = await this.getReadingCard(meterName)
    return card.getByRole('spinbutton').first()
  }

  async getPreviousReadingValue(meterName: string): Promise<string> {
    const card = await this.getReadingCard(meterName)
    const previousInput = card.locator('input[readonly]').first()
    return (await previousInput.inputValue()) || ''
  }

  async expectPreviousReadingVisible(meterName: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    const previousLabel = card.getByText(/попередні показання/i)
    await expect(previousLabel).toBeVisible()
  }

  async getConsumptionValue(meterName: string): Promise<string> {
    const card = await this.getReadingCard(meterName)
    const consumptionRow = card.locator('dt:has-text("Споживання:") + dd, dd:has(+ dt:has-text("Споживання:"))').first()
    if (await consumptionRow.count() === 0) {
      const consumptionText = card.getByText(/споживання:/i).locator('..').locator('dd')
      return (await consumptionText.textContent()) || ''
    }
    return (await consumptionRow.textContent()) || ''
  }

  async expectConsumptionValue(meterName: string, expectedValue: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    const consumptionSection = card.locator('dl').filter({ hasText: /споживання/i })
    await expect(consumptionSection).toContainText(expectedValue)
  }

  async expectEstimatedCostVisible(meterName: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    const costLabel = card.getByText(/вартість/i)
    await expect(costLabel).toBeVisible()
  }

  async expectEstimatedCostValue(meterName: string, expectedCost: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    const costSection = card.locator('dl').filter({ hasText: /вартість/i })
    await expect(costSection).toContainText(expectedCost)
  }

  async expectWarningForLowerValue(meterName: string): Promise<void> {
    const card = await this.getReadingCard(meterName)
    const consumption = await this.getConsumptionValue(meterName)
    expect(consumption).toContain('0')
  }

  async expectSubmitLoading(): Promise<void> {
    await expect(this.loadingIndicator).toBeVisible()
  }

  async expectSubmitNotLoading(): Promise<void> {
    await expect(this.loadingIndicator).not.toBeVisible()
  }

  async fillAllReadings(readings: Array<{ meterName: string; value: string }>): Promise<void> {
    for (const reading of readings) {
      await this.fillReadingValue(reading.meterName, reading.value)
    }
  }

  async expectReadingCardsCount(count: number): Promise<void> {
    const cards = this.page.locator('[class*="shadow-lg"]').filter({ hasText: /поточні показання/i })
    await expect(cards).toHaveCount(count)
  }

  async expectSummaryTableHasRows(count: number): Promise<void> {
    const rows = this.summaryTable.locator('tbody tr')
    await expect(rows).toHaveCount(count)
  }

  async getReadingDateInput(meterName: string): Promise<Locator> {
    const card = await this.getReadingCard(meterName)
    return card.locator('input[type="date"]')
  }

  async getTariffSelect(meterName: string): Promise<Locator> {
    const card = await this.getReadingCard(meterName)
    return card.getByRole('combobox').first()
  }

  async expectInputValidationError(meterName: string): Promise<void> {
    const input = await this.getReadingInput(meterName)
    const isInvalid = await input.evaluate((el: HTMLInputElement) => el.validity.valid === false)
    expect(isInvalid).toBe(true)
  }
}
