import axios from 'axios';

/**
 * API Error interface
 */
export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

/**
 * Format API error to a consistent structure
 * Extracts message, status, and data from Axios errors
 *
 * @param error - The error to format
 * @returns Formatted error object or original error if not an Axios error
 */
export function formatApiError(error: unknown): ApiError | unknown {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
  return error;
}
