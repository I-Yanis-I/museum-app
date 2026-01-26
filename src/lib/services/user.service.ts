import { prisma } from '@/lib/prisma'
import { User } from '@prisma/client'

export class UserService {
  static async findById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    return user
  }

  static async getProfile(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    return user
  }

  static async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string }
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    })

    return user
  }

  static async deleteAccount(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    await prisma.user.delete({
      where: { id: userId },
    })
  }

  static excludePassword(user: User) {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}
