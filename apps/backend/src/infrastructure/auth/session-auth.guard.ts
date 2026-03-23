import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from './authenticated-request.interface';
import { SessionService } from './session.service';
import { env } from '../../config/env';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const sessionToken = request.cookies?.[env.SESSION_COOKIE_NAME] as
      | string
      | undefined;
    const user = await this.sessionService.getUserFromToken(sessionToken);

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    request.currentUser = user;
    request.sessionToken = sessionToken;
    return true;
  }
}
