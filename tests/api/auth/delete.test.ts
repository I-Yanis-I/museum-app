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

// Import the mocked prisma to access the mock function
import { prisma } from '@/lib/prisma'

describe('DELETE /api/auth/delete', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    // Arrange: Mock Supabase to return authentication error
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' }
    })

    // Act: Call the route handler
    const response = await DELETE()

    // Assert: Check status and error message
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({ error: 'Unauthorized' })
    
    // Verify Prisma delete was NOT called
    expect(prisma.user.delete).not.toHaveBeenCalled()
    
    // Verify admin deleteUser was NOT called
    expect(mockAdminDeleteUser).not.toHaveBeenCalled()
  })

  it('should return 500 if Prisma delete fails', async () => {
    // Arrange: Mock Supabase to return valid user
    mockGetUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: '123', 
          email: 'user@example.com' 
        } 
      },
      error: null
    })

    // Mock Prisma to throw error
    vi.mocked(prisma.user.delete).mockRejectedValueOnce(
      new Error('Database error')
    )

    // Act: Call the route handler
    const response = await DELETE()

    // Assert: Check status and error message
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({ error: 'Server error' })
    
    // Verify Prisma delete was called
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: '123' },
    })
    
    // Verify admin deleteUser was NOT called (failed before)
    expect(mockAdminDeleteUser).not.toHaveBeenCalled()
  })

  it('should return 500 if Supabase admin delete fails', async () => {
    // Arrange: Mock Supabase to return valid user
    mockGetUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: '123', 
          email: 'user@example.com' 
        } 
      },
      error: null
    })

    // Mock Prisma delete to succeed
    vi.mocked(prisma.user.delete).mockResolvedValueOnce({
      id: '123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Mock admin deleteUser to fail
    mockAdminDeleteUser.mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to delete user' }
    })

    // Act: Call the route handler
    const response = await DELETE()

    // Assert: Check status and error message
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({ error: 'Failed to delete user authentication' })
    
    // Verify Prisma delete was called
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: '123' },
    })
    
    // Verify admin deleteUser was called
    expect(mockAdminDeleteUser).toHaveBeenCalledWith('123')
    
    // Verify signOut was NOT called (failed before)
    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it('should return 200 if account deletion is successful', async () => {
    // Arrange: Mock Supabase to return valid user
    mockGetUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: '123', 
          email: 'user@example.com' 
        } 
      },
      error: null
    })

    // Mock Prisma delete to succeed
    vi.mocked(prisma.user.delete).mockResolvedValueOnce({
      id: '123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Mock admin deleteUser to succeed
    mockAdminDeleteUser.mockResolvedValueOnce({
      data: {},
      error: null
    })

    // Mock signOut to succeed
    mockSignOut.mockResolvedValueOnce({ error: null })

    // Act: Call the route handler
    const response = await DELETE()

    // Assert: Check status and success message
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({ message: 'Account successfully deleted' })
    
    // Verify complete deletion flow
    expect(mockGetUser).toHaveBeenCalled()
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: '123' },
    })
    expect(mockAdminDeleteUser).toHaveBeenCalledWith('123')
    expect(mockSignOut).toHaveBeenCalled()
  })
})