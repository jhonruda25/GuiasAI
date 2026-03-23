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
      language === 'en' ? 'ENGLISH (Inglés)' : 'SPANISH (Español)';

    const activityInstruction =
      activities && activities.length > 0
        ? `\nREGLA CRÍTICA ESTRICTA SOBRE ACTIVIDADES:\n¡DEBES GENERAR ÚNICA Y EXACTAMENTE ESTOS ${activities.length} TIPOS DE ACTIVIDADES EN ESTE MISMO ORDEN!\n${activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n¡NO GENERES NINGUNA ACTIVIDAD QUE NO ESTÉ EN ESTA LISTA! ¡NO REPITAS TIPO DE ACTIVIDAD SALVO QUE ESTÉ EN LA LISTA!`
        : `4. Entre 3 y 6 actividades pedagógicas DIFERENTES (crucigramas, sopas de letras, completar oraciones, relacionar conceptos, etc.)`;

    return {
      schema: WorkGuideSchema,
      prompt: `Genera una guía pedagógica estructurada para estudiantes de ${targetAudience} sobre el tema: ${topic}. 
      
REQUISITO CRÍTICO DE IDIOMA:
TODO el contenido pedagógico DEBE generarse en: ${languageName}.
Esto incluye: el título, las instrucciones de TODAS las actividades, las pistas, los conceptos, las oraciones para completar, las preguntas y la rúbrica de evaluación.
      
La guía debe incluir:
1. Un tema central claro (en ${languageName})
2. Público objetivo
3. Un puntaje global
4. Un "theme" (Tema visual) que conste de un color primario (vibrante) y un único emoji representativo a utilizarse en interfaces.
${activityInstruction}
6. Una rúbrica global de evaluación (en ${languageName})

REGLAS OBLIGATORIAS POR TIPO DE ACTIVIDAD (Se ignorarán si la actividad explícitamente pide "EXACTAMENTE X ÍTEMS" en su descripción):
- WORD_SEARCH: SIEMPRE incluye MÍNIMO 4 palabras en "items" (adapta la dificultad al nivel, pero siempre 4+)
- CROSSWORD: SIEMPRE incluye MÍNIMO 4 palabras en "items"
- FILL_BLANKS: SIEMPRE incluye MÍNIMO 3 oraciones en "sentences"
- MATCH_CONCEPTS: SIEMPRE incluye MÍNIMO 3 pares en "pairs"
- MULTIPLE_CHOICE: SIEMPRE incluye MÍNIMO 4 preguntas en "questions", cada una con 4 opciones.
- TRUE_FALSE: SIEMPRE incluye MÍNIMO 4 afirmaciones en "statements", balanceando Verdaderas y Falsas.
- WORD_SCRAMBLE: SIEMPRE incluye MÍNIMO 5 palabras con sus pistas en "words".

REGLA ABSOLUTA DE CANTIDADES:
Si una de las actividades listadas arriba exige una cantidad exacta de ítems entre paréntesis (e.g. "DEBES GENERAR EXACTAMENTE 10 ÍTEMS PARA ESTA ACTIVIDAD"), DEBES ANULAR LOS MÍNIMOS Y GENERAR EXACTAMENTE ESA CANTIDAD DE ÍTEMS para ese tipo de actividad en específico.

Para Crucigramas y Sopas de Letras:
- Proporciona la lista de palabras y pistas/definiciones (no generes la matriz, eso lo hará el backend)
- Palabras en MAYÚSCULAS, cortas y apropiadas para ${targetAudience}
- Las palabras y pistas deben estar estrictamente en ${languageName}

Para Relacionar Conceptos:
- Proporciona pares de concepto-definición apropiados para ${targetAudience} (en ${languageName})

Para Completar Oraciones:
- Proporciona las oraciones completas con la palabra oculta entre corchetes, ej: "El [Sol] es amarillo." (en ${languageName})

Para Actividades de Imagen Secuencial:
- Proporciona prompts en INGLÉS para generar las imágenes, descriptivos y apropiados para ${targetAudience}

Genera contenido pedagógico de alta calidad apropiado para ${targetAudience}. Adapta el vocabulario y complejidad al nivel, pero SIEMPRE respeta los mínimos de items indicados.`,
      system: `Eres un experto en pedagogía y diseño de materiales educativos bilingües. Genera guías de trabajo completas, variadas y pedagógicamente sólidas en el idioma solicitado (${languageName}).`,
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

    // Try primary model
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
      throw primaryError;
    }
  }
}
