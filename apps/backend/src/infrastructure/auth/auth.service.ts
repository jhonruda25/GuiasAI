import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { USER_REPOSITORY, IUserRepository } from '../../core/domain/ports';
import { env } from '../../config/env';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly sessionService: SessionService,
  ) {}

  async register(fullName: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.userRepo.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await hash(password, env.AUTH_BCRYPT_ROUNDS);
    const user = await this.userRepo.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const session = await this.sessionService.createSession(user.id);

    return {
      user: this.sessionService.serializeUser(user),
      session,
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findByEmail(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const session = await this.sessionService.createSession(user.id);

    return {
      user: this.sessionService.serializeUser(user),
      session,
    };
  }
}
