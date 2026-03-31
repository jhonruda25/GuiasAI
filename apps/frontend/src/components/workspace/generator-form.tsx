"use client";

import { useState } from "react";
import Image from "next/image";
import { FolderCog, Lightbulb, Sparkles } from "lucide-react";
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
  const totalBlocks = selectedActivities.reduce(
    (sum, activity) =>
      sum + (typeof activity.count === "number" ? activity.count : 0),
    0,
  );
  const estimatedScore = selectedActivities.length
    ? Math.max(100, totalBlocks * 6)
    : 0;

  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1.18fr)_minmax(21rem,0.82fr)] fade-in">
      <Card className="paper-panel overflow-hidden border-[rgba(33,62,74,0.14)] bg-card/95 shadow-[0_24px_48px_rgba(20,34,56,0.1)]">
        <CardHeader className="gap-3 border-b border-border/60 pb-5">
          <span className="section-kicker">Modo generador</span>
          <CardTitle className="font-display text-3xl">
            Elige el destino de tu aprendizaje.
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            Configura los parametros clave y deja que la IA arme la guia con
            estructura editorial y enfoque docente.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="relative mb-6 overflow-hidden rounded-[1.6rem] border border-[rgba(33,62,74,0.12)] bg-[rgba(255,255,255,0.7)] p-3">
            <div className="relative h-36 overflow-hidden rounded-[1.2rem]">
              <Image
                src="/assets/covers/cover-freepik-education.jpg"
                alt="Cover editorial para guias"
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 760px"
              />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(12,30,52,0.64),rgba(12,30,52,0.24)_55%,rgba(231,184,94,0.34))]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/80">
                    Modo studio
                  </p>
                  <p className="mt-1 font-display text-2xl leading-none text-white">
                    Composicion visual con portada
                  </p>
                </div>
                <span className="rounded-full border border-white/35 bg-white/16 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                  Nuevo
                </span>
              </div>
            </div>
          </div>

          <form className="grid gap-6" onSubmit={onSubmit}>
            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="topic">Tema</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(event) => onTopicChange(event.target.value)}
                  placeholder="Ejemplo: ecosistemas, fracciones, independencia de Colombia"
                  disabled={isSubmitting}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Curso</Label>
                <Select
                  disabled={isSubmitting}
                  value={targetAudience}
                  onValueChange={onTargetAudienceChange}
                >
                  <SelectTrigger className="h-12 rounded-xl">
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
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Selecciona un idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Espanol</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm font-semibold">Presets sugeridos</Label>
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {selectedPresetId === "custom" ? "Personalizada" : "Preset"}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {activityPresets.map((preset) => {
                  const active = selectedPresetId === preset.id;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`rounded-xl border p-4 text-left transition ${
                        active
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/70 bg-white/80 hover:border-primary/25"
                      }`}
                      onClick={() => {
                        onApplyActivities(preset.activities);
                        setShowCatalog(false);
                      }}
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {preset.label}
                      </p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-dashed border-border/70 bg-[rgba(238,244,250,0.55)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-[var(--ink-soft)]">
                  Personaliza el catalogo si necesitas ajustar profundidad.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setShowCatalog((current) => !current)}
                  >
                    {showCatalog ? "Ocultar" : "Personalizar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={onOpenTemplates}
                  >
                    <FolderCog className="size-4" />
                    Plantillas
                  </Button>
                </div>
              </div>
            </section>

            {showCatalog ? (
              <section className="grid gap-3 sm:grid-cols-2">
                {activityCatalog.map((activity) => {
                  const selected = selectedActivities.find(
                    (item) => item.id === activity.id,
                  );

                  return (
                    <article
                      key={activity.id}
                      className={`rounded-xl border p-4 ${
                        selected
                          ? "border-primary/35 bg-primary/5"
                          : "border-border/70 bg-white/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {activity.label}
                          </p>
                          <p className="text-xs text-[var(--ink-soft)]">
                            {activity.purpose}
                          </p>
                        </div>
                        <button
                          type="button"
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "border border-border/70 bg-white text-[var(--ink-soft)]"
                          }`}
                          onClick={() => onToggleActivity(activity.id, !selected)}
                        >
                          {selected ? "Activa" : "Agregar"}
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          Cantidad
                        </span>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          className="h-9 w-20 rounded-full text-center"
                          disabled={isSubmitting || !selected}
                          value={selected?.count ?? ""}
                          onChange={(event) => {
                            const value = event.target.value;
                            onActivityCountChange(
                              activity.id,
                              value === "" ? "" : Number.parseInt(value, 10),
                            );
                          }}
                        />
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-[rgba(181,60,40,0.22)] bg-[rgba(181,60,40,0.08)] px-4 py-3 text-sm text-[rgb(136,43,28)]">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--ink-soft)]">
                La guia quedara en tu biblioteca y luego en vista previa.
              </p>
              <Button
                className="h-12 rounded-full bg-[linear-gradient(120deg,var(--primary),#3569b7)] px-6 shadow-[0_14px_28px_rgba(32,70,131,0.3)]"
                type="submit"
                disabled={isSubmitting}
              >
                <Sparkles className="size-4" />
                {isSubmitting ? "Preparando..." : "Generar guia"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <Card className="paper-panel overflow-hidden border-[rgba(33,62,74,0.14)] bg-card/95">
          <CardHeader className="gap-2 border-b border-border/60 pb-4">
            <CardTitle className="font-display text-2xl">Resumen</CardTitle>
            <CardDescription className="text-sm text-[var(--ink-soft)]">
              Vista rapida de lo que vas a generar.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
            <div className="relative overflow-hidden rounded-[1.4rem] border border-[rgba(33,62,74,0.12)] bg-[linear-gradient(135deg,rgba(34,74,108,0.95),rgba(102,132,148,0.9),rgba(177,215,122,0.8))] p-4 text-white">
              <Image
                src="/assets/covers/cover-freepik-education.jpg"
                alt="Preview visual de portada"
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 360px"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_44%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(16,30,50,0.58),rgba(16,30,50,0.16)_56%,rgba(231,184,94,0.22))]" />
              <div className="relative">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/80">
                  Contexto visual
                </p>
                <p className="mt-2 font-display text-2xl leading-tight">
                  {topic || "Nueva guia"}
                </p>
                <p className="mt-1 text-sm text-white/80">
                  {targetAudience} / {language === "en" ? "English" : "Espanol"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Tema
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {topic || "Tema por definir"}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-xl border border-border/70 bg-white/80 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Curso
                </p>
                <p className="mt-1 text-sm font-semibold">{targetAudience}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-white/80 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Actividades
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {selectedActivities.length}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-white/80 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Puntaje estimado
                </p>
                <p className="mt-1 text-sm font-semibold">{estimatedScore}</p>
              </div>
            </div>
            <ul className="grid gap-2">
              {selectedActivities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-white/80 px-3 py-2 text-sm"
                >
                  <span>{activityLookup[activity.id]?.label ?? activity.id}</span>
                  <span className="text-[var(--ink-soft)]">x {activity.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <article className="flex items-start gap-3 rounded-[1.3rem] border border-[rgba(34,74,108,0.18)] bg-[rgba(227,239,249,0.72)] p-4 text-sm leading-6 text-[var(--ink-soft)]">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" />
          <span>
            Para temas complejos, combina <strong>Comprension</strong> y{" "}
            <strong>Verificacion</strong> para mejorar retencion y evaluacion.
          </span>
        </article>
      </div>
    </div>
  );
}
