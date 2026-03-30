import {
  extractGenerationActivityType,
  extractRequestedItemsCount,
  getUnsupportedGenerationActivityTypes,
  resolveGenerationActivityRequests,
  resolveGenerationActivityTypes,
} from './work-guide-generation';

describe('work-guide-generation helpers', () => {
  it('should parse decorated activity values', () => {
    const value =
      'MATCH_CONCEPTS - Relacionar conceptos (DEBES GENERAR EXACTAMENTE 4 ITEMS PARA ESTA ACTIVIDAD)';

    expect(extractGenerationActivityType(value)).toBe('MATCH_CONCEPTS');
    expect(extractRequestedItemsCount(value)).toBe(4);
  });

  it('should resolve supported activity types from decorated values', () => {
    const values = [
      'MULTIPLE_CHOICE - Seleccion multiple (DEBES GENERAR EXACTAMENTE 4 ITEMS PARA ESTA ACTIVIDAD)',
      'TRUE_FALSE - Verdadero o falso (DEBES GENERAR EXACTAMENTE 4 ITEMS PARA ESTA ACTIVIDAD)',
    ];

    expect(resolveGenerationActivityTypes(values)).toEqual([
      'MULTIPLE_CHOICE',
      'TRUE_FALSE',
    ]);
    expect(resolveGenerationActivityRequests(values)).toEqual([
      { type: 'MULTIPLE_CHOICE', requestedItemsCount: 4 },
      { type: 'TRUE_FALSE', requestedItemsCount: 4 },
    ]);
  });

  it('should flag unsupported activity prefixes', () => {
    const values = [
      'SEQUENTIAL_IMAGE_ANALYSIS - Analisis visual',
      'WORD_SEARCH - Sopa de letras',
    ];

    expect(getUnsupportedGenerationActivityTypes(values)).toEqual([
      'SEQUENTIAL_IMAGE_ANALYSIS - Analisis visual',
    ]);
  });
});
