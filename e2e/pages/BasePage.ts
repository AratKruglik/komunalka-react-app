import { type Page, type Locator, expect } from '@playwright/test'

export abstract class BasePage {
  readonly page: Page
  abstract readonly url: string

  constructor(page: Page) {
    this.page = page
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url)
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded')
  }

  async expectUrl(url: string = this.url): Promise<void> {
    await expect(this.page).toHaveURL(url)
  }

  async expectUrlContains(urlPart: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(urlPart))
  }

  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId)
  }

  protected getByRole(
    role: Parameters<Page['getByRole']>[0],
    options?: Parameters<Page['getByRole']>[1]
  ): Locator {
    return this.page.getByRole(role, options)
  }

  protected getByLabel(label: string | RegExp): Locator {
    return this.page.getByLabel(label)
  }

  protected getByText(text: string | RegExp): Locator {
    return this.page.getByText(text)
  }

  protected getByPlaceholder(placeholder: string | RegExp): Locator {
    return this.page.getByPlaceholder(placeholder)
  }

  protected getById(id: string): Locator {
    return this.page.locator(`#${id}`)
  }

  async clickButton(name: string | RegExp): Promise<void> {
    await this.getByRole('button', { name }).click()
  }

  async fillInput(id: string, value: string): Promise<void> {
    await this.getById(id).fill(value)
  }

  async selectOption(id: string, value: string): Promise<void> {
    await this.getById(id).selectOption(value)
  }

  async expectHeading(text: string | RegExp): Promise<void> {
    await expect(this.getByRole('heading', { name: text })).toBeVisible()
  }

  async expectText(text: string | RegExp): Promise<void> {
    await expect(this.getByText(text)).toBeVisible()
  }

  async expectNotVisible(text: string | RegExp): Promise<void> {
    await expect(this.getByText(text)).not.toBeVisible()
  }

  async expectButtonDisabled(name: string | RegExp): Promise<void> {
    await expect(this.getByRole('button', { name })).toBeDisabled()
  }

  async expectButtonEnabled(name: string | RegExp): Promise<void> {
    await expect(this.getByRole('button', { name })).toBeEnabled()
  }
}
