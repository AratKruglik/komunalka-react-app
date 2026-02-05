import { test, expect } from '@playwright/test'
import { AddressPage, AddAddressPage, EditAddressPage } from '../../pages'
import {
  mockAddresses,
  mockUserProfile,
  mockCreateAddress,
  mockDeleteAddress,
  mockUpdateAddress,
  mockGetAddress,
  mockMetersByAddress,
  mockReadingsByAddress,
  mockRegions,
  mockAddressTypes,
} from '../../helpers'
import { authenticateUser } from '../../helpers/auth'
import {
  testAddresses,
  testNewAddressFormData,
  testMeters,
  testEditedAddressFormData,
  testRegions,
  testAddressTypes,
} from '../../fixtures/test-data'

test.describe('Addresses List', () => {
  let addressPage: AddressPage

  test.beforeEach(async ({ page }) => {
    addressPage = new AddressPage(page)
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockRegions(page, testRegions)
    await mockAddressTypes(page, testAddressTypes)
  })

  test('should display addresses list with multiple addresses', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary])
    await mockMetersByAddress(page, { 1: [], 2: [] })
    await mockReadingsByAddress(page, { 1: [], 2: [] })

    await addressPage.goto()

    await addressPage.expectPageVisible()
    await addressPage.expectAddressCount(2)
    await addressPage.expectAddressVisible(testAddresses.primary.street)
    await addressPage.expectAddressVisible(testAddresses.secondary.street)
  })

  test('should display primary address badge', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })

    await addressPage.goto()

    await addressPage.expectPrimaryBadgeVisible(testAddresses.primary.street)
  })

  test.skip('should display meter count for each address', async ({ page }) => {
    const metersForAddress1 = [testMeters.electricity, testMeters.gas]
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: metersForAddress1 })
    await mockReadingsByAddress(page, { 1: [] })

    await addressPage.goto()

    await addressPage.expectMeterCount(testAddresses.primary.street, 2)
  })

  test('should navigate to add address page when clicking add button', async ({ page }) => {
    await mockAddresses(page, [])
    await mockMetersByAddress(page, {})
    await mockReadingsByAddress(page, {})

    await addressPage.goto()
    await addressPage.clickAddAddress()

    await expect(page).toHaveURL(/\/addresses\/new/)
  })

  test('should show loading state while fetching addresses', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary], { delay: 1000 })
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })

    await page.goto('/addresses')

    await addressPage.expectLoadingState()
  })

  test('should show error state when API fails', async ({ page }) => {
    await mockAddresses(page, [], { status: 500 })

    await addressPage.goto()

    await addressPage.expectErrorState()
  })

  test('should allow setting address as primary', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary])
    await mockMetersByAddress(page, { 1: [], 2: [] })
    await mockReadingsByAddress(page, { 1: [], 2: [] })

    await addressPage.goto()

    const setPrimaryButton = page.getByRole('button', { name: /зробити основною/i })
    await expect(setPrimaryButton).toBeVisible()
  })

  test('should have edit and more actions buttons on each card', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })

    await addressPage.goto()

    await addressPage.expectEditButtonVisible(testAddresses.primary.street)
    await addressPage.expectMoreActionsButtonVisible(testAddresses.primary.street)
  })

  test('should have edit and more actions buttons on multiple cards', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary])
    await mockMetersByAddress(page, { 1: [], 2: [] })
    await mockReadingsByAddress(page, { 1: [], 2: [] })

    await addressPage.goto()

    await addressPage.expectEditButtonVisible(testAddresses.primary.street)
    await addressPage.expectMoreActionsButtonVisible(testAddresses.primary.street)
    await addressPage.expectEditButtonVisible(testAddresses.secondary.street)
    await addressPage.expectMoreActionsButtonVisible(testAddresses.secondary.street)
  })
})

