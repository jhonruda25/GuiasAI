import { randomBytes, createHash } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { CookieOptions } from 'express';
import type { User } from '@prisma/client';
import { PrismaService } from '../database/prisma/prisma.service';
import { env } from '../../config/env';
import type { SessionUser } from './auth.types';

@Injectable()
export class SessionService {
  private readonly sessionDurationMs = env.SESSION_TTL_HOURS * 60 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string) {
    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + this.sessionDurationMs);

    await this.prisma.session.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });

    console.log(`[Session] Created session for user ${userId}, tokenHash: ${tokenHash}`);

    return {
      token,
      expiresAt,
    };
  }

  async getUserFromToken(
    token: string | undefined,
  ): Promise<SessionUser | null> {
    if (!token) {
      return null;
    }

    const tokenHash = this.hashToken(token);
    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session) {
      console.warn(`[Session] Token provided but no session found for tokenHash: ${tokenHash}`);
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.prisma.session
        .delete({ where: { id: session.id } })
        .catch(() => null);
      return null;
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      role: session.user.role,
    };
  }

  async destroySession(token: string | undefined) {
    if (!token) {
      return;
    }

    await this.prisma.session
      .deleteMany({
        where: { tokenHash: this.hashToken(token) },
      })
      .catch(() => null);
  }

  getCookieOptions(expiresAt: Date): CookieOptions {
    const isProd = env.NODE_ENV === 'production';
    
    return {
      httpOnly: true,
      secure: isProd, // Must be true for SameSite: None
      sameSite: isProd ? 'none' : 'lax', // Use 'none' for cross-domain production
      domain: env.SESSION_COOKIE_DOMAIN || undefined,
      expires: expiresAt,
      path: '/',
    };
  }

  getClearCookieOptions(): CookieOptions {
    return {
      ...this.getCookieOptions(new Date(0)),
      expires: new Date(0),
      maxAge: 0,
    };
  }

  requireUser(user: SessionUser | null): SessionUser {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return user;
  }

  serializeUser(user: User): SessionUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
