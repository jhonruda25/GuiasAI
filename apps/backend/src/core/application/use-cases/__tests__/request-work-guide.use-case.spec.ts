import { RequestWorkGuideUseCase } from '../request-work-guide.use-case';
import type {
  CreateWorkGuideDto,
  IQueueProducer,
  IWorkGuideRepository,
} from '../../../domain/ports';
import type { WorkGuideEntity } from '../../../domain/entities/work-guide.entity';

function createMockGuide(
  overrides: Partial<WorkGuideEntity> = {},
): WorkGuideEntity {
  return {
    id: 'test-uuid',
    userId: 'user-1',
    topic: 'El Sistema Solar',
    targetAudience: 'Primaria',
    language: 'es',
    status: 'PENDING',
    content: null,
    globalScore: null,
    errorMessage: null,
    reviewed: false,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('RequestWorkGuideUseCase', () => {
  let useCase: RequestWorkGuideUseCase;
  let mockRepository: jest.Mocked<IWorkGuideRepository>;
  let mockQueueProducer: jest.Mocked<IQueueProducer>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdForUser: jest.fn(),
      findAllForUser: jest.fn(),
      updateStatus: jest.fn(),
      markAsReviewed: jest.fn(),
    };

    mockQueueProducer = {
      enqueueGeneration: jest.fn(),
    };

    useCase = new RequestWorkGuideUseCase(mockRepository, mockQueueProducer);
  });

  it('should create a work guide and enqueue generation', async () => {
    const mockGuide = createMockGuide();
    const dto: CreateWorkGuideDto = {
      topic: 'El Sistema Solar',
      targetAudience: 'Primaria',
      language: 'es',
      activities: ['WORD_SEARCH'],
    };

    mockRepository.create.mockResolvedValue(mockGuide);
    mockRepository.updateStatus.mockResolvedValue(
      createMockGuide({ status: 'GENERATING' }),
    );
    mockQueueProducer.enqueueGeneration.mockResolvedValue();

    const result = await useCase.execute(dto, 'user-1');

    expect(result).toEqual({
      guideId: 'test-uuid',
      status: 'GENERATING',
    });
    expect(mockRepository.create).toHaveBeenCalledWith(dto, 'user-1');
    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
      'test-uuid',
      'GENERATING',
    );
    expect(mockQueueProducer.enqueueGeneration).toHaveBeenCalledWith(
      'test-uuid',
      'El Sistema Solar',
      'Primaria',
      'es',
      ['WORD_SEARCH'],
    );
  });

  it('should throw if repository fails', async () => {
    mockRepository.create.mockRejectedValue(new Error('Database error'));

    await expect(
      useCase.execute(
        {
          topic: 'Test',
          targetAudience: 'Test',
          language: 'es',
        },
        'user-1',
      ),
    ).rejects.toThrow('Database error');
  });
});
