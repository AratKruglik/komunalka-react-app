import type { AuthState } from './auth-state.types'
import type { OAuthProvider } from './oauth.types'
import type { UpdateProfilePayload, User } from './user.types'

/**
 * Authentication context value interface
 */
export interface AuthContextValue {
  state: AuthState;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (data: {
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }, rememberMe?: boolean) => Promise<void>;
  refreshTokenManually: () => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<User>;
  getOAuthUrl: (provider: OAuthProvider) => Promise<string>;
  handleOAuthCallback: (provider: OAuthProvider, code: string, state: string) => Promise<void>;
}
