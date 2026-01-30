import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

type MeterType = 'electricity' | 'gas' | 'coldWater' | 'hotWater' | 'heat'

export class MetersPage extends BasePage {
  readonly url = '/meters'

  readonly pageTitle: Locator
  readonly addressSelect: Locator
  readonly addMeterButton: Locator
  readonly meterTypeTabs: Locator
  readonly metersList: Locator
  readonly quickReadingForm: Locator
  readonly historyTable: Locator
  readonly totalMetersCount: Locator
  readonly activeMetersCount: Locator
  readonly pendingReadingsCount: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    super(page)
    this.pageTitle = page.getByRole('heading', { name: /лічильники за адресою/i })
    this.addressSelect = page.locator('#address-select')
    this.addMeterButton = page.getByRole('button', { name: /додати лічильник/i })
    this.meterTypeTabs = page.locator('[role="tablist"], [class*="Tabs"]')
    this.metersList = page.locator('article, [class*="meter"]').filter({ has: page.locator('[class*="serial"], [class*="number"]') })
    this.quickReadingForm = page.locator('form').filter({ has: page.locator('#quick-value') })
    this.historyTable = page.getByText(/історія показань/i).locator('..').locator('..')
    this.totalMetersCount = page.getByText(/всього лічильників/i).locator('..').locator('p.text-3xl')
    this.activeMetersCount = page.getByText(/активні/i).locator('..').locator('p.text-3xl')
    this.pendingReadingsCount = page.getByText(/очікують показань/i).locator('..').locator('p.text-3xl')
    this.emptyState = page.getByText(/немає лічильників|для цієї адреси поки що немає/i)
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL('/meters')
    await expect(this.addressSelect).toBeVisible()
  }

  async selectAddress(addressLabel: string): Promise<void> {
    await this.addressSelect.selectOption({ label: addressLabel })
  }

  async clickAddMeter(): Promise<void> {
    await this.addMeterButton.click()
    await this.page.waitForURL('/meters/new')
  }

  async selectMeterType(type: MeterType): Promise<void> {
    const tabLabels: Record<MeterType, string> = {
      electricity: 'Електроенергія',
      gas: 'Газ',
      coldWater: 'Холодна вода',
      hotWater: 'Гаряча вода',
      heat: 'Опалення',
    }
    const tab = this.page.getByRole('tab', { name: new RegExp(tabLabels[type], 'i') })
    await tab.click()
  }

  async expectMeterTypeTabActive(type: MeterType): Promise<void> {
    const tabLabels: Record<MeterType, string> = {
      electricity: 'Електроенергія',
      gas: 'Газ',
      coldWater: 'Холодна вода',
      hotWater: 'Гаряча вода',
      heat: 'Опалення',
    }
    const tab = this.page.getByRole('tab', { name: new RegExp(tabLabels[type], 'i') })
    await expect(tab).toHaveAttribute('aria-selected', 'true')
  }

  async expectMeterInList(serialNumber: string | RegExp): Promise<void> {
    const meterElement = this.page.getByText(serialNumber)
    await expect(meterElement).toBeVisible()
  }

  async getMeterCard(serialNumber: string | RegExp): Promise<Locator> {
    return this.page.locator('div').filter({ hasText: serialNumber }).first()
  }

  async fillQuickReading(value: string): Promise<void> {
    await this.page.locator('#quick-value').fill(value)
  }

  async submitQuickReading(): Promise<void> {
    await this.page.getByRole('button', { name: /зберегти показання/i }).click()
  }

  async expectQuickReadingSuccess(): Promise<void> {
    await expect(this.page.getByText(/збережено/i)).toBeVisible()
  }

  async expectStatsSummary(): Promise<void> {
    await expect(this.totalMetersCount).toBeVisible()
    await expect(this.activeMetersCount).toBeVisible()
    await expect(this.pendingReadingsCount).toBeVisible()
  }

  async expectHistoryTable(): Promise<void> {
    const historyHeader = this.page.getByText(/історія показань/i)
    await expect(historyHeader).toBeVisible()
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState.first()).toBeVisible()
  }

  async clickUpdateMeterData(serialNumber: string | RegExp): Promise<void> {
    const meterCard = await this.getMeterCard(serialNumber)
    const updateButton = meterCard.getByRole('button', { name: /оновити дані/i })
    await updateButton.click()
  }
}
