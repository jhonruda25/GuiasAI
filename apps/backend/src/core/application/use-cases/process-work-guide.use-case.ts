import { Injectable, Logger, Inject } from '@nestjs/common';
import type {
  IWorkGuideRepository,
  IEventPublisher,
  IAiGeneratorService,
} from '../../domain/ports';
import {
  WORK_GUIDE_REPOSITORY,
  EVENT_PUBLISHER,
  AI_GENERATOR_SERVICE,
} from '../../domain/ports';
import { WorkGuideSchema } from '@repo/schemas';
import { ImageGeneratorService } from '../../../infrastructure/ai/image-generator.service';

@Injectable()
export class ProcessWorkGuideGenerationUseCase {
  private readonly logger = new Logger(ProcessWorkGuideGenerationUseCase.name);

  constructor(
    @Inject(WORK_GUIDE_REPOSITORY)
    private readonly workGuideRepository: IWorkGuideRepository,
    @Inject(AI_GENERATOR_SERVICE)
    private readonly aiGeneratorService: IAiGeneratorService,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
    private readonly imageGeneratorService: ImageGeneratorService,
  ) {}

  async execute(
    guideId: string,
    topic: string,
    targetAudience: string,
    language: string,
    activities?: string[],
  ) {
    this.logger.log(
      `Processing work guide generation for ID: ${guideId} in ${language} with activities: ${activities?.join(',') || 'DEFAULT'}`,
    );

    try {
      const generatedContent = await this.aiGeneratorService.generateWorkGuide(
        topic,
        targetAudience,
        language,
        activities,
      );
      const parsed = WorkGuideSchema.parse(generatedContent);

      // Generate images for SEQUENTIAL_IMAGE_ANALYSIS activities
      const activitiesWithImages = await Promise.all(
        parsed.activities.map(async (activity) => {
          if (
            activity.type === 'SEQUENTIAL_IMAGE_ANALYSIS' &&
            activity.image_prompts?.length
          ) {
            try {
              this.logger.log(
                `Generating ${activity.image_prompts.length} images for guide ${guideId}`,
              );
              const generated_images =
                await this.imageGeneratorService.generateImages(
                  activity.image_prompts,
                );
              return { ...activity, generated_images };
            } catch (imgError) {
              this.logger.error(
                `Image generation failed for guide ${guideId}, using placeholders`,
                imgError,
              );
              return { ...activity, generated_images: [] };
            }
          }
          return activity;
        }),
      );

      const parsedWithImages = { ...parsed, activities: activitiesWithImages };
      const globalScore = parsedWithImages.activities.reduce(
        (sum, a) => sum + a.score,
        0,
      );

      await this.workGuideRepository.updateStatus(
        guideId,
        'COMPLETED',
        parsedWithImages,
        globalScore,
      );

      this.eventPublisher.publishGuideUpdated(guideId, {
        status: 'COMPLETED',
        data: parsedWithImages,
      });
      this.logger.log(`Work guide ${guideId} completed successfully`);
    } catch (error) {
      this.logger.error(`Failed to generate work guide ${guideId}:`, error);

      await this.workGuideRepository.updateStatus(
        guideId,
        'FAILED',
        undefined,
        undefined,
        error instanceof Error ? error.message : 'Unknown error',
      );

      this.eventPublisher.publishGuideUpdated(guideId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
