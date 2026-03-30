import { Injectable, Logger } from '@nestjs/common';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { IAiGeneratorService } from '../../core/domain/ports';
import {
  resolveGenerationActivityTypes,
  type SupportedGenerationActivityType,
} from '../../core/domain/work-guide-generation';
import {
  ActivityContentSchemaByType,
  RubricGenerationSchema,
  ThemeSchema,
  buildFinalWorkGuide,
  parseStageResponse,
  type GeneratedActivityContent,
  WorkGuideGenerationStageError,
} from './work-guide-generation.pipeline';
import { z } from 'zod';

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

interface StageConfig<T> {
  stage: 'theme' | 'activity' | 'rubric';
  schema: z.ZodType<T>;
  prompt: string;
  system: string;
  activityType?: SupportedGenerationActivityType;
  activityTypes?: SupportedGenerationActivityType[];
}

@Injectable()
export class VercelAiGeneratorService implements IAiGeneratorService {
  private readonly logger = new Logger(VercelAiGeneratorService.name);
  private readonly googleProvider;
  private readonly primaryModel: string;
  private readonly fallbackModel: string;
  private readonly googleProviderOptions = {
    google: {
      structuredOutputs: false,
    },
  } as const;

  constructor() {
    this.primaryModel = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
    this.fallbackModel =
      process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash';
    this.googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    this.logger.log(
      `Primary model: ${this.primaryModel}, Fallback model: ${this.fallbackModel}`,
    );
  }

