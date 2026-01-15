import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DELETE } from '@/app/api/auth/delete/route'

// Create mock functions for Supabase
const mockGetUser = vi.fn()
const mockSignOut = vi.fn()
const mockAdminDeleteUser = vi.fn()

// Mock the Supabase server module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
    },
  })),
}))

// Mock Supabase admin client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        deleteUser: mockAdminDeleteUser,
      },
    },
  })),
}))

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      delete: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

describe('DELETE /api/auth/delete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' }
    })

    const response = await DELETE()
    expect(response.status).toBe(401)
    
    const data = await response.json()
    expect(data).toEqual({ error: 'Unauthorized' })
    expect(prisma.user.delete).not.toHaveBeenCalled()
    expect(mockAdminDeleteUser).not.toHaveBeenCalled()
  })

  it('should return 500 if Prisma delete fails', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: '123', 
          email: 'user@example.com' 
        } 
      },
      error: null
    })

    mockAdminDeleteUser.mockResolvedValueOnce({
      data: {},
      error: null
    })

    vi.mocked(prisma.user.delete).mockRejectedValueOnce(
      new Error('Database error')
    )

    const response = await DELETE()

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({ error: 'Failed to delete user data' })
    
    expect(mockAdminDeleteUser).toHaveBeenCalledWith('123')
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: '123' },
    })
    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it('should return 500 if Supabase admin delete fails', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: '123', 
          email: 'user@example.com' 
        } 
      },
      error: null
    })

    mockAdminDeleteUser.mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to delete user' }
    })

    const response = await DELETE()

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({ error: 'Failed to delete authentication' })
    
    expect(mockAdminDeleteUser).toHaveBeenCalledWith('123')
    expect(prisma.user.delete).not.toHaveBeenCalled()
    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it('should return 204 if account deletion is successful', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: '123', 
          email: 'user@example.com' 
        } 
      },
      error: null
    })

    mockAdminDeleteUser.mockResolvedValueOnce({
      data: {},
      error: null
    })

    vi.mocked(prisma.user.delete).mockResolvedValueOnce({
      id: '123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockSignOut.mockResolvedValueOnce({ error: null })

    const response = await DELETE()

    expect(response.status).toBe(204)
    
    expect(mockGetUser).toHaveBeenCalled()
    expect(mockAdminDeleteUser).toHaveBeenCalledWith('123')
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: '123' },
    })
    expect(mockSignOut).toHaveBeenCalled()
  })
})