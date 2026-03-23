export interface SelectedActivity {
  id: string;
  count: number | "";
}

export const gradeOptions = [
  "Transicion",
  "Primero (1o)",
  "Segundo (2o)",
  "Tercero (3o)",
  "Cuarto (4o)",
  "Quinto (5o)",
  "Sexto (6o)",
  "Septimo (7o)",
  "Octavo (8o)",
  "Noveno (9o)",
  "Decimo (10o)",
  "Once (11o)",
] as const;

export const activityCatalog = [
  { id: "WORD_SEARCH", label: "Sopa de letras", defaultCount: 8 },
  { id: "CROSSWORD", label: "Crucigrama", defaultCount: 6 },
  { id: "FILL_BLANKS", label: "Completar espacios", defaultCount: 5 },
  { id: "MATCH_CONCEPTS", label: "Relacionar conceptos", defaultCount: 5 },
  { id: "SEQUENTIAL_IMAGE_ANALYSIS", label: "Analisis de imagenes", defaultCount: 4 },
  { id: "MULTIPLE_CHOICE", label: "Seleccion multiple", defaultCount: 5 },
  { id: "TRUE_FALSE", label: "Verdadero o falso", defaultCount: 5 },
  { id: "WORD_SCRAMBLE", label: "Palabras revueltas", defaultCount: 5 },
  { id: "DICTATION", label: "Dictado", defaultCount: 3 },
  { id: "SENTENCE_ORDER", label: "Ordenar oraciones", defaultCount: 4 },
  { id: "ERROR_IDENTIFICATION", label: "Identificar errores", defaultCount: 4 },
  { id: "TABLE_COMPLETION", label: "Completar tabla", defaultCount: 3 },
  { id: "BONUS", label: "Reto bonus", defaultCount: 1 },
] as const;

export const activityInstructionLabels: Record<string, string> = {
  WORD_SEARCH: "Sopa de letras",
  CROSSWORD: "Crucigrama",
  FILL_BLANKS: "Completar espacios",
  MATCH_CONCEPTS: "Relacionar conceptos",
  SEQUENTIAL_IMAGE_ANALYSIS: "Secuencia de imagenes",
  MULTIPLE_CHOICE: "Seleccion multiple",
  TRUE_FALSE: "Verdadero o falso",
  WORD_SCRAMBLE: "Palabras revueltas",
  DICTATION: "Dictado",
  SENTENCE_ORDER: "Ordenar oraciones",
  ERROR_IDENTIFICATION: "Identificar errores",
  TABLE_COMPLETION: "Completar tabla",
  BONUS: "Reto bonus",
};
