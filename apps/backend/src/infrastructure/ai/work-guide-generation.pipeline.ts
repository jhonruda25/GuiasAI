import { safeParseJSON } from '@ai-sdk/provider-utils';
import {
  ConceptItemSchema,
  ThemeSettingsSchema,
  WorkGuideSchema,
} from '@repo/schemas';
import type { Activity, WorkGuide } from '@repo/schemas';
import { jsonrepair } from 'jsonrepair';
import { z } from 'zod';
import type { SupportedGenerationActivityType } from '../../core/domain/work-guide-generation';

const RubricLevelsSchema = z.object({
  excellent: z.string().trim().min(1),
  good: z.string().trim().min(1),
  needs_improvement: z.string().trim().min(1),
});

export const ThemeSchema = ThemeSettingsSchema;

export const RubricGenerationSchema = z.object({
  global_description: z.string().trim().min(1),
  criteria: z
    .array(
      z.object({
        activity_type: z.string().trim().min(1),
        criteria_description: z.string().trim().min(1),
        levels: RubricLevelsSchema,
      }),
    )
    .min(1),
});

const BaseActivityContentSchema = z.object({
  instructions: z.string().trim().min(1),
});

const CrosswordActivityContentSchema = BaseActivityContentSchema.extend({
  type: z.literal('CROSSWORD'),
  items: z.array(ConceptItemSchema).min(4).max(15),
});

const WordSearchActivityContentSchema = BaseActivityContentSchema.extend({
  type: z.literal('WORD_SEARCH'),
  items: z.array(ConceptItemSchema).min(4).max(15),
});

const MatchConceptsActivityContentSchema = BaseActivityContentSchema.extend({
  type: z.literal('MATCH_CONCEPTS'),
  pairs: z
    .array(
      z.object({
        concept: z.string().trim().min(1),
        definition: z.string().trim().min(1),
      }),
    )
    .min(3)
    .max(10),
});

const FillBlanksActivityContentSchema = BaseActivityContentSchema.extend({
  type: z.literal('FILL_BLANKS'),
  sentences: z
    .array(
      z.object({
        full_sentence: z.string().trim().min(1),
        hidden_word: z.string().trim().min(1),
      }),
    )
    .min(3)
    .max(10),
});

const MultipleChoiceActivityContentSchema = BaseActivityContentSchema.extend({
  type: z.literal('MULTIPLE_CHOICE'),
  questions: z
    .array(
      z.object({
        question: z.string().trim().min(1),
        options: z.array(z.string().trim().min(1)).length(4),
        correct_answer: z.string().trim().min(1),
      }),
    )
    .min(4)
    .max(10),
});

const TrueFalseActivityContentSchema = BaseActivityContentSchema.extend({
  type: z.literal('TRUE_FALSE'),
  statements: z
    .array(
      z.object({
        statement: z.string().trim().min(1),
        is_true: z.boolean(),
      }),
    )
    .min(4)
    .max(10),
});

const WordScrambleActivityContentSchema = BaseActivityContentSchema.extend({
  type: z.literal('WORD_SCRAMBLE'),
  words: z
    .array(
      z.object({
        word: z.string().trim().min(1),
        hint: z.string().trim().min(1),
      }),
    )
    .min(5)
    .max(10),
});

export const ActivityContentSchemaByType = {
  CROSSWORD: CrosswordActivityContentSchema,
  WORD_SEARCH: WordSearchActivityContentSchema,
  FILL_BLANKS: FillBlanksActivityContentSchema,
  MATCH_CONCEPTS: MatchConceptsActivityContentSchema,
  MULTIPLE_CHOICE: MultipleChoiceActivityContentSchema,
  TRUE_FALSE: TrueFalseActivityContentSchema,
  WORD_SCRAMBLE: WordScrambleActivityContentSchema,
} as const satisfies Record<SupportedGenerationActivityType, z.ZodTypeAny>;

export type GeneratedActivityContent = z.infer<
  (typeof ActivityContentSchemaByType)[SupportedGenerationActivityType]
>;

export type StageCategory =
  | 'generation'
  | 'json_repair'
  | 'json_parse'
  | 'schema_validation';

