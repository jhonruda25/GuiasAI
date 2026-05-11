import { Injectable, Logger } from '@nestjs/common';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { IAiGeneratorService } from '../../core/domain/ports';
import {
  resolveGenerationActivityRequests,
} from '../../core/domain/work-guide-generation';
import {
  ActivityContentSchemaByType,
  RubricGenerationSchema,
  ThemeSchema,
  buildFinalWorkGuide,
  type GeneratedActivityContent,
} from './work-guide-generation.pipeline';
import { z } from 'zod';
import { WorkGuidePromptBuilder } from './work-guide-prompt-builder';
import { ModelFallbackStrategy } from './model-fallback-strategy';

@Injectable()
export class VercelAiGeneratorService implements IAiGeneratorService {
  private readonly logger = new Logger(VercelAiGeneratorService.name);

  constructor(
    private readonly promptBuilder: WorkGuidePromptBuilder,
    private readonly fallbackStrategy: ModelFallbackStrategy,
  ) {
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
    const fallbackModel =
      process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash';
    const googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    // Re-bind the fallback strategy with the google provider and models.
    // Since NestJS doesn't support constructor parameter factories easily,
    // we pass these via the strategy's constructor in the module.
    // This constructor is only used when the service is instantiated directly
    // (e.g., in tests). The module provides a properly configured instance.
    this.logger.log(
      `Primary model: ${primaryModel}, Fallback model: ${fallbackModel}`,
    );
  }

  async generateWorkGuide(
    topic: string,
    targetAudience: string,
    language: string,
    activities?: string[],
  ): Promise<unknown> {
    const resolvedActivities = resolveGenerationActivityRequests(activities);
    this.logger.log(
      `Generating work guide for topic: ${topic}, audience: ${targetAudience}, language: ${language}, activities: ${resolvedActivities
        .map((activity) =>
          activity.requestedItemsCount
            ? `${activity.type}(${activity.requestedItemsCount})`
            : activity.type,
        )
        .join(', ')}`,
    );

    const theme = await this.fallbackStrategy.executeStage({
      stage: 'theme',
      schema: ThemeSchema,
      system: this.promptBuilder.buildBaseSystemPrompt(language),
      prompt: this.promptBuilder.buildThemePrompt(topic, targetAudience, language),
    });

    const generatedActivities: GeneratedActivityContent[] = [];
    for (const activity of resolvedActivities) {
      const requestedItemsCount = this.promptBuilder.normalizeRequestedItemsCount(activity);

      generatedActivities.push(
        await this.fallbackStrategy.executeStage<GeneratedActivityContent>({
          stage: 'activity',
          schema: ActivityContentSchemaByType[activity.type] as z.ZodType<GeneratedActivityContent>,
          activityType: activity.type,
          system: this.promptBuilder.buildBaseSystemPrompt(language),
          prompt: this.promptBuilder.buildActivityPrompt(
            topic,
            targetAudience,
            language,
            activity.type,
            requestedItemsCount,
          ),
        }),
      );
    }

    const rubric = await this.fallbackStrategy.executeStage({
      stage: 'rubric',
      schema: RubricGenerationSchema,
      activityTypes: resolvedActivities.map((activity) => activity.type),
      system: this.promptBuilder.buildBaseSystemPrompt(language),
      prompt: this.promptBuilder.buildRubricPrompt(
        topic,
        targetAudience,
        language,
        generatedActivities,
      ),
    });

    return buildFinalWorkGuide({
      topic,
      targetAudience,
      theme,
      activities: generatedActivities,
      rubric,
    });
  }
}
