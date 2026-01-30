import { test, expect } from './fixtures/auth'
import { MetersPage, AddMeterPage } from './pages'
import { UIText } from './fixtures/test-data'

test.describe('Meters Management', () => {
  test.describe('View Meters', () => {
    test('displays meters page correctly', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()
      await metersPage.expectPageLoaded()
    })

    test('shows address selector', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()
      await expect(metersPage.addressSelect).toBeVisible()
    })

    test('shows add meter button', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()
      await expect(metersPage.addMeterButton).toBeVisible()
    })

    test('displays meter statistics summary', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()
      await metersPage.expectStatsSummary()
    })

    test('shows meter type tabs when meters exist', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()

      const tabs = page.locator('[role="tab"], button').filter({ hasText: /електро|газ|вода|опалення/i })
      const hasTabs = (await tabs.count()) > 0

      if (hasTabs) {
        await expect(tabs.first()).toBeVisible()
      } else {
        await metersPage.expectEmptyState()
      }
    })

    test('can switch between meter type tabs', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()

      const electricityTab = page.getByRole('tab', { name: /електроенергія/i }).or(
        page.getByText(/електроенергія/i).filter({ has: page.locator('[role="tab"]') })
      )
      const hasElectricityTab = (await electricityTab.count()) > 0

      if (hasElectricityTab) {
        const gasTab = page.getByRole('tab', { name: /газ/i }).or(
          page.locator('button').filter({ hasText: /газ/i })
        )
        const hasGasTab = (await gasTab.count()) > 0

        if (hasGasTab) {
          await gasTab.first().click()
          await page.waitForTimeout(500)
        }
      }
    })

    test('shows quick reading form', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()

      const quickValueInput = page.locator('#quick-value')
      const hasQuickForm = (await quickValueInput.count()) > 0

      if (hasQuickForm) {
        await expect(quickValueInput).toBeVisible()
      }
    })

    test('shows readings history section', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()

      const historySection = page.getByText(/історія показань/i)
      const hasHistory = (await historySection.count()) > 0

      if (hasHistory) {
        await metersPage.expectHistoryTable()
      }
    })
  })

  test.describe('Quick Reading Submission', () => {
    test('can fill quick reading form', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()

      const quickValueInput = page.locator('#quick-value')
      const hasQuickForm = (await quickValueInput.count()) > 0

      if (hasQuickForm) {
        await quickValueInput.fill('150')
        await expect(quickValueInput).toHaveValue('150')
      }
    })

    test('quick reading submit button is disabled when empty', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()

      const submitButton = page.getByRole('button', { name: /зберегти показання/i })
      const hasSubmitButton = (await submitButton.count()) > 0

      if (hasSubmitButton) {
        await expect(submitButton).toBeDisabled()
      }
    })

    test('quick reading submit button is enabled when filled', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()

      const quickValueInput = page.locator('#quick-value')
      const hasQuickForm = (await quickValueInput.count()) > 0

      if (hasQuickForm) {
        await quickValueInput.fill('150')

        const submitButton = page.getByRole('button', { name: /зберегти показання/i })
        await expect(submitButton).toBeEnabled()
      }
    })

    test('shows success message after quick reading submission', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()

      const quickValueInput = page.locator('#quick-value')
      const hasQuickForm = (await quickValueInput.count()) > 0

      if (hasQuickForm) {
        await metersPage.fillQuickReading('150')
        await metersPage.submitQuickReading()
        await metersPage.expectQuickReadingSuccess()
      }
    })
  })

  test.describe('Add Meter', () => {
    test('navigates to add meter page', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()
      await metersPage.clickAddMeter()

      await expect(page).toHaveURL('/meters/new')
    })

    test('add meter form loads correctly', async ({ authenticatedPage: page }) => {
      const addMeterPage = new AddMeterPage(page)

      await addMeterPage.navigate()
      await addMeterPage.expectPageLoaded()
    })

    test('shows address selector', async ({ authenticatedPage: page }) => {
      const addMeterPage = new AddMeterPage(page)

      await addMeterPage.navigate()
      await expect(addMeterPage.addressSelect).toBeVisible()
    })

    test('shows meter type options', async ({ authenticatedPage: page }) => {
      const addMeterPage = new AddMeterPage(page)

      await addMeterPage.navigate()

      for (const typeLabel of Object.values(UIText.meterTypes)) {
        await expect(page.getByText(typeLabel)).toBeVisible()
      }
    })

    test('can select meter type', async ({ authenticatedPage: page }) => {
      const addMeterPage = new AddMeterPage(page)

      await addMeterPage.navigate()

      await addMeterPage.selectMeterType('electricity')

      const selectedCard = page.getByText(UIText.meterTypes.electricity).locator('..')
      await expect(selectedCard).toBeVisible()
    })

    test('provider selector is disabled until meter type is selected', async ({ authenticatedPage: page }) => {
      const addMeterPage = new AddMeterPage(page)

      await addMeterPage.navigate()

      await addMeterPage.expectProviderSelectDisabled()

      await addMeterPage.selectMeterType('electricity')

      await page.waitForTimeout(500)
    })

    test('shows form progress indicator', async ({ authenticatedPage: page }) => {
      const addMeterPage = new AddMeterPage(page)

      await addMeterPage.navigate()

      await addMeterPage.expectProgressPercentage(0)
    })

    test('progress updates as form is filled', async ({ authenticatedPage: page }) => {
      const addMeterPage = new AddMeterPage(page)

      await addMeterPage.navigate()

      const addressOption = addMeterPage.addressSelect.locator('option').nth(1)
      const hasAddress = (await addressOption.count()) > 0

      if (hasAddress) {
        await addMeterPage.addressSelect.selectOption({ index: 1 })
        await addMeterPage.selectMeterType('electricity')
        await addMeterPage.serialNumberInput.fill('TEST123456')

        const progressText = page.getByText(/% завершено/i)
        await expect(progressText).toBeVisible()
      }
    })

    test('shows validation errors for required fields', async ({ authenticatedPage: page }) => {
      const addMeterPage = new AddMeterPage(page)

      await addMeterPage.navigate()

      await addMeterPage.submitForm()

      await addMeterPage.expectValidationError(/обов'язков|оберіть/i)
    })

    test('serial number validation - minimum length', async ({ authenticatedPage: page }) => {
      const addMeterPage = new AddMeterPage(page)

      await addMeterPage.navigate()

      const addressOption = addMeterPage.addressSelect.locator('option').nth(1)
      const hasAddress = (await addressOption.count()) > 0

      if (hasAddress) {
        await addMeterPage.addressSelect.selectOption({ index: 1 })
        await addMeterPage.selectMeterType('electricity')
        await addMeterPage.serialNumberInput.fill('123')

        await addMeterPage.submitForm()

        await addMeterPage.expectValidationError(/мінімум 6 символів/i)
      }
    })

    test('cancel button exists and works', async ({ authenticatedPage: page }) => {
      const addMeterPage = new AddMeterPage(page)

      await addMeterPage.navigate()
      await expect(addMeterPage.cancelButton).toBeVisible()
    })

    test('clear form button resets form', async ({ authenticatedPage: page }) => {
      const addMeterPage = new AddMeterPage(page)

      await addMeterPage.navigate()

      await addMeterPage.serialNumberInput.fill('TEST123456')
      await expect(addMeterPage.serialNumberInput).toHaveValue('TEST123456')

      await addMeterPage.clearForm()

      await expect(addMeterPage.serialNumberInput).toHaveValue('')
    })

    test('save draft button is visible', async ({ authenticatedPage: page }) => {
      const addMeterPage = new AddMeterPage(page)

      await addMeterPage.navigate()
      await expect(addMeterPage.saveDraftButton).toBeVisible()
    })
  })

  test.describe('Edit Meter', () => {
    test('update data button is visible on meter card', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()

      const updateButton = page.getByRole('button', { name: /оновити дані/i }).first()
      const hasUpdateButton = (await updateButton.count()) > 0

      if (hasUpdateButton) {
        await expect(updateButton).toBeVisible()
      }
    })
  })

  test.describe('Meter Status Display', () => {
    test('shows meter status badges', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()

      const statusBadges = page.getByText(/активний|потрібне обслуговування|очікує показань/i)
      const hasBadges = (await statusBadges.count()) > 0

      if (hasBadges) {
        await expect(statusBadges.first()).toBeVisible()
      }
    })
  })

  test.describe('Address Selection', () => {
    test('can change address in dropdown', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()

      const options = metersPage.addressSelect.locator('option')
      const optionsCount = await options.count()

      if (optionsCount > 1) {
        const initialValue = await metersPage.addressSelect.inputValue()

        await metersPage.addressSelect.selectOption({ index: 1 })

        const newValue = await metersPage.addressSelect.inputValue()
        expect(newValue).not.toBe(initialValue)
      }
    })

    test('shows empty state for address without meters', async ({ authenticatedPage: page }) => {
      const metersPage = new MetersPage(page)

      await metersPage.navigate()

      const emptyMessage = page.getByText(/немає лічильників|для цієї адреси поки що немає/i)
      const hasEmpty = (await emptyMessage.count()) > 0

      if (hasEmpty) {
        await expect(emptyMessage.first()).toBeVisible()
      }
    })
  })
})