export class WorkGuideGenerationStageError extends Error {
  constructor(
    readonly stage: string,
    readonly category: StageCategory,
    readonly options: {
      activityType?: SupportedGenerationActivityType;
      model?: string;
      details?: string;
      rawPayloadSnippet?: string;
      cause?: unknown;
    } = {},
  ) {
    super(
      [
        `Work guide generation failed at stage "${stage}"`,
        options.activityType ? `activity "${options.activityType}"` : undefined,
        options.model ? `model "${options.model}"` : undefined,
        `category "${category}"`,
        options.details,
      ]
        .filter(Boolean)
        .join(' | '),
    );
    this.name = 'WorkGuideGenerationStageError';
  }
}

function truncate(value: string, length = 600): string {
  return value.length <= length ? value : `${value.slice(0, length)}...`;
}

function stripMarkdownCodeFences(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  return trimmed
    .replace(/^```[a-zA-Z0-9_-]*\s*/, '')
    .replace(/\s*```$/, '')
    .trim();
}

function unwrapSingleItemArray(payload: unknown): unknown {
  if (Array.isArray(payload) && payload.length === 1) {
    return unwrapSingleItemArray(payload[0]);
  }

  return payload;
}

function normalizeThemePayload(payload: unknown): unknown {
  const unwrapped = unwrapSingleItemArray(payload);
  if (!unwrapped || typeof unwrapped !== 'object') {
    return unwrapped;
  }

  const candidate = unwrapped as Record<string, unknown>;
  const theme =
    candidate.theme && typeof candidate.theme === 'object'
      ? (candidate.theme as Record<string, unknown>)
      : candidate;

  return {
    ...theme,
    icon_emoji:
      typeof theme.icon_emoji === 'string'
        ? theme.icon_emoji
        : typeof theme.emoji === 'string'
          ? theme.emoji
          : theme.icon_emoji,
  };
}

function normalizeConceptItems(items: unknown): unknown {
  if (!Array.isArray(items)) {
    return items;
  }

  if (items.every((item) => typeof item === 'string') && items.length % 2 === 0) {
    const rawItems = items as string[];
    const looksPrefixed = rawItems.every((item, index) =>
      index % 2 === 0
        ? item.toLowerCase().startsWith('word:')
        : item.toLowerCase().startsWith('clue_or_definition:'),
    );

    return rawItems.reduce<Array<{ word: string; clue_or_definition: string }>>(
      (accumulator, _, index) => {
        if (index % 2 !== 0) {
          return accumulator;
        }

        accumulator.push({
          word: looksPrefixed
            ? rawItems[index].replace(/^word:\s*/i, '').trim()
            : rawItems[index].trim(),
          clue_or_definition: looksPrefixed
            ? rawItems[index + 1].replace(/^clue_or_definition:\s*/i, '').trim()
            : rawItems[index + 1].trim(),
        });

        return accumulator;
      },
      [],
    );
  }

  return items;
}

function normalizeFillBlankSentences(sentences: unknown): unknown {
  if (!Array.isArray(sentences)) {
    return sentences;
  }

  return sentences.map((sentence) => {
    if (typeof sentence !== 'string') {
      return sentence;
    }

    const match = sentence.match(/\[([^\]]+)\]/);
    return {
      full_sentence: sentence.trim(),
      hidden_word: match?.[1]?.trim() ?? '',
    };
  });
}

