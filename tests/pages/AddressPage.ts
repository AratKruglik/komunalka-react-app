import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AddressPage extends BasePage {
  readonly url = '/addresses';

  readonly pageHeading: Locator;
  readonly pageSubtitle: Locator;
  readonly addAddressButton: Locator;
  readonly addressCards: Locator;
  readonly emptyState: Locator;
  readonly loadingIndicator: Locator;
  readonly errorState: Locator;
  readonly retryButton: Locator;

  constructor(page: Page) {
    super(page);

    this.pageHeading = page.getByRole('main').getByRole('heading', { name: /мої адреси/i, level: 1 });
    this.pageSubtitle = page.getByText(/керуйте адресами для комунальних послуг/i);
    this.addAddressButton = page.getByRole('button', { name: /додати адресу/i });
    this.addressCards = page.locator('article');
    this.emptyState = page.getByTestId('empty-state');
    this.loadingIndicator = page.locator('.animate-pulse');
    this.errorState = page.getByText(/помилка завантаження/i);
    this.retryButton = page.getByRole('button', { name: /спробувати знову/i });
  }

  async clickAddAddress(): Promise<void> {
    await this.addAddressButton.click();
  }

  async getAddressCard(addressText: string): Promise<Locator> {
    return this.page.locator('article').filter({ hasText: addressText });
  }

  async getAddressCardByStreet(street: string): Promise<Locator> {
    return this.page.locator('article').filter({ hasText: new RegExp(street, 'i') });
  }

  async clickEditAddress(street: string): Promise<void> {
    const card = await this.getAddressCardByStreet(street);
    const editButton = card.getByRole('button', { name: /редагувати адресу/i });
    await editButton.click();
  }

  async clickMoreActions(street: string): Promise<void> {
    const card = await this.getAddressCardByStreet(street);
    const moreButton = card.getByRole('button', { name: /інші дії/i });
    await moreButton.click();
  }

  async setPrimaryAddress(street: string): Promise<void> {
    const card = await this.getAddressCardByStreet(street);
    const primaryButton = card.getByRole('button', { name: /зробити основною/i });
    await primaryButton.click();
  }

  async expectAddressCount(count: number): Promise<void> {
    const cards = await this.addressCards.all();
    expect(cards.length).toBe(count);
  }

  async expectAddressVisible(street: string): Promise<void> {
    const card = await this.getAddressCardByStreet(street);
    await expect(card).toBeVisible();
  }

  async expectPrimaryBadgeVisible(street: string): Promise<void> {
    const card = await this.getAddressCardByStreet(street);
    const badge = card.getByText(/основна адреса/i);
    await expect(badge).toBeVisible();
  }

  async expectMeterCount(street: string, count: number): Promise<void> {
    const card = await this.getAddressCardByStreet(street);
    const meterText = card.getByText(new RegExp(`${count} лічильник`, 'i'));
    await expect(meterText).toBeVisible();
  }

  async expectPageVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.addAddressButton).toBeVisible();
  }

  async expectLoadingState(): Promise<void> {
    await expect(this.loadingIndicator.first()).toBeVisible();
  }

  async expectErrorState(): Promise<void> {
    await expect(this.errorState).toBeVisible();
    await expect(this.retryButton).toBeVisible();
  }

  async retry(): Promise<void> {
    await this.retryButton.click();
  }

  async clickDeleteAddress(street: string): Promise<void> {
    await this.clickMoreActions(street);
    const deleteButton = this.page.getByRole('menuitem', { name: /видалити/i });
    await deleteButton.click();
  }

  async expectAddressNotVisible(street: string): Promise<void> {
    const card = await this.getAddressCardByStreet(street);
    await expect(card).not.toBeVisible();
  }

  async expectDeleteConfirmationDialog(): Promise<void> {
    const dialog = this.page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/видалити адресу/i)).toBeVisible();
  }

  async confirmDelete(): Promise<void> {
    const dialog = this.page.getByRole('alertdialog');
    const confirmButton = dialog.getByRole('button', { name: /видалити/i });
    await confirmButton.click();
  }

  async cancelDelete(): Promise<void> {
    const dialog = this.page.getByRole('alertdialog');
    const cancelButton = dialog.getByRole('button', { name: /скасувати/i });
    await cancelButton.click();
  }

  async expectActionsMenuVisible(): Promise<void> {
    const menu = this.page.getByRole('menu');
    await expect(menu).toBeVisible();
  }

  async expectActionsMenuHidden(): Promise<void> {
    const menu = this.page.getByRole('menu');
    await expect(menu).not.toBeVisible();
  }

  async expectActionsMenuOptions(): Promise<void> {
    const menu = this.page.getByRole('menu');
    await expect(menu.getByRole('menuitem', { name: /видалити/i })).toBeVisible();
  }

  async clickOutsideActionsMenu(): Promise<void> {
    await this.page.locator('body').click({ position: { x: 10, y: 10 } });
  }

  async expectSuccessToast(message?: string): Promise<void> {
    const toast = this.page.getByRole('status');
    await expect(toast).toBeVisible();
    if (message) {
      await expect(toast).toContainText(message);
    }
  }

  async expectErrorToast(message?: string): Promise<void> {
    const toast = this.page.getByRole('alert');
    await expect(toast).toBeVisible();
    if (message) {
      await expect(toast).toContainText(message);
    }
  }
}

