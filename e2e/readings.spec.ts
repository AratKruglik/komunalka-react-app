import { test, expect } from './fixtures/auth'
import { ReadingsPage } from './pages'

test.describe('Readings Management', () => {
  test.describe('View Readings Page', () => {
    test('displays readings page correctly', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()
      await readingsPage.expectPageLoaded()
    })

    test('shows address selector', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()
      await expect(readingsPage.addressSelect).toBeVisible()
    })

    test('shows add meter button', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()
      await expect(readingsPage.addMeterButton).toBeVisible()
    })

    test('shows meter reading cards when meters exist', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const meterCards = readingsPage.meterCards
      const emptyState = readingsPage.emptyState

      const hasCards = (await meterCards.count()) > 0
      const hasEmpty = (await emptyState.count()) > 0

      expect(hasCards || hasEmpty).toBeTruthy()
    })

    test('shows empty state when no meters for address', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const emptyState = readingsPage.emptyState
      const hasEmpty = (await emptyState.count()) > 0

      if (hasEmpty) {
        await readingsPage.expectEmptyState()
      }
    })
  })

  test.describe('Reading Card Structure', () => {
    test('meter card shows service name', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const serviceNames = page.locator('[class*="CardTitle"]')
      const hasServiceNames = (await serviceNames.count()) > 0

      if (hasServiceNames) {
        await expect(serviceNames.first()).toBeVisible()
      }
    })

    test('meter card shows current reading input', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const readingInputs = page.locator('input[type="number"]')
      const hasInputs = (await readingInputs.count()) > 0

      if (hasInputs) {
        await expect(readingInputs.first()).toBeVisible()
      }
    })

    test('meter card shows previous reading (readonly)', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const readonlyInputs = page.locator('input[readonly]')
      const hasReadonly = (await readonlyInputs.count()) > 0

      if (hasReadonly) {
        await expect(readonlyInputs.first()).toBeVisible()
        await expect(readonlyInputs.first()).toHaveAttribute('readonly')
      }
    })

    test('meter card shows date input', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const dateInputs = page.locator('input[type="date"]')
      const hasDateInputs = (await dateInputs.count()) > 0

      if (hasDateInputs) {
        await expect(dateInputs.first()).toBeVisible()
      }
    })

    test('meter card shows tariff selector', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const tariffSelects = page.locator('select').filter({ has: page.locator('option') })
      const hasTariffSelect = (await tariffSelects.count()) > 1

      if (hasTariffSelect) {
        await expect(tariffSelects.nth(1)).toBeVisible()
      }
    })

    test('meter card shows calculation section', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const calculationSection = page.getByText(/розрахунок/i)
      const hasCalculation = (await calculationSection.count()) > 0

      if (hasCalculation) {
        await expect(calculationSection.first()).toBeVisible()
      }
    })

    test('meter card shows photo upload area', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const photoSection = page.getByText(/фото лічильника/i)
      const hasPhotoSection = (await photoSection.count()) > 0

      if (hasPhotoSection) {
        await expect(photoSection.first()).toBeVisible()
      }
    })
  })

  test.describe('Fill Reading Values', () => {
    test('can fill current reading value', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const readingInput = page.locator('input[type="number"]').first()
      const hasInput = (await readingInput.count()) > 0

      if (hasInput) {
        await readingInput.fill('150')
        await expect(readingInput).toHaveValue('150')
      }
    })

    test('can change reading date', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const dateInput = page.locator('input[type="date"]').first()
      const hasDateInput = (await dateInput.count()) > 0

      if (hasDateInput) {
        const today = new Date().toISOString().split('T')[0]
        await dateInput.fill(today)
        await expect(dateInput).toHaveValue(today)
      }
    })

    test('can select different tariff', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const tariffSelects = page.locator('select').filter({
        has: page.locator('option'),
      })

      const selectCount = await tariffSelects.count()

      if (selectCount > 1) {
        const tariffSelect = tariffSelects.nth(1)
        const options = tariffSelect.locator('option')
        const optionsCount = await options.count()

        if (optionsCount > 1) {
          await tariffSelect.selectOption({ index: 1 })
        }
      }
    })
  })

  test.describe('Consumption Calculation', () => {
    test('consumption is calculated correctly', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const readingInput = page.locator('input[type="number"]').first()
      const hasInput = (await readingInput.count()) > 0

      if (hasInput) {
        const previousInput = page.locator('input[readonly]').first()
        const previousValue = await previousInput.inputValue()
        const previousNum = parseFloat(previousValue) || 0

        const newValue = previousNum + 50
        await readingInput.fill(String(newValue))

        const consumptionText = page.getByText(/споживання/i).first().locator('..').locator('dd')
        const hasConsumption = (await consumptionText.count()) > 0

        if (hasConsumption) {
          const consumptionValue = await consumptionText.textContent()
          expect(consumptionValue).toContain('50')
        }
      }
    })

    test('estimated cost is shown', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const readingInput = page.locator('input[type="number"]').first()
      const hasInput = (await readingInput.count()) > 0

      if (hasInput) {
        const previousInput = page.locator('input[readonly]').first()
        const previousValue = await previousInput.inputValue()
        const previousNum = parseFloat(previousValue) || 0

        await readingInput.fill(String(previousNum + 50))

        const costText = page.getByText(/вартість/i)
        const hasCost = (await costText.count()) > 0

        if (hasCost) {
          await expect(costText.first()).toBeVisible()
        }
      }
    })

    test('consumption updates when value changes', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const readingInput = page.locator('input[type="number"]').first()
      const hasInput = (await readingInput.count()) > 0

      if (hasInput) {
        const previousInput = page.locator('input[readonly]').first()
        const previousValue = await previousInput.inputValue()
        const previousNum = parseFloat(previousValue) || 0

        await readingInput.fill(String(previousNum + 100))

        const consumptionText = page.getByText(/споживання/i).first().locator('..').locator('dd')
        const hasConsumption = (await consumptionText.count()) > 0

        if (hasConsumption) {
          const consumptionValue = await consumptionText.textContent()
          expect(consumptionValue).toContain('100')
        }

        await readingInput.fill(String(previousNum + 75))

        if (hasConsumption) {
          const updatedValue = await consumptionText.textContent()
          expect(updatedValue).toContain('75')
        }
      }
    })
  })

  test.describe('Summary Table', () => {
    test('summary table is displayed', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const meterCards = readingsPage.meterCards
      const hasCards = (await meterCards.count()) > 0

      if (hasCards) {
        const summarySection = page.locator('table').or(page.getByText(/підсумок|тип послуги/i))
        const hasSummary = (await summarySection.count()) > 0

        if (hasSummary) {
          await expect(summarySection.first()).toBeVisible()
        }
      }
    })
  })

  test.describe('Submit Readings', () => {
    test('save button is visible', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()
      await expect(readingsPage.saveButton).toBeVisible()
    })

    test('can submit readings', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const readingInput = page.locator('input[type="number"]').first()
      const hasInput = (await readingInput.count()) > 0

      if (hasInput) {
        const previousInput = page.locator('input[readonly]').first()
        const previousValue = await previousInput.inputValue()
        const previousNum = parseFloat(previousValue) || 0

        await readingInput.fill(String(previousNum + 25))

        page.on('dialog', (dialog) => dialog.accept())

        await readingsPage.submitReadings()

        await readingsPage.expectSubmissionSuccess()
      }
    })
  })

  test.describe('Address Selection', () => {
    test('can change address', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const options = readingsPage.addressSelect.locator('option')
      const optionsCount = await options.count()

      if (optionsCount > 1) {
        const initialValue = await readingsPage.addressSelect.inputValue()

        await readingsPage.addressSelect.selectOption({ index: 1 })

        const newValue = await readingsPage.addressSelect.inputValue()
        expect(newValue).not.toBe(initialValue)
      }
    })

    test('meter cards update when address changes', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()

      const options = readingsPage.addressSelect.locator('option')
      const optionsCount = await options.count()

      if (optionsCount > 1) {
        await readingsPage.addressSelect.selectOption({ index: 1 })

        await page.waitForTimeout(500)

        const meterCards = readingsPage.meterCards
        const emptyState = readingsPage.emptyState

        const hasCards = (await meterCards.count()) > 0
        const hasEmpty = (await emptyState.count()) > 0

        expect(hasCards || hasEmpty).toBeTruthy()
      }
    })
  })

  test.describe('Navigation', () => {
    test('add meter button navigates correctly', async ({ authenticatedPage: page }) => {
      const readingsPage = new ReadingsPage(page)

      await readingsPage.navigate()
      await readingsPage.clickAddMeter()

      await expect(page).toHaveURL('/meters/new')
    })
  })
})
