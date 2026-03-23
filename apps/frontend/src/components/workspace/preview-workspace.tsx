"use client";

import dynamic from "next/dynamic";
import { ArrowLeft, FileOutput } from "lucide-react";
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
        Cargando vista previa...
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
    <div className="grid gap-5">
      <Card className="border-border/70 bg-card/92 shadow-[0_24px_80px_rgba(19,36,53,0.12)]">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-display text-3xl">
              Vista previa editorial
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Revisa estructura, rubrica y exportacion antes de compartir o
              imprimir la guia.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-full" variant="outline" onClick={onBack}>
              <ArrowLeft className="size-4" />
              Volver
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
        </CardHeader>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
