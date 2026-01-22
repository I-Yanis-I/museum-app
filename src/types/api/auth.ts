import { UserRole } from '@prisma/client'

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface RegisterResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
  }
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
  }
  message: string
}

export interface ProfileResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
    createdAt: string 
  }
}

export interface ErrorResponse {
  error: string
  details?: string
}