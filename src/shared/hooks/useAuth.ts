import { useState } from 'react';
import { authService, type LoginRequest, type RegisterRequest, type AuthResponse } from '../api';

/**
 * Custom hook для роботи з аутентифікацією
 */
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Логін користувача
   */
  const login = async (data: LoginRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Помилка входу';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Реєстрація користувача
   */
  const register = async (data: RegisterRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(data);
      // Після успішної реєстрації також зберігаємо токени
      localStorage.setItem('jwt_token', response.token);
      localStorage.setItem('refresh_token', response.refreshToken);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Помилка реєстрації';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Вихід користувача
   */
  const logout = () => {
    authService.logout();
  };

  /**
   * Перевірка, чи користувач залогінений
   */
  const isAuthenticated = authService.isAuthenticated();

  return {
    login,
    register,
    logout,
    isAuthenticated,
    isLoading,
    error,
  };
};
