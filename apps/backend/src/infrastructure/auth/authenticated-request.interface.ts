import type { Request } from 'express';
import type { SessionUser } from './auth.types';

export interface AuthenticatedRequest extends Request {
  currentUser?: SessionUser;
  sessionToken?: string;
}
