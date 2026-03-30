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

export const DEFAULT_GENERATION_ACTIVITY_TYPES: SupportedGenerationActivityType[] =
  [
    ActivityTypeEnum.enum.WORD_SEARCH,
    ActivityTypeEnum.enum.FILL_BLANKS,
    ActivityTypeEnum.enum.MATCH_CONCEPTS,
    ActivityTypeEnum.enum.MULTIPLE_CHOICE,
    ActivityTypeEnum.enum.TRUE_FALSE,
  ];

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

  return values.filter((value) => !isSupportedGenerationActivityType(value));
}

export function resolveGenerationActivityTypes(
  values?: string[],
): SupportedGenerationActivityType[] {
  if (!values?.length) {
    return [...DEFAULT_GENERATION_ACTIVITY_TYPES];
  }

  return values.filter(isSupportedGenerationActivityType);
}
