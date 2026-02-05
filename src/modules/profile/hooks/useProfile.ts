import { useState, useCallback } from 'react'
import { useAuth } from '@shared/hooks'
import type { UpdateProfilePayload } from '@shared/types/auth'

/**
 * Profile management hook
 * Provides functionality for updating user profile including password change
 * Password change is now integrated into updateProfile (via PUT /users/{id})
 *
 * @returns Profile state and methods
 *
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const { user, isLoading, error, updateProfile } = useProfile();
 *
 *   const handleUpdateProfile = async (data: UpdateProfilePayload) => {
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
   * Update user profile with optional avatar and password change
   * Delegates to AuthContext to keep user state synchronized
   *
   * @param data - Profile update data including optional avatar and password fields
   * @throws {Error} if update fails
   */
  const updateProfile = useCallback(
    async (data: UpdateProfilePayload) => {
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

  return {
    user: state.user,
    isLoading,
    error,
    isSuccess,
    updateProfile,
    clearError,
  }
}
