'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // 🔍 PROTECTION MANUELLE (on verra pourquoi c'est insuffisant)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('⚠️ User not authenticated, redirecting to login...')
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // État de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Si pas authentifié (pendant la redirection)
  if (!isAuthenticated || !user) {
    return null // On n'affiche rien pendant la redirection
  }

  // Affichage du profil
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            My Profile
          </h1>

          <div className="space-y-6">
            {/* Informations personnelles */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                    {user.firstName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                    {user.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                {user.email}
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <div className="flex items-center gap-2">
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : ''}
                  ${user.role === 'STAFF' ? 'bg-blue-100 text-blue-800' : ''}
                  ${user.role === 'VISITOR' ? 'bg-green-100 text-green-800' : ''}
                `}>
                  {user.role}
                </span>
              </div>
            </div>

            {/* Actions futures */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex gap-4">
                <Button variant="secondary" disabled>
                  Edit Profile (Coming soon)
                </Button>
                <Button variant="danger" disabled>
                  Delete Account (Coming soon)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}