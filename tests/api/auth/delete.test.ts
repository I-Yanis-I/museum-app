import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DELETE } from '@/app/api/auth/delete/route'
import { UserService } from '@/lib/services/user.service'

// Mock UserService
vi.mock('@/lib/services/user.service', () => ({
  UserService: {
    deleteAccount: vi.fn(),
  },
}))

describe('DELETE /api/auth/delete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 200 if account deletion is successful', async () => {
    // Mock UserService.deleteAccount to succeed
    vi.mocked(UserService.deleteAccount).mockResolvedValueOnce(undefined)

    const response = await DELETE({} as Request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({ message: 'Account deleted successfully' })
    expect(UserService.deleteAccount).toHaveBeenCalled()
  })

  it('should return 404 if user is not found', async () => {
    // Mock UserService.deleteAccount to throw USER_NOT_FOUND error
    vi.mocked(UserService.deleteAccount).mockRejectedValueOnce(
      new Error('USER_NOT_FOUND')
    )

    const response = await DELETE({} as Request)

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toEqual({ error: 'User not found' })
  })

  it('should return 500 if deletion fails with unknown error', async () => {
    // Mock UserService.deleteAccount to throw generic error
    vi.mocked(UserService.deleteAccount).mockRejectedValueOnce(
      new Error('Database error')
    )

    const response = await DELETE({} as Request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({ error: 'Internal server error' })
  })
})