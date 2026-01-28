'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Musée d&apos;Art
            </h1>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Accueil
            </Link>
            <Link 
              href="/exhibitions" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Expositions
            </Link>
            <Link 
              href="/artworks" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Œuvres
            </Link>
            <Link 
              href="/bookings" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Réserver
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="secondary">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Register</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}