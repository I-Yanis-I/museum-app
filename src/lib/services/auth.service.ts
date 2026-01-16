import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { RegisterInput, LoginInput } from '@/lib/validators/auth'
import { User } from '@prisma/client'

export class AuthService {
  /**
   * Register a new user
   */
  static async registerUser(data: RegisterInput): Promise<User> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'VISITOR',
      },
    })

    return user
  }

  /**
   * Login user
   */
  static async loginUser(data: LoginInput): Promise<User> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new Error('INVALID_CREDENTIALS')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password!)

    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS')
    }

    return user
  }

  /**
   * Remove password from user object
   */
  static excludePassword(user: User) {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}