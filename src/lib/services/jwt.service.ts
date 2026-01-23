import jwt from 'jsonwebtoken'

export interface AccessTokenPayload {
  userId: string
  email: string
  role: string
}

export interface RefreshTokenPayload {
  userId: string
}

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

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables')
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        issuer: 'museum-app',
        audience: 'museum-api',
      }) as RefreshTokenPayload

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('REFRESH_TOKEN_EXPIRED')
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_REFRESH_TOKEN')
      }
      throw error
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
