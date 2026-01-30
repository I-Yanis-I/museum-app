import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

/**
 * Next.js Middleware - Route Protection
 * 
 * Executes BEFORE each request to:
 * - Verify authentication
 * - Redirect if necessary
 * - Control permissions (ADMIN, STAFF, VISITOR)
 */

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/exhibitions',
  '/about',
]

const protectedRoutes = [
  '/profile',
  '/bookings',
]

const adminRoutes = [
  '/admin',
]

const authRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 🔍 LOG for debugging (you can remove later)
  console.log(`[Middleware] ${request.method} ${pathname}`)

  // Get token from cookies
  const token = request.cookies.get('refreshToken')?.value

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // CASE 1: Attempt to access protected route WITHOUT token
  if ((isProtectedRoute || isAdminRoute) && !token) {
    console.log(`[Middleware] ❌ No token, redirecting to /login`)
    const loginUrl = new URL('/login', request.url)
    // Add destination URL to redirect after login
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // CASE 2: Token present → Verify validity and permissions
  if (token) {
    try {
      // Decode JWT to extract information
      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)
      const { payload } = await jwtVerify(token, secret)
      const userRole = payload.role as string

      console.log(`[Middleware] ✅ Token valid, user role: ${userRole}`)

      // CASE 2a: Authenticated user tries to access /login or /register
      if (isAuthRoute) {
        console.log(`[Middleware] ➡️ Already authenticated, redirecting to /`)
        return NextResponse.redirect(new URL('/', request.url))
      }

      // CASE 2b: Non-ADMIN user tries to access /admin
      if (isAdminRoute && userRole !== 'ADMIN') {
        console.log(`[Middleware] ❌ Not ADMIN, redirecting to /`)
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Token valid and permissions OK → Allow access
      return NextResponse.next()

    } catch (error) {
      // Invalid or expired token
      console.log(`[Middleware] ❌ Invalid token:`, error)
      
      // Delete invalid cookie
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('refreshToken')
      return response
    }
  }

  // CASE 3: Public route without token → Allow access
  return NextResponse.next()
}

/**
 * Configuration: On which routes to execute the middleware
 * 
 * IMPORTANT: Do NOT execute on static resources (_next, images, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - Next.js internal API routes (_next)
     * - Static files (images, fonts, etc.)
     * - Favicon
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)',
  ],
}