"use client";

import { useState } from "react";
import {
  BookOpenText,
  Boxes,
  FileStack,
  FolderCog,
  Languages,
  LayoutTemplate,
  LibraryBig,
  ListChecks,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  activityCatalog,
  activityLookup,
  activityPresets,
  gradeOptions,
  type SelectedActivity,
} from "@/lib/work-guide-options";

interface GeneratorFormProps {
  topic: string;
  targetAudience: string;
  language: string;
  selectedActivities: SelectedActivity[];
  status: "idle" | "loading" | "generating" | "completed" | "error";
  error: string | null;
  onTopicChange: (value: string) => void;
  onTargetAudienceChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onToggleActivity: (activityId: string, checked: boolean) => void;
  onActivityCountChange: (activityId: string, count: number | "") => void;
  onApplyActivities: (activities: SelectedActivity[]) => void;
  onOpenTemplates: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const familyIcons = {
  Exploracion: LibraryBig,
  Comprension: BookOpenText,
  Verificacion: ListChecks,
} as const;

const familyDescriptions = {
  Exploracion:
    "Actividades para abrir el tema con vocabulario, pistas y reconocimiento rapido.",
  Comprension:
    "Bloques para fijar ideas clave y comprobar relaciones entre conceptos.",
  Verificacion:
    "Actividades de chequeo final para detectar comprension, errores o vacios.",
} as const;

function getPresetKey(activities: SelectedActivity[]) {
  const serialized = activities
    .map((activity) => `${activity.id}:${activity.count}`)
    .sort()
    .join("|");

  return (
    activityPresets.find((preset) => {
      const presetKey = preset.activities
        .map((activity) => `${activity.id}:${activity.count}`)
        .sort()
        .join("|");

      return presetKey === serialized;
    })?.id ?? "custom"
  );
}

export function GeneratorForm({
  topic,
  targetAudience,
  language,
  selectedActivities,
  status,
  error,
  onTopicChange,
  onTargetAudienceChange,
  onLanguageChange,
  onToggleActivity,
  onActivityCountChange,
  onApplyActivities,
  onOpenTemplates,
  onSubmit,
}: GeneratorFormProps) {
  const isSubmitting = status === "loading";
  const [showCatalog, setShowCatalog] = useState(false);
  const selectedPresetId = getPresetKey(selectedActivities);
  const activityGroups = activityCatalog.reduce<
    Record<string, (typeof activityCatalog)[number][]>
  >((groups, activity) => {
    groups[activity.family] ??= [];
    groups[activity.family].push(activity);
    return groups;
  }, {});
  const totalBlocks = selectedActivities.reduce(
    (sum, activity) => sum + (typeof activity.count === "number" ? activity.count : 0),
    0,
  );
  const estimatedScore = selectedActivities.length
    ? Math.max(100, totalBlocks * 6)
    : 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] fade-in">
      <form className="grid gap-6" onSubmit={onSubmit}>
        <Card className="paper-panel overflow-hidden bg-card/95">
          <CardHeader className="gap-4 border-b border-border/60 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="section-kicker">
                <LayoutTemplate className="size-3.5" />
                Paso 1
              </span>
              <span className="rounded-full border border-[rgba(33,62,74,0.1)] bg-white/80 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                Base editorial
              </span>
            </div>
            <div className="space-y-2">
              <CardTitle className="font-display text-3xl">
                Define la clase que quieres convertir en guia.
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6">
                Este primer bloque no pide tecnicismos. Solo tema, curso e
                idioma para que el sistema entienda el contexto real del aula.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="topic">Tema de la guia</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(event) => onTopicChange(event.target.value)}
                  placeholder="Ejemplo: ecosistemas, fracciones equivalentes, independencia de Colombia"
                  disabled={isSubmitting}
                  className="h-[3.25rem] rounded-[1.3rem] border-[rgba(33,62,74,0.12)] bg-[rgba(255,255,255,0.82)] px-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Curso o grupo</Label>
                <Select
                  disabled={isSubmitting}
                  value={targetAudience}
                  onValueChange={onTargetAudienceChange}
                >
                  <SelectTrigger className="h-[3.25rem] rounded-[1.3rem] border-[rgba(33,62,74,0.12)] bg-[rgba(255,255,255,0.82)]">
                    <SelectValue placeholder="Selecciona un grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select
                  disabled={isSubmitting}
                  value={language}
                  onValueChange={onLanguageChange}
                >
                  <SelectTrigger className="h-[3.25rem] rounded-[1.3rem] border-[rgba(33,62,74,0.12)] bg-[rgba(255,255,255,0.82)]">
                    <SelectValue placeholder="Selecciona un idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Espanol</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="paper-panel overflow-hidden bg-card/95">
          <CardHeader className="gap-4 border-b border-border/60 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="section-kicker">
                <Boxes className="size-3.5" />
                Paso 2
              </span>
              <span className="rounded-full border border-[rgba(33,62,74,0.1)] bg-white/80 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                Receta pedagogica
              </span>
            </div>
            <div className="space-y-2">
              <CardTitle className="font-display text-3xl">
                Elige una mezcla docente y personalizala solo si hace falta.
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6">
                La interfaz deja visibles unas recetas claras y guarda el
                catalogo completo como una segunda capa. Menos ruido, mejor
                criterio.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6">
            <div className="grid gap-4 xl:grid-cols-2">
              {activityPresets.map((preset) => {
                const active = selectedPresetId === preset.id;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`text-left rounded-[1.7rem] border p-5 transition ${
                      active
                        ? "border-[rgba(34,74,108,0.35)] bg-[linear-gradient(160deg,rgba(236,245,248,0.94),rgba(255,248,232,0.94))] shadow-[0_18px_38px_rgba(34,74,108,0.12)]"
                        : "border-[rgba(33,62,74,0.12)] bg-[rgba(255,255,255,0.84)] hover:border-[rgba(34,74,108,0.22)]"
                    }`}
                    onClick={() => {
                      onApplyActivities(preset.activities);
                      setShowCatalog(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                          {preset.label}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {preset.description}
                        </p>
                      </div>
                      {active ? (
                        <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary-foreground)]">
                          Activa
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                      {preset.note}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {preset.activities.map((activity) => (
                        <span
                          key={activity.id}
                          className="rounded-full border border-[rgba(33,62,74,0.12)] bg-white/88 px-3 py-1 text-xs font-medium text-foreground"
                        >
                          {activityLookup[activity.id].label} x {activity.count}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.7rem] border border-dashed border-[rgba(33,62,74,0.18)] bg-[rgba(248,244,234,0.74)] px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Personalizar mezcla de actividades
                </p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  Activa el catalogo detallado solo si necesitas salirte de los
                  presets.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-[rgba(33,62,74,0.14)] bg-white/80"
                  onClick={() => setShowCatalog((current) => !current)}
                >
                  <Sparkles className="size-4" />
                  {showCatalog ? "Ocultar catalogo" : "Personalizar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-[rgba(33,62,74,0.14)] bg-white/80"
                  onClick={onOpenTemplates}
                >
                  <FolderCog className="size-4" />
                  Plantillas
                </Button>
              </div>
            </div>

            {showCatalog ? (
              <div className="grid gap-5">
                {Object.entries(activityGroups).map(([family, activities]) => {
                  const Icon =
                    familyIcons[family as keyof typeof familyIcons] ?? Boxes;

                  return (
                    <section
                      key={family}
                      className="rounded-[1.8rem] border border-[rgba(33,62,74,0.12)] bg-[rgba(255,255,255,0.82)] p-5"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="grid size-11 place-items-center rounded-[1.1rem] bg-[rgba(34,74,108,0.1)] text-[var(--primary)]">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-2xl text-foreground">
                            {family}
                          </h3>
                          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
                            {
                              familyDescriptions[
                                family as keyof typeof familyDescriptions
                              ]
                            }
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        {activities.map((activity) => {
                          const selected = selectedActivities.find(
                            (item) => item.id === activity.id,
                          );

                          return (
                            <article
                              key={activity.id}
                              className={`rounded-[1.6rem] border p-4 transition ${
                                selected
                                  ? "border-[rgba(34,74,108,0.26)] bg-[linear-gradient(160deg,rgba(239,247,250,0.9),rgba(255,250,241,0.9))]"
                                  : "border-[rgba(33,62,74,0.1)] bg-[rgba(252,251,248,0.92)]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-foreground">
                                      {activity.label}
                                    </p>
                                    <span className="rounded-full bg-[rgba(207,170,61,0.18)] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgb(111,88,18)]">
                                      {activity.purpose}
                                    </span>
                                  </div>
                                  <p className="text-sm leading-6 text-[var(--ink-soft)]">
                                    {activity.summary}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                                    selected
                                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                                      : "border border-[rgba(33,62,74,0.14)] bg-white text-[var(--ink-soft)] hover:border-[rgba(34,74,108,0.28)]"
                                  }`}
                                  onClick={() =>
                                    onToggleActivity(activity.id, !selected)
                                  }
                                >
                                  {selected ? "Activa" : "Agregar"}
                                </button>
                              </div>

                              <div className="mt-4 flex items-center justify-between gap-3 rounded-[1.2rem] border border-[rgba(33,62,74,0.08)] bg-white/78 px-3 py-3">
                                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                  <Languages className="size-3.5" />
                                  Cantidad de items
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon-sm"
                                    className="rounded-full border-[rgba(33,62,74,0.14)] bg-white"
                                    disabled={isSubmitting || !selected}
                                    onClick={() => {
                                      const current =
                                        typeof selected?.count === "number"
                                          ? selected.count
                                          : activity.defaultCount;
                                      onActivityCountChange(
                                        activity.id,
                                        Math.max(1, current - 1),
                                      );
                                    }}
                                  >
                                    <Minus className="size-4" />
                                  </Button>
                                  <div className="min-w-10 text-center text-sm font-semibold text-foreground">
                                    {selected?.count ?? activity.defaultCount}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon-sm"
                                    className="rounded-full border-[rgba(33,62,74,0.14)] bg-white"
                                    disabled={isSubmitting || !selected}
                                    onClick={() => {
                                      const current =
                                        typeof selected?.count === "number"
                                          ? selected.count
                                          : activity.defaultCount;
                                      onActivityCountChange(
                                        activity.id,
                                        Math.min(20, current + 1),
                                      );
                                    }}
                                  >
                                    <Plus className="size-4" />
                                  </Button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="paper-panel overflow-hidden bg-card/95">
          <CardHeader className="gap-4 border-b border-border/60 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="section-kicker">
                <FileStack className="size-3.5" />
                Paso 3
              </span>
              <span className="rounded-full border border-[rgba(33,62,74,0.1)] bg-white/80 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                Ajuste final
              </span>
            </div>
            <div className="space-y-2">
              <CardTitle className="font-display text-3xl">
                Lanza una guia con criterio visual y estructura clara.
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6">
                El sistema guarda la guia en tu biblioteca y la deja lista para
                revision y exportacion dentro del mismo flujo.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 pt-6">
            <div className="rounded-[1.7rem] border border-dashed border-[rgba(33,62,74,0.18)] bg-[rgba(248,244,234,0.74)] px-4 py-4 text-sm leading-6 text-[var(--ink-soft)]">
              Se mostraran primero las decisiones docentes esenciales. El resto
              del detalle queda para la vista previa y exportacion.
            </div>

            {error ? (
              <div className="rounded-[1.5rem] border border-[rgba(181,60,40,0.22)] bg-[rgba(181,60,40,0.08)] px-4 py-3 text-sm text-[rgb(136,43,28)]">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                La solicitud se procesa en tu sesion y luego pasa a biblioteca o
                mesa de revision sin saltos de contexto.
              </p>
              <Button
                className="h-12 rounded-full bg-[var(--primary)] px-6 text-[var(--primary-foreground)] shadow-[0_18px_35px_rgba(34,74,108,0.24)]"
                type="submit"
                disabled={isSubmitting}
              >
                <Sparkles className="size-4" />
                {isSubmitting ? "Preparando solicitud..." : "Generar guia"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <aside className="grid gap-5 xl:sticky xl:top-6 xl:self-start">
        <Card className="paper-panel overflow-hidden bg-[linear-gradient(180deg,rgba(255,252,245,0.96),rgba(242,248,247,0.98))]">
          <CardHeader className="gap-4 border-b border-border/60 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="section-kicker">
                <Sparkles className="size-3.5" />
                Tu guia se vera asi
              </span>
            </div>
            <CardTitle className="font-display text-3xl">
              Una portada clara, una mezcla equilibrada y salida lista para aula.
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 pt-6">
            <div className="rounded-[1.8rem] border border-[rgba(33,62,74,0.1)] bg-[linear-gradient(160deg,rgba(255,255,255,0.88),rgba(245,240,228,0.88))] p-5 shadow-[0_20px_36px_rgba(27,42,61,0.12)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Borrador editorial
                  </p>
                  <h3 className="mt-3 font-display text-3xl text-foreground">
                    {topic || "Tema por definir"}
                  </h3>
                </div>
                <span className="rounded-full bg-[rgba(207,170,61,0.18)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgb(111,88,18)]">
                  {targetAudience}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <article className="rounded-[1.3rem] bg-white/74 px-3 py-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Idioma
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {language === "en" ? "English" : "Espanol"}
                  </p>
                </article>
                <article className="rounded-[1.3rem] bg-white/74 px-3 py-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Actividades
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {selectedActivities.length}
                  </p>
                </article>
                <article className="rounded-[1.3rem] bg-white/74 px-3 py-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Puntaje estimado
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {estimatedScore}
                  </p>
                </article>
              </div>
            </div>

            <article className="rounded-[1.6rem] border border-[rgba(33,62,74,0.1)] bg-[rgba(255,255,255,0.82)] p-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Receta actual
              </p>
              <ul className="mt-4 grid gap-3 text-sm text-foreground">
                {selectedActivities.length > 0 ? (
                  selectedActivities.map((activity) => (
                    <li
                      key={activity.id}
                      className="flex items-start justify-between gap-3 rounded-[1.2rem] bg-[rgba(245,241,232,0.72)] px-3 py-3"
                    >
                      <div>
                        <p className="font-semibold">
                          {activityLookup[activity.id]?.label ?? activity.id}
                        </p>
                        <p className="mt-1 text-xs text-[var(--ink-soft)]">
                          {activityLookup[activity.id]?.purpose}
                        </p>
                      </div>
                      <span className="rounded-full border border-[rgba(33,62,74,0.1)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                        x {activity.count || "-"}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-[var(--ink-soft)]">
                    Selecciona al menos una actividad.
                  </li>
                )}
              </ul>
            </article>

            <article className="rounded-[1.6rem] border border-[rgba(33,62,74,0.1)] bg-[rgba(255,255,255,0.82)] p-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Lo que se promete
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.2rem] bg-[rgba(240,247,246,0.78)] px-3 py-3 text-sm leading-6 text-[var(--ink-soft)]">
                  Material con mezcla pedagogica visible, no una secuencia
                  arbitraria de ejercicios.
                </div>
                <div className="rounded-[1.2rem] bg-[rgba(247,241,228,0.78)] px-3 py-3 text-sm leading-6 text-[var(--ink-soft)]">
                  Salida pensada para revision, biblioteca y exportacion sin
                  cambiar de espacio.
                </div>
              </div>
            </article>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