  async generateWorkGuide(
    topic: string,
    targetAudience: string,
    language: string,
    activities?: string[],
  ): Promise<unknown> {
    const resolvedActivities = resolveGenerationActivityTypes(activities);
    this.logger.log(
      `Generating work guide for topic: ${topic}, audience: ${targetAudience}, language: ${language}, activities: ${resolvedActivities.join(', ')}`,
    );

    const theme = await this.executeStage<z.infer<typeof ThemeSchema>>({
      stage: 'theme',
      schema: ThemeSchema,
      system: this.buildBaseSystemPrompt(language),
      prompt: this.buildThemePrompt(topic, targetAudience, language),
    });

    const generatedActivities: GeneratedActivityContent[] = [];
    for (const activityType of resolvedActivities) {
      generatedActivities.push(
        await this.executeStage<GeneratedActivityContent>({
          stage: 'activity',
          schema: ActivityContentSchemaByType[activityType],
          activityType,
          system: this.buildBaseSystemPrompt(language),
          prompt: this.buildActivityPrompt(
            topic,
            targetAudience,
            language,
            activityType,
          ),
        }),
      );
    }

    const rubric = await this.executeStage<z.infer<typeof RubricGenerationSchema>>({
      stage: 'rubric',
      schema: RubricGenerationSchema,
      activityTypes: resolvedActivities,
      system: this.buildBaseSystemPrompt(language),
      prompt: this.buildRubricPrompt(
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

  private buildBaseSystemPrompt(language: string): string {
    return `Eres un experto en pedagogia y materiales educativos. Devuelves exclusivamente JSON valido, sin markdown ni texto adicional. Todo el contenido debe estar en ${this.getLanguageName(language)}.`;
  }

  private getLanguageName(language: string): string {
    return language === 'en' ? 'ENGLISH' : 'SPANISH';
  }

  private buildThemePrompt(
    topic: string,
    targetAudience: string,
    language: string,
  ): string {
    return `Genera SOLO un objeto JSON para la apariencia de una guia pedagogica sobre "${topic}" para ${targetAudience}.

Idioma obligatorio: ${this.getLanguageName(language)}.

Shape exacto requerido:
{
  "primary_color": "#RRGGBB",
  "icon_emoji": "🌿"
}

Reglas:
- Unicamente esas 2 claves.
- "primary_color" debe ser un color vibrante y apropiado para el tema.
- "icon_emoji" debe ser un solo emoji.
- No uses "theme".
- No uses "emoji".
- No incluyas explicaciones.`;
  }

  private buildActivityPrompt(
    topic: string,
    targetAudience: string,
    language: string,
    activityType: SupportedGenerationActivityType,
  ): string {
    const rulesByActivity: Record<SupportedGenerationActivityType, string> = {
      WORD_SEARCH: `Shape exacto:
{
  "type": "WORD_SEARCH",
  "instructions": "texto",
  "items": [
    { "word": "PALABRA", "clue_or_definition": "pista o definicion" }
  ]
}
Reglas:
- Genera exactamente entre 4 y 8 items.
- Todas las palabras en MAYUSCULAS.
- Sin "score", "title", "topic" ni otras claves.`,
      CROSSWORD: `Shape exacto:
{
  "type": "CROSSWORD",
  "instructions": "texto",
  "items": [
    { "word": "PALABRA", "clue_or_definition": "pista o definicion" }
  ]
}
Reglas:
- Genera exactamente entre 4 y 8 items.
- Todas las palabras en MAYUSCULAS.
- Sin "score", "title", "topic" ni otras claves.`,
      FILL_BLANKS: `Shape exacto:
{
  "type": "FILL_BLANKS",
  "instructions": "texto",
  "sentences": [
    { "full_sentence": "Texto con [palabra]", "hidden_word": "palabra" }
  ]
}
Reglas:
- Genera exactamente entre 3 y 6 oraciones.
- Cada "full_sentence" debe contener la palabra oculta entre corchetes.
- "hidden_word" debe coincidir exactamente con la palabra entre corchetes.
- Sin "score", "title", "topic" ni otras claves.`,
      MATCH_CONCEPTS: `Shape exacto:
{
  "type": "MATCH_CONCEPTS",
  "instructions": "texto",
  "pairs": [
    { "concept": "concepto", "definition": "definicion" }
  ]
}
Reglas:
- Genera exactamente entre 3 y 6 pares.
- Sin "score", "title", "topic" ni otras claves.`,
      MULTIPLE_CHOICE: `Shape exacto:
{
  "type": "MULTIPLE_CHOICE",
  "instructions": "texto",
  "questions": [
    {
      "question": "pregunta",
      "options": ["a", "b", "c", "d"],
      "correct_answer": "a"
    }
  ]
}
Reglas:
- Genera exactamente 4 preguntas.
- Cada pregunta debe tener exactamente 4 opciones.
- "correct_answer" debe coincidir exactamente con una opcion.
- Sin "score", "title", "topic" ni otras claves.`,
      TRUE_FALSE: `Shape exacto:
{
  "type": "TRUE_FALSE",
  "instructions": "texto",
  "statements": [
    { "statement": "afirmacion", "is_true": true }
  ]
}
Reglas:
- Genera exactamente 4 afirmaciones.
- Debe haber al menos 1 verdadera y 1 falsa.
- Sin "score", "title", "topic" ni otras claves.`,
      WORD_SCRAMBLE: `Shape exacto:
{
  "type": "WORD_SCRAMBLE",
  "instructions": "texto",
  "words": [
    { "word": "PALABRA", "hint": "pista" }
  ]
}
Reglas:
- Genera exactamente 5 palabras.
- Todas las palabras en MAYUSCULAS.
- No uses "scrambled".
- Sin "score", "title", "topic" ni otras claves.`,
    };

    return `Genera SOLO un objeto JSON para una actividad pedagogica sobre "${topic}" para ${targetAudience}.

Idioma obligatorio: ${this.getLanguageName(language)}.
Tipo obligatorio: ${activityType}

${rulesByActivity[activityType]}

No cambies el valor de "type".
No devuelvas un arreglo.
No incluyas markdown ni explicaciones.`;
  }

  private buildRubricPrompt(
    topic: string,
    targetAudience: string,
    language: string,
    activities: GeneratedActivityContent[],
  ): string {
    const activitySummary = activities
      .map(
        (activity, index) =>
          `${index + 1}. ${activity.type}: ${activity.instructions}`,
      )
      .join('\n');

    return `Genera SOLO un objeto JSON con la rubrica global de una guia pedagogica sobre "${topic}" para ${targetAudience}.

Idioma obligatorio: ${this.getLanguageName(language)}.

Debes generar exactamente un criterio por cada actividad y en este mismo orden:
${activitySummary}

Shape exacto:
{
  "global_description": "texto",
  "criteria": [
    {
      "activity_type": "WORD_SEARCH",
      "criteria_description": "texto",
      "levels": {
        "excellent": "texto",
        "good": "texto",
        "needs_improvement": "texto"
      }
    }
  ]
}

Reglas:
- Usa exactamente los mismos activity_type de las actividades suministradas.
- No uses "rubric".
- No uses "evaluation_rubric".
- No uses "criterion" ni "criteria" como texto libre en lugar de "criteria_description".
- Los tres textos de "levels" son obligatorios y no pueden ser vacios.
- Esta prohibido devolver "", " ", null o campos omitidos dentro de "levels".
- Si no sabes redactar un nivel perfecto, escribe una frase breve pero no vacia.
- No devuelvas un arreglo en la raiz.
- No incluyas markdown ni explicaciones.`;
  }

  private async executeStage<T>(config: StageConfig<T>): Promise<T> {
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

  private describeStage(config: StageConfig<unknown>): string {
    if (config.stage !== 'activity') {
      return config.stage;
    }

    return `${config.stage}:${config.activityType ?? 'UNKNOWN'}`;
  }

  private logStageFailure(
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
}
