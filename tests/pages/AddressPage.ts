import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AddressPage extends BasePage {
  readonly url = '/addresses';

  readonly addressList: Locator;
  readonly addAddressButton: Locator;
  readonly searchInput: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.addressList = page.getByTestId('address-list');
    this.addAddressButton = page.getByRole('button', { name: /add|додати/i });
    this.searchInput = page.getByPlaceholder(/search|пошук/i);
    this.emptyState = page.getByTestId('empty-state');
  }

  async getAddressCards(): Promise<Locator> {
    return this.addressList.getByTestId('address-card');
  }

  async clickAddAddress(): Promise<void> {
    await this.addAddressButton.click();
  }

  async searchAddresses(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async expectAddressCount(count: number): Promise<void> {
    const cards = await this.getAddressCards();
    await expect(cards).toHaveCount(count);
  }

  async selectAddress(name: string): Promise<void> {
    const card = this.addressList.getByText(name);
    await card.click();
  }
}
