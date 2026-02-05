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

  readonly templatesSection: Locator
  readonly providerCards: Locator

  constructor(page: Page) {
    super(page)

    this.pageHeading = page.getByRole('heading', { name: /мої провайдери/i, level: 1 })
    this.pageSubtitle = page.getByText(/керуйте тарифами води, газу, електрики та тепла/i)
    this.addProviderButton = page.getByRole('button', { name: /додати провайдера/i })

    this.journalHeading = page.getByRole('heading', { name: /журнал провайдерів/i })
    this.whatsNextInfo = page.getByText(/що далі\?/i)
    this.securityInfo = page.getByText(/безпека даних/i)

    this.templatesSection = page.getByText(/шаблони провайдерів/i)
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

  async expectServiceCategoryVisible(category: string): Promise<void> {
    const categoryHeading = this.page.getByRole('heading', { name: category })
    await expect(categoryHeading).toBeVisible()
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
  readonly serviceTypeSelect: Locator
  readonly websiteInput: Locator
  readonly descriptionInput: Locator
  readonly tariffNameInput: Locator
  readonly tariffPriceInput: Locator
  readonly addTariffButton: Locator

  readonly cancelButton: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    super(page)

    this.pageHeading = page.getByRole('heading', { name: /додати провайдера/i, level: 1 })
    this.breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' })

    this.nameInput = page.getByLabel(/назва провайдера/i)
    this.serviceTypeSelect = page.getByRole('combobox', { name: /тип послуги/i })
    this.websiteInput = page.getByLabel(/веб-сайт/i)
    this.descriptionInput = page.getByLabel(/опис/i)
    this.tariffNameInput = page.getByLabel(/назва тарифу/i)
    this.tariffPriceInput = page.getByLabel(/ціна/i)
    this.addTariffButton = page.getByRole('button', { name: /додати тариф/i })

    this.cancelButton = page.getByRole('button', { name: /скасувати/i })
    this.submitButton = page.getByRole('button', { name: /зберегти/i })
  }

  async fillProviderForm(data: {
    name: string;
    serviceType?: string;
    website?: string;
    description?: string;
  }): Promise<void> {
    await this.nameInput.fill(data.name)
    if (data.serviceType) {
      await this.serviceTypeSelect.selectOption({ label: data.serviceType })
    }
    if (data.website) {
      await this.websiteInput.fill(data.website)
    }
    if (data.description) {
      await this.descriptionInput.fill(data.description)
    }
  }

  async addTariff(name: string, price: string): Promise<void> {
    await this.tariffNameInput.fill(name)
    await this.tariffPriceInput.fill(price)
    await this.addTariffButton.click()
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
