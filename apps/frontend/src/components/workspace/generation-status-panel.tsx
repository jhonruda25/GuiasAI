"use client";

import Image from "next/image";
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
    <Card className="paper-panel overflow-hidden border-[rgba(33,62,74,0.14)] bg-[linear-gradient(160deg,rgba(255,252,245,0.98),rgba(236,245,251,0.98))] shadow-[0_26px_56px_rgba(19,36,53,0.14)]">
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
              Tu guia entro al taller editorial.
            </CardTitle>
            <p className="max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
              El sistema esta organizando contenido, formato y estructura para
              que luego abras la pieza como documento de trabajo y no como un
              estado intermedio sin forma.
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-[rgba(33,62,74,0.1)] bg-white/80 p-4">
            <div className="relative h-28 overflow-hidden rounded-[1.2rem] border border-[rgba(33,62,74,0.1)]">
              <Image
                src="/assets/covers/cover-freepik-education.jpg"
                alt="Visual de guia en produccion"
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 360px"
              />
              <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(12,30,52,0.62),rgba(12,30,52,0.22)_58%,rgba(231,184,94,0.32))]" />
              <div className="absolute inset-x-0 bottom-0 px-3 py-2">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/80">
                  Tema en produccion
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {topic || "Nueva guia"}
                </p>
              </div>
            </div>
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
                    ? "border-[rgba(34,74,108,0.24)] bg-[linear-gradient(135deg,rgba(240,247,250,0.96),rgba(230,241,250,0.92))]"
                    : "border-[rgba(33,62,74,0.1)] bg-[rgba(255,255,255,0.84)]"
                }`}
              >
                <div
                  className={`inline-flex size-11 shrink-0 items-center justify-center rounded-[1.2rem] ${
                    step.state === "current"
                      ? "bg-[linear-gradient(140deg,var(--primary),#4c77bd)] text-[var(--primary-foreground)]"
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
