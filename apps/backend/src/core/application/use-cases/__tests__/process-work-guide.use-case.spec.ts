import { ProcessWorkGuideGenerationUseCase } from '../process-work-guide.use-case';
import { Logger } from '@nestjs/common';
import type {
  IAiGeneratorService,
  IEventPublisher,
  IWorkGuideRepository,
} from '../../../domain/ports';
import type { WorkGuideEntity } from '../../../domain/entities/work-guide.entity';
import { ImageGeneratorService } from '../../../../infrastructure/ai/image-generator.service';

function createMockGuide(
  overrides: Partial<WorkGuideEntity> = {},
): WorkGuideEntity {
  return {
    id: 'test-id',
    userId: 'user-1',
    topic: 'El Sistema Solar',
    targetAudience: 'Primaria',
    language: 'es',
    status: 'COMPLETED',
    content: null,
    globalScore: 50,
    errorMessage: null,
    reviewed: false,
    reviewedBy: null,
    reviewedAt: null,
    hasCover: false,
    coverImageDataUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const mockGeneratedContent = {
  topic: 'El Sistema Solar',
  target_audience: 'Primaria',
  global_score: 100,
  theme: {
    primary_color: '#1E90FF',
    icon_emoji: '🌎',
  },
  activities: [
    {
      type: 'CROSSWORD' as const,
      instructions: 'Resuelve el crucigrama',
      score: 50,
      items: [
        { word: 'SOL', clue_or_definition: 'Estrella central del sistema' },
        { word: 'TIERRA', clue_or_definition: 'Nuestro planeta' },
        { word: 'LUNA', clue_or_definition: 'Satelite natural de la Tierra' },
        { word: 'MARTE', clue_or_definition: 'Planeta rojo' },
      ],
    },
  ],
  global_rubric: {
    global_description: 'Evaluacion del sistema solar',
    criteria: [],
  },
};

describe('ProcessWorkGuideGenerationUseCase', () => {
  let useCase: ProcessWorkGuideGenerationUseCase;
  let mockRepository: jest.Mocked<IWorkGuideRepository>;
  let mockAiService: jest.Mocked<IAiGeneratorService>;
  let mockEventPublisher: jest.Mocked<IEventPublisher>;
  let mockImageGeneratorService: jest.Mocked<
    Pick<ImageGeneratorService, 'generateImages' | 'generateImage'>
  >;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdForUser: jest.fn(),
      findCoverByIdForUser: jest.fn(),
      findAllForUser: jest.fn(),
      updateStatus: jest.fn(),
      markAsReviewed: jest.fn(),
    };

    mockAiService = {
      generateWorkGuide: jest.fn(),
    };

    mockEventPublisher = {
      publishGuideUpdated: jest.fn(),
    };

    mockImageGeneratorService = {
      generateImages: jest.fn(),
      generateImage: jest.fn(),
    };

    useCase = new ProcessWorkGuideGenerationUseCase(
      mockRepository,
      mockAiService,
      mockEventPublisher,
      mockImageGeneratorService as unknown as ImageGeneratorService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate work guide, save to DB and emit event', async () => {
    mockAiService.generateWorkGuide.mockResolvedValue(mockGeneratedContent);
    mockImageGeneratorService.generateImage.mockResolvedValue('cover-image');
    mockRepository.updateStatus.mockResolvedValue(
      createMockGuide({
        content: mockGeneratedContent,
        globalScore: 50,
        hasCover: true,
        coverImageDataUrl: 'cover-image',
      }),
    );

    await useCase.execute('test-id', 'El Sistema Solar', 'Primaria', 'es');

    expect(mockAiService.generateWorkGuide).toHaveBeenCalledWith(
      'El Sistema Solar',
      'Primaria',
      'es',
      undefined,
    );
    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
      'test-id',
      'COMPLETED',
      mockGeneratedContent,
      50,
      undefined,
      'cover-image',
    );
    expect(mockEventPublisher.publishGuideUpdated).toHaveBeenCalledWith(
      'test-id',
      {
        status: 'COMPLETED',
        data: mockGeneratedContent,
      },
    );
    expect(mockImageGeneratorService.generateImages).not.toHaveBeenCalled();
    expect(mockImageGeneratorService.generateImage).toHaveBeenCalledTimes(1);
  });

  it('should handle AI generation failure', async () => {
    mockAiService.generateWorkGuide.mockRejectedValue(
      new Error('AI API Error'),
    );

    await useCase.execute('test-id', 'El Sistema Solar', 'Primaria', 'es');

    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
      'test-id',
      'FAILED',
      undefined,
      undefined,
      'AI API Error',
    );
    expect(mockEventPublisher.publishGuideUpdated).toHaveBeenCalledWith(
      'test-id',
      {
        status: 'FAILED',
        error: 'AI API Error',
      },
    );
  });

  it('should append generated images for sequential image activities', async () => {
    const sequentialContent = {
      ...mockGeneratedContent,
      activities: [
        {
          type: 'SEQUENTIAL_IMAGE_ANALYSIS' as const,
          instructions: 'Analiza las imagenes',
          score: 20,
          image_prompts: ['planet earth', 'planet mars'],
          questions: ['Que observas?', 'Que diferencias notas?'],
        },
      ],
    };

    mockAiService.generateWorkGuide.mockResolvedValue(sequentialContent);
    mockImageGeneratorService.generateImages.mockResolvedValue([
      'img-1',
      'img-2',
    ]);
    mockImageGeneratorService.generateImage.mockResolvedValue('cover-image');
    mockRepository.updateStatus.mockResolvedValue(
      createMockGuide({
        content: {
          ...sequentialContent,
          activities: [
            {
              ...sequentialContent.activities[0],
              generated_images: ['img-1', 'img-2'],
            },
          ],
        },
        globalScore: 20,
      }),
    );

    await useCase.execute('test-id', 'El Sistema Solar', 'Primaria', 'es');

    expect(mockImageGeneratorService.generateImages).toHaveBeenCalledWith([
      'planet earth',
      'planet mars',
    ]);
    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
      'test-id',
      'COMPLETED',
      {
        ...sequentialContent,
        activities: [
          {
            ...sequentialContent.activities[0],
            generated_images: ['img-1', 'img-2'],
          },
        ],
      },
      20,
      undefined,
      'cover-image',
    );
  });

  it('should not fail guide completion if cover generation fails', async () => {
    mockAiService.generateWorkGuide.mockResolvedValue(mockGeneratedContent);
    mockImageGeneratorService.generateImage.mockRejectedValue(
      new Error('image model unavailable'),
    );
    mockRepository.updateStatus.mockResolvedValue(
      createMockGuide({ content: mockGeneratedContent, globalScore: 50 }),
    );

    await useCase.execute('test-id', 'El Sistema Solar', 'Primaria', 'es');

    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
      'test-id',
      'COMPLETED',
      mockGeneratedContent,
      50,
      undefined,
      null,
    );
  });
});
