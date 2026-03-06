export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: "USER" | "ADMIN"
  exp: number
  iat: number
}

export interface AuthUser {
  id: string
  email: string
  role: "USER" | "ADMIN"
}
