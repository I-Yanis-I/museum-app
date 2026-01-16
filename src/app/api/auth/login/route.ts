import { NextResponse } from 'next/server'
import { LoginSchema } from '@/lib/validators/auth'
import { AuthService } from '@/lib/services/auth.service'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    // 1. Validate input
    const body = await request.json()
    const validatedData = LoginSchema.parse(body)

    // 2. Delegate to service
    const user = await AuthService.loginUser(validatedData)

    // 3. Format response
    return NextResponse.json(
      {
        user: AuthService.excludePassword(user),
        message: 'Login successful',
      },
      { status: 200 }
    )
  } catch (error) {
    // Validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    // Business logic errors
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Unknown errors
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}