import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/user.service'
import { requireAuth } from '@/lib/middleware/auth.middleware'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const user = await UserService.getProfile(auth.userId)

    return NextResponse.json(
      {
        user: UserService.excludePassword(user),
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.error('Profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()
    const user = await UserService.updateProfile(auth.userId, body)

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: UserService.excludePassword(user),
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (error instanceof Error && error.message === 'VALIDATION_ERROR') {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      )
    }

    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}