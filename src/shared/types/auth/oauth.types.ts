export type OAuthProvider = 'Google' | 'GitHub'

export interface OAuthAuthorizationResponse {
  authorizationUrl: string
}

export interface OAuthLoginRequest {
  provider: OAuthProvider
  token: string
}

export interface OAuthCallbackRequest {
  provider: OAuthProvider
  code: string
  state: string
}

export interface OAuthLinkRequest {
  provider: OAuthProvider
  token: string
}

export interface OAuthLinkResponse {
  message: string
  linkedProviders: ('Local' | 'Google' | 'GitHub')[]
}

export interface OAuthUnlinkResponse {
  message: string
  linkedProviders: ('Local' | 'Google' | 'GitHub')[]
}
