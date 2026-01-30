import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly url = '/';

  readonly welcomeHeading: Locator;
  readonly addressSelect: Locator;
  readonly addReadingButton: Locator;

  readonly expensesSection: Locator;
  readonly consumptionChart: Locator;
  readonly expenseDistribution: Locator;
  readonly recentReadingsTable: Locator;
  readonly paymentReminders: Locator;
  readonly quickActionsSection: Locator;

  readonly quickActionAddReading: Locator;
  readonly quickActionAddAddress: Locator;
  readonly quickActionViewTariffs: Locator;

  readonly chartPeriodButtons: {
    year: Locator;
    sixMonths: Locator;
    threeMonths: Locator;
  };

  constructor(page: Page) {
    super(page);

    this.welcomeHeading = page.getByRole('heading', { name: /вітаємо/i });
    this.addressSelect = page.getByRole('combobox');
    this.addReadingButton = page.getByRole('button', { name: /додати показання/i }).first();

    this.expensesSection = page.getByRole('heading', { name: /витрати цього місяця/i });
    this.consumptionChart = page.getByRole('heading', { name: /графік споживання/i });
    this.expenseDistribution = page.getByRole('heading', { name: /розподіл витрат/i });
    this.recentReadingsTable = page.getByRole('heading', { name: /останні показання/i });
    this.paymentReminders = page.getByRole('heading', { name: /нагадування про оплату/i });
    this.quickActionsSection = page.getByRole('heading', { name: /швидкі дії/i });
    const quickActionsCard = page.locator('section').filter({ has: this.quickActionsSection });
    this.quickActionAddReading = quickActionsCard.getByRole('button', { name: /додати показання/i });
    this.quickActionAddAddress = quickActionsCard.getByRole('button', { name: /додати адресу/i });
    this.quickActionViewTariffs = quickActionsCard.getByRole('button', { name: /переглянути тарифи/i });

    this.chartPeriodButtons = {
      year: page.getByRole('button', { name: /за рік/i }).first(),
      sixMonths: page.getByRole('button', { name: /за 6 місяців/i }).first(),
      threeMonths: page.getByRole('button', { name: /за 3 місяці/i }).first(),
    };
  }

  async selectAddress(addressLabel: string): Promise<void> {
    await this.addressSelect.selectOption({ label: addressLabel });
  }

  async clickAddReading(): Promise<void> {
    await this.addReadingButton.click();
  }

  async clickQuickActionAddReading(): Promise<void> {
    await this.quickActionAddReading.click();
  }

  async clickQuickActionAddAddress(): Promise<void> {
    await this.quickActionAddAddress.click();
  }

  async clickQuickActionViewTariffs(): Promise<void> {
    await this.quickActionViewTariffs.click();
  }

  async selectChartPeriod(period: 'year' | 'sixMonths' | 'threeMonths'): Promise<void> {
    await this.chartPeriodButtons[period].click();
  }

  async expectWelcomeMessageVisible(): Promise<void> {
    await expect(this.welcomeHeading).toBeVisible();
  }

  async expectWelcomeMessageContains(name: string): Promise<void> {
    await expect(this.welcomeHeading).toContainText(name);
  }

  async expectMainSectionsVisible(): Promise<void> {
    await expect(this.expensesSection).toBeVisible();
    await expect(this.consumptionChart).toBeVisible();
    await expect(this.expenseDistribution).toBeVisible();
    await expect(this.recentReadingsTable).toBeVisible();
    await expect(this.paymentReminders).toBeVisible();
    await expect(this.quickActionsSection).toBeVisible();
  }

  async expectQuickActionsVisible(): Promise<void> {
    await expect(this.quickActionAddReading).toBeVisible();
    await expect(this.quickActionAddAddress).toBeVisible();
    await expect(this.quickActionViewTariffs).toBeVisible();
  }

  async getServiceCards(): Promise<Locator[]> {
    return await this.page.locator('[class*="rounded-xl"]').filter({ hasText: /грн/i }).all();
  }

  async expectServiceCardVisible(serviceName: string): Promise<void> {
    const card = this.page.locator('[class*="rounded-xl"]').filter({ hasText: serviceName });
    await expect(card).toBeVisible();
  }

  async getRecentReadingsRows(): Promise<Locator[]> {
    return await this.page.locator('table tbody tr').all();
  }
}
