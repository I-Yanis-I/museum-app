import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/login/route'
import { AuthService } from '@/lib/services/auth.service'

// Mock AuthService
vi.mock('@/lib/services/auth.service', () => ({
  AuthService: {
    loginUser: vi.fn(),
    excludePassword: vi.fn((user) => {
      const { password, ...rest } = user
      return rest
    }),
  },
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if validation fails', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email', password: 'test123' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Validation failed')
  })

  it('should return 401 if credentials are invalid', async () => {
    vi.mocked(AuthService.loginUser).mockRejectedValueOnce(
      new Error('INVALID_CREDENTIALS')
    )

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({ error: 'Invalid email or password' })
  })

  it('should return 200 if login is successful', async () => {
    const mockUser = {
      id: '123',
      email: 'valid@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedpassword',
      role: 'VISITOR' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(AuthService.loginUser).mockResolvedValueOnce(mockUser)

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'valid@example.com',
        password: 'Password123',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('message', 'Login successful')
    expect(data.user).toEqual({
      id: '123',
      email: 'valid@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'VISITOR',
      createdAt: mockUser.createdAt.toISOString(),
      updatedAt: mockUser.updatedAt.toISOString(),
    })
    expect(AuthService.loginUser).toHaveBeenCalledWith({
      email: 'valid@example.com',
      password: 'Password123',
    })
  })
})