test.describe('Add Address Form', () => {
  let addAddressPage: AddAddressPage

  test.beforeEach(async ({ page }) => {
    addAddressPage = new AddAddressPage(page)
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockRegions(page, testRegions)
    await mockAddressTypes(page, testAddressTypes)
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
  })

  test('should display add address form with all elements', async ({ page }) => {
    await addAddressPage.goto()

    await addAddressPage.expectFormVisible()
    await addAddressPage.expectBreadcrumbVisible()
  })

  test('should disable address fields until property type is selected', async ({ page }) => {
    await addAddressPage.goto()

    await addAddressPage.expectAddressFieldsDisabled()
    await addAddressPage.expectSubmitButtonDisabled()
    await addAddressPage.expectDisabledFieldsHintVisible()
  })

  test('should enable address fields after selecting property type', async ({ page }) => {
    await addAddressPage.goto()

    await addAddressPage.selectPropertyType('apartment')

    await addAddressPage.expectAddressFieldsEnabled()
    await addAddressPage.expectDisabledFieldsHintHidden()
  })

  test.skip('should show validation errors for required fields', async ({ page }) => {
    // TODO: Form uses HTML5 native validation which blocks submit when required fields are empty
    // Custom FormMessage errors from react-hook-form are not displayed due to native validation
    await addAddressPage.goto()

    await addAddressPage.selectPropertyType('apartment')
    await addAddressPage.submit()

    await addAddressPage.expectValidationError('Оберіть область')
  })

  test.skip('should validate postal code format', async ({ page }) => {
    // TODO: Form uses HTML5 native validation - custom error messages require filling all required fields first
    await addAddressPage.goto()

    await addAddressPage.selectPropertyType('apartment')
    await addAddressPage.postalCodeInput.fill('123')
    await addAddressPage.submit()

    await addAddressPage.expectValidationError('5 цифр')
  })

  test('should successfully submit valid address form', async ({ page }) => {
    await mockCreateAddress(page)

    await addAddressPage.goto()
    await addAddressPage.fillAddressForm(testNewAddressFormData)
    await addAddressPage.submit()

    await expect(page).toHaveURL(/\/addresses$/)
  })

  test('should navigate back to addresses list on cancel', async ({ page }) => {
    await addAddressPage.goto()
    await addAddressPage.cancel()

    await expect(page).toHaveURL(/\/addresses$/)
  })

  test('should allow selecting different property types', async ({ page }) => {
    await addAddressPage.goto()

    await addAddressPage.selectPropertyType('house')
    await expect(addAddressPage.propertyTypeHouse).toHaveAttribute('class', /ring|border-primary/)

    await addAddressPage.selectPropertyType('office')
    await expect(addAddressPage.propertyTypeOffice).toHaveAttribute('class', /ring|border-primary/)
  })

  test('should navigate via breadcrumb links', async ({ page }) => {
    await addAddressPage.goto()

    const breadcrumbLink = page.getByLabel('Breadcrumb').getByRole('link', { name: 'Мої адреси' })
    await breadcrumbLink.click()

    await expect(page).toHaveURL(/\/addresses$/)
  })

  test('should allow setting address as primary via checkbox', async ({ page }) => {
    await mockCreateAddress(page)

    await addAddressPage.goto()
    await addAddressPage.selectPropertyType('apartment')

    await expect(addAddressPage.isPrimaryCheckbox).not.toBeChecked()
    await addAddressPage.isPrimaryCheckbox.check()
    await expect(addAddressPage.isPrimaryCheckbox).toBeChecked()
  })

  test('should show all region options in dropdown', async ({ page }) => {
    await addAddressPage.goto()
    await addAddressPage.selectPropertyType('apartment')

    const options = await addAddressPage.regionSelect.locator('option').allTextContents()

    expect(options).toContain('Київська область')
    expect(options).toContain('Львівська область')
    expect(options).toContain('м. Київ')
  })
})

test.describe('Address Card Actions', () => {
  let addressPage: AddressPage

  test.beforeEach(async ({ page }) => {
    addressPage = new AddressPage(page)
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockRegions(page, testRegions)
    await mockAddressTypes(page, testAddressTypes)
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary])
    await mockMetersByAddress(page, { 1: [], 2: [] })
    await mockReadingsByAddress(page, { 1: [], 2: [] })
  })

  test('should display address with full details', async ({ page }) => {
    await addressPage.goto()

    const card = await addressPage.getAddressCardByStreet(testAddresses.primary.street)

    await expect(card).toContainText(testAddresses.primary.buildingNumber)
    await expect(card).toContainText(testAddresses.primary.city)
  })

  test('should display address type information', async ({ page }) => {
    await addressPage.goto()

    const primaryCard = await addressPage.getAddressCardByStreet(testAddresses.primary.street)
    await expect(primaryCard).toContainText(/основна адреса/i)
  })
})

