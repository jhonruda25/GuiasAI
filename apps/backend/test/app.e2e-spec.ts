import cookieParser from 'cookie-parser';
import {
  ConflictException,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from '../src/infrastructure/auth/auth.controller';
import { AuthService } from '../src/infrastructure/auth/auth.service';
import { SessionAuthGuard } from '../src/infrastructure/auth/session-auth.guard';
import { SessionService } from '../src/infrastructure/auth/session.service';
import { WorkGuideController } from '../src/infrastructure/http/controllers/work-guide.controller';
import { RetryWorkGuideUseCase } from '../src/core/application/use-cases/retry-work-guide.use-case';
import { RequestWorkGuideUseCase } from '../src/core/application/use-cases/request-work-guide.use-case';
import {
  WORK_GUIDE_REPOSITORY,
  type IWorkGuideRepository,
} from '../src/core/domain/ports';
import type { WorkGuideEntity } from '../src/core/domain/entities/work-guide.entity';

type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'TEACHER';
};

const userA: SessionUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'teacher-a@example.com',
  fullName: 'Teacher A',
  role: 'TEACHER',
};

const userB: SessionUser = {
  id: '22222222-2222-4222-8222-222222222222',
  email: 'teacher-b@example.com',
  fullName: 'Teacher B',
  role: 'TEACHER',
};

const guideAId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const guideBId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function createGuide(overrides: Partial<WorkGuideEntity>): WorkGuideEntity {
  return {
    id: guideAId,
    userId: userA.id,
    topic: 'Sistema solar',
    targetAudience: 'Tercero (3o)',
    language: 'es',
    status: 'COMPLETED',
    content: null,
    globalScore: 20,
    errorMessage: null,
    reviewed: false,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date('2026-03-14T12:00:00.000Z'),
    updatedAt: new Date('2026-03-14T12:00:00.000Z'),
    ...overrides,
  };
}

class FakeSessionService {
  private readonly sessions = new Map<string, SessionUser>();

  remember(token: string, user: SessionUser) {
    this.sessions.set(token, user);
  }

  async getUserFromToken(token: string | undefined) {
    return token ? (this.sessions.get(token) ?? null) : null;
  }

  async destroySession(token: string | undefined) {
    if (token) {
      this.sessions.delete(token);
    }
  }

  getCookieOptions(expiresAt: Date) {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      expires: expiresAt,
      path: '/',
    };
  }

  getClearCookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      expires: new Date(0),
      path: '/',
      maxAge: 0,
    };
  }
}

class FakeAuthService {
  private readonly users = new Map<
    string,
    { user: SessionUser; password: string }
  >();

  constructor(private readonly sessionService: FakeSessionService) {}

