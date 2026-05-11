import { Injectable, Logger } from '@nestjs/common';
import type {
  ResolvedGenerationActivityRequest,
  SupportedGenerationActivityType,
} from '../../core/domain/work-guide-generation';
import type { GeneratedActivityContent } from './work-guide-generation.pipeline';

@Injectable()
export class WorkGuidePromptBuilder {
  private readonly logger = new Logger(WorkGuidePromptBuilder.name);

  buildBaseSystemPrompt(language: string): string {
    return `Eres un experto en pedagogia y materiales educativos. Devuelves exclusivamente JSON valido, sin markdown ni texto adicional. Todo el contenido debe estar en ${this.getLanguageName(language)}.`;
  }

  getLanguageName(language: string): string {
    return language === 'en' ? 'ENGLISH' : 'SPANISH';
  }

  buildThemePrompt(
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

  buildActivityPrompt(
    topic: string,
    targetAudience: string,
    language: string,
    activityType: SupportedGenerationActivityType,
    requestedItemsCount?: number,
  ): string {
    const itemCountRule = this.buildItemCountRule(
      activityType,
      requestedItemsCount,
    );

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
- ${itemCountRule}
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
- ${itemCountRule}
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
- ${itemCountRule}
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
- ${itemCountRule}
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
- ${itemCountRule}
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
- ${itemCountRule}
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
- ${itemCountRule}
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

  normalizeRequestedItemsCount(
    activity: ResolvedGenerationActivityRequest,
  ): number | undefined {
    if (!activity.requestedItemsCount) {
      return undefined;
    }

    const limitsByType: Record<
      SupportedGenerationActivityType,
      { min: number; max: number }
    > = {
      WORD_SEARCH: { min: 4, max: 15 },
      CROSSWORD: { min: 4, max: 15 },
      FILL_BLANKS: { min: 3, max: 10 },
      MATCH_CONCEPTS: { min: 3, max: 10 },
      MULTIPLE_CHOICE: { min: 4, max: 10 },
      TRUE_FALSE: { min: 4, max: 10 },
      WORD_SCRAMBLE: { min: 5, max: 10 },
    };

    const limits = limitsByType[activity.type];
    const normalized = Math.min(
      limits.max,
      Math.max(limits.min, activity.requestedItemsCount),
    );

    if (normalized !== activity.requestedItemsCount) {
      this.logger.warn(
        `Requested ${activity.requestedItemsCount} items for ${activity.type} is out of supported range ${limits.min}-${limits.max}; clamped to ${normalized}`,
      );
    }

    return normalized;
  }

  buildItemCountRule(
    activityType: SupportedGenerationActivityType,
    requestedItemsCount?: number,
  ): string {
    if (requestedItemsCount) {
      if (activityType === 'FILL_BLANKS') {
        return `Genera exactamente ${requestedItemsCount} oraciones.`;
      }
      if (activityType === 'MATCH_CONCEPTS') {
        return `Genera exactamente ${requestedItemsCount} pares.`;
      }
      if (activityType === 'MULTIPLE_CHOICE') {
        return `Genera exactamente ${requestedItemsCount} preguntas.`;
      }
      if (activityType === 'TRUE_FALSE') {
        return `Genera exactamente ${requestedItemsCount} afirmaciones.`;
      }
      if (activityType === 'WORD_SCRAMBLE') {
        return `Genera exactamente ${requestedItemsCount} palabras.`;
      }
      return `Genera exactamente ${requestedItemsCount} items.`;
    }

    const defaultRules: Record<SupportedGenerationActivityType, string> = {
      WORD_SEARCH: 'Genera exactamente entre 4 y 8 items.',
      CROSSWORD: 'Genera exactamente entre 4 y 8 items.',
      FILL_BLANKS: 'Genera exactamente entre 3 y 6 oraciones.',
      MATCH_CONCEPTS: 'Genera exactamente entre 3 y 6 pares.',
      MULTIPLE_CHOICE: 'Genera exactamente 4 preguntas.',
      TRUE_FALSE: 'Genera exactamente 4 afirmaciones.',
      WORD_SCRAMBLE: 'Genera exactamente 5 palabras.',
    };

    return defaultRules[activityType];
  }

  buildRubricPrompt(
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
}
