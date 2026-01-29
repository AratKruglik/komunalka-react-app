import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MeterPage extends BasePage {
  readonly url = '/meters';

  readonly meterList: Locator;
  readonly addMeterButton: Locator;
  readonly meterTypeFilter: Locator;

  constructor(page: Page) {
    super(page);
    this.meterList = page.getByTestId('meter-list');
    this.addMeterButton = page.getByRole('button', { name: /add meter|додати лічильник/i });
    this.meterTypeFilter = page.getByTestId('meter-type-filter');
  }

  async getMeterCards(): Promise<Locator> {
    return this.meterList.getByTestId('meter-card');
  }

  async clickAddMeter(): Promise<void> {
    await this.addMeterButton.click();
  }

  async filterByType(type: string): Promise<void> {
    await this.meterTypeFilter.selectOption(type);
  }

  async expectMeterCount(count: number): Promise<void> {
    const cards = await this.getMeterCards();
    await expect(cards).toHaveCount(count);
  }

  async selectMeter(serialNumber: string): Promise<void> {
    const card = this.meterList.getByText(serialNumber);
    await card.click();
  }
}
