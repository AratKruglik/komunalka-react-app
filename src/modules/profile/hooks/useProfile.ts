import { useState, useCallback } from 'react'
import { useAuth } from '@shared/hooks'
import { userService } from '@shared/api'
import type { ChangePasswordRequest } from '@types/auth'

/**
 * Profile management hook
 * Provides functionality for updating user profile and changing password
 *
 * @returns Profile state and methods
 *
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const { user, isLoading, error, updateProfile, changePassword } = useProfile();
 *
 *   const handleUpdateProfile = async (data: UpdateUserRequest) => {
 *     await updateProfile(data);
 *   };
 *
 *   return <ProfileForm user={user} onSubmit={handleUpdateProfile} />;
 * }
 * ```
 */
export function useProfile() {
  const { state, updateProfile: updateProfileContext } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
    setIsSuccess(false)
  }, [])

  /**
   * Update user profile
   * Delegates to AuthContext to keep user state synchronized
   *
   * @param data - Profile update data
   * @throws {Error} if update fails
   */
  const updateProfile = useCallback(
    async (data: {
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        password: string | undefined
    }) => {
      setIsLoading(true)
      setError(null)
      setIsSuccess(false)

      try {
        await updateProfileContext(data)
        setIsSuccess(true)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [updateProfileContext]
  )

  /**
   * Change user password
   *
   * @param data - Current and new password
   * @throws {Error} if password change fails
   */
  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      await userService.changePassword(data)
      setIsSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    user: state.user,
    isLoading,
    error,
    isSuccess,
    updateProfile,
    changePassword,
    clearError,
  }
}
