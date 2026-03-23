import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from '../../auth/authenticated-request.interface';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: AuthenticatedRequest): Promise<string> {
    if (req.currentUser?.id) {
      return await Promise.resolve(`user:${req.currentUser.id}`);
    }

    return await Promise.resolve(
      `${req.ip}:${req.headers['user-agent'] ?? 'unknown'}`,
    );
  }

  protected getRequestResponse(context: ExecutionContext) {
    const http = context.switchToHttp();
    const req = http.getRequest<AuthenticatedRequest>();
    const res = http.getResponse<Record<string, unknown>>();

    return {
      req,
      res,
    };
  }
}
