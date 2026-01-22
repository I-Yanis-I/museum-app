import { NextResponse } from 'next/server'
import { UserService } from '@/lib/services/user.service'

export async function DELETE(request: Request) {
  try {
    const userId = 'b26047c1-1e46-4fad-b4dc-ac9f9fee69b8' // Temporary

    await UserService.deleteAccount(userId)

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}