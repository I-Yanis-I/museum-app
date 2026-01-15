import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Delete user from database first
    await prisma.user.delete({
      where: {
        id: userId,
      },
    })

    // Create admin client to delete auth user
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Delete user from Supabase auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    )

    if (deleteError) {
      console.error('Supabase deletion error:', deleteError)
      // If Supabase fails, return error (DB already deleted - can't rollback easily)
      return NextResponse.json(
        { error: 'Failed to delete user authentication' },
        { status: 500 }
      )
    }

    // Sign out current session
    await supabase.auth.signOut()

    return NextResponse.json(
      { message: 'Account successfully deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}