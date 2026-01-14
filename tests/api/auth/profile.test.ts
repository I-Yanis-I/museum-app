import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/auth/profile/route'

// Create mock function for Supabase getUser
const mockGetUser = vi.fn()

// Mock the entire Supabase server module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

// Mock Prisma client - Create the mock directly in factory
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(), // Create the mock directly here
    },
  },
}))

// Import the mocked prisma to access the mock function
import { prisma } from '@/lib/prisma'

describe('GET /api/auth/profile', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if user is not authenticated (error)', async () => {
    // Arrange: Mock Supabase to return authentication error
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' }
    })

    // Act: Call the route handler
    const response = await GET()

    // Assert: Check status and error message
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({ error: 'Unauthorized' })
    
    // Verify Prisma was NOT called (early return)
    expect(prisma.user.findUnique).not.toHaveBeenCalled()
  })

  it('should return 401 if user is null', async () => {
    // Arrange: Mock Supabase to return null user
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    })

    // Act: Call the route handler
    const response = await GET()

    // Assert: Check status and error message
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({ error: 'Unauthorized' })
    
    // Verify Prisma was NOT called
    expect(prisma.user.findUnique).not.toHaveBeenCalled()
  })

  it('should return 404 if user profile not found in database', async () => {
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

    // Mock Prisma to return null (user not found in DB)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

    // Act: Call the route handler
    const response = await GET()

    // Assert: Check status and error message
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toEqual({ error: 'Profile not found' })
    
    // Verify Prisma was called with correct user ID
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: '123' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    })
  })

  it('should return 200 with user profile if authenticated', async () => {
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

    // Mock Prisma to return user profile
    const mockDate = new Date('2024-01-01')
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: '123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    // Act: Call the route handler
    const response = await GET()

    // Assert: Check status and user data
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({
      user: {
        id: '123',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: mockDate.toISOString(), // ← FIX: Convert Date to ISO string
      },
    })
    
    // Verify Supabase getUser was called
    expect(mockGetUser).toHaveBeenCalled()
    
    // Verify Prisma findUnique was called with correct parameters
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: '123' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    })
  })
})