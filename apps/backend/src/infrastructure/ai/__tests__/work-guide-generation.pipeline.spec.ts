import {
  ActivityContentSchemaByType,
  RubricGenerationSchema,
  ThemeSchema,
  buildFinalWorkGuide,
  parseStageResponse,
  WorkGuideGenerationStageError,
} from '../work-guide-generation.pipeline';

describe('work-guide-generation.pipeline', () => {
  it('should repair and parse malformed theme JSON', async () => {
    const parsed = await parseStageResponse({
      stage: 'theme',
      schema: ThemeSchema,
      model: 'test-model',
      text: "{ primary_color: '#22AA66', emoji: '🌿', }",
    });

    expect(parsed).toEqual({
      primary_color: '#22AA66',
      icon_emoji: '🌿',
    });
  });

  it('should fail on irreparable JSON', async () => {
    await expect(
      parseStageResponse({
        stage: 'theme',
        schema: ThemeSchema,
        model: 'test-model',
        text: '{"primary_color": ',
      }),
    ).rejects.toThrow(WorkGuideGenerationStageError);
  });

  it.each([
    [
      'WORD_SEARCH',
      {
        type: 'WORD_SEARCH',
        instructions: 'Busca las palabras.',
        items: [
          { word: 'SOL', clue_or_definition: 'Estrella' },
          { word: 'AGUA', clue_or_definition: 'Liquido' },
          { word: 'AIRE', clue_or_definition: 'Gas vital' },
          { word: 'SUELO', clue_or_definition: 'Base de la tierra' },
        ],
      },
    ],
    [
      'CROSSWORD',
      {
        type: 'CROSSWORD',
        instructions: 'Resuelve el crucigrama.',
        items: [
          { word: 'BOSQUE', clue_or_definition: 'Lugar con arboles' },
          { word: 'RIO', clue_or_definition: 'Corriente de agua' },
          { word: 'SOL', clue_or_definition: 'Fuente de luz' },
          { word: 'FLORA', clue_or_definition: 'Conjunto de plantas' },
        ],
      },
    ],
    [
      'FILL_BLANKS',
      {
        type: 'FILL_BLANKS',
        instructions: 'Completa las oraciones.',
        sentences: [
          {
            full_sentence: 'Los [ecosistemas] tienen seres vivos.',
            hidden_word: 'ecosistemas',
          },
          {
            full_sentence: 'El [agua] es fundamental para la vida.',
            hidden_word: 'agua',
          },
          {
            full_sentence: 'La [flora] incluye todas las plantas.',
            hidden_word: 'flora',
          },
        ],
      },
    ],
    [
      'MATCH_CONCEPTS',
      {
        type: 'MATCH_CONCEPTS',
        instructions: 'Relaciona conceptos.',
        pairs: [
          { concept: 'Flora', definition: 'Conjunto de plantas' },
          { concept: 'Fauna', definition: 'Conjunto de animales' },
          { concept: 'Suelo', definition: 'Capa superficial terrestre' },
        ],
      },
    ],
    [
      'MULTIPLE_CHOICE',
      {
        type: 'MULTIPLE_CHOICE',
        instructions: 'Selecciona la respuesta correcta.',
        questions: [
          {
            question: '¿Que necesita una planta?',
            options: ['Agua', 'Metal', 'Plastico', 'Vidrio'],
            correct_answer: 'Agua',
          },
          {
            question: '¿Que es fauna?',
            options: ['Animales', 'Rocas', 'Nubes', 'Rios'],
            correct_answer: 'Animales',
          },
          {
            question: '¿Que es flora?',
            options: ['Plantas', 'Arena', 'Luz', 'Lago'],
            correct_answer: 'Plantas',
          },
          {
            question: '¿Que factor no tiene vida?',
            options: ['Agua', 'Arbol', 'Pajaro', 'Hongo'],
            correct_answer: 'Agua',
          },
        ],
      },
    ],
    [
      'TRUE_FALSE',
      {
        type: 'TRUE_FALSE',
        instructions: 'Marca verdadero o falso.',
        statements: [
          { statement: 'El agua es abiotica.', is_true: true },
          { statement: 'Las rocas tienen vida.', is_true: false },
          { statement: 'La flora son plantas.', is_true: true },
          { statement: 'Todos los desiertos carecen de vida.', is_true: false },
        ],
      },
    ],
    [
      'WORD_SCRAMBLE',
      {
        type: 'WORD_SCRAMBLE',
        instructions: 'Ordena las letras.',
        words: [
          { word: 'AGUA', hint: 'Liquido vital' },
          { word: 'FLORA', hint: 'Conjunto de plantas' },
          { word: 'FAUNA', hint: 'Conjunto de animales' },
          { word: 'SOL', hint: 'Fuente de energia' },
          { word: 'SUELO', hint: 'Base terrestre' },
        ],
      },
    ],
  ])('should parse valid %s activity payloads', async (type, payload) => {
    const parsed = (await parseStageResponse({
      stage: 'activity',
      activityType: type as keyof typeof ActivityContentSchemaByType,
      schema:
        ActivityContentSchemaByType[
          type as keyof typeof ActivityContentSchemaByType
        ] as any,
      model: 'test-model',
      text: JSON.stringify(payload),
    })) as { type: string };

    expect(parsed.type).toBe(type);
  });

  it('should normalize rubric aliases and build a final work guide with deterministic scores', async () => {
    const rubric = await parseStageResponse({
      stage: 'rubric',
      schema: RubricGenerationSchema,
      model: 'test-model',
      activityTypes: ['WORD_SEARCH', 'TRUE_FALSE', 'WORD_SCRAMBLE'],
      text: JSON.stringify({
        global_description: 'Comprension general del tema.',
        rubric: [
          {
            criteria: 'Identificacion de conceptos',
            excellent: 'Identifica todo correctamente.',
            good: 'Identifica casi todo.',
            needs_improvement: 'Necesita apoyo.',
          },
          {
            criteria: 'Verificacion de ideas',
            excellent: 'Distingue perfectamente.',
            good: 'Distingue la mayoria.',
            needs_improvement: 'Confunde varios enunciados.',
          },
          {
            criteria: 'Vocabulario clave',
            excellent: 'Reconoce todas las palabras.',
            good: 'Reconoce la mayoria.',
            needs_improvement: 'Le cuesta reconocer palabras.',
          },
        ],
      }),
    });

    const guide = buildFinalWorkGuide({
      topic: 'Ecosistemas',
      targetAudience: 'Tercero',
      theme: {
        primary_color: '#22AA66',
        icon_emoji: '🌿',
      },
      activities: [
        {
          type: 'WORD_SEARCH',
          instructions: 'Busca las palabras.',
          items: [
            { word: 'SOL', clue_or_definition: 'Estrella' },
            { word: 'AGUA', clue_or_definition: 'Liquido' },
            { word: 'AIRE', clue_or_definition: 'Gas' },
            { word: 'SUELO', clue_or_definition: 'Base' },
          ],
        },
        {
          type: 'TRUE_FALSE',
          instructions: 'Marca verdadero o falso.',
          statements: [
            { statement: 'El agua es abiotica.', is_true: true },
            { statement: 'Las piedras tienen vida.', is_true: false },
            { statement: 'La flora son plantas.', is_true: true },
            { statement: 'El sol es un ser vivo.', is_true: false },
          ],
        },
        {
          type: 'WORD_SCRAMBLE',
          instructions: 'Ordena las letras.',
          words: [
            { word: 'AGUA', hint: 'Liquido vital' },
            { word: 'FLORA', hint: 'Conjunto de plantas' },
            { word: 'FAUNA', hint: 'Conjunto de animales' },
            { word: 'SOL', hint: 'Fuente de energia' },
            { word: 'SUELO', hint: 'Base terrestre' },
          ],
        },
      ],
      rubric,
    });

    expect(guide.global_score).toBe(100);
    expect(guide.activities.map((activity) => activity.score)).toEqual([
      34, 33, 33,
    ]);
    expect(
      guide.global_rubric.criteria.map((criterion) => criterion.activity_type),
    ).toEqual(['WORD_SEARCH', 'TRUE_FALSE', 'WORD_SCRAMBLE']);
  });
});
