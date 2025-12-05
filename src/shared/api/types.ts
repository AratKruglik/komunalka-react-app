/**
 * Базові типи для API
 */

/**
 * Стандартна помилка API
 */
export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

/**
 * Відповідь з пагінацією (Laravel-compatible format)
 */
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

/**
 * Параметри пагінації
 */
export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  desc?: boolean;
}
