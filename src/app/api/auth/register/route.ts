import { NextResponse } from 'next/server'
import { RegisterSchema } from '@/lib/validators/auth'
import { RegisterResponse, ErrorResponse } from '@/types/api/auth'
import { AuthService } from '@/lib/services/auth.service'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    // 1. Validate input
    const body = await request.json()
    const validatedData = RegisterSchema.parse(body)

    // 2. Delegate to service
    const user = await AuthService.registerUser(validatedData)

    // 3. Format response
    const response: RegisterResponse = {
      user: AuthService.excludePassword(user),
      message: 'Registration successful',
    }

    return NextResponse.json(response, { status: 201 })
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
    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      const errorResponse: ErrorResponse = {
        error: 'This email is already in use',
      }
      return NextResponse.json(errorResponse, { status: 409 })
    }

    // Unknown errors
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}