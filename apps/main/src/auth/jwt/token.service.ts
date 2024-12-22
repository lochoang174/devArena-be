import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenService {
  constructor(private readonly configService: ConfigService) {}

  // Generate a login token
  generateLoginToken(userId: string): string {
    const secret = this.configService.get<string>('JWT_ENABLE');
    const expiresIn = this.configService.get<string>('JWT_ENABLE_EXPIRED');

    if (!secret || !expiresIn) {
      throw new Error('Missing JWT configuration.');
    }

    return jwt.sign(
      { userId },
      secret,
      {
        expiresIn, // e.g., '1h', '7d'
      }
    );
  }

  // Verify the login token
  verifyLoginToken(token: string): string {
    const secret = this.configService.get<string>('JWT_ENABLE');

    if (!secret) {
      throw new Error('Missing JWT secret configuration.');
    }

    try {
      const payload = jwt.verify(token, secret) as { userId: string };
      return payload.userId; // Return the userId from the payload
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired.');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token.');
      }
      throw error; // Re-throw unexpected errors
    }
  }
}
