"use client";

import { FolderCog, Languages, WandSparkles } from "lucide-react";
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
  onOpenTemplates: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
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
  onOpenTemplates,
  onSubmit,
}: GeneratorFormProps) {
  const isSubmitting = status === "loading";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] fade-in">
      <Card className="overflow-hidden border-border/70 bg-card/92 shadow-[0_24px_80px_rgba(19,36,53,0.12)]">
        <CardHeader className="gap-4 border-b border-border/70">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <WandSparkles className="size-3.5" />
            Editor de generacion
          </div>
          <div className="space-y-2">
            <CardTitle className="font-display text-3xl">
              Configura tu guia
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">
              Define tema, nivel y mezcla de actividades. La interfaz esta
              pensada para que puedas ajustar la carga pedagogica sin perder
              velocidad.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="grid gap-6" onSubmit={onSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="topic">Tema de la guia</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(event) => onTopicChange(event.target.value)}
                  placeholder="Ejemplo: ecosistemas, fracciones equivalentes, independencia de Colombia"
                  disabled={isSubmitting}
                  className="h-12 rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Grado o grupo</Label>
                <Select
                  disabled={isSubmitting}
                  value={targetAudience}
                  onValueChange={onTargetAudienceChange}
                >
                  <SelectTrigger className="h-12 rounded-2xl">
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
                  <SelectTrigger className="h-12 rounded-2xl">
                    <SelectValue placeholder="Selecciona un idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Espanol</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Actividades y volumen</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Activa solo las dinamicas que necesites. Puedes ajustar la
                    cantidad por bloque.
                  </p>
                </div>
                <Button
                  className="rounded-full"
                  type="button"
                  variant="outline"
                  onClick={onOpenTemplates}
                >
                  <FolderCog className="size-4" />
                  Plantillas
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {activityCatalog.map((activity) => {
                  const selected = selectedActivities.find(
                    (item) => item.id === activity.id,
                  );

                  return (
                    <label
                      key={activity.id}
                      className="grid gap-3 rounded-[var(--radius-3xl)] border border-border/70 bg-background/80 p-4 transition hover:border-primary/40 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-sm font-semibold text-foreground">
                            {activity.label}
                          </span>
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                            {activity.id}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="mt-1 size-4 rounded border-border text-primary focus:ring-primary"
                          checked={Boolean(selected)}
                          onChange={(event) =>
                            onToggleActivity(activity.id, event.target.checked)
                          }
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          <Languages className="size-3.5" />
                          Cantidad
                        </span>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          className="h-10 w-24 rounded-full text-center"
                          disabled={isSubmitting || !selected}
                          value={selected?.count ?? ""}
                          onChange={(event) => {
                            const value = event.target.value;
                            onActivityCountChange(
                              activity.id,
                              value === ""
                                ? ""
                                : Number.parseInt(value, 10),
                            );
                          }}
                        />
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {error ? (
              <div className="rounded-[var(--radius-2xl)] border border-[color:rgba(181,60,40,0.25)] bg-[rgba(181,60,40,0.08)] px-4 py-3 text-sm text-[rgb(136,43,28)]">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-muted-foreground">
                Se generara una guia protegida por tu sesion, lista para
                revision y descarga.
              </p>
              <Button
                className="h-12 rounded-full px-6"
                type="submit"
                disabled={isSubmitting}
              >
                <WandSparkles className="size-4" />
                {isSubmitting ? "Preparando solicitud..." : "Generar guia"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(240,248,247,0.92),rgba(255,251,242,0.94))]">
        <CardHeader className="gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Resumen editorial
          </div>
          <CardTitle className="font-display text-3xl">
            Antes de generar
          </CardTitle>
          <CardDescription className="leading-6">
            Esta vista te ayuda a confirmar el balance didactico antes de
            enviar la solicitud a la IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <article className="rounded-[var(--radius-3xl)] border border-border/70 bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Tema
            </p>
            <p className="mt-2 font-medium text-foreground">
              {topic || "Sin definir"}
            </p>
          </article>
          <article className="rounded-[var(--radius-3xl)] border border-border/70 bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Grado e idioma
            </p>
            <p className="mt-2 font-medium text-foreground">
              {targetAudience} · {language === "en" ? "English" : "Espanol"}
            </p>
          </article>
          <article className="rounded-[var(--radius-3xl)] border border-border/70 bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Actividades seleccionadas
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-foreground">
              {selectedActivities.length > 0 ? (
                selectedActivities.map((activity) => (
                  <li
                    key={activity.id}
                    className="flex items-center justify-between gap-3 rounded-full bg-card px-3 py-2"
                  >
                    <span>
                      {activityCatalog.find((item) => item.id === activity.id)
                        ?.label ?? activity.id}
                    </span>
                    <span className="text-muted-foreground">
                      {activity.count || "-"}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">
                  Selecciona al menos una actividad.
                </li>
              )}
            </ul>
          </article>
        </CardContent>
      </Card>
    </div>
  );
}
