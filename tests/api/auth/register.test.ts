import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/register/route'

// Create mock function for Supabase signUp
const mockSignUp = vi.fn()

// Create mock function for Prisma create
const mockPrismaCreate = vi.fn()

// Mock the entire Supabase server module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: mockSignUp,
    },
  })),
}))

// Mock Prisma client - Use factory function that returns the mock
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(), // Create the mock directly here
    },
  },
}))

// Import the mocked prisma to access the mock function
import { prisma } from '@/lib/prisma'

describe('POST /api/auth/register', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if email is missing', async () => {
    // Arrange: Create request without email
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        password: 'test123456' 
      }),
    })

    // Act: Call the route handler
    const response = await POST(request)

    // Assert: Check status and error message
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ error: 'Email and password are required' })
  })

  it('should return 400 if password is missing', async () => {
    // Arrange: Create request without password
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@example.com' 
      }),
    })

    // Act: Call the route handler
    const response = await POST(request)

    // Assert: Check status and error message
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ error: 'Email and password are required' })
  })

  it('should return 400 if password is too short', async () => {
    // Arrange: Create request with password less than 6 characters
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@example.com',
        password: '12345' // Less than 6 characters
      }),
    })

    // Act: Call the route handler
    const response = await POST(request)

    // Assert: Check status and error message
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ error: 'Password must be at least 6 characters long' })
  })

  it('should return 409 if user already exists', async () => {
    // Arrange: Mock Supabase to return error for existing user
    mockSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered' }
    })

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'existing@example.com',
        password: 'test123456'
      }),
    })

    // Act: Call the route handler
    const response = await POST(request)

    // Assert: Check status and error message
    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data).toEqual({ error: 'This email is already in use' })
  })

  it('should return 201 if registration is successful', async () => {
    // Arrange: Mock Supabase to return successful registration
    mockSignUp.mockResolvedValueOnce({
      data: { 
        user: { id: '123', email: 'newuser@example.com' }, 
        session: { access_token: 'fake-token' } 
      },
      error: null
    })

    // Mock Prisma to return created user
    vi.mocked(prisma.user.create).mockResolvedValueOnce({
      id: '123',
      email: 'newuser@example.com',
      firstName: '',
      lastName: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'newuser@example.com',
        password: 'test123456'
      }),
    })

    // Act: Call the route handler
    const response = await POST(request)

    // Assert: Check status and success message
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.message).toBe('Registration successful')
    
    // Verify that mockSignUp was called with correct parameters
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'test123456',
    })

    // Verify that Prisma create was called
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        id: '123',
        email: 'newuser@example.com',
        firstName: '',
        lastName: '',
      },
    })
  })
})