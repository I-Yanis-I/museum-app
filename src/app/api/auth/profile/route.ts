import { NextResponse } from 'next/server'
import { UserService } from '@/lib/services/user.service'

export async function GET(request: Request) {
  try {
    // hardcoded userId in waiting for JWT/session
    const userId = 'de0766ca-ebf4-402a-9535-ee7930a2cff2' // ID of john.doe@museum.com

    const user = await UserService.getProfile(userId)

    return NextResponse.json(
      {
        user: UserService.excludePassword(user),
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.error('Profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = 'de0766ca-ebf4-402a-9535-ee7930a2cff2' // Temporary
    const body = await request.json()

    const user = await UserService.updateProfile(userId, body)

    return NextResponse.json(
      {
        user: UserService.excludePassword(user),
        message: 'Profile updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}