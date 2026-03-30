import { Injectable, Logger } from '@nestjs/common';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { IAiGeneratorService } from '../../core/domain/ports';
import { WorkGuideSchema } from '@repo/schemas';

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

interface AiObjectGenerationError {
  text?: string;
  cause?: {
    text?: string;
  };
}

@Injectable()
export class VercelAiGeneratorService implements IAiGeneratorService {
  private readonly logger = new Logger(VercelAiGeneratorService.name);
  private readonly googleProvider;
  private readonly primaryModel: string;
  private readonly fallbackModel: string;

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

  private buildPromptConfig(
    topic: string,
    targetAudience: string,
    language: string,
    activities?: string[],
  ) {
    const languageName =
      language === 'en' ? 'ENGLISH (Ingles)' : 'SPANISH (Espanol)';

    const activityInstruction =
      activities && activities.length > 0
        ? `\nREGLA CRITICA ESTRICTA SOBRE ACTIVIDADES:\nDebes generar unica y exactamente estos ${activities.length} tipos de actividades en este mismo orden:\n${activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}\nNo generes ninguna actividad que no este en esta lista y no repitas tipos fuera de la lista.`
        : '4. Entre 3 y 6 actividades pedagogicas diferentes (crucigramas, sopas de letras, completar oraciones, relacionar conceptos, etc.)';

    return {
      schema: WorkGuideSchema,
      prompt: `Genera una guia pedagogica estructurada para estudiantes de ${targetAudience} sobre el tema: ${topic}.

REQUISITO CRITICO DE IDIOMA:
Todo el contenido pedagogico debe generarse en: ${languageName}.
Esto incluye el titulo, las instrucciones, las pistas, los conceptos, las oraciones para completar, las preguntas y la rubrica de evaluacion.

La guia debe incluir:
1. Un tema central claro (en ${languageName})
2. Publico objetivo
3. Un puntaje global
4. Un "theme" que conste de un color primario vibrante y un unico emoji representativo
${activityInstruction}
6. Una rubrica global de evaluacion (en ${languageName})

REGLAS OBLIGATORIAS POR TIPO DE ACTIVIDAD:
- WORD_SEARCH: minimo 4 palabras en "items"
- CROSSWORD: minimo 4 palabras en "items"
- FILL_BLANKS: minimo 3 oraciones en "sentences"
- MATCH_CONCEPTS: minimo 3 pares en "pairs"
- MULTIPLE_CHOICE: minimo 4 preguntas en "questions", cada una con 4 opciones
- TRUE_FALSE: minimo 4 afirmaciones en "statements", balanceando Verdaderas y Falsas
- WORD_SCRAMBLE: minimo 5 palabras en "words"

REGLA ABSOLUTA DE ESTRUCTURA JSON:
- Cada actividad debe usar la clave "type", nunca "activity_type".
- Cada actividad debe usar la clave "instructions", nunca "instruction".
- Cada actividad debe usar la clave "score", nunca "score_per_item".
- Para TRUE_FALSE, "statements" debe ser un arreglo de objetos con esta forma exacta:
  [{ "statement": "texto", "is_true": true }]
- No generes un arreglo separado llamado "answers".

Para crucigramas y sopas de letras:
- Proporciona la lista de palabras y pistas/definiciones
- Palabras en mayusculas, cortas y apropiadas para ${targetAudience}
- Las palabras y pistas deben estar estrictamente en ${languageName}

Para relacionar conceptos:
- Proporciona pares de concepto-definicion apropiados para ${targetAudience}

Para completar oraciones:
- Proporciona las oraciones completas con la palabra oculta entre corchetes, ej: "El [Sol] es amarillo."

Para actividades de imagen secuencial:
- Proporciona prompts en ingles para generar las imagenes

Genera contenido pedagogico de alta calidad apropiado para ${targetAudience}.`,
      system:
        `Eres un experto en pedagogia y diseno de materiales educativos bilingues. ` +
        `Genera guias de trabajo completas, variadas y pedagogicamente solidas en el idioma solicitado (${languageName}).`,
    };
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

  private tryRecoverValidationError(error: unknown): unknown {
    const candidateText =
      (error as AiObjectGenerationError)?.text ??
      (error as AiObjectGenerationError)?.cause?.text;

    if (!candidateText) {
      throw error;
    }

    try {
      const parsedText = JSON.parse(candidateText);
      const normalized = this.normalizeLegacyGuideShape(parsedText);
      return WorkGuideSchema.parse(normalized);
    } catch {
      throw error;
    }
  }

  private normalizeLegacyGuideShape(payload: unknown): unknown {
    if (!payload || typeof payload !== 'object') {
      return payload;
    }

    const guide = payload as Record<string, unknown>;
    const normalizedActivities = Array.isArray(guide.activities)
      ? guide.activities.map((activity) =>
          this.normalizeLegacyActivityShape(activity),
        )
      : guide.activities;

    return {
      ...guide,
      activities: normalizedActivities,
    };
  }

  private normalizeLegacyActivityShape(activity: unknown): unknown {
    if (!activity || typeof activity !== 'object') {
      return activity;
    }

    const raw = activity as Record<string, unknown>;
    const normalizedType =
      typeof raw.type === 'string'
        ? raw.type
        : typeof raw.activity_type === 'string'
          ? raw.activity_type
          : raw.type;

    const normalizedInstructions =
      typeof raw.instructions === 'string'
        ? raw.instructions
        : typeof raw.instruction === 'string'
          ? raw.instruction
          : raw.instructions;

    let normalizedStatements = raw.statements;

    if (
      normalizedType === 'TRUE_FALSE' &&
      Array.isArray(raw.statements) &&
      Array.isArray(raw.answers)
    ) {
      const statements = raw.statements as unknown[];
      const answers = raw.answers as unknown[];

      normalizedStatements = statements
        .map((statement, index) => {
          const answer = answers[index];
          if (typeof statement !== 'string' || typeof answer !== 'boolean') {
            return null;
          }

          return {
            statement,
            is_true: answer,
          };
        })
        .filter(Boolean);
    }

    const normalizedScore =
      typeof raw.score === 'number'
        ? raw.score
        : typeof raw.score_per_item === 'number' && Array.isArray(raw.statements)
          ? raw.score_per_item * raw.statements.length
          : raw.score;

    return {
      ...raw,
      type: normalizedType,
      instructions: normalizedInstructions,
      score: normalizedScore,
      statements: normalizedStatements,
    };
  }

  async generateWorkGuide(
    topic: string,
    targetAudience: string,
    language: string,
    activities?: string[],
  ): Promise<unknown> {
    this.logger.log(
      `Generating work guide for topic: ${topic}, audience: ${targetAudience}, language: ${language}`,
    );

    const promptConfig = this.buildPromptConfig(
      topic,
      targetAudience,
      language,
      activities,
    );

    try {
      this.logger.log(`Attempting with primary model: ${this.primaryModel}`);
      const { object } = await generateObject({
        model: this.googleProvider(this.primaryModel),
        ...promptConfig,
      });
      return object;
    } catch (primaryError: unknown) {
      if (this.isHighDemandError(primaryError)) {
        this.logger.warn(
          `Primary model ${this.primaryModel} is unavailable (503 high demand). Switching to fallback: ${this.fallbackModel}`,
        );
        const { object } = await generateObject({
          model: this.googleProvider(this.fallbackModel),
          ...promptConfig,
        });
        return object;
      }

      this.logger.warn(
        'Primary generation failed schema validation, attempting to recover legacy JSON shape',
      );
      return this.tryRecoverValidationError(primaryError);
    }
  }
}