export class AddAddressPage extends BasePage {
  readonly url = '/addresses/new';

  readonly pageHeading: Locator;
  readonly breadcrumb: Locator;
  readonly formHeading: Locator;

  readonly propertyTypeApartment: Locator;
  readonly propertyTypeHouse: Locator;
  readonly propertyTypeOffice: Locator;

  readonly regionSelect: Locator;
  readonly cityInput: Locator;
  readonly streetInput: Locator;
  readonly buildingInput: Locator;
  readonly unitInput: Locator;
  readonly postalCodeInput: Locator;
  readonly notesInput: Locator;
  readonly isPrimaryCheckbox: Locator;

  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  readonly stepIndicators: Locator;
  readonly disabledFieldsHint: Locator;

  constructor(page: Page) {
    super(page);

    this.pageHeading = page.getByRole('heading', { name: /додати адресу/i, level: 1 });
    this.breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    this.formHeading = page.getByRole('heading', { name: /додати нову адресу/i });

    this.propertyTypeApartment = page.getByRole('button', { name: /квартира/i });
    this.propertyTypeHouse = page.getByRole('button', { name: /приватний будинок/i });
    this.propertyTypeOffice = page.getByRole('button', { name: /офіс/i });

    this.regionSelect = page.getByRole('combobox', { name: /область/i });
    this.cityInput = page.getByLabel(/місто/i);
    this.streetInput = page.getByLabel(/вулиця/i);
    this.buildingInput = page.getByLabel(/номер будинку/i);
    this.unitInput = page.getByLabel(/номер квартири/i);
    this.postalCodeInput = page.getByLabel(/поштовий індекс/i);
    this.notesInput = page.getByLabel(/додаткові примітки/i);
    this.isPrimaryCheckbox = page.getByLabel(/встановити як основну/i);

    this.cancelButton = page.getByRole('button', { name: /скасувати/i });
    this.submitButton = page.getByRole('button', { name: /зберегти адресу/i });

    this.stepIndicators = page.locator('ol li');
    this.disabledFieldsHint = page.getByText(/оберіть тип нерухомості, щоб заповнити адресу/i);
  }

  async selectPropertyType(type: 'apartment' | 'house' | 'office'): Promise<void> {
    switch (type) {
      case 'apartment':
        await this.propertyTypeApartment.click();
        break;
      case 'house':
        await this.propertyTypeHouse.click();
        break;
      case 'office':
        await this.propertyTypeOffice.click();
        break;
    }
  }

