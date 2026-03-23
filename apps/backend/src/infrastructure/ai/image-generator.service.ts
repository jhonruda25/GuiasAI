import { Injectable, Logger } from '@nestjs/common';
import { generateImage } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

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
export class ImageGeneratorService {
  private readonly logger = new Logger(ImageGeneratorService.name);
  private readonly googleProvider;
  private readonly primaryImageModel: string;
  private readonly fallbackImageModel: string;

  constructor() {
    this.primaryImageModel =
      process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image-preview';
    this.fallbackImageModel =
      process.env.GEMINI_IMAGE_FALLBACK_MODEL || 'gemini-2.5-flash-image';
    this.googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    this.logger.log(
      `Primary image model: ${this.primaryImageModel}, Fallback: ${this.fallbackImageModel}`,
    );
  }

  private isHighDemandError(error: unknown): boolean {
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

  async generateImage(prompt: string): Promise<string> {
    this.logger.log(
      `Generating image with prompt: ${prompt.substring(0, 50)}...`,
    );

    // Try primary image model
    try {
      this.logger.log(
        `Attempting image with primary model: ${this.primaryImageModel}`,
      );
      const { image } = await generateImage({
        model: this.googleProvider.image(this.primaryImageModel),
        prompt,
        aspectRatio: '3:4',
      });
      return `data:image/png;base64,${image.base64}`;
    } catch (primaryError: unknown) {
      if (this.isHighDemandError(primaryError)) {
        this.logger.warn(
          `Primary image model ${this.primaryImageModel} is unavailable (503). Switching to fallback: ${this.fallbackImageModel}`,
        );
        const { image } = await generateImage({
          model: this.googleProvider.image(this.fallbackImageModel),
          prompt,
          aspectRatio: '3:4',
        });
        return `data:image/png;base64,${image.base64}`;
      }
      throw primaryError;
    }
  }

  async generateImages(prompts: string[]): Promise<string[]> {
    const results = await Promise.all(
      prompts.map((prompt) => this.generateImage(prompt)),
    );
    return results;
  }
}
