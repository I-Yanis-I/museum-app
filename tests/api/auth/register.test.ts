import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { AuthService } from '@/lib/services/auth.service'

// Mock AuthService
vi.mock('@/lib/services/auth.service', () => ({
  AuthService: {
    registerUser: vi.fn(),
    excludePassword: vi.fn((user) => {
      const { password, ...rest } = user
      return rest
    }),
  },
}))

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if validation fails', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'weak',
        firstName: 'J',
        lastName: 'D',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Validation failed')
  })

  it('should return 409 if user already exists', async () => {
    vi.mocked(AuthService.registerUser).mockRejectedValueOnce(
      new Error('EMAIL_ALREADY_EXISTS')
    )

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data).toEqual({ error: 'This email is already in use' })
  })

  it('should return 201 if registration is successful', async () => {
    const mockUser = {
      id: '123',
      email: 'newuser@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedpassword',
      role: 'VISITOR' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(AuthService.registerUser).mockResolvedValueOnce(mockUser)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data).toHaveProperty('message', 'Registration successful')
    expect(data.user).toEqual({
      id: '123',
      email: 'newuser@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'VISITOR',
      createdAt: mockUser.createdAt.toISOString(),
      updatedAt: mockUser.updatedAt.toISOString(),
    })
    expect(AuthService.registerUser).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
    })
  })
})