import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (deleteAuthError) {
      console.error('Auth deletion failed:', deleteAuthError)
      return NextResponse.json(
        { error: 'Failed to delete authentication' },
        { status: 500 }
      )
    }

    try {
      await prisma.user.delete({ where: { id: userId } })
    } catch (dbError) {
      console.error('DB deletion failed:', dbError)
    
      return NextResponse.json(
        { error: 'Failed to delete user data' },
        { status: 500 }
      )
    }

    await supabase.auth.signOut()

    return new NextResponse(null, { status: 204 })
    
  } catch (error) {
    console.error('Unexpected deletion error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}