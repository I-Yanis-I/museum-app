import { User as PrismaUser, UserRole } from '@prisma/client'

export type User = PrismaUser
export type UserPublic = Omit<User, 'password'>
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

export { UserRole }