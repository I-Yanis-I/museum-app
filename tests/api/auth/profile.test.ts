import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PATCH } from '@/app/api/auth/profile/route'
import { UserService } from '@/lib/services/user.service'

// Mock UserService
vi.mock('@/lib/services/user.service', () => ({
  UserService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    excludePassword: vi.fn((user) => {
      const { password, ...rest } = user
      return rest
    }),
  },
}))

describe('GET /api/auth/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 200 and user profile', async () => {
    const mockUser = {
      id: 'de0766ca-ebf4-402a-9535-ee7930a2cff2',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedpassword',
      role: 'VISITOR' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(UserService.getProfile).mockResolvedValueOnce(mockUser)

    const response = await GET({} as Request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      role: mockUser.role,
      createdAt: mockUser.createdAt.toISOString(),
      updatedAt: mockUser.updatedAt.toISOString(),
    })
  })

  it('should return 404 if user not found', async () => {
    vi.mocked(UserService.getProfile).mockRejectedValueOnce(
      new Error('USER_NOT_FOUND')
    )

    const response = await GET({} as Request)

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toEqual({ error: 'User not found' })
  })
})

describe('PATCH /api/auth/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 200 and updated user', async () => {
    const mockUser = {
      id: 'de0766ca-ebf4-402a-9535-ee7930a2cff2',
      email: 'test@example.com',
      firstName: 'Johnny',
      lastName: 'Doey',
      password: 'hashedpassword',
      role: 'VISITOR' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(UserService.updateProfile).mockResolvedValueOnce(mockUser)

    const request = new Request('http://localhost:3000/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Johnny',
        lastName: 'Doey',
      }),
    })

    const response = await PATCH(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Profile updated successfully')
    expect(data.user.firstName).toBe('Johnny')
    expect(data.user.lastName).toBe('Doey')
  })
})