  async fillAddressForm(data: {
    propertyType: 'apartment' | 'house' | 'office';
    region: string;
    city: string;
    street: string;
    building: string;
    unit: string;
    postalCode: string;
    notes?: string;
    isPrimary?: boolean;
  }): Promise<void> {
    await this.selectPropertyType(data.propertyType);
    await this.regionSelect.selectOption({ label: data.region });
    await this.cityInput.fill(data.city);
    await this.streetInput.fill(data.street);
    await this.buildingInput.fill(data.building);
    await this.unitInput.fill(data.unit);
    await this.postalCodeInput.fill(data.postalCode);

    if (data.notes) {
      await this.notesInput.fill(data.notes);
    }

    if (data.isPrimary) {
      await this.isPrimaryCheckbox.check();
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.formHeading).toBeVisible();
    await expect(this.propertyTypeApartment).toBeVisible();
    await expect(this.propertyTypeHouse).toBeVisible();
    await expect(this.propertyTypeOffice).toBeVisible();
  }

  async expectBreadcrumbVisible(): Promise<void> {
    await expect(this.breadcrumb).toBeVisible();
    await expect(this.breadcrumb.getByText('Мої адреси')).toBeVisible();
    await expect(this.breadcrumb.getByText('Додати адресу')).toBeVisible();
  }

  async expectAddressFieldsDisabled(): Promise<void> {
    await expect(this.regionSelect).toBeDisabled();
    await expect(this.cityInput).toBeDisabled();
    await expect(this.streetInput).toBeDisabled();
    await expect(this.buildingInput).toBeDisabled();
    await expect(this.unitInput).toBeDisabled();
    await expect(this.postalCodeInput).toBeDisabled();
  }

  async expectAddressFieldsEnabled(): Promise<void> {
    await expect(this.regionSelect).toBeEnabled();
    await expect(this.cityInput).toBeEnabled();
    await expect(this.streetInput).toBeEnabled();
    await expect(this.buildingInput).toBeEnabled();
    await expect(this.unitInput).toBeEnabled();
    await expect(this.postalCodeInput).toBeEnabled();
  }

  async expectSubmitButtonDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  async expectSubmitButtonEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  async expectValidationError(message: string): Promise<void> {
    const error = this.page.locator('p.text-red-500').filter({ hasText: new RegExp(message, 'i') });
    await expect(error.first()).toBeVisible();
  }

  async expectStepCompleted(stepName: string): Promise<void> {
    const step = this.stepIndicators.filter({ hasText: stepName });
    await expect(step).toBeVisible();
  }

  async expectDisabledFieldsHintVisible(): Promise<void> {
    await expect(this.disabledFieldsHint).toBeVisible();
  }

  async expectDisabledFieldsHintHidden(): Promise<void> {
    await expect(this.disabledFieldsHint).not.toBeVisible();
  }
}

export class EditAddressPage extends BasePage {
  readonly url: string;

  readonly pageHeading: Locator;
  readonly breadcrumb: Locator;
  readonly formHeading: Locator;

  readonly propertyTypeApartment: Locator;
  readonly propertyTypeHouse: Locator;
  readonly propertyTypeOffice: Locator;

  readonly regionSelect: Locator;
  readonly cityInput: Locator;
  readonly streetInput: Locator;
  readonly buildingInput: Locator;
  readonly unitInput: Locator;
  readonly postalCodeInput: Locator;
  readonly notesInput: Locator;
  readonly isPrimaryCheckbox: Locator;

  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  readonly loadingIndicator: Locator;

