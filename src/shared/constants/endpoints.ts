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
    LIST: '/meters',
    CREATE: '/meters',
    GET: (id: number) => `/meters/${id}`,
    UPDATE: (id: number) => `/meters/${id}`,
    DELETE: (id: number) => `/meters/${id}`,
  },
  READINGS: {
    LIST: '/readings',
    CREATE: '/readings',
    GET: (id: number) => `/readings/${id}`,
    UPDATE: (id: number) => `/readings/${id}`,
    DELETE: (id: number) => `/readings/${id}`,
  },
  PROVIDERS: {
    LIST: '/providers',
    CREATE: '/providers',
    GET: (id: number) => `/providers/${id}`,
    UPDATE: (id: number) => `/providers/${id}`,
    DELETE: (id: number) => `/providers/${id}`,
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
  },
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS;
