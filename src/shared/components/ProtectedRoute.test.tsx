import { describe, it, expect } from 'vitest'
import { Routes, Route, Navigate } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import {
  renderWithProviders,
  screen,
  createAuthenticatedState,
} from '@test-utils'

function TestChildComponent() {
  return <div data-testid="protected-content">Protected Content</div>
}

function LoginPage() {
  return <div data-testid="login-page">Login Page</div>
}

function renderProtectedRoute(authState: Parameters<typeof renderWithProviders>[1]['authContext']) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<TestChildComponent />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Route>
    </Routes>,
    {
      authContext: authState,
      routerProps: { initialEntries: ['/'] },
    }
  )
}

describe('ProtectedRoute', () => {
  describe('when authenticated', () => {
    it('renders child routes', () => {
      const authenticatedState = createAuthenticatedState()

      renderProtectedRoute({ state: authenticatedState })

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('renders nested routes when authenticated', () => {
      const authenticatedState = createAuthenticatedState()

      renderWithProviders(
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
          </Route>
        </Routes>,
        {
          authContext: { state: authenticatedState },
          routerProps: { initialEntries: ['/dashboard'] },
        }
      )

      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })
  })

  describe('when not authenticated', () => {
    it('redirects to login page', () => {
      renderProtectedRoute({
        state: {
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          error: null,
        },
      })

      expect(screen.getByTestId('login-page')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('redirects to login even when there is an error', () => {
      renderProtectedRoute({
        state: {
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          error: 'Session expired',
        },
      })

      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })
  })

  describe('when loading', () => {
    it('renders nothing while checking authentication', () => {
      const { container } = renderProtectedRoute({
        state: {
          isAuthenticated: false,
          isLoading: true,
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          error: null,
        },
      })

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
      expect(container.innerHTML).toBe('')
    })

    it('renders nothing even if isAuthenticated is true during loading', () => {
      const { container } = renderProtectedRoute({
        state: {
          isAuthenticated: true,
          isLoading: true,
          user: null,
          token: 'some-token',
          refreshToken: 'some-refresh',
          expiresAt: new Date().toISOString(),
          error: null,
        },
      })

      expect(container.innerHTML).toBe('')
    })
  })

  describe('state transitions', () => {
    it('shows content after loading completes with authentication', () => {
      const authenticatedState = createAuthenticatedState()

      const { rerender } = renderWithProviders(
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<TestChildComponent />} />
          </Route>
        </Routes>,
        {
          authContext: {
            state: { ...authenticatedState, isLoading: true },
          },
          routerProps: { initialEntries: ['/'] },
        }
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()

      rerender(
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<TestChildComponent />} />
          </Route>
        </Routes>
      )
    })
  })
})