  constructor(page: Page, addressId?: number) {
    super(page);

    this.url = addressId ? `/addresses/${addressId}/edit` : '/addresses/1/edit';

    this.pageHeading = page.getByRole('heading', { name: /редагувати адресу/i, level: 1 });
    this.breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    this.formHeading = page.getByRole('heading', { name: /редагувати адресу/i });

    this.propertyTypeApartment = page.getByRole('button', { name: /квартира/i });
    this.propertyTypeHouse = page.getByRole('button', { name: /приватний будинок/i });
    this.propertyTypeOffice = page.getByRole('button', { name: /офіс/i });

    this.regionSelect = page.getByRole('combobox', { name: /область/i });
    this.cityInput = page.getByLabel(/місто/i);
    this.streetInput = page.getByLabel(/вулиця/i);
    this.buildingInput = page.getByLabel(/номер будинку/i);
    this.unitInput = page.getByLabel(/номер квартири/i);
    this.postalCodeInput = page.getByLabel(/поштовий індекс/i);
    this.notesInput = page.getByLabel(/додаткові примітки/i);
    this.isPrimaryCheckbox = page.getByLabel(/встановити як основну/i);

    this.cancelButton = page.getByRole('button', { name: /скасувати/i });
    this.submitButton = page.getByRole('button', { name: /зберегти/i });

    this.loadingIndicator = page.locator('.animate-pulse');
  }

  async selectPropertyType(type: 'apartment' | 'house' | 'office'): Promise<void> {
    switch (type) {
      case 'apartment':
        await this.propertyTypeApartment.click();
        break;
      case 'house':
        await this.propertyTypeHouse.click();
        break;
      case 'office':
        await this.propertyTypeOffice.click();
        break;
    }
  }

  async fillEditForm(data: {
    city?: string;
    street?: string;
    building?: string;
    unit?: string;
    postalCode?: string;
    notes?: string;
    isPrimary?: boolean;
  }): Promise<void> {
    if (data.city !== undefined) {
      await this.cityInput.clear();
      await this.cityInput.fill(data.city);
    }
    if (data.street !== undefined) {
      await this.streetInput.clear();
      await this.streetInput.fill(data.street);
    }
    if (data.building !== undefined) {
      await this.buildingInput.clear();
      await this.buildingInput.fill(data.building);
    }
    if (data.unit !== undefined) {
      await this.unitInput.clear();
      await this.unitInput.fill(data.unit);
    }
    if (data.postalCode !== undefined) {
      await this.postalCodeInput.clear();
      await this.postalCodeInput.fill(data.postalCode);
    }
    if (data.notes !== undefined) {
      await this.notesInput.clear();
      await this.notesInput.fill(data.notes);
    }
    if (data.isPrimary !== undefined) {
      if (data.isPrimary) {
        await this.isPrimaryCheckbox.check();
      } else {
        await this.isPrimaryCheckbox.uncheck();
      }
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.formHeading).toBeVisible();
  }

  async expectFormPrePopulated(data: {
    city?: string;
    street?: string;
    building?: string;
    unit?: string;
    postalCode?: string;
  }): Promise<void> {
    if (data.city) {
      await expect(this.cityInput).toHaveValue(data.city);
    }
    if (data.street) {
      await expect(this.streetInput).toHaveValue(data.street);
    }
    if (data.building) {
      await expect(this.buildingInput).toHaveValue(data.building);
    }
    if (data.unit) {
      await expect(this.unitInput).toHaveValue(data.unit);
    }
    if (data.postalCode) {
      await expect(this.postalCodeInput).toHaveValue(data.postalCode);
    }
  }

  async expectBreadcrumbVisible(): Promise<void> {
    await expect(this.breadcrumb).toBeVisible();
    await expect(this.breadcrumb.getByText('Мої адреси')).toBeVisible();
    await expect(this.breadcrumb.getByText('Редагувати')).toBeVisible();
  }

  async expectLoadingState(): Promise<void> {
    await expect(this.loadingIndicator.first()).toBeVisible();
  }

  async expectValidationError(message: string): Promise<void> {
    const error = this.page.locator('p.text-red-500').filter({ hasText: new RegExp(message, 'i') });
    await expect(error.first()).toBeVisible();
  }
}
