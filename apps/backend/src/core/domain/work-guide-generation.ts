import { ActivityTypeEnum } from '@repo/schemas';

export const SUPPORTED_GENERATION_ACTIVITY_TYPES = [
  ActivityTypeEnum.enum.WORD_SEARCH,
  ActivityTypeEnum.enum.CROSSWORD,
  ActivityTypeEnum.enum.FILL_BLANKS,
  ActivityTypeEnum.enum.MATCH_CONCEPTS,
  ActivityTypeEnum.enum.MULTIPLE_CHOICE,
  ActivityTypeEnum.enum.TRUE_FALSE,
  ActivityTypeEnum.enum.WORD_SCRAMBLE,
] as const;

export type SupportedGenerationActivityType =
  (typeof SUPPORTED_GENERATION_ACTIVITY_TYPES)[number];

export interface ResolvedGenerationActivityRequest {
  type: SupportedGenerationActivityType;
  requestedItemsCount?: number;
}

export const DEFAULT_GENERATION_ACTIVITY_TYPES: SupportedGenerationActivityType[] =
  [
    ActivityTypeEnum.enum.WORD_SEARCH,
    ActivityTypeEnum.enum.FILL_BLANKS,
    ActivityTypeEnum.enum.MATCH_CONCEPTS,
    ActivityTypeEnum.enum.MULTIPLE_CHOICE,
    ActivityTypeEnum.enum.TRUE_FALSE,
  ];

const ACTIVITY_TYPE_PREFIX_REGEX = /^\s*([A-Z_]+)/i;
const EXACT_ITEMS_REGEX = /\b(?:EXACTAMENTE|EXACTLY)\s+(\d+)\s+ITEMS?\b/i;

export function extractGenerationActivityType(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const prefixedMatch = trimmed.match(ACTIVITY_TYPE_PREFIX_REGEX);
  if (prefixedMatch?.[1]) {
    return prefixedMatch[1].toUpperCase();
  }

  return trimmed.toUpperCase();
}

export function extractRequestedItemsCount(
  value: string,
): number | undefined {
  const match = value.match(EXACT_ITEMS_REGEX);
  if (!match?.[1]) {
    return undefined;
  }

  const parsed = Number.parseInt(match[1], 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

export function isSupportedGenerationActivityType(
  value: string,
): value is SupportedGenerationActivityType {
  return (SUPPORTED_GENERATION_ACTIVITY_TYPES as readonly string[]).includes(
    value,
  );
}

export function getUnsupportedGenerationActivityTypes(
  values?: string[],
): string[] {
  if (!values?.length) {
    return [];
  }

  return values.filter(
    (value) =>
      !isSupportedGenerationActivityType(extractGenerationActivityType(value)),
  );
}

export function resolveGenerationActivityTypes(
  values?: string[],
): SupportedGenerationActivityType[] {
  if (!values?.length) {
    return [...DEFAULT_GENERATION_ACTIVITY_TYPES];
  }

  return values
    .map(extractGenerationActivityType)
    .filter(isSupportedGenerationActivityType);
}

export function resolveGenerationActivityRequests(
  values?: string[],
): ResolvedGenerationActivityRequest[] {
  if (!values?.length) {
    return DEFAULT_GENERATION_ACTIVITY_TYPES.map((type) => ({ type }));
  }

  return values.reduce<ResolvedGenerationActivityRequest[]>(
    (accumulator, value) => {
      const type = extractGenerationActivityType(value);
      if (!isSupportedGenerationActivityType(type)) {
        return accumulator;
      }

      accumulator.push({
        type,
        requestedItemsCount: extractRequestedItemsCount(value),
      });

      return accumulator;
    },
    [],
  );
}
