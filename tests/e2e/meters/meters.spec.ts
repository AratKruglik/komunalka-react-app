import { test, expect } from '@playwright/test';
import { MeterPage } from '../../pages';
import {
  mockAddresses,
  mockMeters,
  mockReadings,
  mockAllMeterPageData,
  mockMetersByAddress,
  mockReadingsByAddress,
  mockApiError,
  mockLoginSuccess,
} from '../../helpers';
import {
  testAddresses,
  testMeters,
  testReadings,
} from '../../fixtures/test-data';

test.describe('Meters Page', () => {
  let meterPage: MeterPage;

  const defaultAddresses = [testAddresses.primary, testAddresses.secondary];
  const defaultMeters = [
    testMeters.electricity,
    testMeters.gas,
    testMeters.coldWater,
    testMeters.hotWater,
  ];
  const defaultReadings = [
    testReadings.electricity,
    testReadings.gas,
    testReadings.water,
    testReadings.processing,
  ];

  test.beforeEach(async ({ page }) => {
    meterPage = new MeterPage(page);
    await mockLoginSuccess(page);
  });

  test.describe('Meters List Display', () => {
    test('should display meters page with address selector', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(meterPage.addressSelect).toBeVisible();
      await expect(meterPage.addMeterButton).toBeVisible();
    });

    test('should display statistics cards with correct values', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(page.getByText('Всього лічильників')).toBeVisible();
      await expect(page.getByText('Активні')).toBeVisible();
      await expect(page.getByText('Очікують показань')).toBeVisible();
    });

    test('should display meter type tabs', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      const electricityTab = meterPage.getMeterTypeTab('electricity');
      const gasTab = meterPage.getMeterTypeTab('gas');
      const coldWaterTab = meterPage.getMeterTypeTab('coldWater');
      const hotWaterTab = meterPage.getMeterTypeTab('hotWater');

      await expect(electricityTab).toBeVisible();
      await expect(gasTab).toBeVisible();
      await expect(coldWaterTab).toBeVisible();
      await expect(hotWaterTab).toBeVisible();
    });

    test('should display message when no meters exist for address', async ({ page }) => {
      await mockAddresses(page, defaultAddresses);
      await mockMeters(page, []);
      await mockReadings(page, []);

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(page.getByText(/немає доступних лічильників/i)).toBeVisible();
    });

    test('should show loading state while fetching data', async ({ page }) => {
      await mockAllMeterPageData(
        page,
        {
          addresses: defaultAddresses,
          meters: defaultMeters,
          readings: defaultReadings,
        },
        { delay: 1000 }
      );

      await meterPage.goto();

      await expect(page.getByText(/завантаження/i)).toBeVisible();
    });
  });

  test.describe('Address Switching', () => {
    test('should load addresses in dropdown', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      const options = await meterPage.getAddressOptions();
      expect(options.length).toBe(2);
    });

    test('should switch meters when address changes', async ({ page }) => {
      const address1Meters = [testMeters.electricity, testMeters.gas];
      const address2Meters = [testMeters.coldWater];

      await mockAddresses(page, defaultAddresses);
      await mockMetersByAddress(page, {
        1: address1Meters,
        2: address2Meters,
      });
      await mockReadingsByAddress(page, {
        1: [testReadings.electricity, testReadings.gas],
        2: [testReadings.water],
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      const electricityTab = meterPage.getMeterTypeTab('electricity');
      await expect(electricityTab).toBeVisible();

      await meterPage.selectAddressByIndex(1);
      await page.waitForTimeout(500);

      const coldWaterTab = meterPage.getMeterTypeTab('coldWater');
      await expect(coldWaterTab).toBeVisible();
    });

    test('should show no meters message when switching to address without meters', async ({ page }) => {
      await mockAddresses(page, defaultAddresses);
      await mockMetersByAddress(page, {
        1: defaultMeters,
        2: [],
      });
      await mockReadingsByAddress(page, {
        1: defaultReadings,
        2: [],
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await meterPage.selectAddressByIndex(1);
      await page.waitForTimeout(500);

      await expect(page.getByText(/немає збережених лічильників/i)).toBeVisible();
    });
  });

  test.describe('Meter Details', () => {
    test('should display meter card with serial number', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(page.getByText(testMeters.electricity.serialNumber)).toBeVisible();
    });

    test('should display meter name and location', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(page.getByText(testMeters.electricity.name)).toBeVisible();
      await expect(page.getByText(new RegExp(`Локація:.*${testMeters.electricity.location}`))).toBeVisible();
    });

    test('should display meter status badge', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(page.getByText('Активний').first()).toBeVisible();
    });

    test('should display update button on meter card', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(page.getByRole('button', { name: /оновити дані/i }).first()).toBeVisible();
    });
  });

  test.describe('Meter Type Tabs Navigation', () => {
    test('should switch to gas meters when gas tab clicked', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await meterPage.selectMeterType('gas');

      await expect(page.getByText(testMeters.gas.serialNumber)).toBeVisible();
    });

    test('should switch to cold water meters when tab clicked', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await meterPage.selectMeterType('coldWater');

      await expect(page.getByText(testMeters.coldWater.serialNumber)).toBeVisible();
    });

    test('should highlight active tab', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await meterPage.selectMeterType('gas');

      await meterPage.expectMeterTypeActive('gas');
    });

    test('should display meter count in tab', async ({ page }) => {
      const metersWithMultipleElectricity = [
        testMeters.electricity,
        { ...testMeters.electricity, id: 10, serialNumber: 'EL-002-2024', name: 'Електролічильник коридор' },
        testMeters.gas,
      ];

      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: metersWithMultipleElectricity,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      const electricityTab = meterPage.getMeterTypeTab('electricity');
      await expect(electricityTab.getByText(/2\s*ліч/)).toBeVisible();
    });
  });

  test.describe('Quick Reading Form', () => {
    test('should display quick reading form', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(page.getByText('Швидке внесення показань')).toBeVisible();
      await expect(meterPage.quickFormMeterSelect).toBeVisible();
      await expect(meterPage.quickFormPeriodSelect).toBeVisible();
      await expect(meterPage.quickFormValueInput).toBeVisible();
      await expect(meterPage.quickFormSubmitButton).toBeVisible();
    });

    test('should have submit button disabled when value is empty', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await meterPage.expectQuickFormSubmitDisabled();
    });

    test('should enable submit button when value is entered', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await meterPage.fillQuickReadingForm('13000');

      await meterPage.expectQuickFormSubmitEnabled();
    });

    test('should show success message after submitting reading', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await meterPage.submitReading('13000');

      await meterPage.expectQuickFormSuccess();
    });

    test('should clear input after successful submission', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await meterPage.submitReading('13000');

      await expect(meterPage.quickFormValueInput).toHaveValue('');
    });

    test('should display previous reading value', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await meterPage.expectPreviousValueDisplayed();
    });

    test('should validate minimum value of 0', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(meterPage.quickFormValueInput).toHaveAttribute('min', '0');
    });
  });

  test.describe('Reading History', () => {
    test('should display history section', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(page.getByText('Історія показань')).toBeVisible();
    });

    test('should display history table headers', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(page.getByText('Період')).toBeVisible();
      await expect(page.getByText('Показання')).toBeVisible();
      await expect(page.getByText('Статус')).toBeVisible();
      await expect(page.getByText('Відправлено')).toBeVisible();
    });

    test('should display download PDF button', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(meterPage.downloadPdfButton).toBeVisible();
    });

    test('should display reading status badges', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(page.getByText('Прийнято').first()).toBeVisible();
    });
  });

  test.describe('Add Meter Navigation', () => {
    test('should navigate to add meter page when button clicked', async ({ page }) => {
      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await meterPage.clickAddMeter();

      await expect(page).toHaveURL(/\/meters\/new/);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle meters API error gracefully', async ({ page }) => {
      await mockAddresses(page, defaultAddresses);
      await mockApiError(page, '/meters*', 500, 'Server Error');
      await mockReadings(page, []);

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(page.getByText(/немає збережених лічильників|немає доступних лічильників/i)).toBeVisible();
    });

    test('should handle readings API error gracefully', async ({ page }) => {
      await mockAddresses(page, defaultAddresses);
      await mockMeters(page, defaultMeters);
      await mockApiError(page, '/readings*', 500, 'Server Error');

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(page.getByText(testMeters.electricity.serialNumber)).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display meter type tabs on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      const electricityTab = meterPage.getMeterTypeTab('electricity');
      await expect(electricityTab).toBeVisible();
    });

    test('should display quick form on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await mockAllMeterPageData(page, {
        addresses: defaultAddresses,
        meters: defaultMeters,
        readings: defaultReadings,
      });

      await meterPage.goto();
      await meterPage.waitForPageLoad();

      await expect(meterPage.quickFormValueInput).toBeVisible();
      await expect(meterPage.quickFormSubmitButton).toBeVisible();
    });
  });
});
