import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { RegisterInput, LoginInput } from '@/lib/validators/auth'
import { User } from '@prisma/client'

export class AuthService {
  static async registerUser(data: RegisterInput): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

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

  static async loginUser(data: LoginInput): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password!)

    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS')
    }

    return user
  }

  static excludePassword(user: User) {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}