test.describe('Address Card Edit Button Navigation', () => {
  let addressPage: AddressPage

  test.beforeEach(async ({ page }) => {
    addressPage = new AddressPage(page)
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockRegions(page, testRegions)
    await mockAddressTypes(page, testAddressTypes)
  })

  test('should navigate to meters page with addressId when clicking edit button', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })

    await addressPage.goto()
    await addressPage.clickEditAddress(testAddresses.primary.street)

    await expect(page).toHaveURL(/\/meters\?addressId=1$/)
  })

  test('should navigate to meters page with correct addressId for secondary address', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary])
    await mockMetersByAddress(page, { 1: [], 2: [] })
    await mockReadingsByAddress(page, { 1: [], 2: [] })

    await addressPage.goto()
    await addressPage.clickEditAddress(testAddresses.secondary.street)

    await expect(page).toHaveURL(/\/meters\?addressId=2$/)
  })

  test('should include addressId query parameter in navigation URL', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })

    await addressPage.goto()
    await addressPage.clickEditAddress(testAddresses.primary.street)

    const url = new URL(page.url())
    expect(url.pathname).toBe('/meters')
    expect(url.searchParams.get('addressId')).toBe(String(testAddresses.primary.id))
  })
})

test.describe('Edit Address Form', () => {
  let addressPage: AddressPage
  let editAddressPage: EditAddressPage

  test.beforeEach(async ({ page }) => {
    addressPage = new AddressPage(page)
    editAddressPage = new EditAddressPage(page, testAddresses.primary.id)
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockRegions(page, testRegions)
    await mockAddressTypes(page, testAddressTypes)
  })

  test.skip('should pre-populate form with existing address data', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
    await mockGetAddress(page, testAddresses.primary)

    await editAddressPage.goto()

    await editAddressPage.expectFormPrePopulated({
      city: testAddresses.primary.city,
      street: testAddresses.primary.street,
      building: testAddresses.primary.buildingNumber,
      unit: testAddresses.primary.apartmentNumber,
      postalCode: testAddresses.primary.zipCode,
    })
  })

  test.skip('should validate edited fields', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
    await mockGetAddress(page, testAddresses.primary)

    await editAddressPage.goto()

    await editAddressPage.fillEditForm({ city: '' })
    await editAddressPage.submit()

    await editAddressPage.expectValidationError('місто')
  })

  test.skip('should save updated address successfully', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
    await mockGetAddress(page, testAddresses.primary)
    await mockUpdateAddress(page)

    await editAddressPage.goto()

    await editAddressPage.fillEditForm({
      city: testEditedAddressFormData.city,
      street: testEditedAddressFormData.street,
      building: testEditedAddressFormData.building,
      unit: testEditedAddressFormData.unit,
    })
    await editAddressPage.submit()

    await expect(page).toHaveURL(/\/addresses$/)
  })

  test.skip('should show updated data in list after save', async ({ page }) => {
    const updatedAddress = {
      ...testAddresses.primary,
      city: 'Львів',
      street: 'вул. Франка',
    }

    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
    await mockGetAddress(page, testAddresses.primary)
    await mockUpdateAddress(page)

    await editAddressPage.goto()
    await editAddressPage.fillEditForm({
      city: updatedAddress.city,
      street: updatedAddress.street,
    })
    await editAddressPage.submit()

    await mockAddresses(page, [updatedAddress])

    await addressPage.goto()
    await addressPage.expectAddressVisible(updatedAddress.street)
  })

  test.skip('should cancel edit without saving changes', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary])
    await mockMetersByAddress(page, { 1: [] })
    await mockReadingsByAddress(page, { 1: [] })
    await mockGetAddress(page, testAddresses.primary)

    await editAddressPage.goto()
    await editAddressPage.fillEditForm({ city: 'Нове місто' })
    await editAddressPage.cancel()

    await expect(page).toHaveURL(/\/addresses$/)

    await addressPage.expectAddressVisible(testAddresses.primary.street)
  })
})

