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
 * Extended profile update payload with avatar and password support
 * Used for PUT /users/{id} with multipart/form-data when avatar is included
 */
export interface UpdateProfilePayload extends UpdateUserRequest {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  avatar?: File;
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
