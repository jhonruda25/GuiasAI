"use client";

import { FileCheck2, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GenerationStatusPanelProps {
  topic: string;
  guideId: string | null;
}

const steps = [
  { icon: Sparkles, label: "Redactando actividades", state: "done" },
  { icon: FileCheck2, label: "Armando rubrica y formato", state: "current" },
  {
    icon: ShieldCheck,
    label: "Preparando revision y exportacion",
    state: "upcoming",
  },
] as const;

export function GenerationStatusPanel({
  topic,
  guideId,
}: GenerationStatusPanelProps) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-[linear-gradient(145deg,rgba(255,251,242,0.96),rgba(240,248,247,0.98))] shadow-[0_20px_60px_rgba(19,36,53,0.12)]">
      <CardHeader className="gap-4 border-b border-border/60">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Loader2 className="size-3.5 animate-spin" />
          Generacion en curso
        </div>
        <CardTitle className="font-display text-3xl">
          Tu guia se esta preparando
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Tema actual</span>
            <span className="font-medium text-foreground">
              {topic || "Nueva guia"}
            </span>
          </div>
          <Progress value={66} className="h-2 rounded-full" />
          {guideId ? (
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              ID: {guideId}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.label}
                className="flex items-center gap-3 rounded-3xl border border-border/70 bg-background/75 p-4"
              >
                <div className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className={`size-4 ${index === 1 ? "animate-pulse" : ""}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{step.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {step.state === "done"
                      ? "Completado"
                      : step.state === "current"
                        ? "Procesando ahora"
                        : "Pendiente"}
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
