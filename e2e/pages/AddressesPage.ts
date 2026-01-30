import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class AddressesPage extends BasePage {
  readonly url = '/addresses'

  readonly pageTitle: Locator
  readonly addAddressButton: Locator
  readonly addressCards: Locator
  readonly emptyState: Locator
  readonly loadingState: Locator
  readonly errorState: Locator

  constructor(page: Page) {
    super(page)
    this.pageTitle = page.getByRole('heading', { name: /мої адреси/i })
    this.addAddressButton = page.getByRole('button', { name: /додати адресу/i })
    this.addressCards = page.locator('article')
    this.emptyState = page.getByText(/немає адрес|додайте першу адресу/i)
    this.loadingState = page.locator('.animate-pulse')
    this.errorState = page.getByText(/помилка завантаження/i)
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL('/addresses')
    await expect(this.pageTitle.first()).toBeVisible()
    await expect(this.addAddressButton).toBeVisible()
  }

  async clickAddAddress(): Promise<void> {
    await this.addAddressButton.click()
    await this.page.waitForURL('/addresses/new')
  }

  async expectAddressCount(count: number): Promise<void> {
    await expect(this.addressCards).toHaveCount(count)
  }

  async expectAddressCardVisible(addressText: string | RegExp): Promise<void> {
    const card = this.addressCards.filter({ hasText: addressText })
    await expect(card.first()).toBeVisible()
  }

  getAddressCard(addressText: string | RegExp): Locator {
    return this.addressCards.filter({ hasText: addressText })
  }

  async clickEditAddress(addressText: string | RegExp): Promise<void> {
    const card = this.getAddressCard(addressText)
    const editButton = card.getByRole('button', { name: /редагувати/i })
    await editButton.click()
  }

  async clickDeleteAddress(addressText: string | RegExp): Promise<void> {
    const card = this.getAddressCard(addressText)
    const moreButton = card.getByRole('button', { name: /інші дії/i })
    await moreButton.click()
    const deleteOption = this.page.getByRole('menuitem', { name: /видалити/i })
    await deleteOption.click()
  }

  async expectPrimaryAddressBadge(addressText: string | RegExp): Promise<void> {
    const card = this.getAddressCard(addressText)
    const primaryBadge = card.getByText(/основна/i)
    await expect(primaryBadge).toBeVisible()
  }

  async expectServiceTags(addressText: string | RegExp, services: string[]): Promise<void> {
    const card = this.getAddressCard(addressText)
    for (const service of services) {
      await expect(card.getByText(new RegExp(service, 'i'))).toBeVisible()
    }
  }

  async expectLoadingState(): Promise<void> {
    await expect(this.loadingState.first()).toBeVisible()
  }

  async expectNoLoadingState(): Promise<void> {
    await expect(this.loadingState).toHaveCount(0)
  }
}
