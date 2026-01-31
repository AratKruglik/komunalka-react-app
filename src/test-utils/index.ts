import { type ReactElement, type ReactNode, createElement } from 'react'
import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router'
import { AuthContext } from '@shared/contexts/auth'
import { ThemeProvider } from '@shared/components/theme/ThemeProvider'
import type { AuthContextValue, AuthState, User } from '@shared/types/auth'
import type { UpdateUserRequest } from '@shared/types/auth'
import { createMockAuthState, createMockUser } from './factories'

export interface MockAuthContextOptions {
  state?: Partial<AuthState>
  login?: AuthContextValue['login']
  logout?: AuthContextValue['logout']
  register?: AuthContextValue['register']
  refreshTokenManually?: AuthContextValue['refreshTokenManually']
  updateProfile?: AuthContextValue['updateProfile']
}

export function createMockAuthContext(options: MockAuthContextOptions = {}): AuthContextValue {
  const defaultState = createMockAuthState(options.state)

  return {
    state: defaultState,
    login: options.login ?? vi.fn().mockResolvedValue(undefined),
    logout: options.logout ?? vi.fn(),
    register: options.register ?? vi.fn().mockResolvedValue(undefined),
    refreshTokenManually: options.refreshTokenManually ?? vi.fn().mockResolvedValue(undefined),
    updateProfile: options.updateProfile ?? vi.fn().mockImplementation(
      async (data: UpdateUserRequest): Promise<User> => {
        return createMockUser({ ...defaultState.user, ...data })
      }
    ),
  }
}

interface WrapperOptions {
  authContext?: MockAuthContextOptions
  routerProps?: MemoryRouterProps
}

function createTestWrapper(options: WrapperOptions = {}) {
  const { authContext, routerProps } = options
  const mockAuthValue = createMockAuthContext(authContext)

  return function TestWrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(
      MemoryRouter,
      routerProps,
      createElement(AuthContext.Provider, { value: mockAuthValue }, children)
    )
  }
}

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  authContext?: MockAuthContextOptions
  routerProps?: MemoryRouterProps
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult & { authContext: AuthContextValue } {
  const { authContext: authContextOptions, routerProps, ...renderOptions } = options
  const mockAuthValue = createMockAuthContext(authContextOptions)

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => {
    return createElement(
      ThemeProvider,
      null,
      createElement(
        MemoryRouter,
        routerProps,
        createElement(AuthContext.Provider, { value: mockAuthValue }, children)
      )
    )
  }

  return {
    ...render(ui, { wrapper, ...renderOptions }),
    authContext: mockAuthValue,
  }
}

export function renderWithRouter(
  ui: ReactElement,
  routerProps?: MemoryRouterProps
): RenderResult {
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => {
    return createElement(MemoryRouter, routerProps, children)
  }

  return render(ui, { wrapper })
}

export * from './factories'
export { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
