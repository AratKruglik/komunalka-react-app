import { test, expect } from '@playwright/test';
import { AddMeterPage } from '../../pages/AddMeterPage';
import {
  mockAddresses,
  mockCreateMeter,
  mockCreateMeterError,
  mockReferenceData,
  mockUserProfile,
  mockUtilityTypes,
} from '../../helpers';
import { authenticateUser } from '../../helpers/auth';
import {
  testAddresses,
  testProviders,
  testNewMeterInput,
} from '../../fixtures/test-data';

test.describe('Add Meter Page', () => {
  let addMeterPage: AddMeterPage;

  const defaultAddresses = [testAddresses.primary, testAddresses.secondary];

  test.beforeEach(async ({ page }) => {
    addMeterPage = new AddMeterPage(page);
    await authenticateUser(page);
    await mockUserProfile(page);
    await mockReferenceData(page);
    await mockAddresses(page, defaultAddresses);
    await mockUtilityTypes(page);
    await mockCreateMeter(page);
  });

  test.describe('Add Meter Form Display', () => {
    test('should display add meter page with all form elements', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.expectPageVisible();
      await addMeterPage.expectFormElements();
    });

    test('should display breadcrumb navigation', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.expectBreadcrumbVisible();
    });

    test('should show address selector with available addresses', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await expect(addMeterPage.addressSelect).toBeVisible();
      await addMeterPage.expectAddressSelectHasOptions();
    });

    test('should show meter type selector with all utility types', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.expectAllMeterTypeCardsVisible();
    });

    test('should display electricity meter type option', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      const electricityCard = addMeterPage.getMeterTypeCard('electricity');
      await expect(electricityCard).toBeVisible();
      await expect(electricityCard).toContainText(/електролічильник/i);
    });

    test('should display gas meter type option', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      const gasCard = addMeterPage.getMeterTypeCard('gas');
      await expect(gasCard).toBeVisible();
      await expect(gasCard).toContainText(/газовий лічильник/i);
    });

    test('should display cold water meter type option', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      const coldWaterCard = addMeterPage.getMeterTypeCard('coldWater');
      await expect(coldWaterCard).toBeVisible();
      await expect(coldWaterCard).toContainText(/холодної води/i);
    });

    test('should display hot water meter type option', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      const hotWaterCard = addMeterPage.getMeterTypeCard('hotWater');
      await expect(hotWaterCard).toBeVisible();
      await expect(hotWaterCard).toContainText(/гарячої води/i);
    });

    test('should display heat meter type option', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      const heatCard = addMeterPage.getMeterTypeCard('heat');
      await expect(heatCard).toBeVisible();
      await expect(heatCard).toContainText(/лічильник тепла/i);
    });

    test('should display tips section', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.expectTipsSectionVisible();
    });

    test('should display progress indicator at 0% initially', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.expectProgress(0);
    });

    test('should display cancel and submit buttons', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await expect(addMeterPage.cancelButton).toBeVisible();
      await expect(addMeterPage.submitButton).toBeVisible();
      await expect(addMeterPage.saveDraftButton).toBeVisible();
      await expect(addMeterPage.clearFormButton).toBeVisible();
    });
  });

  test.describe('Provider Selection', () => {
    test('should have provider select disabled before meter type is selected', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.expectProviderSelectDisabled();
    });

    test('should enable provider select after meter type is selected', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.selectMeterType('electricity');

      await addMeterPage.expectProviderSelectEnabled();
    });

    test('should show placeholder text when no meter type selected', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      const placeholderOption = addMeterPage.providerSelect.locator('option').first();
      await expect(placeholderOption).toContainText(/спочатку оберіть тип лічильника/i);
    });
  });

  test.describe('Form Validation', () => {
    test('should validate required address field', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.selectMeterType('electricity');
      await addMeterPage.serialNumberInput.fill('TEST-001');
      await addMeterPage.installationDateInput.fill('2025-01-15');
      await addMeterPage.initialReadingInput.fill('100');
      await addMeterPage.tariffValueInput.fill('4.32');

      await addMeterPage.submit();

      await addMeterPage.expectValidationError(/оберіть адресу/i);
    });

    test('should validate required meter type field', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.selectAddress('1');
      await addMeterPage.serialNumberInput.fill('TEST-001');
      await addMeterPage.installationDateInput.fill('2025-01-15');
      await addMeterPage.initialReadingInput.fill('100');
      await addMeterPage.tariffValueInput.fill('4.32');

      await addMeterPage.submit();

      await addMeterPage.expectValidationError(/оберіть тип лічильника/i);
    });

    test('should validate required serial number field', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.selectAddress('1');
      await addMeterPage.selectMeterType('electricity');
      await addMeterPage.installationDateInput.fill('2025-01-15');
      await addMeterPage.initialReadingInput.fill('100');
      await addMeterPage.tariffValueInput.fill('4.32');

      await addMeterPage.submit();

      await addMeterPage.expectValidationError(/серійний номер/i);
    });

    test('should validate serial number minimum length', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.selectAddress('1');
      await addMeterPage.selectMeterType('electricity');
      await addMeterPage.serialNumberInput.fill('AB');
      await addMeterPage.installationDateInput.fill('2025-01-15');
      await addMeterPage.initialReadingInput.fill('100');
      await addMeterPage.tariffValueInput.fill('4.32');

      await addMeterPage.submit();

      await addMeterPage.expectValidationError(/мінімум 6 символів/i);
    });

    test('should validate required installation date field', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.selectAddress('1');
      await addMeterPage.selectMeterType('electricity');
      await addMeterPage.serialNumberInput.fill('TEST-001-2025');
      await addMeterPage.initialReadingInput.fill('100');
      await addMeterPage.tariffValueInput.fill('4.32');

      await addMeterPage.submit();

      await addMeterPage.expectValidationError(/дату встановлення/i);
    });

    test('should validate required initial reading field', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.selectAddress('1');
      await addMeterPage.selectMeterType('electricity');
      await addMeterPage.serialNumberInput.fill('TEST-001-2025');
      await addMeterPage.installationDateInput.fill('2025-01-15');
      await addMeterPage.tariffValueInput.fill('4.32');

      await addMeterPage.submit();

      await addMeterPage.expectValidationError(/початкові показання/i);
    });

    test('should validate required tariff field', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.selectAddress('1');
      await addMeterPage.selectMeterType('electricity');
      await addMeterPage.serialNumberInput.fill('TEST-001-2025');
      await addMeterPage.installationDateInput.fill('2025-01-15');
      await addMeterPage.initialReadingInput.fill('100');
      await addMeterPage.tariffValueInput.clear();

      await addMeterPage.submit();

      await addMeterPage.expectValidationError(/тариф/i);
    });

    test('should have min attribute of 0 for initial reading', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.expectInitialReadingHasMinAttribute();
    });
  });

  test.describe('Form Progress', () => {
    test('should update progress when address is selected', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.selectAddress('1');

      const progressText = await addMeterPage.getProgress();
      expect(progressText).toContain('17%');
    });

    test('should update progress when meter type is selected', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.selectAddress('1');
      await addMeterPage.selectMeterType('electricity');

      const progressText = await addMeterPage.getProgress();
      expect(progressText).toContain('33%');
    });

    test('should show 100% progress when all required fields are filled', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.fillMeterForm({
        addressId: '1',
        meterType: 'electricity',
        serialNumber: 'TEST-001-2025',
        installationDate: '2025-01-15',
        initialReading: '100',
        tariffValue: '4.32',
      });

      await addMeterPage.expectProgress(100);
    });
  });

  test.describe('Form Submission', () => {
    test('should show loading state during submission', async ({ page }) => {
      await mockCreateMeter(page, { delay: 1000 });

      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.fillMeterForm({
        addressId: '1',
        meterType: 'electricity',
        serialNumber: 'TEST-001-2025',
        installationDate: '2025-01-15',
        initialReading: '100',
        tariffValue: '4.32',
      });

      await addMeterPage.submit();

      await addMeterPage.expectLoadingState();
    });

    test('should submit valid meter form successfully', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.fillMeterForm({
        addressId: '1',
        meterType: 'electricity',
        serialNumber: 'TEST-001-2025',
        installationLocation: 'Коридор',
        manufacturer: 'НІК',
        installationDate: '2025-01-15',
        initialReading: '100',
        tariffValue: '4.32',
        notes: 'Тестовий лічильник',
      });

      await addMeterPage.submit();

      await addMeterPage.expectSuccessMessage();
    });

    test('should clear form after successful submission', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.fillMeterForm({
        addressId: '1',
        meterType: 'electricity',
        serialNumber: 'TEST-001-2025',
        installationDate: '2025-01-15',
        initialReading: '100',
        tariffValue: '4.32',
      });

      await addMeterPage.submit();

      await addMeterPage.expectSuccessMessage();

      await expect(addMeterPage.serialNumberInput).toHaveValue('');
      await expect(addMeterPage.initialReadingInput).toHaveValue('');
    });

    test('should handle submission error gracefully', async ({ page }) => {
      await page.unroute('**/api/v1/meter');
      await mockCreateMeterError(page, 400, 'Лічильник з таким серійним номером вже існує');

      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.fillMeterForm({
        addressId: '1',
        meterType: 'electricity',
        serialNumber: 'DUPLICATE-001',
        installationDate: '2025-01-15',
        initialReading: '100',
        tariffValue: '4.32',
      });

      await addMeterPage.submit();

      await addMeterPage.expectErrorMessage();
    });

    test('should handle server error gracefully', async ({ page }) => {
      await page.unroute('**/api/v1/meter');
      await mockCreateMeterError(page, 500, 'Внутрішня помилка сервера');

      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.fillMeterForm({
        addressId: '1',
        meterType: 'electricity',
        serialNumber: 'TEST-001-2025',
        installationDate: '2025-01-15',
        initialReading: '100',
        tariffValue: '4.32',
      });

      await addMeterPage.submit();

      await addMeterPage.expectErrorMessage();
    });
  });

  test.describe('Cancel and Navigation', () => {
    test('should cancel and return to addresses page', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.cancel();

      await expect(page).toHaveURL(/\/addresses/);
    });

    test('should clear form when clear button is clicked', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.fillMeterForm({
        addressId: '1',
        meterType: 'electricity',
        serialNumber: 'TEST-001-2025',
        installationDate: '2025-01-15',
        initialReading: '100',
      });

      await addMeterPage.clearForm();

      await expect(addMeterPage.serialNumberInput).toHaveValue('');
      await expect(addMeterPage.initialReadingInput).toHaveValue('');
      await addMeterPage.expectProgress(0);
    });

    test('should navigate back via breadcrumb', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      const metersLink = addMeterPage.breadcrumb.getByText('Лічильники');
      await metersLink.click();

      await expect(page).toHaveURL(/\/meters/);
    });
  });

  test.describe('Save Draft', () => {
    test('should be able to save as draft', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.fillMeterForm({
        addressId: '1',
        meterType: 'electricity',
        serialNumber: 'DRAFT-001',
      });

      await expect(addMeterPage.saveDraftButton).toBeVisible();
      await expect(addMeterPage.saveDraftButton).toBeEnabled();
    });
  });

  test.describe('Meter Type Selection Behavior', () => {
    test('should highlight selected meter type', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.selectMeterType('gas');

      const gasCard = addMeterPage.getMeterTypeCard('gas');
      await expect(gasCard).toHaveClass(/ring-2|ring-offset|border-primary/);
    });

    test('should switch meter type when different type is selected', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.selectMeterType('electricity');
      await addMeterPage.selectMeterType('coldWater');

      const coldWaterCard = addMeterPage.getMeterTypeCard('coldWater');
      await expect(coldWaterCard).toHaveClass(/ring-2|ring-offset|border-primary/);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display form correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await expect(addMeterPage.formHeading).toBeVisible();
      await expect(addMeterPage.addressSelect).toBeVisible();
      await expect(addMeterPage.submitButton).toBeVisible();
    });

    test('should display meter type cards on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.expectAllMeterTypeCardsVisible();
    });

    test('should display form correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await addMeterPage.expectFormElements();
    });
  });

  test.describe('Empty States', () => {
    test('should show no addresses message when no addresses exist', async ({ page }) => {
      await mockAddresses(page, []);

      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      const options = await addMeterPage.addressSelect.locator('option').count();
      expect(options).toBe(1);
    });
  });

  test.describe('Accessibility', () => {
    test('should have labels for all form fields', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      await expect(page.getByLabel(/серійний номер/i)).toBeVisible();
      await expect(page.getByLabel(/розташування лічильника/i)).toBeVisible();
      await expect(page.getByLabel(/модель.*виробник/i)).toBeVisible();
      await expect(page.getByLabel(/дата встановлення/i)).toBeVisible();
      await expect(page.getByLabel(/початкові показання/i)).toBeVisible();
      await expect(page.getByLabel(/поточний тариф/i)).toBeVisible();
      await expect(page.getByLabel(/додаткові примітки/i)).toBeVisible();
    });

    test('should have proper form heading', async ({ page }) => {
      await addMeterPage.goto();
      await addMeterPage.waitForPageLoad();

      const heading = page.getByRole('heading', { name: /додати новий лічильник/i });
      await expect(heading).toBeVisible();
    });
  });
});
