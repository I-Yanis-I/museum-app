import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/login/route'

// Create a shared mock instance
const mockSignInWithPassword = vi.fn()

// Mock Supabase module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  })),
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if email is missing', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'test123' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ error: 'Email and password are required' })
  })

  it('should return 400 if password is missing', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ error: 'Email and password are required' })
  })

  it('should return 401 if credentials are invalid', async () => {
    // Configure the shared mock to return an error
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    })

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
    expect(data).toEqual({ error: 'Invalid credentials' })
  })

  it('should return 200 and token if login is successful', async () => {
    // Configure the shared mock to return success
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {
        user: { id: '123', email: 'valid@example.com' },
        session: {
          access_token: 'fake-token-123',
          expires_at: 1234567890,
        },
      },
      error: null,
    })

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'valid@example.com',
        password: 'validpassword123',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('message', 'Login successful')
    expect(data.user).toEqual({
      id: '123',
      email: 'valid@example.com',
    })
    expect(data.session).toHaveProperty('access_token', 'fake-token-123')
  })
})