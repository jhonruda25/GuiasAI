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

export const supportedActivityIds = [
  "WORD_SEARCH",
  "CROSSWORD",
  "FILL_BLANKS",
  "MATCH_CONCEPTS",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "WORD_SCRAMBLE",
] as const;

export type SupportedActivityId = (typeof supportedActivityIds)[number];

export interface ActivityDefinition {
  id: SupportedActivityId;
  label: string;
  defaultCount: number;
  family: "Exploracion" | "Comprension" | "Verificacion";
  purpose: string;
  summary: string;
}

export interface ActivityPreset {
  id: string;
  label: string;
  description: string;
  note: string;
  activities: Array<{ id: SupportedActivityId; count: number }>;
}

export const activityCatalog: ActivityDefinition[] = [
  {
    id: "WORD_SEARCH",
    label: "Sopa de letras",
    defaultCount: 8,
    family: "Exploracion",
    purpose: "Activar vocabulario clave",
    summary: "Ideal para abrir clase y fijar terminos del tema.",
  },
  {
    id: "CROSSWORD",
    label: "Crucigrama",
    defaultCount: 6,
    family: "Exploracion",
    purpose: "Relacionar pistas con conceptos",
    summary: "Convierte definiciones en una dinamica mas memorable.",
  },
  {
    id: "WORD_SCRAMBLE",
    label: "Palabras revueltas",
    defaultCount: 5,
    family: "Exploracion",
    purpose: "Practicar escritura y reconocimiento",
    summary: "Sirve para repaso veloz y cierre de clase.",
  },
  {
    id: "FILL_BLANKS",
    label: "Completar espacios",
    defaultCount: 5,
    family: "Comprension",
    purpose: "Evaluar lectura guiada",
    summary: "Comprueba si el estudiante retiene ideas centrales.",
  },
  {
    id: "MATCH_CONCEPTS",
    label: "Relacionar conceptos",
    defaultCount: 5,
    family: "Comprension",
    purpose: "Conectar terminos y significados",
    summary: "Funciona bien para ciencias, sociales y lenguaje.",
  },
  {
    id: "MULTIPLE_CHOICE",
    label: "Seleccion multiple",
    defaultCount: 5,
    family: "Verificacion",
    purpose: "Comprobar dominio puntual",
    summary: "Rapida de calificar y util para control corto.",
  },
  {
    id: "TRUE_FALSE",
    label: "Verdadero o falso",
    defaultCount: 5,
    family: "Verificacion",
    purpose: "Detectar ideas correctas o mitos",
    summary: "Buen complemento para una revision final.",
  },
] as const;

export const activityInstructionLabels: Record<string, string> = {
  WORD_SEARCH: "Sopa de letras",
  CROSSWORD: "Crucigrama",
  FILL_BLANKS: "Completar espacios",
  MATCH_CONCEPTS: "Relacionar conceptos",
  MULTIPLE_CHOICE: "Seleccion multiple",
  TRUE_FALSE: "Verdadero o falso",
  WORD_SCRAMBLE: "Palabras revueltas",
};

export const activityPresets: ActivityPreset[] = [
  {
    id: "balanced",
    label: "Evaluacion variada",
    description: "La mezcla base recomendada para una guia completa.",
    note: "Combina exploracion, comprension y verificacion final.",
    activities: [
      { id: "WORD_SEARCH", count: 8 },
      { id: "FILL_BLANKS", count: 5 },
      { id: "MATCH_CONCEPTS", count: 5 },
      { id: "MULTIPLE_CHOICE", count: 5 },
      { id: "TRUE_FALSE", count: 5 },
    ],
  },
  {
    id: "reinforcement",
    label: "Refuerzo visual",
    description: "Arranque ludico con vocabulario y asociaciones clave.",
    note: "Sirve para introducir o reforzar una unidad.",
    activities: [
      { id: "WORD_SEARCH", count: 8 },
      { id: "CROSSWORD", count: 6 },
      { id: "MATCH_CONCEPTS", count: 5 },
      { id: "TRUE_FALSE", count: 4 },
    ],
  },
  {
    id: "quick-check",
    label: "Repaso rapido",
    description: "Pensado para control corto o cierre de clase.",
    note: "Reduce carga de lectura y acelera revision.",
    activities: [
      { id: "MATCH_CONCEPTS", count: 4 },
      { id: "MULTIPLE_CHOICE", count: 4 },
      { id: "TRUE_FALSE", count: 4 },
    ],
  },
  {
    id: "literacy",
    label: "Lectura y vocabulario",
    description: "Mas peso en reconocimiento de terminos y escritura.",
    note: "Util para primaria y trabajo de conceptos.",
    activities: [
      { id: "WORD_SEARCH", count: 8 },
      { id: "WORD_SCRAMBLE", count: 5 },
      { id: "FILL_BLANKS", count: 5 },
      { id: "CROSSWORD", count: 6 },
    ],
  },
] as const;

export const activityLookup: Record<string, ActivityDefinition> =
  Object.fromEntries(
    activityCatalog.map((activity) => [activity.id, activity]),
  ) as Record<string, ActivityDefinition>;

export const defaultPresetActivities: SelectedActivity[] = activityPresets[0]
  .activities.map((activity) => ({
    id: activity.id,
    count: activity.count,
  }));

export function isSupportedActivityId(
  value: string,
): value is SupportedActivityId {
  return supportedActivityIds.includes(value as SupportedActivityId);
}

export function normalizeSelectedActivities(
  activities: SelectedActivity[],
): SelectedActivity[] {
  const seen = new Set<string>();

  return activities
    .filter((activity) => isSupportedActivityId(activity.id))
    .filter((activity) => {
      if (seen.has(activity.id)) {
        return false;
      }

      seen.add(activity.id);
      return true;
    })
    .map((activity) => ({
      id: activity.id,
      count:
        typeof activity.count === "number" && activity.count > 0
          ? activity.count
          : activityLookup[activity.id].defaultCount,
    }));
}
