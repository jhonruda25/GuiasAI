import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { SessionAuthGuard } from './session-auth.guard';
import { ZodValidationPipe } from '../http/pipes/zod-validation.pipe';
import { SessionService } from './session.service';
import { CurrentUser } from './current-user.decorator';
import type { SessionUser } from './auth.types';
import type { AuthenticatedRequest } from './authenticated-request.interface';
import { env } from '../../config/env';
import { Throttle as RateLimit } from '@nestjs/throttler';

const registerSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

type RegisterRequest = z.infer<typeof registerSchema>;
type LoginRequest = z.infer<typeof loginSchema>;

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('register')
  @RateLimit({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(
      body.fullName,
      body.email,
      body.password,
    );

    response.cookie(
      env.SESSION_COOKIE_NAME,
      result.session.token,
      this.sessionService.getCookieOptions(result.session.expiresAt),
    );

    return {
      user: result.user,
    };
  }

  @Post('login')
  @RateLimit({ default: { ttl: 60_000, limit: 8 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(body.email, body.password);

    response.cookie(
      env.SESSION_COOKIE_NAME,
      result.session.token,
      this.sessionService.getCookieOptions(result.session.expiresAt),
    );

    return {
      user: result.user,
    };
  }

  @Post('logout')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() _user: SessionUser,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = request.cookies?.[env.SESSION_COOKIE_NAME] as
      | string
      | undefined;

    await this.sessionService.destroySession(token);
    response.clearCookie(
      env.SESSION_COOKIE_NAME,
      this.sessionService.getClearCookieOptions(),
    );
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  getCurrentUser(@CurrentUser() user: SessionUser) {
    return { user };
  }
}