test.describe('Delete Address', () => {
  let addressPage: AddressPage

  test.beforeEach(async ({ page }) => {
    addressPage = new AddressPage(page)
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockRegions(page, testRegions)
    await mockAddressTypes(page, testAddressTypes)
  })

  test.skip('should show confirmation dialog when clicking delete', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary])
    await mockMetersByAddress(page, { 1: [], 2: [] })
    await mockReadingsByAddress(page, { 1: [], 2: [] })

    await addressPage.goto()
    await addressPage.clickDeleteAddress(testAddresses.secondary.street)

    await addressPage.expectDeleteConfirmationDialog()
  })

  test.skip('should delete address after confirmation', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary])
    await mockMetersByAddress(page, { 1: [], 2: [] })
    await mockReadingsByAddress(page, { 1: [], 2: [] })
    await mockDeleteAddress(page)

    await addressPage.goto()
    await addressPage.clickDeleteAddress(testAddresses.secondary.street)
    await addressPage.confirmDelete()

    await addressPage.expectSuccessToast()
  })

  test.skip('should remove address from list after deletion', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary])
    await mockMetersByAddress(page, { 1: [], 2: [] })
    await mockReadingsByAddress(page, { 1: [], 2: [] })
    await mockDeleteAddress(page)

    await addressPage.goto()
    await addressPage.expectAddressCount(2)

    await addressPage.clickDeleteAddress(testAddresses.secondary.street)
    await addressPage.confirmDelete()

    await mockAddresses(page, [testAddresses.primary])
    await page.reload()

    await addressPage.expectAddressCount(1)
    await addressPage.expectAddressNotVisible(testAddresses.secondary.street)
  })

  test.skip('should cancel delete operation', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary])
    await mockMetersByAddress(page, { 1: [], 2: [] })
    await mockReadingsByAddress(page, { 1: [], 2: [] })

    await addressPage.goto()
    await addressPage.clickDeleteAddress(testAddresses.secondary.street)
    await addressPage.cancelDelete()

    await addressPage.expectAddressCount(2)
    await addressPage.expectAddressVisible(testAddresses.secondary.street)
  })

  test.skip('should handle delete error gracefully', async ({ page }) => {
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary])
    await mockMetersByAddress(page, { 1: [], 2: [] })
    await mockReadingsByAddress(page, { 1: [], 2: [] })
    await mockDeleteAddress(page, { status: 500 })

    await addressPage.goto()
    await addressPage.clickDeleteAddress(testAddresses.secondary.street)
    await addressPage.confirmDelete()

    await addressPage.expectErrorToast()
    await addressPage.expectAddressCount(2)
  })
})

test.describe('Address Actions Menu', () => {
  let addressPage: AddressPage

  test.beforeEach(async ({ page }) => {
    addressPage = new AddressPage(page)
    await authenticateUser(page)
    await mockUserProfile(page)
    await mockRegions(page, testRegions)
    await mockAddressTypes(page, testAddressTypes)
    await mockAddresses(page, [testAddresses.primary, testAddresses.secondary])
    await mockMetersByAddress(page, { 1: [], 2: [] })
    await mockReadingsByAddress(page, { 1: [], 2: [] })
  })

  test.skip('should open actions menu when clicking more button', async ({ page }) => {
    await addressPage.goto()
    await addressPage.clickMoreActions(testAddresses.primary.street)

    await addressPage.expectActionsMenuVisible()
  })

  test.skip('should have delete option in actions menu', async ({ page }) => {
    await addressPage.goto()
    await addressPage.clickMoreActions(testAddresses.primary.street)

    await addressPage.expectActionsMenuOptions()
  })

  test.skip('should close menu on outside click', async ({ page }) => {
    await addressPage.goto()
    await addressPage.clickMoreActions(testAddresses.primary.street)
    await addressPage.expectActionsMenuVisible()

    await addressPage.clickOutsideActionsMenu()

    await addressPage.expectActionsMenuHidden()
  })
})
