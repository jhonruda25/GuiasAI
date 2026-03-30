"use client";

import dynamic from "next/dynamic";
import { ArrowLeft, FileOutput, ScrollText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkGuideRecord } from "@/services/work-guide.api";

const WorkGuidePreview = dynamic(
  () =>
    import("@/components/work-guide/work-guide-preview").then(
      (mod) => mod.WorkGuidePreview,
    ),
  {
    loading: () => (
      <div className="grid place-items-center rounded-[var(--radius-3xl)] border border-dashed border-border bg-muted/35 px-6 py-20 text-muted-foreground">
        Cargando mesa de revision...
      </div>
    ),
  },
);

interface PreviewWorkspaceProps {
  guide: WorkGuideRecord;
  onBack: () => void;
  onResetGenerated: () => void;
}

export function PreviewWorkspace({
  guide,
  onBack,
  onResetGenerated,
}: PreviewWorkspaceProps) {
  if (!guide.content) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.22fr)_minmax(22rem,0.78fr)]">
      <Card className="paper-panel overflow-hidden bg-card/96">
        <CardHeader className="gap-5 border-b border-border/60 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="section-kicker">
              <ScrollText className="size-3.5" />
              Mesa de revision
            </span>
            <span className="rounded-full border border-[rgba(33,62,74,0.1)] bg-white/80 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
              Documento activo
            </span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <CardTitle className="font-display text-3xl">
                Revisa la guia como pieza final antes de imprimirla o compartirla.
              </CardTitle>
              <p className="max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
                Aqui lo importante es la lectura del documento, no la
                configuracion tecnica. El control vive en un marco limpio y la
                pieza queda al centro.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full" variant="outline" onClick={onBack}>
                <ArrowLeft className="size-4" />
                Volver al estudio
              </Button>
              <Button
                className="rounded-full"
                variant="outline"
                onClick={onResetGenerated}
              >
                <FileOutput className="size-4" />
                Nueva guia
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="rounded-[2rem] border border-[rgba(33,62,74,0.08)] bg-[linear-gradient(180deg,rgba(245,241,233,0.92),rgba(255,255,255,0.88))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] sm:p-5">
            <div className="rounded-[1.65rem] border border-[rgba(33,62,74,0.08)] bg-white px-3 py-4 shadow-[0_22px_44px_rgba(27,42,61,0.1)] sm:px-5 sm:py-5">
              <WorkGuidePreview
                workGuide={{
                  ...guide.content,
                  id: guide.id,
                  language: guide.language,
                  reviewed: guide.reviewed,
                  reviewedBy: guide.reviewedBy,
                  reviewedAt: guide.reviewedAt,
                }}
                onReset={onResetGenerated}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <aside className="grid gap-5 xl:sticky xl:top-6 xl:self-start">
        <Card className="paper-panel overflow-hidden bg-[linear-gradient(180deg,rgba(255,252,245,0.96),rgba(242,248,247,0.98))]">
          <CardHeader className="gap-4 border-b border-border/60 pb-6">
            <div className="section-kicker">
              <ShieldCheck className="size-3.5" />
              Inspector docente
            </div>
            <CardTitle className="font-display text-3xl">
              Lo esencial esta visible sin distraer de la hoja.
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <article className="rounded-[1.5rem] border border-[rgba(33,62,74,0.1)] bg-white/84 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Tema
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {guide.topic}
              </p>
            </article>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <article className="rounded-[1.5rem] border border-[rgba(33,62,74,0.1)] bg-white/84 p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Curso
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {guide.targetAudience}
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-[rgba(33,62,74,0.1)] bg-white/84 p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Idioma
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {guide.language === "en" ? "English" : "Espanol"}
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-[rgba(33,62,74,0.1)] bg-white/84 p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Puntaje global
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {guide.globalScore ?? "-"}
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-[rgba(33,62,74,0.1)] bg-white/84 p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Estado
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {guide.reviewed ? "Revisada" : "Pendiente de revision"}
                </p>
              </article>
            </div>

            <article className="rounded-[1.5rem] border border-dashed border-[rgba(33,62,74,0.16)] bg-[rgba(248,244,234,0.82)] p-4 text-sm leading-6 text-[var(--ink-soft)]">
              La pieza ya esta centrada en la hoja. Usa los controles internos
              de la preview para revisar, exportar y marcar revision sin romper
              el contexto del documento.
            </article>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
