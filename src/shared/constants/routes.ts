/**
 * Application route constants
 * Centralizes all route paths for consistent routing across the application
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  AUTH_CALLBACK: '/auth/callback',
  ADDRESSES: '/addresses',
  ADDRESSES_NEW: '/addresses/new',
  METERS: '/meters',
  METERS_NEW: '/meters/new',
  METERS_EDIT: '/meters/:id/edit',
  READINGS_NEW: '/readings/new',
  PROVIDERS: '/providers',
  PROVIDERS_NEW: '/providers/new',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  FORGOT_PASSWORD: '/forgot-password',
  TERMS: '/terms',
  PRIVACY: '/privacy',
} as const

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = typeof ROUTES[RouteKey];

export const metersEditPath = (id: number) => `/meters/${id}/edit`
