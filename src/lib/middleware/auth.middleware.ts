import { NextRequest } from 'next/server'
import { JWTService } from '@/lib/services/jwt.service'
import type { AccessTokenPayload } from '@/types/jwt'

export async function requireAuth(request: NextRequest): Promise<AccessTokenPayload> {
  const accessToken = request.cookies.get('accessToken')?.value

  if (!accessToken) {
    throw new Error('UNAUTHORIZED')
  }

  try {
    const payload = JWTService.verifyAccessToken(accessToken)
    return payload
  } catch (error) {
    throw new Error('UNAUTHORIZED')
  }
}