function normalizePairs(pairs: unknown): unknown {
  if (!Array.isArray(pairs)) {
    return pairs;
  }

  if (pairs.every((item) => typeof item === 'string') && pairs.length % 2 === 0) {
    const rawPairs = pairs as string[];
    const looksPrefixed = rawPairs.every((item, index) =>
      index % 2 === 0
        ? item.toLowerCase().startsWith('concept:')
        : item.toLowerCase().startsWith('definition:'),
    );

    return rawPairs.reduce<Array<{ concept: string; definition: string }>>(
      (accumulator, _, index) => {
        if (index % 2 !== 0) {
          return accumulator;
        }

        accumulator.push({
          concept: looksPrefixed
            ? rawPairs[index].replace(/^concept:\s*/i, '').trim()
            : rawPairs[index].trim(),
          definition: looksPrefixed
            ? rawPairs[index + 1].replace(/^definition:\s*/i, '').trim()
            : rawPairs[index + 1].trim(),
        });

        return accumulator;
      },
      [],
    );
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
}

function normalizeMultipleChoiceQuestions(questions: unknown): unknown {
  if (!Array.isArray(questions)) {
    return questions;
  }

  if (
    questions.every((item) => typeof item === 'string') &&
    questions.length % 3 === 0
  ) {
    const rawQuestions = questions as string[];
    const looksPrefixed = rawQuestions.every((item, index) => {
      const lower = item.toLowerCase();
      if (index % 3 === 0) return lower.startsWith('question:');
      if (index % 3 === 1) return lower.startsWith('options:');
      return lower.startsWith('correct_answer:');
    });

    if (looksPrefixed) {
      return rawQuestions.reduce<
        Array<{ question: string; options: string[]; correct_answer: string }>
      >((accumulator, _, index) => {
        if (index % 3 !== 0) {
          return accumulator;
        }

        const question = rawQuestions[index].replace(/^question:\s*/i, '').trim();
        const rawOptions = rawQuestions[index + 1]
          .replace(/^options:\s*/i, '')
          .trim();
        const correctAnswer = rawQuestions[index + 2]
          .replace(/^correct_answer:\s*/i, '')
          .trim();

        let options: string[] = [];
        try {
          const parsedOptions = JSON.parse(rawOptions) as unknown;
          if (
            Array.isArray(parsedOptions) &&
            parsedOptions.every((option) => typeof option === 'string')
          ) {
            options = parsedOptions;
          }
        } catch {
          options = rawOptions
            .replace(/^\[/, '')
            .replace(/\]$/, '')
            .split(',')
            .map((option) => option.trim().replace(/^"|"$/g, ''))
            .filter(Boolean);
        }

        accumulator.push({
          question,
          options,
          correct_answer: correctAnswer,
        });

        return accumulator;
      }, []);
    }
  }

  return questions;
}

function normalizeTrueFalseStatements(statements: unknown): unknown {
  if (!Array.isArray(statements)) {
    return statements;
  }

  if (
    statements.length % 2 === 0 &&
    statements.every(
      (item, index) =>
        (index % 2 === 0 && typeof item === 'string') ||
        (index % 2 === 1 && typeof item === 'boolean'),
    )
  ) {
    const rawStatements = statements as Array<string | boolean>;
    return rawStatements.reduce<Array<{ statement: string; is_true: boolean }>>(
      (accumulator, _, index) => {
        if (index % 2 !== 0) {
          return accumulator;
        }

        accumulator.push({
          statement: rawStatements[index] as string,
          is_true: rawStatements[index + 1] as boolean,
        });

        return accumulator;
      },
      [],
    );
  }

  if (
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
      return rawStatements.reduce<Array<{ statement: string; is_true: boolean }>>(
        (accumulator, _, index) => {
          if (index % 2 !== 0) {
            return accumulator;
          }

          accumulator.push({
            statement: rawStatements[index].replace(/^statement:\s*/i, '').trim(),
            is_true:
              rawStatements[index + 1]
                .replace(/^is_true:\s*/i, '')
                .trim()
                .toLowerCase() === 'true',
          });

          return accumulator;
        },
        [],
      );
    }
  }

  return statements.map((statement) => {
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

function normalizeWordScrambleWords(words: unknown): unknown {
  if (!Array.isArray(words)) {
    return words;
  }

  return words.map((word) => {
    if (word && typeof word === 'object') {
      const rawWord = word as Record<string, unknown>;
      return {
        word: rawWord.word,
        hint:
          typeof rawWord.hint === 'string'
            ? rawWord.hint
            : typeof rawWord.scrambled === 'string'
              ? `Palabra desordenada: ${rawWord.scrambled}`
              : rawWord.hint,
      };
    }

    if (typeof word !== 'string') {
      return word;
    }

    return {
      word,
      hint: `Palabra clave relacionada con ${word}.`,
    };
  });
}

function normalizeActivityPayload(
  payload: unknown,
  activityType: SupportedGenerationActivityType,
): unknown {
  const unwrapped = unwrapSingleItemArray(payload);
  if (!unwrapped || typeof unwrapped !== 'object') {
    return unwrapped;
  }

  const candidate = unwrapped as Record<string, unknown>;
  const activity =
    candidate.activity && typeof candidate.activity === 'object'
      ? (candidate.activity as Record<string, unknown>)
      : candidate;

  const normalizedType =
    typeof activity.type === 'string'
      ? activity.type
      : typeof activity.activity_type === 'string'
        ? activity.activity_type
        : activityType;

  return {
    ...activity,
    type: normalizedType,
    instructions:
      typeof activity.instructions === 'string'
        ? activity.instructions
        : typeof activity.instruction === 'string'
          ? activity.instruction
          : activity.instructions,
    items:
      normalizedType === 'WORD_SEARCH' || normalizedType === 'CROSSWORD'
        ? normalizeConceptItems(activity.items)
        : activity.items,
    sentences:
      normalizedType === 'FILL_BLANKS'
        ? normalizeFillBlankSentences(activity.sentences)
        : activity.sentences,
    pairs:
      normalizedType === 'MATCH_CONCEPTS'
        ? normalizePairs(activity.pairs)
        : activity.pairs,
    questions:
      normalizedType === 'MULTIPLE_CHOICE'
        ? normalizeMultipleChoiceQuestions(activity.questions)
        : activity.questions,
    statements:
      normalizedType === 'TRUE_FALSE'
        ? normalizeTrueFalseStatements(activity.statements)
        : activity.statements,
    words:
      normalizedType === 'WORD_SCRAMBLE'
        ? normalizeWordScrambleWords(activity.words)
        : activity.words,
  };
}

function normalizeRubricPayload(
  payload: unknown,
  activityTypes: SupportedGenerationActivityType[],
): unknown {
  const unwrapped = unwrapSingleItemArray(payload);
  if (!unwrapped || typeof unwrapped !== 'object') {
    return unwrapped;
  }

  const candidate = unwrapped as Record<string, unknown>;
  const rubric =
    candidate.global_rubric && typeof candidate.global_rubric === 'object'
      ? (candidate.global_rubric as Record<string, unknown>)
      : candidate;

  const rawCriteria = Array.isArray(rubric.criteria)
    ? rubric.criteria
    : Array.isArray(rubric.rubric)
      ? rubric.rubric
      : Array.isArray(candidate.rubric)
        ? candidate.rubric
        : rubric.criteria;

  const normalizedCriteria = Array.isArray(rawCriteria)
    ? rawCriteria.map((criterion, index) => {
        if (!criterion || typeof criterion !== 'object') {
          return criterion;
        }

        const rawCriterion = criterion as Record<string, unknown>;
        const performanceLevels =
          rawCriterion.performance_levels &&
          typeof rawCriterion.performance_levels === 'object'
            ? (rawCriterion.performance_levels as Record<string, unknown>)
            : undefined;

        return {
          activity_type:
            typeof rawCriterion.activity_type === 'string'
              ? rawCriterion.activity_type
              : activityTypes[index] ?? activityTypes[0],
          criteria_description:
            typeof rawCriterion.criteria_description === 'string'
              ? rawCriterion.criteria_description
              : typeof rawCriterion.criteria === 'string'
                ? rawCriterion.criteria
                : typeof rawCriterion.criterion === 'string'
                  ? rawCriterion.criterion
                  : '',
          levels: {
            excellent:
              typeof rawCriterion.excellent === 'string'
                ? rawCriterion.excellent
                : typeof performanceLevels?.excellent === 'string'
                  ? performanceLevels.excellent
                  : typeof performanceLevels?.excelente === 'string'
                    ? performanceLevels.excelente
                    : '',
            good:
              typeof rawCriterion.good === 'string'
                ? rawCriterion.good
                : typeof performanceLevels?.good === 'string'
                  ? performanceLevels.good
                  : typeof performanceLevels?.bueno === 'string'
                    ? performanceLevels.bueno
                    : '',
            needs_improvement:
              typeof rawCriterion.needs_improvement === 'string'
                ? rawCriterion.needs_improvement
                : typeof performanceLevels?.needs_improvement === 'string'
                  ? performanceLevels.needs_improvement
                  : typeof performanceLevels?.necesita_mejorar === 'string'
                    ? performanceLevels.necesita_mejorar
                    : '',
          },
        };
      })
    : rawCriteria;

  return {
    global_description:
      typeof rubric.global_description === 'string'
        ? rubric.global_description
        : typeof candidate.global_description === 'string'
          ? candidate.global_description
          : 'Rubrica global de evaluacion de la guia pedagogica.',
    criteria: normalizedCriteria,
  };
}

export async function parseStageResponse<T>(options: {
  stage: string;
  text: string;
  schema: z.ZodType<T>;
  activityType?: SupportedGenerationActivityType;
  activityTypes?: SupportedGenerationActivityType[];
  model?: string;
}): Promise<T> {
  const sanitizedText = stripMarkdownCodeFences(options.text);

  let repairedText = sanitizedText;
  try {
    repairedText = jsonrepair(sanitizedText);
  } catch (error) {
    throw new WorkGuideGenerationStageError(options.stage, 'json_repair', {
      activityType: options.activityType,
      model: options.model,
      details:
        error instanceof Error ? error.message : 'Unable to repair JSON output',
      rawPayloadSnippet: truncate(sanitizedText),
      cause: error,
    });
  }

  const parseResult = await safeParseJSON({ text: repairedText });
  if (!parseResult.success) {
    throw new WorkGuideGenerationStageError(options.stage, 'json_parse', {
      activityType: options.activityType,
      model: options.model,
      details: parseResult.error.message,
      rawPayloadSnippet: truncate(repairedText),
      cause: parseResult.error,
    });
  }

  const normalizedPayload =
    options.stage === 'theme'
      ? normalizeThemePayload(parseResult.value)
      : options.stage === 'rubric'
        ? normalizeRubricPayload(
            parseResult.value,
            options.activityTypes ?? [],
          )
        : options.activityType
          ? normalizeActivityPayload(parseResult.value, options.activityType)
          : parseResult.value;

  const validationResult = options.schema.safeParse(normalizedPayload);
  if (!validationResult.success) {
    throw new WorkGuideGenerationStageError(options.stage, 'schema_validation', {
      activityType: options.activityType,
      model: options.model,
      details: validationResult.error.issues
        .slice(0, 3)
        .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
        .join('; '),
      rawPayloadSnippet: truncate(JSON.stringify(normalizedPayload)),
      cause: validationResult.error,
    });
  }

  return validationResult.data;
}

function buildDeterministicScores(count: number): number[] {
  const baseScore = Math.floor(100 / count);
  let remainder = 100 % count;

  return Array.from({ length: count }, () => {
    const score = remainder > 0 ? baseScore + 1 : baseScore;
    remainder = Math.max(0, remainder - 1);
    return score;
  });
}

function alignRubricCriteria(
  rubric: z.infer<typeof RubricGenerationSchema>,
  activities: Activity[],
): WorkGuide['global_rubric'] {
  const criteriaByType = new Map(
    rubric.criteria.map((criterion) => [criterion.activity_type, criterion]),
  );

  const orderedCriteria = activities.map((activity) => {
    const criterion = criteriaByType.get(activity.type);
    if (!criterion) {
      throw new WorkGuideGenerationStageError('rubric', 'schema_validation', {
        activityType: activity.type as SupportedGenerationActivityType,
        details: `Missing rubric criteria for activity type ${activity.type}`,
      });
    }

    return {
      activity_type: activity.type,
      criteria_description: criterion.criteria_description,
      levels: criterion.levels,
    };
  });

  return {
    global_description: rubric.global_description,
    criteria: orderedCriteria,
  };
}

export function buildFinalWorkGuide(input: {
  topic: string;
  targetAudience: string;
  theme: z.infer<typeof ThemeSchema>;
  activities: GeneratedActivityContent[];
  rubric: z.infer<typeof RubricGenerationSchema>;
}): WorkGuide {
  const scores = buildDeterministicScores(input.activities.length);
  const scoredActivities = input.activities.map((activity, index) => ({
    ...activity,
    score: scores[index],
  })) as Activity[];

  const guide = {
    topic: input.topic,
    target_audience: input.targetAudience,
    global_score: scoredActivities.reduce((sum, activity) => sum + activity.score, 0),
    theme: input.theme,
    activities: scoredActivities,
    global_rubric: alignRubricCriteria(input.rubric, scoredActivities),
  };

  return WorkGuideSchema.parse(guide);
}
