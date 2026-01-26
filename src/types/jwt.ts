export interface RefreshTokenPayload {
  userId: string
  iat?: number  
  exp?: number  
}

export interface AccessTokenPayload extends RefreshTokenPayload {
  email: string
  role: string
}