# Наступні кроки після рефакторингу (Етап 1)

## Статус

✅ **Етап 1 - Критичні виправлення** - ЗАВЕРШЕНО
- AuthProvider рефакторинг
- apiClient оптимізація
- Protected Routes впровадження

---

## Етап 2: Високий пріоритет (1 день роботи)

### 1. Створити константи для routes та endpoints

**Файл:** `src/shared/constants/routes.ts`
```typescript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  ADDRESSES: '/addresses',
  ADDRESSES_NEW: '/addresses/new',
  METERS: '/meters',
  METERS_NEW: '/meters/new',
  READINGS_NEW: '/readings/new',
  PROVIDERS: '/providers',
  PROVIDERS_NEW: '/providers/new',
  PROFILE: '/profile',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = typeof ROUTES[RouteKey];
```

**Файл:** `src/shared/constants/endpoints.ts`
```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  // ... інші endpoints
} as const;
```

**Що змінити:**
- `src/App.tsx` - використати ROUTES замість string literals
- `src/modules/auth/pages/LoginPage.tsx` - використати ROUTES.REGISTER
- `src/modules/auth/components/LoginForm.tsx` - використати ROUTES
- `src/modules/auth/components/RegisterForm.tsx` - використати ROUTES
- `src/shared/api/authService.ts` - використати API_ENDPOINTS

---

### 2. Рефакторити authService.ts

**Проблеми з PR review:**
- Line 136: endpoints як string literals
- Lines 88, 121: використати object maps замість if-else
- Line 96: можна використати `.find()`

**Файл:** `src/shared/api/authService.ts`

**Що зробити:**
1. Імпортувати API_ENDPOINTS з констант
2. Створити validation helpers:
   ```typescript
   // src/shared/api/utils/validation.ts
   export const validateLoginData = (data: LoginCredentials) => {
     const errors: ValidationError[] = [];

     const validations = {
       email: () => !data.email ? 'Email is required' : null,
       password: () => !data.password ? 'Password is required' : null,
     };

     Object.entries(validations).forEach(([field, validate]) => {
       const error = validate();
       if (error) errors.push({ field, message: error });
     });

     return errors;
   };
   ```
3. Використати object map для валідації

---

### 3. Виправити RegisterForm - rememberMe

**Проблема:**
- Line 84: поле rememberMe не використовується

**Рішення (на вибір):**
1. **Видалити:** Якщо rememberMe не потрібен при реєстрації
2. **Реалізувати:** Передавати rememberMe в register action

**Файл:** `src/modules/auth/components/RegisterForm.tsx`

---

### 4. Оптимізувати структуру типів

**Проблема:**
- Типи розкидані по різних місцях
- Непотрібні реекспорти

**Що зробити:**
1. Перемістити всі auth types в `src/shared/contexts/auth/types.ts`
2. Видалити `src/shared/types/auth/` якщо дублюється
3. Використати прямі імпорти замість реекспортів

---

### 5. Перевірити useAuth hook

**Проблема:**
- Можливе дублювання з useAuthContext

**Файл:** `src/shared/hooks/useAuth.ts`

**Що зробити:**
1. Порівняти з `src/shared/contexts/auth/useAuthContext.ts`
2. Якщо дублюється - видалити
3. Якщо різні - документувати відмінності

---

## Етап 3: Середній пріоритет (пів дня)

### 1. Додати Spinner компонент

**Файл:** `src/shared/ui/Spinner.tsx`
```typescript
export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className={spinnerVariants({ size, className })}>
      <div className="animate-spin rounded-full border-2 border-current border-t-transparent" />
    </div>
  );
}
```

**Змінити:**
- `src/modules/auth/pages/LoginPage.tsx` - замінити "Loading..."
- `src/modules/auth/pages/RegisterPage.tsx` - замінити "Loading..."

---

### 2. Розглянути Tailwind className оптимізацію

**Проблема:**
- Lines 135, 144, 153 в RegisterForm - довгі className

**Рішення:**
- Використати `tailwind-variants` (вже є в проєкті)
- Або створити окремий тікет для великого рефакторингу

---

### 3. Створити enum для action types

**Файл:** `src/shared/contexts/auth/actionTypes.ts`
```typescript
export enum AuthActionType {
  AUTH_START = 'AUTH_START',
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_ERROR = 'AUTH_ERROR',
  SET_TOKENS = 'SET_TOKENS',
  LOGOUT = 'LOGOUT',
  REFRESH_START = 'REFRESH_START',
  REFRESH_SUCCESS = 'REFRESH_SUCCESS',
  REFRESH_ERROR = 'REFRESH_ERROR',
}
```

**Змінити:**
- `src/shared/types/auth/auth-action.types.ts`
- `src/shared/contexts/auth/reducer.ts`
- Всі utils в `src/shared/contexts/auth/utils/`

---

## Етап 4: Низький пріоритет (1-2 години)

### 1. Видалити непотрібні коментарі

**Файли:**
- `src/modules/auth/components/RegisterForm.tsx` (lines 83, 98)

---

### 2. Покращити назви змінних

**Файл:** `src/shared/contexts/auth/reducer.ts`
- Line 4: перевірити назви змінних

---

## Рекомендації щодо тестування

### Unit tests (пріоритетні)
```bash
# Створити тести для utils
src/shared/contexts/auth/utils/__tests__/
├── tokenRefreshScheduler.test.ts
├── tokenRefresher.test.ts
├── authActions.test.ts
├── authInitializer.test.ts
└── visibilityHandler.test.ts

src/shared/api/utils/__tests__/
├── errorFormatter.test.ts
└── authHeader.test.ts
```

### Integration tests
```bash
src/shared/contexts/auth/__tests__/
└── AuthProvider.integration.test.tsx

src/shared/components/__tests__/
├── ProtectedRoute.test.tsx
└── PublicRoute.test.tsx
```

### E2E tests (опціонально)
- Login flow
- Token refresh scenario
- Protected route access

---

## Checklist перед мержем

- [ ] Всі unit tests написані та проходять
- [ ] Константи створені (routes, endpoints)
- [ ] authService відрефакторений
- [ ] Структура типів оптимізована
- [ ] Spinner компонент доданий
- [ ] rememberMe в RegisterForm вирішено
- [ ] ESLint warnings виправлені
- [ ] TypeScript компілюється без помилок
- [ ] Manual testing пройдений
- [ ] Documentation оновлена

---

## Контакти та допомога

Якщо потрібна допомога з будь-яким етапом:
1. Звертайтесь до PR review коментарів: `PR-1-REVIEW-COMMENTS.md`
2. Перегляньте детальний звіт: `REFACTORING-REPORT.md`
3. Перевірте CLAUDE.md для project guidelines

---

**Останнє оновлення:** 19 грудня 2025
**Статус:** Етап 1 завершено, готові до Етапу 2
