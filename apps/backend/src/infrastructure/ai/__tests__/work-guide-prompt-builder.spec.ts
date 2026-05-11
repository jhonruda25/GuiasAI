import { WorkGuidePromptBuilder } from '../work-guide-prompt-builder';

describe('WorkGuidePromptBuilder', () => {
  let builder: WorkGuidePromptBuilder;

  beforeEach(() => {
    builder = new WorkGuidePromptBuilder();
  });

  describe('getLanguageName', () => {
    it('returns ENGLISH for "en"', () => {
      expect(builder.getLanguageName('en')).toBe('ENGLISH');
    });

    it('returns SPANISH for "es"', () => {
      expect(builder.getLanguageName('es')).toBe('SPANISH');
    });

    it('returns SPANISH for any non-en language', () => {
      expect(builder.getLanguageName('fr')).toBe('SPANISH');
      expect(builder.getLanguageName('pt')).toBe('SPANISH');
    });
  });

  describe('buildBaseSystemPrompt', () => {
    it('includes ENGLISH language for "en"', () => {
      const prompt = builder.buildBaseSystemPrompt('en');
      expect(prompt).toContain('ENGLISH');
      expect(prompt).toContain('JSON valido');
    });

    it('includes SPANISH language for "es"', () => {
      const prompt = builder.buildBaseSystemPrompt('es');
      expect(prompt).toContain('SPANISH');
    });
  });

  describe('buildThemePrompt', () => {
    it('includes topic, audience, and language name', () => {
      const prompt = builder.buildThemePrompt('Biology', '5th grade', 'en');
      expect(prompt).toContain('Biology');
      expect(prompt).toContain('5th grade');
      expect(prompt).toContain('ENGLISH');
    });

    it('includes required shape keys', () => {
      const prompt = builder.buildThemePrompt('Math', 'students', 'es');
      expect(prompt).toContain('primary_color');
      expect(prompt).toContain('icon_emoji');
    });

    it('includes rules about not using theme/emoji keys', () => {
      const prompt = builder.buildThemePrompt('History', 'kids', 'es');
      expect(prompt).toContain('No uses "theme"');
      expect(prompt).toContain('No uses "emoji"');
    });
  });

  describe('buildActivityPrompt', () => {
    it('includes topic, audience, language, and activity type', () => {
      const prompt = builder.buildActivityPrompt(
        'Physics',
        'high school',
        'en',
        'MULTIPLE_CHOICE',
      );
      expect(prompt).toContain('Physics');
      expect(prompt).toContain('high school');
      expect(prompt).toContain('ENGLISH');
      expect(prompt).toContain('MULTIPLE_CHOICE');
    });

    it('includes correct shape for WORD_SEARCH', () => {
      const prompt = builder.buildActivityPrompt(
        'Biology',
        'students',
        'es',
        'WORD_SEARCH',
      );
      expect(prompt).toContain('"type": "WORD_SEARCH"');
      expect(prompt).toContain('"word"');
      expect(prompt).toContain('"clue_or_definition"');
    });

    it('includes correct shape for TRUE_FALSE', () => {
      const prompt = builder.buildActivityPrompt(
        'Math',
        'students',
        'es',
        'TRUE_FALSE',
      );
      expect(prompt).toContain('"type": "TRUE_FALSE"');
      expect(prompt).toContain('"statement"');
      expect(prompt).toContain('"is_true"');
    });

    it('includes correct shape for MATCH_CONCEPTS', () => {
      const prompt = builder.buildActivityPrompt(
        'History',
        'students',
        'es',
        'MATCH_CONCEPTS',
      );
      expect(prompt).toContain('"type": "MATCH_CONCEPTS"');
      expect(prompt).toContain('"concept"');
      expect(prompt).toContain('"definition"');
    });

    it('includes item count rule when requestedItemsCount is provided', () => {
      const prompt = builder.buildActivityPrompt(
        'Science',
        'students',
        'es',
        'MULTIPLE_CHOICE',
        5,
      );
      expect(prompt).toContain('Genera exactamente 5 preguntas');
    });

    it('includes default item count rule when requestedItemsCount is undefined', () => {
      const prompt = builder.buildActivityPrompt(
        'Science',
        'students',
        'es',
        'MULTIPLE_CHOICE',
      );
      expect(prompt).toContain('Genera exactamente 4 preguntas');
    });
  });

  describe('buildRubricPrompt', () => {
    it('includes topic, audience, and language', () => {
      const prompt = builder.buildRubricPrompt(
        'Biology',
        '5th grade',
        'en',
        [
          { type: 'WORD_SEARCH', instructions: 'Find the words', items: [] },
        ] as any,
      );
      expect(prompt).toContain('Biology');
      expect(prompt).toContain('5th grade');
      expect(prompt).toContain('ENGLISH');
    });

    it('includes activity summary', () => {
      const activities = [
        { type: 'WORD_SEARCH' as const, instructions: 'Find words', items: [] },
        { type: 'TRUE_FALSE' as const, instructions: 'Answer true or false', statements: [] },
      ];
      const prompt = builder.buildRubricPrompt(
        'Science',
        'students',
        'es',
        activities as any,
      );
      expect(prompt).toContain('1. WORD_SEARCH: Find words');
      expect(prompt).toContain('2. TRUE_FALSE: Answer true or false');
    });

    it('includes required rubric shape keys', () => {
      const prompt = builder.buildRubricPrompt(
        'Math',
        'students',
        'es',
        [{ type: 'MULTIPLE_CHOICE' as const, instructions: 'Choose', questions: [] }],
      );
      expect(prompt).toContain('global_description');
      expect(prompt).toContain('criteria');
      expect(prompt).toContain('activity_type');
      expect(prompt).toContain('criteria_description');
      expect(prompt).toContain('levels');
      expect(prompt).toContain('excellent');
      expect(prompt).toContain('good');
      expect(prompt).toContain('needs_improvement');
    });
  });

  describe('buildItemCountRule', () => {
    it('returns specific count rule when requestedItemsCount is provided for MULTIPLE_CHOICE', () => {
      const rule = builder.buildItemCountRule('MULTIPLE_CHOICE', 5);
      expect(rule).toBe('Genera exactamente 5 preguntas.');
    });

    it('returns specific count rule for TRUE_FALSE', () => {
      const rule = builder.buildItemCountRule('TRUE_FALSE', 6);
      expect(rule).toBe('Genera exactamente 6 afirmaciones.');
    });

    it('returns specific count rule for FILL_BLANKS', () => {
      const rule = builder.buildItemCountRule('FILL_BLANKS', 4);
      expect(rule).toBe('Genera exactamente 4 oraciones.');
    });

    it('returns specific count rule for MATCH_CONCEPTS', () => {
      const rule = builder.buildItemCountRule('MATCH_CONCEPTS', 3);
      expect(rule).toBe('Genera exactamente 3 pares.');
    });

    it('returns specific count rule for WORD_SCRAMBLE', () => {
      const rule = builder.buildItemCountRule('WORD_SCRAMBLE', 7);
      expect(rule).toBe('Genera exactamente 7 palabras.');
    });

    it('returns specific count rule for WORD_SEARCH', () => {
      const rule = builder.buildItemCountRule('WORD_SEARCH', 10);
      expect(rule).toBe('Genera exactamente 10 items.');
    });

    it('returns default rule for MULTIPLE_CHOICE without count', () => {
      const rule = builder.buildItemCountRule('MULTIPLE_CHOICE');
      expect(rule).toBe('Genera exactamente 4 preguntas.');
    });

    it('returns default rule for WORD_SEARCH without count', () => {
      const rule = builder.buildItemCountRule('WORD_SEARCH');
      expect(rule).toBe('Genera exactamente entre 4 y 8 items.');
    });

    it('returns default rule for FILL_BLANKS without count', () => {
      const rule = builder.buildItemCountRule('FILL_BLANKS');
      expect(rule).toBe('Genera exactamente entre 3 y 6 oraciones.');
    });
  });

  describe('normalizeRequestedItemsCount', () => {
    it('returns undefined when requestedItemsCount is not set', () => {
      const result = builder.normalizeRequestedItemsCount({
        type: 'MULTIPLE_CHOICE',
      });
      expect(result).toBeUndefined();
    });

    it('returns the same value when within range for MULTIPLE_CHOICE', () => {
      const result = builder.normalizeRequestedItemsCount({
        type: 'MULTIPLE_CHOICE',
        requestedItemsCount: 6,
      });
      expect(result).toBe(6);
    });

    it('clamps to min when below range for MULTIPLE_CHOICE', () => {
      const result = builder.normalizeRequestedItemsCount({
        type: 'MULTIPLE_CHOICE',
        requestedItemsCount: 2,
      });
      expect(result).toBe(4);
    });

    it('clamps to max when above range for MULTIPLE_CHOICE', () => {
      const result = builder.normalizeRequestedItemsCount({
        type: 'MULTIPLE_CHOICE',
        requestedItemsCount: 20,
      });
      expect(result).toBe(10);
    });

    it('clamps to min for WORD_SCRAMBLE (min 5)', () => {
      const result = builder.normalizeRequestedItemsCount({
        type: 'WORD_SCRAMBLE',
        requestedItemsCount: 2,
      });
      expect(result).toBe(5);
    });

    it('clamps to max for WORD_SEARCH (max 15)', () => {
      const result = builder.normalizeRequestedItemsCount({
        type: 'WORD_SEARCH',
        requestedItemsCount: 20,
      });
      expect(result).toBe(15);
    });
  });
});
