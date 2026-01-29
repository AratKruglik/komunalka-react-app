import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReadingPage extends BasePage {
  readonly url = '/readings';

  readonly readingInput: Locator;
  readonly submitButton: Locator;
  readonly readingHistory: Locator;
  readonly consumptionDisplay: Locator;
  readonly dateInput: Locator;

  constructor(page: Page) {
    super(page);
    this.readingInput = page.getByLabel(/reading|показання/i);
    this.submitButton = page.getByRole('button', { name: /submit|зберегти/i });
    this.readingHistory = page.getByTestId('reading-history');
    this.consumptionDisplay = page.getByTestId('consumption-display');
    this.dateInput = page.getByLabel(/date|дата/i);
  }

  async enterReading(value: string): Promise<void> {
    await this.readingInput.fill(value);
  }

  async submitReading(): Promise<void> {
    await this.submitButton.click();
  }

  async addReading(value: string, date?: string): Promise<void> {
    if (date) {
      await this.dateInput.fill(date);
    }
    await this.enterReading(value);
    await this.submitReading();
  }

  async expectConsumption(value: string): Promise<void> {
    await expect(this.consumptionDisplay).toContainText(value);
  }

  async getHistoryItems(): Promise<Locator> {
    return this.readingHistory.getByTestId('reading-item');
  }
}
