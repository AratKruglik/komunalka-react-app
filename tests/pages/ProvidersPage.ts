import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class ProvidersPage extends BasePage {
  readonly url = '/providers'

  readonly pageHeading: Locator
  readonly pageSubtitle: Locator
  readonly addProviderButton: Locator

  readonly journalHeading: Locator
  readonly whatsNextInfo: Locator
  readonly securityInfo: Locator

  readonly providerCards: Locator

  constructor(page: Page) {
    super(page)

    this.pageHeading = page.getByRole('heading', { name: /мої провайдери/i, level: 1 })
    this.pageSubtitle = page.getByText(/керуйте тарифами води, газу, електрики та тепла/i)
    this.addProviderButton = page.getByRole('button', { name: /додати провайдера/i }).first()

    this.journalHeading = page.getByRole('heading', { name: /журнал провайдерів/i })
    this.whatsNextInfo = page.getByText(/що далі\?/i)
    this.securityInfo = page.getByText(/безпека даних/i)

    this.providerCards = page.locator('article')
  }

  async clickAddProvider(): Promise<void> {
    await this.addProviderButton.click()
  }

  async getProviderCard(providerName: string): Promise<Locator> {
    return this.page.locator('article').filter({ hasText: providerName })
  }

  async getEditButton(providerName: string): Promise<Locator> {
    return this.page.getByRole('button', { name: new RegExp(`редагувати ${providerName}`, 'i') })
  }

  async getDeleteButton(providerName: string): Promise<Locator> {
    return this.page.getByRole('button', { name: new RegExp(`видалити ${providerName}`, 'i') })
  }

  async clickEditProvider(providerName: string): Promise<void> {
    const editButton = await this.getEditButton(providerName)
    await editButton.click()
  }

  async clickDeleteProvider(providerName: string): Promise<void> {
    const deleteButton = await this.getDeleteButton(providerName)
    await deleteButton.click()
  }

  async expectPageVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible()
    await expect(this.journalHeading).toBeVisible()
    await expect(this.addProviderButton).toBeVisible()
  }

  async expectProviderVisible(providerName: string): Promise<void> {
    const card = await this.getProviderCard(providerName)
    await expect(card).toBeVisible()
  }

  async expectProviderHasTariff(providerName: string, tariffName: string): Promise<void> {
    const card = await this.getProviderCard(providerName)
    const tariff = card.getByText(tariffName)
    await expect(tariff).toBeVisible()
  }

  async getProviderCount(): Promise<number> {
    const cards = await this.providerCards.all()
    return cards.length
  }

  async expectProviderWebsiteLink(providerName: string, expectedUrl: string): Promise<void> {
    const card = await this.getProviderCard(providerName)
    const link = card.getByRole('link')
    await expect(link).toHaveAttribute('href', expectedUrl)
  }
}

export class AddProviderPage extends BasePage {
  readonly url = '/providers/new'

  readonly pageHeading: Locator
  readonly breadcrumb: Locator

  readonly nameInput: Locator
  readonly websiteInput: Locator
  readonly descriptionInput: Locator
  readonly addTariffButton: Locator

  readonly cancelButton: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    super(page)

    this.pageHeading = page.getByRole('heading', { name: /додати провайдера/i, level: 1 })
    this.breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' })

    this.nameInput = page.getByLabel(/назва провайдера/i)
    this.websiteInput = page.getByLabel(/офіційний сайт/i)
    this.descriptionInput = page.getByLabel(/нотатки/i)
    this.addTariffButton = page.getByRole('button', { name: /додати тариф/i })

    this.cancelButton = page.getByRole('button', { name: /скасувати/i })
    this.submitButton = page.getByRole('button', { name: /зберегти/i })
  }

  async fillProviderForm(data: {
    name: string;
    website?: string;
    description?: string;
  }): Promise<void> {
    await this.nameInput.fill(data.name)
    if (data.website) {
      await this.websiteInput.fill(data.website)
    }
    if (data.description) {
      await this.descriptionInput.fill(data.description)
    }
  }

  async selectUtilityType(utilityTypeName: string): Promise<void> {
    const radioCard = this.page.getByText(utilityTypeName, { exact: true }).first()
    await radioCard.click()
  }

  getTariffNameInput(index: number): Locator {
    return this.page.getByLabel(/назва тарифу/i).nth(index)
  }

  getTariffPricingModelInput(index: number): Locator {
    return this.page.getByLabel(/тип тарифу/i).nth(index)
  }

  getTariffBaseRateInput(index: number): Locator {
    return this.page.getByLabel(/базова ставка/i).nth(index)
  }

  getTariffServiceFeeInput(index: number): Locator {
    return this.page.getByLabel(/абонплата/i).nth(index)
  }

  async fillTariff(index: number, data: {
    name: string;
    pricingModel: string;
    baseRate: string;
    serviceFee?: string;
  }): Promise<void> {
    await this.getTariffNameInput(index).fill(data.name)
    await this.getTariffPricingModelInput(index).fill(data.pricingModel)
    await this.getTariffBaseRateInput(index).fill(data.baseRate)
    if (data.serviceFee) {
      await this.getTariffServiceFeeInput(index).fill(data.serviceFee)
    }
  }

  async addTariff(name: string, pricingModel: string, baseRate: string): Promise<void> {
    await this.addTariffButton.click()
    const lastIndex = await this.page.getByLabel(/назва тарифу/i).count() - 1
    await this.fillTariff(lastIndex, { name, pricingModel, baseRate })
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click()
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible()
    await expect(this.nameInput).toBeVisible()
  }

  async expectBreadcrumbVisible(): Promise<void> {
    await expect(this.breadcrumb).toBeVisible()
    await expect(this.breadcrumb.getByText('Провайдери')).toBeVisible()
  }
}
