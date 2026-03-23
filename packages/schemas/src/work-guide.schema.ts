import { z } from 'zod';

export const ActivityTypeEnum = z.enum([
  'CROSSWORD',
  'WORD_SEARCH',
  'FILL_BLANKS',
  'MATCH_CONCEPTS',
  'BONUS',
  'SEQUENTIAL_IMAGE_ANALYSIS',
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'WORD_SCRAMBLE',
  'DICTATION',
  'SENTENCE_ORDER',
  'ERROR_IDENTIFICATION',
  'TABLE_COMPLETION'
]);

export const ThemeSettingsSchema = z.object({
  primary_color: z.string().describe('Color hexadecimal representativo del tema de la guía (e.g. #FF8C00 para otoño).'),
  icon_emoji: z.string().describe('Un solo emoji muy representativo del tema general de esta guía pedagógica.')
});

export const ConceptItemSchema = z.object({
  word: z.string().describe('La palabra clave o concepto principal. Debe estar en mayúsculas, sin espacios ni caracteres especiales.'),
  clue_or_definition: z.string().describe('Pista pedagógica, definición o descripción para que el estudiante adivine la palabra.')
});

const BaseActivitySchema = z.object({
  instructions: z.string().describe('Instrucciones claras y pedagógicas para el estudiante sobre cómo resolver esta actividad.'),
  score: z.number().int().min(1).describe('Puntaje asignado a esta actividad.'),
});

const CrosswordActivitySchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.CROSSWORD),
  items: z.array(ConceptItemSchema).min(2).max(15).describe('Lista de palabras y pistas para construir el crucigrama. Mínimo 2, máximo 15.')
});

const WordSearchActivitySchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.WORD_SEARCH),
  items: z.array(ConceptItemSchema).min(2).max(15).describe('Lista de palabras a encontrar y sus definiciones (para reflexión).')
});

const MatchConceptsActivitySchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.MATCH_CONCEPTS),
  pairs: z.array(z.object({
    concept: z.string(),
    definition: z.string()
  })).min(2).max(10).describe('Pares de conceptos y definiciones que el estudiante deberá unir con líneas.')
});

const FillBlanksActivitySchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.FILL_BLANKS),
  sentences: z.array(z.object({
    full_sentence: z.string().describe('Oración completa con la palabra clave entre corchetes, ej: "La capital de Francia es [París]".'),
    hidden_word: z.string().describe('La palabra que se debe ocultar al estudiante.')
  })).min(2).max(10)
});

const SequentialImageAnalysisSchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.SEQUENTIAL_IMAGE_ANALYSIS),
  image_prompts: z.array(z.string()).describe('Prompts detallados para generar imágenes ilustrativas que el docente aprobará después.'),
  questions: z.array(z.string()).describe('Preguntas de análisis sobre la secuencia de imágenes.'),
  generated_images: z.array(z.string()).optional().describe('Imágenes generadas en base64, añadidas por el backend.')
});

const BonusActivitySchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.BONUS),
  challenge: z.string().describe('Un reto cognitivo adicional o acertijo relacionado al tema principal.')
});

const MultipleChoiceActivitySchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.MULTIPLE_CHOICE),
  questions: z.array(z.object({
    question: z.string().describe('La pregunta formulada al estudiante.'),
    options: z.array(z.string()).length(4).describe('Exactamente 4 opciones de respuesta.'),
    correct_answer: z.string().describe('La opción correcta exacta (debe coincidir con uno de los strings de options).')
  })).min(3).max(10).describe('Lista de preguntas de selección múltiple con única respuesta.')
});

const TrueFalseActivitySchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.TRUE_FALSE),
  statements: z.array(z.object({
    statement: z.string().describe('Afirmación que el estudiante debe evaluar como verdadera o falsa.'),
    is_true: z.boolean().describe('Valor booleano que indica si la afirmación es correcta.')
  })).min(3).max(10).describe('Lista de enunciados Verdadero/Falso.')
});

const WordScrambleActivitySchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.WORD_SCRAMBLE),
  words: z.array(z.object({
    word: z.string().describe('La palabra clave original, escrita correctamente y en mayúsculas.'),
    hint: z.string().describe('Pista que ayuda a adivinar la palabra antes de desenredarla.')
  })).min(3).max(10).describe('Lista de palabras que el sistema presentará con las letras revueltas.')
});

const DictationActivitySchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.DICTATION),
  paragraphs: z.array(z.object({
    text: z.string().describe('Párrafo o conjunto de oraciones para el estudiante.'),
    word_count: z.number().int().describe('Cantidad de palabras del párrafo.')
  })).min(1).max(5).describe('Lista de párrafos para el ejercicio de dictado.')
});

const SentenceOrderActivitySchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.SENTENCE_ORDER),
  sentences: z.array(z.object({
    original: z.string().describe('Oración original en orden correcto.'),
    words: z.array(z.string()).describe('Palabras de la oración mezcladas que el estudiante debe ordenar.')
  })).min(2).max(8).describe('Oraciones separadas en palabras mezcladas para que el estudiante las ordene.')
});

const ErrorIdentificationActivitySchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.ERROR_IDENTIFICATION),
  sentences: z.array(z.object({
    sentence_with_error: z.string().describe('Oración que contiene errores gramaticales u ortográficos.'),
    errors: z.array(z.object({
      error: z.string().describe('El error en la oración.'),
      correction: z.string().describe('La corrección del error.'),
      explanation: z.string().describe('Breve explicación del error.')
    })).describe('Lista de errores encontrados en la oración.')
  })).min(2).max(8).describe('Oraciones con errores para que el estudiante los identifique y corrija.')
});

const TableCompletionActivitySchema = BaseActivitySchema.extend({
  type: z.literal(ActivityTypeEnum.enum.TABLE_COMPLETION),
  table: z.object({
    headers: z.array(z.string()).describe('Encabezados de las columnas de la tabla.'),
    rows: z.array(z.object({
      cells: z.record(z.string(), z.string()).describe('Datos de cada celda de la fila.')
    })).describe('Filas de datos con la información a completar.')
  }).describe('Estructura de la tabla con encabezados y filas.')
});

export const ActivitySchema = z.discriminatedUnion('type', [
  CrosswordActivitySchema,
  WordSearchActivitySchema,
  MatchConceptsActivitySchema,
  FillBlanksActivitySchema,
  SequentialImageAnalysisSchema,
  BonusActivitySchema,
  MultipleChoiceActivitySchema,
  TrueFalseActivitySchema,
  WordScrambleActivitySchema,
  DictationActivitySchema,
  SentenceOrderActivitySchema,
  ErrorIdentificationActivitySchema,
  TableCompletionActivitySchema
]);

export const RubricCriteriaSchema = z.object({
  activity_type: ActivityTypeEnum,
  criteria_description: z.string().describe('Qué se evalúa exactamente en esta actividad.'),
  levels: z.object({
    excellent: z.string().describe('Descripción del nivel de logro: Excelente.'),
    good: z.string().describe('Descripción del nivel de logro: Bueno / Aceptable.'),
    needs_improvement: z.string().describe('Descripción del nivel de logro: Requiere mejora.')
  })
});

export const GlobalRubricSchema = z.object({
  global_description: z.string().describe('Descripción general de los objetivos de aprendizaje de esta guía.'),
  criteria: z.array(RubricCriteriaSchema).describe('Criterios de evaluación desglosados por tipo de actividad incluida.')
});

export const WorkGuideSchema = z.object({
  topic: z.string().describe('El tema pedagógico central de la guía generada.'),
  target_audience: z.string().describe('El público objetivo o grado escolar, ej: "Niños de 3er grado de primaria".'),
  global_score: z.number().int().describe('La suma total de los puntajes de todas las actividades.'),
  theme: ThemeSettingsSchema.describe('Configuración visual y temática inteligente.'),
  activities: z.array(ActivitySchema).min(1).describe('Lista de actividades pedagógicas generadas. Cada una debe ser de un tipo distinto si es posible.'),
  global_rubric: GlobalRubricSchema.describe('La rúbrica de evaluación global para la guía.')
});

export type WorkGuide = z.infer<typeof WorkGuideSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type ConceptItem = z.infer<typeof ConceptItemSchema>;