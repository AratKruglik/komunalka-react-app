import { test, expect } from './fixtures/auth'
import { AddressesPage, AddAddressPage } from './pages'
import { TestAddresses, UIText } from './fixtures/test-data'

test.describe('Addresses Management', () => {
  test.describe('View Addresses', () => {
    test('displays addresses list page correctly', async ({ authenticatedPage: page }) => {
      const addressesPage = new AddressesPage(page)

      await addressesPage.navigate()
      await addressesPage.expectPageLoaded()
    })

    test('shows add address button', async ({ authenticatedPage: page }) => {
      const addressesPage = new AddressesPage(page)

      await addressesPage.navigate()
      await expect(addressesPage.addAddressButton).toBeVisible()
    })

    test('displays address cards when addresses exist', async ({ authenticatedPage: page }) => {
      const addressesPage = new AddressesPage(page)

      await addressesPage.navigate()

      const cardsOrEmpty = page.locator('article').or(page.getByText(/немає адрес|додайте/i))
      await expect(cardsOrEmpty.first()).toBeVisible()
    })

    test('address card shows correct structure', async ({ authenticatedPage: page }) => {
      const addressesPage = new AddressesPage(page)

      await addressesPage.navigate()

      const firstCard = addressesPage.addressCards.first()
      const hasCard = (await firstCard.count()) > 0

      if (hasCard) {
        await expect(firstCard.locator('h3')).toBeVisible()
        const editButton = firstCard.getByRole('button', { name: /редагувати/i })
        await expect(editButton).toBeVisible()
      }
    })

    test('primary address is highlighted', async ({ authenticatedPage: page }) => {
      const addressesPage = new AddressesPage(page)

      await addressesPage.navigate()

      const primaryBadge = page.getByText(/основна/i).first()
      const hasPrimary = (await primaryBadge.count()) > 0

      if (hasPrimary) {
        await expect(primaryBadge).toBeVisible()
      }
    })
  })

  test.describe('Create Address', () => {
    test('navigates to add address page', async ({ authenticatedPage: page }) => {
      const addressesPage = new AddressesPage(page)

      await addressesPage.navigate()
      await addressesPage.clickAddAddress()

      await expect(page).toHaveURL('/addresses/new')
    })

    test('add address form loads correctly', async ({ authenticatedPage: page }) => {
      const addAddressPage = new AddAddressPage(page)

      await addAddressPage.navigate()
      await addAddressPage.expectPageLoaded()

      await expect(addAddressPage.saveButton).toBeVisible()
      await expect(addAddressPage.cancelButton).toBeVisible()
    })

    test('save button is disabled until property type is selected', async ({ authenticatedPage: page }) => {
      const addAddressPage = new AddAddressPage(page)

      await addAddressPage.navigate()

      await addAddressPage.expectSaveButtonDisabled()

      await addAddressPage.selectPropertyType('apartment')

      await addAddressPage.expectSaveButtonEnabled()
    })

    test('address form fields are disabled until property type is selected', async ({ authenticatedPage: page }) => {
      const addAddressPage = new AddAddressPage(page)

      await addAddressPage.navigate()

      await addAddressPage.expectFormFieldsDisabled()

      await addAddressPage.selectPropertyType('apartment')

      await addAddressPage.expectFormFieldsEnabled()
    })

    test('can select different property types', async ({ authenticatedPage: page }) => {
      const addAddressPage = new AddAddressPage(page)

      await addAddressPage.navigate()

      const propertyTypes = ['apartment', 'house', 'office'] as const

      for (const type of propertyTypes) {
        await addAddressPage.selectPropertyType(type)

        const typeText = UIText.propertyTypes[type]
        const selectedCard = page.getByText(typeText).locator('..')
        await expect(selectedCard).toBeVisible()
      }
    })

    test('shows validation errors for required fields', async ({ authenticatedPage: page }) => {
      const addAddressPage = new AddAddressPage(page)

      await addAddressPage.navigate()
      await addAddressPage.selectPropertyType('apartment')

      await addAddressPage.submitForm()

      await addAddressPage.expectValidationError(/обов'язков|вкажіть|оберіть/i)
    })

    test('validates postal code format', async ({ authenticatedPage: page }) => {
      const addAddressPage = new AddAddressPage(page)

      await addAddressPage.navigate()
      await addAddressPage.selectPropertyType('apartment')

      await addAddressPage.regionSelect.selectOption(TestAddresses.new.region)
      await addAddressPage.cityInput.fill(TestAddresses.new.city)
      await addAddressPage.streetInput.fill(TestAddresses.new.street)
      await addAddressPage.buildingNumberInput.fill(TestAddresses.new.buildingNumber)
      await addAddressPage.unitNumberInput.fill(TestAddresses.new.unitNumber)
      await addAddressPage.postalCodeInput.fill('123')

      await addAddressPage.submitForm()

      await addAddressPage.expectValidationError(/5 цифр|поштовий індекс/i)
    })

    test('creates address with all required fields', async ({ authenticatedPage: page }) => {
      const addAddressPage = new AddAddressPage(page)

      await addAddressPage.navigate()
      await addAddressPage.fillAddressForm(TestAddresses.new)
      await addAddressPage.submitForm()

      await addAddressPage.expectSuccessRedirect()
    })

    test('creates address and sets as primary', async ({ authenticatedPage: page }) => {
      const addAddressPage = new AddAddressPage(page)

      await addAddressPage.navigate()
      await addAddressPage.fillAddressForm({ ...TestAddresses.new, isPrimary: true })
      await addAddressPage.submitForm()

      await addAddressPage.expectSuccessRedirect()
    })

    test('cancel button returns to addresses list', async ({ authenticatedPage: page }) => {
      const addAddressPage = new AddAddressPage(page)

      await addAddressPage.navigate()
      await addAddressPage.selectPropertyType('apartment')
      await addAddressPage.cancelForm()

      await expect(page).toHaveURL('/addresses')
    })

    test('form stepper shows progress', async ({ authenticatedPage: page }) => {
      const addAddressPage = new AddAddressPage(page)

      await addAddressPage.navigate()

      await addAddressPage.expectStepCompleted('Тип нерухомості')
      await addAddressPage.expectStepCompleted('Адреса')
      await addAddressPage.expectStepCompleted('Підтвердження')
    })
  })

  test.describe('Edit Address', () => {
    test('edit button is visible on address card', async ({ authenticatedPage: page }) => {
      const addressesPage = new AddressesPage(page)

      await addressesPage.navigate()

      const firstCard = addressesPage.addressCards.first()
      const hasCard = (await firstCard.count()) > 0

      if (hasCard) {
        const editButton = firstCard.getByRole('button', { name: /редагувати/i })
        await expect(editButton).toBeVisible()
      }
    })
  })

  test.describe('Delete Address', () => {
    test('more actions button is visible on address card', async ({ authenticatedPage: page }) => {
      const addressesPage = new AddressesPage(page)

      await addressesPage.navigate()

      const firstCard = addressesPage.addressCards.first()
      const hasCard = (await firstCard.count()) > 0

      if (hasCard) {
        const moreButton = firstCard.getByRole('button', { name: /інші дії/i })
        await expect(moreButton).toBeVisible()
      }
    })
  })

  test.describe('Address Loading States', () => {
    test('shows loading state while fetching addresses', async ({ authenticatedPage: page }) => {
      const addressesPage = new AddressesPage(page)

      await page.route('**/api/addresses**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await route.continue()
      })

      await addressesPage.navigate()
    })
  })

  test.describe('Error Handling', () => {
    test('shows error message when API fails', async ({ authenticatedPage: page }) => {
      await page.route('**/api/addresses**', (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
        })
      )

      const addressesPage = new AddressesPage(page)
      await addressesPage.navigate()

      await expect(addressesPage.errorState.or(page.getByText(/помилка/i)).first()).toBeVisible({
        timeout: 10000,
      })
    })
  })
})
