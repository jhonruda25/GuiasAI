"use client";

import {
  FileCheck2,
  Loader2,
  NotebookPen,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GenerationStatusPanelProps {
  topic: string;
  guideId: string | null;
}

const steps = [
  {
    icon: Sparkles,
    label: "Construyendo actividades",
    detail: "La mezcla pedagogica ya paso a produccion.",
    state: "done",
  },
  {
    icon: NotebookPen,
    label: "Ajustando formato y claridad",
    detail: "Se esta armando la estructura editorial de la guia.",
    state: "current",
  },
  {
    icon: ShieldCheck,
    label: "Preparando revision y exportacion",
    detail: "La pieza final quedara lista para abrirse en mesa de revision.",
    state: "upcoming",
  },
] as const;

export function GenerationStatusPanel({
  topic,
  guideId,
}: GenerationStatusPanelProps) {
  return (
    <Card className="paper-panel overflow-hidden bg-[linear-gradient(160deg,rgba(255,251,242,0.96),rgba(239,247,249,0.98))] shadow-[0_24px_60px_rgba(19,36,53,0.12)]">
      <CardHeader className="gap-5 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="section-kicker">
            <Loader2 className="size-3.5 animate-spin" />
            Produccion en curso
          </span>
          {guideId ? (
            <span className="rounded-full border border-[rgba(33,62,74,0.1)] bg-white/80 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
              ID {guideId}
            </span>
          ) : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)]">
          <div className="space-y-3">
            <CardTitle className="font-display text-3xl">
              Tu guia esta entrando al taller editorial.
            </CardTitle>
            <p className="max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
              El sistema esta organizando contenido, formato y estructura para
              que luego abras la pieza como documento de trabajo y no como un
              estado intermedio sin forma.
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-[rgba(33,62,74,0.1)] bg-white/80 p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Tema en produccion
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {topic || "Nueva guia"}
            </p>
            <div className="mt-4 flex items-center gap-3 text-sm text-[var(--ink-soft)]">
              <FileCheck2 className="size-4 text-[var(--primary)]" />
              Cuando termine, aparecera en tu biblioteca y mesa de revision.
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 pt-6">
        <div className="grid gap-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Avance estimado</span>
            <span className="font-medium text-foreground">66%</span>
          </div>
          <Progress value={66} className="h-2.5 rounded-full" />
        </div>

        <div className="grid gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.label}
                className={`flex items-start gap-4 rounded-[1.6rem] border p-4 ${
                  step.state === "current"
                    ? "border-[rgba(34,74,108,0.22)] bg-[rgba(240,247,250,0.92)]"
                    : "border-[rgba(33,62,74,0.1)] bg-[rgba(255,255,255,0.8)]"
                }`}
              >
                <div
                  className={`inline-flex size-11 shrink-0 items-center justify-center rounded-[1.2rem] ${
                    step.state === "current"
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : step.state === "done"
                        ? "bg-[rgba(42,125,93,0.12)] text-[rgb(30,99,73)]"
                        : "bg-[rgba(207,170,61,0.14)] text-[rgb(111,88,18)]"
                  }`}
                >
                  <Icon className={`size-5 ${index === 1 ? "animate-pulse" : ""}`} />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{step.label}</p>
                  <p className="text-sm leading-6 text-[var(--ink-soft)]">
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
