'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Museum App
          </Link>
          <div className="flex items-center gap-4">
            {isLoading && (
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
            )}

            {!isLoading && !isAuthenticated && (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}

            {!isLoading && isAuthenticated && user && (
              <div className="flex items-center gap-4">
                {/* 🆕 Lien vers le profil */}
                <Link href="/profile">
                  <span className="text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
                    Hello, <span className="font-semibold">{user.firstName}</span>
                  </span>
                </Link>
                <Button variant="ghost" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}