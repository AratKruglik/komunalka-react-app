/**
 * API Configuration from environment variables
 */
export const API_CONFIG = {
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/${import.meta.env.VITE_API_VERSION}`,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
};

