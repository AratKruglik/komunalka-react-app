# API Compliance Audit: Fix All Frontend-to-API Mismatches

## Phase 0: snake_case ↔ camelCase interceptors
- [x] Create `src/shared/api/utils/caseTransform.ts`
- [x] Add response/request interceptors to `apiClient.ts`

## Phase 1: Fix Utility Type ID mapping
- [x] Fix `entities.ts` — UTILITY_TYPE_ID_TO_METER_TYPE, METER_TYPE_TO_UTILITY_TYPE_ID
- [x] Fix `meter.types.ts` — UTILITY_TYPE_ID_MAP, UTILITY_TYPE_FROM_ID
- [x] Fix `serviceProviderAdapter.ts` — getUnitForUtilityType
- [x] Fix `meterViewModels.ts` — unitMap
- [x] Fix `readingViewModels.ts` — unitMap
- [x] Fix `providerTariffs.ts` — getUnitByUtilityTypeId

## Phase 2: Create/fix API response types
- [x] Fix `serviceProvider.types.ts` — nested utility_type/currency in ApiTariff, ApiServiceProvider
- [x] Add `description`, `createdAt`, `updatedAt` to ApiUtilityType
- [x] Add `notes?` to CreateTariffRequest

## Phase 3: Fix entity types
- [x] Fix Region — remove timestamps
- [x] Fix AddressType — remove timestamps
- [x] Fix Address — remove userId/regionId/addressTypeId, nullable fields
- [x] Fix Meter — nested utilityType/serviceProvider, photoUrl
- [x] Fix Reading — nested meter/tariff, remove flat fields
- [x] Fix ReadingPhoto — add originalUrl, remove width/height/isProcessed
- [x] Fix ConsumptionCalculation — remove extra fields
- [x] Fix BatchReadingsResponse — rename calculations→tariffCalculations, remove extra fields

## Phase 4: Fix User type
- [x] Add role, authProvider, emailVerified, lastLoginAt
- [x] Rename avatarUrl → avatarOptimizedUrl
- [x] Make firstName/lastName/phoneNumber nullable (string | null)
- [x] Update AuthenticatedLayout, ProfileInfoSection, navigation components

## Phase 5: Fix request DTOs
- [x] Fix CreateAddressRequest — optional fields
- [x] Fix CreateMeterRequest — serviceProviderId optional
- [x] Fix BatchReadingItem — remove tariffId
- [x] Fix BatchReadingsJsonPayload — remove addressId

## Phase 6: Update view models and mappers
- [x] Update addressViewModels.ts
- [x] Update meterViewModels.ts
- [x] Update readingViewModels.ts
- [x] Update dashboardViewModels.ts
- [x] Update serviceProviderAdapter.ts
- [x] Update providerTariffs.ts

## Phase 7: Update hooks and services
- [x] Fix readingService.ts — remove addressId from payload
- [x] Fix authActions.ts — full User object construction
- [x] Fix tokenRefresher.ts — full User fallback

## Phase 8: Update test factories and tests
- [x] Fix all mock factories to match new types
- [x] Fix all viewModel test files
- [x] Fix apiClient.test.ts (interceptor mocks)
- [x] Fix component tests (AddMeterForm, EditMeterForm, AddAddressForm, ProfileForm, LoginForm, RegisterForm)
- [x] Fix hook tests (useCreateAddress, useUpdateAddress, useDeleteAddress, useMeters)
- [x] Fix service tests (meterService, readingService, userService)
- [x] Fix mockDatabase.ts

## Verification
- [x] `tsc -b` — 0 errors
- [x] `pnpm run test:run` — 741 tests passed, 34 files, 0 failures
