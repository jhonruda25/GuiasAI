import { Injectable, Logger } from '@nestjs/common';
import { generateText, type LanguageModel } from 'ai';
import { z } from 'zod';
import {
  parseStageResponse,
  WorkGuideGenerationStageError,
} from './work-guide-generation.pipeline';
import type { SupportedGenerationActivityType } from '../../core/domain/work-guide-generation';

export interface StageConfig<T> {
  stage: 'theme' | 'activity' | 'rubric';
  schema: z.ZodType<T>;
  prompt: string;
  system: string;
  activityType?: SupportedGenerationActivityType;
  activityTypes?: SupportedGenerationActivityType[];
}

interface HighDemandError {
  statusCode?: number;
  status?: number;
  message?: string;
  lastError?: {
    statusCode?: number;
  };
  errors?: Array<{
    statusCode?: number;
  }>;
}

@Injectable()
export class ModelFallbackStrategy {
  private readonly logger = new Logger(ModelFallbackStrategy.name);
  private readonly googleProviderOptions = {
    google: {
      structuredOutputs: false,
    },
  } as const;

  constructor(
    private readonly googleProvider: (modelName: string) => LanguageModel,
    private readonly primaryModel: string,
    private readonly fallbackModel: string,
  ) {}

  async executeStage<T>(config: StageConfig<T>): Promise<T> {
    const stageLabel = this.describeStage(config);
    this.logger.log(
      `Starting stage ${stageLabel} with primary model ${this.primaryModel}`,
    );

    try {
      return await this.generateStageWithModel(config, this.primaryModel);
    } catch (primaryError) {
      this.logStageFailure(primaryError, config, this.primaryModel, 'warn');

      if (this.primaryModel === this.fallbackModel) {
        throw primaryError;
      }

      const fallbackReason = this.isHighDemandError(primaryError)
        ? `Primary model ${this.primaryModel} unavailable for stage ${stageLabel}; retrying with fallback ${this.fallbackModel}`
        : `Primary model ${this.primaryModel} failed at stage ${stageLabel}; retrying with fallback ${this.fallbackModel}`;
      this.logger.warn(fallbackReason);

      try {
        return await this.generateStageWithModel(config, this.fallbackModel);
      } catch (fallbackError) {
        this.logStageFailure(fallbackError, config, this.fallbackModel, 'error');
        throw fallbackError;
      }
    }
  }

  private async generateStageWithModel<T>(
    config: StageConfig<T>,
    modelName: string,
  ): Promise<T> {
    const start = Date.now();

    try {
      const result = await generateText({
        model: this.googleProvider(modelName),
        providerOptions: this.googleProviderOptions,
        system: config.system,
        prompt: config.prompt,
      });

      const parsed = await parseStageResponse({
        stage: config.stage,
        text: result.text,
        schema: config.schema,
        activityType: config.activityType,
        activityTypes: config.activityTypes,
        model: modelName,
      });

      this.logger.log(
        `Completed stage ${this.describeStage(config)} with model ${modelName} in ${Date.now() - start}ms`,
      );

      return parsed;
    } catch (error) {
      if (error instanceof WorkGuideGenerationStageError) {
        throw error;
      }

      throw new WorkGuideGenerationStageError(config.stage, 'generation', {
        activityType: config.activityType,
        model: modelName,
        details: error instanceof Error ? error.message : 'Unknown generation error',
        cause: error,
      });
    }
  }

  describeStage(config: StageConfig<unknown>): string {
    if (config.stage !== 'activity') {
      return config.stage;
    }

    return `${config.stage}:${config.activityType ?? 'UNKNOWN'}`;
  }

  logStageFailure(
    error: unknown,
    config: StageConfig<unknown>,
    modelName: string,
    level: 'warn' | 'error',
  ) {
    const log = level === 'warn' ? this.logger.warn.bind(this.logger) : this.logger.error.bind(this.logger);

    if (error instanceof WorkGuideGenerationStageError) {
      log(
        `Stage ${this.describeStage(config)} failed with model ${modelName} [${error.category}] ${error.message}${
          error.options.rawPayloadSnippet
            ? ` | payload=${error.options.rawPayloadSnippet}`
            : ''
        }`,
      );
      return;
    }

    log(
      `Stage ${this.describeStage(config)} failed with model ${modelName}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }

  isHighDemandError(error: unknown): boolean {
    const err = error as HighDemandError;
    return (
      err?.statusCode === 503 ||
      err?.status === 503 ||
      (typeof err?.message === 'string' &&
        err.message.includes('high demand')) ||
      err?.lastError?.statusCode === 503 ||
      (Array.isArray(err?.errors) &&
        err.errors.some((item) => item?.statusCode === 503))
    );
  }
}
