/**
 * API endpoint constants
 * Centralizes all API endpoint paths for consistent API communication
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh-token',
    REVOKE: '/auth/revoke-token',
    LOGOUT: '/auth/logout',
    VALIDATE: '/auth/validate-token',
  },
  ADDRESSES: {
    LIST: '/addresses',
    CREATE: '/addresses',
    GET: (id: number) => `/addresses/${id}`,
    UPDATE: (id: number) => `/addresses/${id}`,
    DELETE: (id: number) => `/addresses/${id}`,
  },
  METERS: {
    LIST: '/meter',
    CREATE: '/meter',
    GET: (id: number) => `/meter/${id}`,
    BY_ADDRESS: (addressId: number) => `/meter/address/${addressId}`,
    ACTIVE: '/meter/active',
    UPDATE: (id: number) => `/meter/${id}`,
    DELETE: (id: number) => `/meter/${id}`,
  },
  READINGS: {
    BATCH_CREATE: '/meter-readings/batch',
    BY_ADDRESS: (addressId: number) => `/meter-readings/address/${addressId}`,
    GET: (id: number) => `/meter-readings/${id}`,
    DELETE: (id: number) => `/meter-readings/${id}`,
    PHOTO_OPTIMIZED: (id: number) => `/meter-readings/photos/${id}/optimized`,
    PHOTO_THUMBNAIL: (id: number) => `/meter-readings/photos/${id}/thumbnail`,
  },
  PROVIDERS: {
    LIST: '/providers',
    CREATE: '/providers',
    GET: (id: number) => `/providers/${id}`,
    UPDATE: (id: number) => `/providers/${id}`,
    DELETE: (id: number) => `/providers/${id}`,
  },
  USER: {
    CHANGE_PASSWORD: '/user/change-password',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id: number) => `/users/${id}`,
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
  },
} as const

export type ApiEndpoint = typeof API_ENDPOINTS;
