import type { Address } from '@shared/types/entities'

/**
 * User information interface
 */
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  avatarThumbnailUrl?: string;
  addresses?: Address[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request type for updating user profile
 */
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

/**
 * Request type for creating a new user
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
}

/**
 * Request type for changing user password
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
