import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class DashboardPage extends BasePage {
  readonly url = '/'

  readonly welcomeHeader: Locator
  readonly addressDropdown: Locator
  readonly serviceCards: Locator
  readonly consumptionChart: Locator
  readonly expenseDistribution: Locator
  readonly recentReadingsTable: Locator
  readonly paymentReminders: Locator
  readonly quickActions: Locator
  readonly addReadingButton: Locator
  readonly addMeterButton: Locator

  constructor(page: Page) {
    super(page)
    this.welcomeHeader = page.getByText(/привіт|вітаємо/i).first()
    this.addressDropdown = page.locator('select').first()
    this.serviceCards = page.locator('[class*="ServiceCard"], article').filter({ has: page.locator('h2, h3') })
    this.consumptionChart = page.locator('canvas').first()
    this.expenseDistribution = page.getByText(/розподіл витрат/i).first()
    this.recentReadingsTable = page.getByText(/останні показання/i).first()
    this.paymentReminders = page.getByText(/нагадування про оплату/i).first()
    this.quickActions = page.getByText(/швидкі дії/i).first()
    this.addReadingButton = page.getByRole('link', { name: /внести показання/i })
    this.addMeterButton = page.getByRole('link', { name: /додати лічильник/i })
  }

  async expectDashboardLoaded(): Promise<void> {
    await expect(this.page).toHaveURL('/')
    await expect(this.page.locator('header')).toBeVisible()
  }

  async expectWelcomeMessage(userName?: string): Promise<void> {
    if (userName) {
      await expect(this.page.getByText(new RegExp(userName, 'i'))).toBeVisible()
    }
  }

  async selectAddress(addressLabel: string): Promise<void> {
    await this.addressDropdown.selectOption({ label: addressLabel })
  }

  async expectServiceCardsVisible(): Promise<void> {
    const sections = this.page.locator('section')
    const expensesSection = sections.filter({ hasText: /витрати/i })
    await expect(expensesSection).toBeVisible()
  }

  async expectChartVisible(): Promise<void> {
    await expect(this.consumptionChart).toBeVisible()
  }

  async getServiceCardByType(serviceType: string): Promise<Locator> {
    return this.page.locator('article, [class*="Card"]').filter({ hasText: new RegExp(serviceType, 'i') })
  }

  async expectStatisticsSection(): Promise<void> {
    const statisticsSection = this.page.locator('section').filter({ hasText: /статистика|споживання/i })
    await expect(statisticsSection.first()).toBeVisible()
  }

  async navigateToAddReading(): Promise<void> {
    await this.addReadingButton.click()
    await this.page.waitForURL('/readings/new')
  }

  async navigateToAddMeter(): Promise<void> {
    await this.addMeterButton.click()
    await this.page.waitForURL('/meters/new')
  }

  async expectAddressInDropdown(addressLabel: string | RegExp): Promise<void> {
    const option = this.addressDropdown.locator('option').filter({ hasText: addressLabel })
    await expect(option).toBeVisible()
  }

  async getCurrentAddressLabel(): Promise<string> {
    const selectedOption = this.addressDropdown.locator('option:checked')
    return (await selectedOption.textContent()) ?? ''
  }
}
