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

interface PromptConfig {
  schema: typeof WorkGuideSchema;
  prompt: string;
  system: string;
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

  private buildPromptConfig(
    topic: string,
    targetAudience: string,
    language: string,
    activities?: string[],
  ): PromptConfig {
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
- Para WORD_SEARCH y CROSSWORD, "items" debe ser un arreglo de objetos:
  [{ "word": "PALABRA", "clue_or_definition": "pista o definicion" }]
- Para FILL_BLANKS, "sentences" debe ser un arreglo de objetos:
  [{ "full_sentence": "texto con [palabra]", "hidden_word": "palabra" }]
- Para MATCH_CONCEPTS, "pairs" debe ser un arreglo de objetos:
  [{ "concept": "concepto", "definition": "definicion" }]
- Para MULTIPLE_CHOICE, "questions" debe ser un arreglo de objetos:
  [{ "question": "pregunta", "options": ["a", "b", "c", "d"], "correct_answer": "a" }]
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

  private buildRepairPrompt(rawJson: string): string {
    return `Corrige el siguiente JSON para que cumpla exactamente con el esquema esperado de una guia pedagogica.

Reglas estrictas de reparacion:
- Conserva el tema, el publico, el puntaje, la rubrica y el sentido pedagogico.
- Corrige solo la estructura.
- Usa "type", "instructions" y "score".
- WORD_SEARCH/CROSSWORD: convierte strings en objetos { "word", "clue_or_definition" }.
- FILL_BLANKS: convierte strings con [palabra] en objetos { "full_sentence", "hidden_word" }.
- MATCH_CONCEPTS: convierte strings "concepto - definicion" en objetos { "concept", "definition" }.
- MULTIPLE_CHOICE: convierte cada pregunta al shape { "question", "options", "correct_answer" }.
- TRUE_FALSE: convierte cada item al shape { "statement", "is_true" }.
- Devuelve solo JSON valido, sin markdown.

JSON a reparar:
${rawJson}`;
  }

  private async tryRecoverValidationError(
    error: unknown,
    promptConfig: PromptConfig,
  ): Promise<unknown> {
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
      this.logger.warn(
        'Local normalization was insufficient, attempting structured repair pass',
      );

      try {
        const { object } = await generateObject({
          model: this.googleProvider(this.fallbackModel),
          providerOptions: this.googleProviderOptions,
          schema: promptConfig.schema,
          system: promptConfig.system,
          prompt: this.buildRepairPrompt(candidateText),
        });

        return object;
      } catch {
        throw error;
      }
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

    const normalizeConceptItems = (items: unknown) => {
      if (!Array.isArray(items)) {
        return items;
      }

      if (
        items.length % 2 === 0 &&
        items.every((item) => typeof item === 'string')
      ) {
        const pairs: Array<{ word: string; clue_or_definition: string }> = [];
        for (let index = 0; index < items.length; index += 2) {
          pairs.push({
            word: items[index] as string,
            clue_or_definition: items[index + 1] as string,
          });
        }
        return pairs;
      }

      if (
        items.length % 2 === 0 &&
        items.every((item) => typeof item === 'string')
      ) {
        const rawItems = items as string[];
        const looksPrefixed = rawItems.every((item, index) =>
          index % 2 === 0
            ? item.toLowerCase().startsWith('word:')
            : item.toLowerCase().startsWith('clue_or_definition:'),
        );

        if (looksPrefixed) {
          const pairs: Array<{ word: string; clue_or_definition: string }> = [];
          for (let index = 0; index < rawItems.length; index += 2) {
            pairs.push({
              word: rawItems[index].replace(/^word:\s*/i, '').trim(),
              clue_or_definition: rawItems[index + 1]
                .replace(/^clue_or_definition:\s*/i, '')
                .trim(),
            });
          }
          return pairs;
        }
      }

      return items.map((item) => {
        if (typeof item !== 'string') {
          return item;
        }

        return {
          word: item,
          clue_or_definition: `Concepto clave relacionado con ${item}.`,
        };
      });
    };

    const normalizeFillBlanksSentences = (sentences: unknown) => {
      if (!Array.isArray(sentences)) {
        return sentences;
      }

      return sentences.map((sentence) => {
        if (typeof sentence !== 'string') {
          return sentence;
        }

        const match = sentence.match(/\[([^\]]+)\]/);
        return {
          full_sentence: sentence,
          hidden_word: match?.[1] ?? '',
        };
      });
    };

    const normalizePairs = (pairs: unknown) => {
      if (!Array.isArray(pairs)) {
        return pairs;
      }

      if (
        pairs.length % 2 === 0 &&
        pairs.every((item) => typeof item === 'string')
      ) {
        const normalized: Array<{ concept: string; definition: string }> = [];
        for (let index = 0; index < pairs.length; index += 2) {
          normalized.push({
            concept: (pairs[index] as string).trim(),
            definition: (pairs[index + 1] as string).trim(),
          });
        }
        return normalized;
      }

      if (
        pairs.length % 2 === 0 &&
        pairs.every((item) => typeof item === 'string')
      ) {
        const rawPairs = pairs as string[];
        const looksPrefixed = rawPairs.every((item, index) =>
          index % 2 === 0
            ? item.toLowerCase().startsWith('concept:')
            : item.toLowerCase().startsWith('definition:'),
        );

        if (looksPrefixed) {
          const normalized: Array<{ concept: string; definition: string }> = [];
          for (let index = 0; index < rawPairs.length; index += 2) {
            normalized.push({
              concept: rawPairs[index].replace(/^concept:\s*/i, '').trim(),
              definition: rawPairs[index + 1]
                .replace(/^definition:\s*/i, '')
                .trim(),
            });
          }
          return normalized;
        }
      }

      return pairs.map((pair) => {
        if (typeof pair !== 'string') {
          return pair;
        }

        const [concept, ...definitionParts] = pair.split(' - ');
        return {
          concept: concept?.trim() ?? '',
          definition: definitionParts.join(' - ').trim(),
        };
      });
    };

    const normalizeMultipleChoiceQuestions = (questions: unknown) => {
      if (!Array.isArray(questions)) {
        return questions;
      }

      if (
        questions.length % 3 === 0 &&
        questions.every((item) => typeof item === 'string')
      ) {
        const rawQuestions = questions as string[];
        const looksPrefixed = rawQuestions.every((item, index) => {
          const lower = item.toLowerCase();
          if (index % 3 === 0) return lower.startsWith('question:');
          if (index % 3 === 1) return lower.startsWith('options:');
          return lower.startsWith('correct_answer:');
        });

        if (looksPrefixed) {
          const normalized: Array<{
            question: string;
            options: string[];
            correct_answer: string;
          }> = [];

          for (let index = 0; index < rawQuestions.length; index += 3) {
            const question = rawQuestions[index]
              .replace(/^question:\s*/i, '')
              .trim();
            const rawOptions = rawQuestions[index + 1]
              .replace(/^options:\s*/i, '')
              .trim();
            const correctAnswer = rawQuestions[index + 2]
              .replace(/^correct_answer:\s*/i, '')
              .trim();

            let options: string[] = [];

            try {
              const parsed = JSON.parse(rawOptions) as unknown;
              if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
                options = parsed;
              }
            } catch {
              options = rawOptions
                .replace(/^\[/, '')
                .replace(/\]$/, '')
                .split(',')
                .map((item) => item.trim().replace(/^"|"$/g, ''))
                .filter(Boolean);
            }

            normalized.push({
              question,
              options,
              correct_answer: correctAnswer,
            });
          }

          return normalized;
        }
      }

      return questions.map((question) => {
        if (typeof question !== 'string') {
          return question;
        }

        const parts = question.split(' - ').map((item) => item.trim());
        if (parts.length < 6) {
          return question;
        }

        const [questionText, optionA, optionB, optionC, optionD] = parts;
        return {
          question: questionText,
          options: [optionA, optionB, optionC, optionD],
          correct_answer: optionA,
        };
      });
    };

