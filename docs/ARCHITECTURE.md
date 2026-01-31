# Архітектура проєкту Komunalka React Web

> Документація технологічної архітектури застосунку для обліку комунальних лічильників

---

## Зміст

1. [Огляд проєкту](#1-огляд-проєкту)
2. [Tech Stack](#2-tech-stack)
3. [Файлова структура](#3-файлова-структура)
4. [Модульна архітектура](#4-модульна-архітектура)
5. [State Management](#5-state-management)
6. [API Layer](#6-api-layer)
7. [Routing](#7-routing)
8. [Компонентна архітектура](#8-компонентна-архітектура)
9. [Стилізація](#9-стилізація)
10. [Тестування](#10-тестування)
11. [Build та Dev Tools](#11-build-та-dev-tools)
12. [Модель даних](#12-модель-даних)
13. [Архітектурні патерни](#13-архітектурні-патерни)

---

## 1. Огляд проєкту

**Komunalka** — React веб-застосунок для обліку показань комунальних лічильників.

### Функціональність

- Управління адресами (CRUD)
- Управління лічильниками на адресі (електрика, газ, вода, опалення)
- Внесення показань з автоматичним розрахунком споживання
- Візуалізація історичних даних (графіки)
- Статистика: порівняння споживання, середні значення, прогнозування
- Dashboard для огляду всіх адрес
- Адаптивний дизайн для мобільних пристроїв

### Ієрархія даних

```
User (Користувач)
  └── Addresses (Адреси)
        └── Meters (Лічильники)
              └── Readings (Показання)
```

---

## 2. Tech Stack

### Core Framework

| Технологія | Версія | Призначення |
|------------|--------|-------------|
| React | 19.1.1 | UI фреймворк (останні features) |
| TypeScript | 5.9.3 | Типізація (strict mode) |
| React Router | 7.1.3 | Клієнтська маршрутизація |

### Build та Dev Tools

| Технологія | Версія | Призначення |
|------------|--------|-------------|
| Vite | 7.1.7 | Збірка + HMR |
| pnpm | - | Package manager |
| ESLint | 9.36.0 | Лінтинг коду |
| PostCSS | 8.5.6 | CSS трансформації |

### Styling

| Технологія | Версія | Призначення |
|------------|--------|-------------|
| Tailwind CSS | 4.1.14 | Utility-first CSS |
| tailwind-variants | 3.2.2 | Typed Tailwind компоненти |
| tailwind-merge | 3.4.0 | Злиття Tailwind класів |

### HTTP та Forms

| Технологія | Версія | Призначення |
|------------|--------|-------------|
| Axios | 1.13.2 | HTTP клієнт |
| React Hook Form | 7.53.1 | Управління формами |

### Візуалізація

| Технологія | Версія | Призначення |
|------------|--------|-------------|
| Recharts | 3.3.0 | Графіки та діаграми |
| Lucide React | 0.546.0 | Іконки |

### Тестування

| Технологія | Версія | Призначення |
|------------|--------|-------------|
| Vitest | 4.0.18 | Unit тести |
| Playwright | 1.56.1 | E2E тести |
| Testing Library | 16.2.0 | React компонент тести |

---

## 3. Файлова структура

```
komunalka-react-web/
├── src/
│   ├── main.tsx                 # Entry point (React 19 createRoot)
│   ├── App.tsx                  # Router configuration
│   ├── index.css                # Global styles
│   ├── modules/                 # Feature modules
│   │   ├── addresses/           # Адреси
│   │   ├── auth/                # Аутентифікація
│   │   ├── dashboard/           # Dashboard
│   │   ├── meters/              # Лічильники
│   │   ├── readings/            # Показання
│   │   ├── providers/           # Постачальники
│   │   └── profile/             # Профіль
│   ├── shared/                  # Shared код
│   │   ├── api/                 # API клієнт та сервіси
│   │   ├── components/          # Reusable компоненти
│   │   ├── contexts/            # React Context (auth)
│   │   ├── constants/           # Константи
│   │   ├── hooks/               # Shared hooks
│   │   ├── types/               # TypeScript типи
│   │   ├── utils/               # Утиліти
│   │   └── viewModels/          # View Model mappers
│   └── test-utils/              # Unit test utilities
├── tests/                       # E2E тести (Playwright)
│   ├── e2e/                     # Test specs
│   ├── pages/                   # Page Object Model
│   ├── fixtures/                # Test data
│   └── helpers/                 # Test utilities
├── docs/                        # Документація
├── dist/                        # Production build
└── [config files]               # Конфігураційні файли
```

### Конфігураційні файли

| Файл | Призначення |
|------|-------------|
| `package.json` | Залежності та scripts |
| `tsconfig.json` | TypeScript конфігурація |
| `vite.config.ts` | Vite конфігурація |
| `vitest.config.ts` | Unit тест конфігурація |
| `playwright.config.ts` | E2E тест конфігурація |
| `eslint.config.js` | ESLint правила |
| `.env.example` | Шаблон env змінних |

---

## 4. Модульна архітектура

### Принцип організації

Проєкт використовує **feature-based module architecture** — код організований за доменами/фічами, а не за технічними ролями.

### Структура модуля

Кожен модуль в `src/modules/` є самодостатнім:

```
modules/{feature}/
├── api/           # API сервіс модуля
├── components/    # UI компоненти
├── hooks/         # Custom hooks
├── pages/         # Сторінки (routes)
├── types/         # TypeScript типи
└── utils/         # Утиліти (опційно)
```

### Список модулів

| Модуль | Призначення | Сторінки |
|--------|-------------|----------|
| `auth` | Аутентифікація | Login, Register, Logout |
| `addresses` | Управління адресами | AddressesPage, AddAddressPage |
| `meters` | Управління лічильниками | AddressMetersPage, AddMeterPage |
| `readings` | Показання | AddReadingsPage |
| `providers` | Постачальники | ProvidersPage, AddProviderPage |
| `dashboard` | Головна панель | DashboardPage |
| `profile` | Профіль користувача | ProfilePage |

### Правила імпорту

```
✅ Модуль може імпортувати з:
   - Власних файлів модуля
   - /src/shared/ (завжди безпечно)
   - Інших модулів (мінімально, уникати)

❌ Модуль НЕ повинен:
   - Створювати циклічні залежності
   - Тісно зв'язуватись з іншими модулями
```

### Коли створювати новий модуль?

- Додається нова фіча зі своїми сторінками та компонентами
- Фіча має окрему бізнес-логіку
- Фіча буде рости і потребує ізоляції

### Коли додавати до shared/?

- Компонент/hook використовується в 2+ модулях
- Це базовий UI примітив (button, input, modal)
- Це частина layout або навігації
- Містить application-wide логіку

---

## 5. State Management

### Підхід

**React Context API + useReducer** — без Redux, Zustand чи MobX.

### Глобальний стан

Єдиний глобальний стан — **Authentication** в `/shared/contexts/auth/`:

```
shared/contexts/auth/
├── AuthProvider.tsx      # Provider компонент
├── reducer.ts            # Auth state reducer
├── actions.ts            # Action creators
├── useAuthContext.ts     # Hook для доступу
└── utils/
    ├── tokenRefresh.ts   # Token refresh логіка
    ├── authInit.ts       # Ініціалізація auth
    └── visibility.ts     # Tab visibility handling
```

### Auth State структура

```typescript
interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  token: string | null
  refreshToken: string | null
  expiresAt: string | null
  error: string | null
}
```

### Auth методи

```typescript
interface AuthContextValue {
  state: AuthState
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  register: (data: RegisterData, rememberMe: boolean) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: ProfileData) => Promise<void>
  refreshTokenManually: () => Promise<void>
}
```

### Token Management

- Токени зберігаються в `localStorage`
- Автоматичне оновлення токена за розкладом (до закінчення терміну)
- 401 відповідь → автоматичне оновлення + retry
- Handling видимості вкладки (refresh при поверненні на вкладку)

### Стан даних (Addresses, Meters, Readings)

**Немає глобального store для даних!**

Дані завантажуються через custom hooks кожного модуля:

```typescript
// Кожен hook керує своїм локальним станом
const { addresses, isLoading, error } = useAddresses()
const { meters, isLoading, error } = useMeters(addressId)
const { readings, isLoading, error } = useReadings(meterId)
```

---

## 6. API Layer

### Архітектура

Централізований Axios клієнт з сервісним патерном.

```
shared/api/
├── apiClient.ts        # Axios wrapper
├── authService.ts      # Auth API
├── userService.ts      # User API
├── referenceService.ts # Reference data API
├── config.ts           # API конфігурація
├── types.ts            # API типи
└── utils/
    ├── authHeader.ts   # Auth header injection
    └── errorFormatter.ts # Error formatting
```

### API Client (`apiClient.ts`)

```typescript
// Singleton axios instance з:
// - Автоматичним додаванням auth header
// - Обробкою 401 (token refresh + retry)
// - Форматуванням помилок

export const api = {
  get: <T>(url, config?) => apiRequest<T>({ method: 'GET', url, ...config }),
  post: <T>(url, data?, config?) => apiRequest<T>({ method: 'POST', url, data, ...config }),
  put: <T>(url, data?, config?) => apiRequest<T>({ method: 'PUT', url, data, ...config }),
  patch: <T>(url, data?, config?) => apiRequest<T>({ method: 'PATCH', url, data, ...config }),
  delete: <T>(url, config?) => apiRequest<T>({ method: 'DELETE', url, ...config }),
}
```

### Module Services

Кожен модуль має свій сервіс в `modules/{feature}/api/`:

```typescript
// modules/addresses/api/addressService.ts
export const addressService = {
  list: async (params?) => api.get<PaginatedResponse<Address>>('/address', { params }),
  getById: async (id) => api.get<Address>(`/address/${id}`),
  create: async (data) => api.post<Address>('/address', data),
  update: async (id, data) => api.put<Address>(`/address/${id}`, data),
  delete: async (id) => api.delete(`/address/${id}`),
}
```

### Endpoints (`shared/constants/endpoints.ts`)

```typescript
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
  },
  ADDRESS: {
    LIST: '/address',
    CREATE: '/address',
    GET: (id: number) => `/address/${id}`,
    UPDATE: (id: number) => `/address/${id}`,
    DELETE: (id: number) => `/address/${id}`,
  },
  // ... інші endpoints
}
```

### Authentication Flow

```
1. Request → withAuthHeader() додає Authorization header
2. Response 401 → refreshAndRetry() запускається
3. Token refresh через authService.refreshToken()
4. Автоматичний retry з новим токеном
5. Якщо refresh fail → logout + redirect to /login
```

---

## 7. Routing

### Фреймворк

**React Router v7** з protected/public routes.

### Route структура (`App.tsx`)

```typescript
<Routes>
  {/* Public Routes (redirect to / if authenticated) */}
  <Route element={<PublicRoute />}>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
  </Route>

  {/* Protected Routes (redirect to /login if not authenticated) */}
  <Route element={<ProtectedRoute />}>
    <Route element={<Layout />}>
      <Route index element={<DashboardPage />} />
      <Route path="/addresses" element={<AddressesPage />} />
      <Route path="/addresses/new" element={<AddAddressPage />} />
      <Route path="/meters" element={<AddressMetersPage />} />
      <Route path="/meters/new" element={<AddMeterPage />} />
      <Route path="/readings/new" element={<AddReadingsPage />} />
      <Route path="/providers" element={<ProvidersPage />} />
      <Route path="/providers/new" element={<AddProviderPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/logout" element={<LogoutPage />} />
    </Route>
  </Route>
</Routes>
```

### Route Guards

| Компонент | Призначення |
|-----------|-------------|
| `<ProtectedRoute />` | Redirect to `/login` якщо не authenticated |
| `<PublicRoute />` | Redirect to `/` якщо authenticated |

### Route Constants (`shared/constants/routes.ts`)

```typescript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADDRESSES: '/addresses',
  ADD_ADDRESS: '/addresses/new',
  METERS: '/meters',
  ADD_METER: '/meters/new',
  // ...
} as const

export type RouteKey = keyof typeof ROUTES
```

---

## 8. Компонентна архітектура

### Організація

**Feature-based modules + Shared UI library** (без atomic design).

### UI Components (`shared/components/ui/`)

```
ui/
├── Alert.tsx           # Сповіщення
├── Badge.tsx           # Бейджі
├── Button.tsx          # Кнопки
├── Card.tsx            # Картки
├── Checkbox.tsx        # Чекбокси
├── Input.tsx           # Текстові поля
├── Label.tsx           # Лейбли
├── Logo.tsx            # Логотип
├── PasswordInput.tsx   # Поле пароля
├── PhotoDropzone.tsx   # Завантаження фото
├── RadioCard.tsx       # Radio картки
├── Select.tsx          # Випадаючі списки
├── Spinner.tsx         # Завантаження
├── Textarea.tsx        # Текстові області
├── icons/              # SVG іконки
└── styles/             # Tailwind-variants стилі
```

### Layout Components (`shared/components/layout/`)

- Layout wrappers
- Page containers

### Navigation Components (`shared/components/navigation/`)

- Navigation bars
- Menus
- Breadcrumbs

### Module Components

Кожен модуль має свої компоненти в `modules/{feature}/components/`:

```typescript
// modules/addresses/components/
AddAddressForm.tsx      // Форма додавання адреси
AddressCard.tsx         // Картка адреси
AddressesListSection.tsx // Секція списку адрес
```

---

## 9. Стилізація

### Фреймворк

**Tailwind CSS 4.1.14** — utility-first CSS фреймворк.

### Інтеграція

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### DRY з tailwind-variants

Для повторюваних стилів використовується `tv()`:

```typescript
import { tv } from 'tailwind-variants'

// Визначення стилів
const button = tv({
  base: 'px-4 py-2 rounded-lg font-medium transition-colors',
  variants: {
    variant: {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    },
    size: {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

// Використання
<button className={button({ variant: 'primary', size: 'lg' })}>
  Click me
</button>
```

### Centralized Styles

```
shared/components/ui/styles/
├── button.ts        # Button стилі
├── card.ts          # Card стилі
├── navItem.ts       # Navigation item стилі
└── iconContainer.ts # Icon container стилі
```

### Responsive Design

Tailwind breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`

```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Mobile: full width, tablet: half, desktop: third -->
</div>
```

---

## 10. Тестування

### Unit Testing (Vitest)

**Конфігурація:** `vitest.config.ts`

```typescript
{
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-utils/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
    },
  },
}
```

**Розташування тестів:** Colocated з source файлами

```
src/shared/viewModels/
├── addressViewModels.ts
└── addressViewModels.test.ts  # Unit test поряд
```

### E2E Testing (Playwright)

**Конфігурація:** `playwright.config.ts`

```typescript
{
  testDir: './tests',
  baseURL: 'http://localhost:5173',
  use: {
    storageState: 'playwright/.auth/user.json',
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },  // CI only
    { name: 'webkit' },   // CI only
  ],
}
```

**Page Object Model:**

```
tests/pages/
├── BasePage.ts         # Base клас з common методами
├── LoginPage.ts        # Login page object
├── AddressPage.ts      # Address page object
└── ...
```

**Test Organization:**

```
tests/e2e/
├── auth/
│   ├── login.spec.ts
│   ├── register.spec.ts
│   └── logout.spec.ts
├── addresses/
│   └── addresses.spec.ts
├── meters/
│   ├── meters.spec.ts
│   └── add-meter.spec.ts
└── ...
```

### Test Commands

```bash
# Unit tests
pnpm run test           # Watch mode
pnpm run test:run       # Single run
pnpm run test:coverage  # With coverage

# E2E tests
pnpm run test:e2e       # Run all
pnpm run test:e2e:ui    # UI mode
pnpm run test:e2e:debug # Debug mode
```

---

## 11. Build та Dev Tools

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/src/shared',
      '@modules': '/src/modules',
      '@types': '/src/shared/types',
    },
  },
})
```

### TypeScript Configuration

```typescript
// tsconfig.app.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedSideEffectImports": true,
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@modules/*": ["./src/modules/*"]
    }
  }
}
```

### NPM Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug"
}
```

### Environment Variables

```bash
# .env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_VERSION=v1
VITE_API_TIMEOUT=10000
VITE_ENV=development

# For E2E tests
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
```

---

## 12. Модель даних

### Entity Definitions (`shared/types/entities.ts`)

```typescript
interface Address {
  id: number
  name: string
  regionId: number
  region?: Region
  addressTypeId: number
  addressType?: AddressType
  notes?: string
  createdAt: string
  updatedAt: string
}

interface Meter {
  id: number
  addressId: number
  providerId: number
  provider?: Provider
  meterType: MeterType
  serialNumber?: string
  installationDate?: string
  createdAt: string
  updatedAt: string
}

interface Reading {
  id: number
  meterId: number
  value: number
  consumption?: number
  date: string
  status: ReadingStatus
  createdAt: string
}

interface Provider {
  id: number
  name: string
  serviceType: ServiceType
  contactInfo?: string
}

interface Region {
  id: number
  name: string
}

interface AddressType {
  id: number
  name: string
}
```

### Meter Types

```typescript
type MeterType =
  | 'electricity'
  | 'gas'
  | 'cold_water'
  | 'hot_water'
  | 'heating'
```

---

## 13. Архітектурні патерни

### Custom Hooks Pattern

Кожен модуль надає операції через custom hooks:

```typescript
// Fetch список
const { addresses, isLoading, error } = useAddresses()

// Fetch один елемент
const { address, isLoading, error } = useAddress(id)

// Мутації
const { createAddress, isLoading } = useCreateAddress()
const { updateAddress, isLoading } = useUpdateAddress(id)
const { deleteAddress, isLoading } = useDeleteAddress(id)
```

### View Model Pattern

Трансформація entities → UI view models:

```typescript
// shared/viewModels/addressViewModels.ts
export function toAddressCardViewModel(address: Address): AddressCardViewModel {
  return {
    id: address.id,
    title: address.name,
    subtitle: address.region?.name ?? '',
    badge: address.addressType?.name ?? '',
    // UI-specific transformations
  }
}
```

### Service Pattern

Модульні API сервіси:

```typescript
export const addressService = {
  list: async (params?) => api.get('/address', { params }),
  getById: async (id) => api.get(`/address/${id}`),
  create: async (data) => api.post('/address', data),
  update: async (id, data) => api.put(`/address/${id}`, data),
  delete: async (id) => api.delete(`/address/${id}`),
}
```

### Reducer Pattern (Auth)

```typescript
// shared/contexts/auth/reducer.ts
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, isAuthenticated: true, user: action.payload.user }
    case 'LOGOUT':
      return { ...initialState }
    // ...
  }
}
```

### Context + Custom Hook Pattern

```typescript
// Provider
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  // ...
  return (
    <AuthContext.Provider value={{ state, login, logout, ... }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

---

## Dependency Graph

```
                    ┌─────────────────────────────────────┐
                    │           App.tsx (Router)          │
                    └─────────────────┬───────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
   ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
   │   modules/   │           │   modules/   │           │   modules/   │
   │   auth/      │           │  addresses/  │           │   meters/    │
   └──────┬───────┘           └──────┬───────┘           └──────┬───────┘
          │                          │                          │
          └──────────────────────────┼──────────────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────────┐
                    │             shared/                 │
                    ├─────────────────────────────────────┤
                    │  • api/       (Axios + Services)    │
                    │  • contexts/  (Auth state)          │
                    │  • components/ (UI + Layout)        │
                    │  • hooks/     (useAuth, etc.)       │
                    │  • types/     (Entities + DTOs)     │
                    │  • constants/ (Routes + Endpoints)  │
                    │  • utils/     (Helpers)             │
                    │  • viewModels/ (Mappers)            │
                    └─────────────────────────────────────┘
```

---

## Висновок

**Komunalka React Web** — це сучасний, добре структурований React застосунок із:

- **React 19** з TypeScript у strict mode
- **Feature-based module architecture** для масштабованості
- **Context API + useReducer** для мінімального state (лише auth)
- **Axios-based API layer** з автоматичним token refresh
- **Tailwind CSS + tailwind-variants** для maintainable стилізації
- **Playwright + Vitest** для комплексного тестування
- **Vite** для швидкої розробки та оптимізованих builds

Архітектура забезпечує чітке **розділення відповідальностей** між:
- Логікою модулів (API services, components, hooks)
- Shared інфраструктурою (types, constants, utilities)
- Глобальними concerns (authentication, routing)
