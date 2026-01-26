import jwt from 'jsonwebtoken'
import { jwtVerify } from 'jose'
import { RefreshTokenPayload, AccessTokenPayload } from '@/types/jwt'

export class JWTService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m' 
  private static readonly REFRESH_TOKEN_EXPIRY = '7d' 

  static generateAccessToken(payload: AccessTokenPayload): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables')
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: 'museum-app',
      audience: 'museum-api',
    })
  }

  static generateRefreshToken(payload: RefreshTokenPayload): string {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables')
    }

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      issuer: 'museum-app',
      audience: 'museum-api',
    })
  }

  static verifyAccessToken(token: string): AccessTokenPayload {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables')
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'museum-app',
        audience: 'museum-api',
      }) as AccessTokenPayload

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('TOKEN_EXPIRED')
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_TOKEN')
      }
      throw error
    }
  }

  static async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables')
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET)
      const { payload } = await jwtVerify(token, secret, {
        issuer: 'museum-app',
        audience: 'museum-api',
      })
      
      if (!payload.userId || typeof payload.userId !== 'string') {
        throw new Error('INVALID_REFRESH_TOKEN')
      }
      
      return {
        userId: payload.userId as string,
      }
    } catch (error) {
      throw new Error('INVALID_REFRESH_TOKEN')
    }
  }

  static generateTokenPair(userId: string, email: string, role: string) {
    const accessToken = this.generateAccessToken({ userId, email, role })
    const refreshToken = this.generateRefreshToken({ userId })

    return {
      accessToken,
      refreshToken,
    }
  }
}
