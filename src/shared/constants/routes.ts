/**
 * Application route constants
 * Centralizes all route paths for consistent routing across the application
 */
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
  FORGOT_PASSWORD: '/forgot-password',
  TERMS: '/terms',
  PRIVACY: '/privacy',
} as const

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = typeof ROUTES[RouteKey];
