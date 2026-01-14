import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    // Check if required fields are present
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      // Check if user already exists
      if (authError.message.toLowerCase().includes('already registered') || 
          authError.message.toLowerCase().includes('already exists')) {
        return NextResponse.json(
          { error: 'This email is already in use' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Create user in database with optional firstName/lastName
    const user = await prisma.user.create({
      data: {
        id: authData.user!.id,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
      },
    })

    return NextResponse.json(
      { 
        message: 'Registration successful',
        user: {
          id: user.id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}