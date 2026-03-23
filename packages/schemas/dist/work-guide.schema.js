"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkGuideSchema = exports.GlobalRubricSchema = exports.RubricCriteriaSchema = exports.ActivitySchema = exports.ConceptItemSchema = exports.ThemeSettingsSchema = exports.ActivityTypeEnum = void 0;
const zod_1 = require("zod");
exports.ActivityTypeEnum = zod_1.z.enum([
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
exports.ThemeSettingsSchema = zod_1.z.object({
    primary_color: zod_1.z.string().describe('Color hexadecimal representativo del tema de la guía (e.g. #FF8C00 para otoño).'),
    icon_emoji: zod_1.z.string().describe('Un solo emoji muy representativo del tema general de esta guía pedagógica.')
});
exports.ConceptItemSchema = zod_1.z.object({
    word: zod_1.z.string().describe('La palabra clave o concepto principal. Debe estar en mayúsculas, sin espacios ni caracteres especiales.'),
    clue_or_definition: zod_1.z.string().describe('Pista pedagógica, definición o descripción para que el estudiante adivine la palabra.')
});
const BaseActivitySchema = zod_1.z.object({
    instructions: zod_1.z.string().describe('Instrucciones claras y pedagógicas para el estudiante sobre cómo resolver esta actividad.'),
    score: zod_1.z.number().int().min(1).describe('Puntaje asignado a esta actividad.'),
});
const CrosswordActivitySchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.CROSSWORD),
    items: zod_1.z.array(exports.ConceptItemSchema).min(2).max(15).describe('Lista de palabras y pistas para construir el crucigrama. Mínimo 2, máximo 15.')
});
const WordSearchActivitySchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.WORD_SEARCH),
    items: zod_1.z.array(exports.ConceptItemSchema).min(2).max(15).describe('Lista de palabras a encontrar y sus definiciones (para reflexión).')
});
const MatchConceptsActivitySchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.MATCH_CONCEPTS),
    pairs: zod_1.z.array(zod_1.z.object({
        concept: zod_1.z.string(),
        definition: zod_1.z.string()
    })).min(2).max(10).describe('Pares de conceptos y definiciones que el estudiante deberá unir con líneas.')
});
const FillBlanksActivitySchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.FILL_BLANKS),
    sentences: zod_1.z.array(zod_1.z.object({
        full_sentence: zod_1.z.string().describe('Oración completa con la palabra clave entre corchetes, ej: "La capital de Francia es [París]".'),
        hidden_word: zod_1.z.string().describe('La palabra que se debe ocultar al estudiante.')
    })).min(2).max(10)
});
const SequentialImageAnalysisSchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.SEQUENTIAL_IMAGE_ANALYSIS),
    image_prompts: zod_1.z.array(zod_1.z.string()).describe('Prompts detallados para generar imágenes ilustrativas que el docente aprobará después.'),
    questions: zod_1.z.array(zod_1.z.string()).describe('Preguntas de análisis sobre la secuencia de imágenes.'),
    generated_images: zod_1.z.array(zod_1.z.string()).optional().describe('Imágenes generadas en base64, añadidas por el backend.')
});
const BonusActivitySchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.BONUS),
    challenge: zod_1.z.string().describe('Un reto cognitivo adicional o acertijo relacionado al tema principal.')
});
const MultipleChoiceActivitySchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.MULTIPLE_CHOICE),
    questions: zod_1.z.array(zod_1.z.object({
        question: zod_1.z.string().describe('La pregunta formulada al estudiante.'),
        options: zod_1.z.array(zod_1.z.string()).length(4).describe('Exactamente 4 opciones de respuesta.'),
        correct_answer: zod_1.z.string().describe('La opción correcta exacta (debe coincidir con uno de los strings de options).')
    })).min(3).max(10).describe('Lista de preguntas de selección múltiple con única respuesta.')
});
const TrueFalseActivitySchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.TRUE_FALSE),
    statements: zod_1.z.array(zod_1.z.object({
        statement: zod_1.z.string().describe('Afirmación que el estudiante debe evaluar como verdadera o falsa.'),
        is_true: zod_1.z.boolean().describe('Valor booleano que indica si la afirmación es correcta.')
    })).min(3).max(10).describe('Lista de enunciados Verdadero/Falso.')
});
const WordScrambleActivitySchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.WORD_SCRAMBLE),
    words: zod_1.z.array(zod_1.z.object({
        word: zod_1.z.string().describe('La palabra clave original, escrita correctamente y en mayúsculas.'),
        hint: zod_1.z.string().describe('Pista que ayuda a adivinar la palabra antes de desenredarla.')
    })).min(3).max(10).describe('Lista de palabras que el sistema presentará con las letras revueltas.')
});
const DictationActivitySchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.DICTATION),
    paragraphs: zod_1.z.array(zod_1.z.object({
        text: zod_1.z.string().describe('Párrafo o conjunto de oraciones para el estudiante.'),
        word_count: zod_1.z.number().int().describe('Cantidad de palabras del párrafo.')
    })).min(1).max(5).describe('Lista de párrafos para el ejercicio de dictado.')
});
const SentenceOrderActivitySchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.SENTENCE_ORDER),
    sentences: zod_1.z.array(zod_1.z.object({
        original: zod_1.z.string().describe('Oración original en orden correcto.'),
        words: zod_1.z.array(zod_1.z.string()).describe('Palabras de la oración mezcladas que el estudiante debe ordenar.')
    })).min(2).max(8).describe('Oraciones separadas en palabras mezcladas para que el estudiante las ordene.')
});
const ErrorIdentificationActivitySchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.ERROR_IDENTIFICATION),
    sentences: zod_1.z.array(zod_1.z.object({
        sentence_with_error: zod_1.z.string().describe('Oración que contiene errores gramaticales u ortográficos.'),
        errors: zod_1.z.array(zod_1.z.object({
            error: zod_1.z.string().describe('El error en la oración.'),
            correction: zod_1.z.string().describe('La corrección del error.'),
            explanation: zod_1.z.string().describe('Breve explicación del error.')
        })).describe('Lista de errores encontrados en la oración.')
    })).min(2).max(8).describe('Oraciones con errores para que el estudiante los identifique y corrija.')
});
const TableCompletionActivitySchema = BaseActivitySchema.extend({
    type: zod_1.z.literal(exports.ActivityTypeEnum.enum.TABLE_COMPLETION),
    table: zod_1.z.object({
        headers: zod_1.z.array(zod_1.z.string()).describe('Encabezados de las columnas de la tabla.'),
        rows: zod_1.z.array(zod_1.z.object({
            cells: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).describe('Datos de cada celda de la fila.')
        })).describe('Filas de datos con la información a completar.')
    }).describe('Estructura de la tabla con encabezados y filas.')
});
exports.ActivitySchema = zod_1.z.discriminatedUnion('type', [
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
exports.RubricCriteriaSchema = zod_1.z.object({
    activity_type: exports.ActivityTypeEnum,
    criteria_description: zod_1.z.string().describe('Qué se evalúa exactamente en esta actividad.'),
    levels: zod_1.z.object({
        excellent: zod_1.z.string().describe('Descripción del nivel de logro: Excelente.'),
        good: zod_1.z.string().describe('Descripción del nivel de logro: Bueno / Aceptable.'),
        needs_improvement: zod_1.z.string().describe('Descripción del nivel de logro: Requiere mejora.')
    })
});
exports.GlobalRubricSchema = zod_1.z.object({
    global_description: zod_1.z.string().describe('Descripción general de los objetivos de aprendizaje de esta guía.'),
    criteria: zod_1.z.array(exports.RubricCriteriaSchema).describe('Criterios de evaluación desglosados por tipo de actividad incluida.')
});
exports.WorkGuideSchema = zod_1.z.object({
    topic: zod_1.z.string().describe('El tema pedagógico central de la guía generada.'),
    target_audience: zod_1.z.string().describe('El público objetivo o grado escolar, ej: "Niños de 3er grado de primaria".'),
    global_score: zod_1.z.number().int().describe('La suma total de los puntajes de todas las actividades.'),
    theme: exports.ThemeSettingsSchema.describe('Configuración visual y temática inteligente.'),
    activities: zod_1.z.array(exports.ActivitySchema).min(1).describe('Lista de actividades pedagógicas generadas. Cada una debe ser de un tipo distinto si es posible.'),
    global_rubric: exports.GlobalRubricSchema.describe('La rúbrica de evaluación global para la guía.')
});
