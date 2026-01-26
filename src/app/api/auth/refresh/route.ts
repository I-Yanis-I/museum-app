import { NextRequest, NextResponse } from 'next/server'
import { JWTService } from '@/lib/services/jwt.service'
import { UserService } from '@/lib/services/user.service'
import type { RefreshTokenPayload } from '@/types/jwt'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token provided' },
        { status: 401 }
      )
    }

    const payload: RefreshTokenPayload = await JWTService.verifyRefreshToken(refreshToken)

    const user = await UserService.findById(payload.userId)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      )
    }

    const newAccessToken = JWTService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json(
      {
        success: true,
        message: 'Token refreshed successfully',
      },
      { status: 200 }
    )

    const isProduction = process.env.NODE_ENV === 'production'

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 60 * 15,
      path: '/',
    })

    return response
    
  } catch (error) {
    console.error('Token refresh error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired refresh token',
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Error refreshing token',
      },
      { status: 500 }
    )
  }
}