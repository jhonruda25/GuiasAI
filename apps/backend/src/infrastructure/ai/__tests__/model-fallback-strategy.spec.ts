import { ModelFallbackStrategy, type StageConfig } from '../model-fallback-strategy';
import { z } from 'zod';
import { WorkGuideGenerationStageError } from '../work-guide-generation.pipeline';

jest.mock('ai', () => ({
  generateText: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { generateText } = require('ai') as { generateText: jest.Mock };

describe('ModelFallbackStrategy', () => {
  let strategy: ModelFallbackStrategy;
  const mockGoogleProvider = jest.fn();
  const primaryModel = 'gemini-3-flash-preview';
  const fallbackModel = 'gemini-2.5-flash';

  const mockStageConfig: StageConfig<{ value: string }> = {
    stage: 'theme',
    schema: z.object({ value: z.string() }),
    prompt: 'test prompt',
    system: 'test system',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGoogleProvider.mockReturnValue({} as any);
    strategy = new ModelFallbackStrategy(
      mockGoogleProvider,
      primaryModel,
      fallbackModel,
    );
  });

  describe('isHighDemandError', () => {
    it('returns true for statusCode 503', () => {
      expect(strategy.isHighDemandError({ statusCode: 503 })).toBe(true);
    });

    it('returns true for status 503', () => {
      expect(strategy.isHighDemandError({ status: 503 })).toBe(true);
    });

    it('returns true for message containing "high demand"', () => {
      expect(strategy.isHighDemandError({ message: 'Service is under high demand' })).toBe(true);
    });

    it('returns true for lastError.statusCode 503', () => {
      expect(strategy.isHighDemandError({ lastError: { statusCode: 503 } })).toBe(true);
    });

    it('returns true when errors array contains statusCode 503', () => {
      expect(strategy.isHighDemandError({ errors: [{ statusCode: 503 }] })).toBe(true);
    });

    it('returns false for non-503 errors', () => {
      expect(strategy.isHighDemandError({ statusCode: 500 })).toBe(false);
    });

    it('returns false for generic errors without 503 indicators', () => {
      expect(strategy.isHighDemandError({ message: 'Network error' })).toBe(false);
    });

    it('returns false for null error', () => {
      expect(strategy.isHighDemandError(null)).toBe(false);
    });
  });

  describe('describeStage', () => {
    it('returns stage name for non-activity stages', () => {
      expect(strategy.describeStage({ ...mockStageConfig, stage: 'theme' })).toBe('theme');
      expect(strategy.describeStage({ ...mockStageConfig, stage: 'rubric' })).toBe('rubric');
    });

    it('returns stage:activityType for activity stages', () => {
      expect(
        strategy.describeStage({
          ...mockStageConfig,
          stage: 'activity',
          activityType: 'WORD_SEARCH',
        }),
      ).toBe('activity:WORD_SEARCH');
    });

    it('returns activity:UNKNOWN when activityType is missing', () => {
      expect(
        strategy.describeStage({
          ...mockStageConfig,
          stage: 'activity',
        }),
      ).toBe('activity:UNKNOWN');
    });
  });

  describe('executeStage', () => {
    it('succeeds on primary model and returns parsed result', async () => {
      generateText.mockResolvedValue({ text: JSON.stringify({ value: 'test' }) });

      const result = await strategy.executeStage(mockStageConfig);

      expect(result).toEqual({ value: 'test' });
      expect(mockGoogleProvider).toHaveBeenCalledWith(primaryModel);
      expect(generateText).toHaveBeenCalledTimes(1);
    });

    it('falls back to fallback model when primary fails with 503', async () => {
      generateText
        .mockRejectedValueOnce({ statusCode: 503, message: 'high demand' })
        .mockResolvedValueOnce({ text: JSON.stringify({ value: 'fallback' }) });

      const result = await strategy.executeStage(mockStageConfig);

      expect(result).toEqual({ value: 'fallback' });
      expect(mockGoogleProvider).toHaveBeenNthCalledWith(1, primaryModel);
      expect(mockGoogleProvider).toHaveBeenNthCalledWith(2, fallbackModel);
      expect(generateText).toHaveBeenCalledTimes(2);
    });

    it('falls back to fallback model when primary fails with non-503 error', async () => {
      generateText
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ text: JSON.stringify({ value: 'fallback' }) });

      const result = await strategy.executeStage(mockStageConfig);

      expect(result).toEqual({ value: 'fallback' });
      expect(generateText).toHaveBeenCalledTimes(2);
    });

    it('throws primary error when primary === fallback model', async () => {
      const sameModelStrategy = new ModelFallbackStrategy(
        mockGoogleProvider,
        'same-model',
        'same-model',
      );
      const primaryError = new Error('Primary failed');
      generateText.mockRejectedValue(primaryError);

      await expect(sameModelStrategy.executeStage(mockStageConfig)).rejects.toThrow('Primary failed');
      expect(generateText).toHaveBeenCalledTimes(1);
    });

    it('throws fallback error when both models fail', async () => {
      const fallbackError = new Error('Fallback also failed');
      generateText
        .mockRejectedValueOnce({ statusCode: 503 })
        .mockRejectedValueOnce(fallbackError);

      await expect(strategy.executeStage(mockStageConfig)).rejects.toThrow('Fallback also failed');
      expect(generateText).toHaveBeenCalledTimes(2);
    });

    it('attempts fallback even for WorkGuideGenerationStageError from primary', async () => {
      const stageError = new WorkGuideGenerationStageError('theme', 'schema_validation', {
        model: primaryModel,
        details: 'bad json',
        rawPayloadSnippet: 'not valid json',
      });
      generateText
        .mockResolvedValueOnce({ text: 'not valid json' })
        .mockResolvedValueOnce({ text: JSON.stringify({ value: 'fallback' }) });

      const result = await strategy.executeStage(mockStageConfig);

      expect(result).toEqual({ value: 'fallback' });
      expect(generateText).toHaveBeenCalledTimes(2);
    });
  });

  describe('logStageFailure', () => {
    it('logs WorkGuideGenerationStageError with category', () => {
      const warnSpy = jest.spyOn(strategy['logger'], 'warn');
      const stageError = new WorkGuideGenerationStageError('theme', 'json_parse', {
        model: primaryModel,
        details: 'bad json',
      });

      strategy.logStageFailure(stageError, mockStageConfig, primaryModel, 'warn');

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[json_parse]'),
      );
    });

    it('logs generic error with message', () => {
      const errorSpy = jest.spyOn(strategy['logger'], 'error');

      strategy.logStageFailure(
        new Error('Network timeout'),
        mockStageConfig,
        primaryModel,
        'error',
      );

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Network timeout'),
      );
    });
  });
});