    const normalizeWordScrambleWords = (words: unknown) => {
      if (!Array.isArray(words)) {
        return words;
      }

      return words.map((word) => {
        if (typeof word !== 'string') {
          return word;
        }

        return {
          word,
          hint: `Palabra clave relacionada con ${word}.`,
        };
      });
    };

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

    if (normalizedType === 'TRUE_FALSE' && Array.isArray(raw.statements)) {
      const statements = raw.statements as unknown[];
      if (
        statements.length % 2 === 0 &&
        statements.every(
          (item, index) =>
            (index % 2 === 0 && typeof item === 'string') ||
            (index % 2 === 1 && typeof item === 'boolean'),
        )
      ) {
        normalizedStatements = [];
        for (let index = 0; index < statements.length; index += 2) {
          (normalizedStatements as Array<{ statement: string; is_true: boolean }>).push({
            statement: statements[index] as string,
            is_true: statements[index + 1] as boolean,
          });
        }
      } else if (
        statements.length % 2 === 0 &&
        statements.every((item) => typeof item === 'string')
      ) {
        const rawStatements = statements as string[];
        const looksPrefixed = rawStatements.every((item, index) => {
          const lower = item.toLowerCase();
          if (index % 2 === 0) return lower.startsWith('statement:');
          return lower.startsWith('is_true:');
        });

        if (looksPrefixed) {
          normalizedStatements = [];
          for (let index = 0; index < rawStatements.length; index += 2) {
            const statement = rawStatements[index]
              .replace(/^statement:\s*/i, '')
              .trim();
            const rawValue = rawStatements[index + 1]
              .replace(/^is_true:\s*/i, '')
              .trim()
              .toLowerCase();

            (normalizedStatements as Array<{ statement: string; is_true: boolean }>).push({
              statement,
              is_true: rawValue === 'true',
            });
          }
        } else {
          normalizedStatements = rawStatements.map((statement) => {
            if (typeof statement !== 'string') {
              return statement;
            }

            const match = statement.match(/^(.*)\s+-\s+(true|false)$/i);
            if (!match) {
              return statement;
            }

            return {
              statement: match[1].trim(),
              is_true: match[2].toLowerCase() === 'true',
            };
          });
        }
      } else {
        normalizedStatements = statements.map((statement) => {
          if (typeof statement !== 'string') {
            return statement;
          }

          const match = statement.match(/^(.*)\s+-\s+(true|false)$/i);
          if (!match) {
            return statement;
          }

          return {
            statement: match[1].trim(),
            is_true: match[2].toLowerCase() === 'true',
          };
        });
      }
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
      items:
        normalizedType === 'WORD_SEARCH' || normalizedType === 'CROSSWORD'
          ? normalizeConceptItems(raw.items)
          : raw.items,
      sentences:
        normalizedType === 'FILL_BLANKS'
          ? normalizeFillBlanksSentences(raw.sentences)
          : raw.sentences,
      pairs:
        normalizedType === 'MATCH_CONCEPTS'
          ? normalizePairs(raw.pairs)
          : raw.pairs,
      questions:
        normalizedType === 'MULTIPLE_CHOICE'
          ? normalizeMultipleChoiceQuestions(raw.questions)
          : raw.questions,
      words:
        normalizedType === 'WORD_SCRAMBLE'
          ? normalizeWordScrambleWords(raw.words)
          : raw.words,
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
        providerOptions: this.googleProviderOptions,
        ...promptConfig,
      });
      return object;
    } catch (primaryError: unknown) {
      if (this.isHighDemandError(primaryError)) {
        this.logger.warn(
          `Primary model ${this.primaryModel} is unavailable (503 high demand). Switching to fallback: ${this.fallbackModel}`,
        );
        try {
          const { object } = await generateObject({
            model: this.googleProvider(this.fallbackModel),
            providerOptions: this.googleProviderOptions,
            ...promptConfig,
          });
          return object;
        } catch (fallbackError: unknown) {
          return this.tryRecoverValidationError(fallbackError, promptConfig);
        }
      }

      this.logger.warn(
        'Primary generation failed schema validation, attempting to recover legacy JSON shape',
      );
      return this.tryRecoverValidationError(primaryError, promptConfig);
    }
  }
}