  async register(fullName: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (this.users.has(normalizedEmail)) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = normalizedEmail === userA.email ? userA : userB;
    this.users.set(normalizedEmail, { user: { ...user, fullName }, password });

    const token = `token-${user.id}`;
    this.sessionService.remember(token, { ...user, fullName });

    return {
      user: { ...user, fullName },
      session: {
        token,
        expiresAt: new Date(Date.now() + 60_000),
      },
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const record = this.users.get(normalizedEmail);

    if (!record || record.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = `token-${record.user.id}`;
    this.sessionService.remember(token, record.user);

    return {
      user: record.user,
      session: {
        token,
        expiresAt: new Date(Date.now() + 60_000),
      },
    };
  }
}

class InMemoryWorkGuideRepository implements IWorkGuideRepository {
  private guides = [
    createGuide({ id: guideAId, userId: userA.id, topic: 'Sistema solar' }),
    createGuide({
      id: guideBId,
      userId: userB.id,
      topic: 'Estados de la materia',
    }),
  ];

  async create(): Promise<WorkGuideEntity> {
    throw new Error('Not implemented in e2e test');
  }

  async findById(id: string) {
    return this.guides.find((guide) => guide.id === id) ?? null;
  }

  async findByIdForUser(id: string, userId: string) {
    return (
      this.guides.find((guide) => guide.id === id && guide.userId === userId) ??
      null
    );
  }

  async findAllForUser(userId: string) {
    return this.guides.filter((guide) => guide.userId === userId);
  }

  async updateStatus(
    id: string,
    status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED',
    content?: unknown,
    globalScore?: number,
    errorMessage?: string,
  ) {
    const guide = await this.findById(id);
    if (!guide) {
      throw new Error('Guide not found');
    }

    const updated: WorkGuideEntity = {
      ...guide,
      status,
      content: (content as WorkGuideEntity['content']) ?? guide.content,
      globalScore: globalScore ?? guide.globalScore,
      errorMessage: errorMessage ?? guide.errorMessage,
      updatedAt: new Date(),
    };

    this.guides = this.guides.map((item) => (item.id === id ? updated : item));
    return updated;
  }

  async markAsReviewed(id: string, reviewerName: string) {
    const guide = await this.findById(id);
    if (!guide) {
      throw new Error('Guide not found');
    }

    const updated: WorkGuideEntity = {
      ...guide,
      reviewed: true,
      reviewedBy: reviewerName,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    };

    this.guides = this.guides.map((item) => (item.id === id ? updated : item));
    return updated;
  }
}

describe('Auth and WorkGuide (e2e)', () => {
  let app: INestApplication;
  let repository: InMemoryWorkGuideRepository;

  beforeEach(async () => {
    repository = new InMemoryWorkGuideRepository();
    const fakeSessionService = new FakeSessionService();
    const fakeAuthService = new FakeAuthService(fakeSessionService);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, WorkGuideController],
      providers: [
        EventEmitter2,
        SessionAuthGuard,
        {
          provide: SessionService,
          useValue: fakeSessionService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        {
          provide: WORK_GUIDE_REPOSITORY,
          useValue: repository,
        },
        {
          provide: RequestWorkGuideUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RetryWorkGuideUseCase,
          useValue: {
            execute: jest.fn(async (guideId: string, userId: string) => {
              const guide = await repository.findByIdForUser(guideId, userId);
              if (!guide) {
                throw new NotFoundException('Guide not found');
              }

              return {
                guideId,
                status: 'GENERATING',
              };
            }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('blocks anonymous access to protected routes and SSE', async () => {
    await request(app.getHttpServer()).get('/api/v1/work-guides').expect(401);
    await request(app.getHttpServer())
      .get(`/api/v1/work-guides/${guideAId}/events`)
      .expect(401);
  });

  it('enforces ownership, review access and logout lifecycle', async () => {
    const agentA = request.agent(app.getHttpServer());
    const agentB = request.agent(app.getHttpServer());

    await agentA
      .post('/api/v1/auth/register')
      .send({
        fullName: userA.fullName,
        email: userA.email,
        password: 'password123',
      })
      .expect(201);

    await agentB
      .post('/api/v1/auth/register')
      .send({
        fullName: userB.fullName,
        email: userB.email,
        password: 'password123',
      })
      .expect(201);

    await agentA
      .get('/api/v1/auth/me')
      .expect(200)
      .expect(({ body }) => {
        expect(body.user.email).toBe(userA.email);
      });

    await agentA
      .get('/api/v1/work-guides')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0].id).toBe(guideAId);
      });

    await agentA.get(`/api/v1/work-guides/${guideBId}`).expect(404);

    await agentA
      .post(`/api/v1/work-guides/${guideBId}/review`)
      .send({ reviewerName: 'Teacher A' })
      .expect(404);

    await agentA
      .post(`/api/v1/work-guides/${guideAId}/review`)
      .send({ reviewerName: 'Teacher A' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.reviewed).toBe(true);
        expect(body.reviewedBy).toBe('Teacher A');
      });

    await agentB.post(`/api/v1/work-guides/${guideAId}/retry`).expect(404);

    await agentA.post('/api/v1/auth/logout').expect(204);
    await agentA.get('/api/v1/auth/me').expect(401);
  });
});
