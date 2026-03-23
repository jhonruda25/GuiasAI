"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Eye, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAllWorkGuides,
  getWorkGuideById,
  retryWorkGuide,
  type WorkGuideListItem,
  type WorkGuideRecord,
} from "@/services/work-guide.api";

const statusStyles: Record<string, string> = {
  PENDING: "bg-[rgba(209,153,30,0.12)] text-[rgb(130,94,13)]",
  GENERATING: "bg-[rgba(28,121,153,0.12)] text-[rgb(19,90,115)]",
  COMPLETED: "bg-[rgba(42,125,93,0.12)] text-[rgb(30,99,73)]",
  FAILED: "bg-[rgba(181,60,40,0.12)] text-[rgb(136,43,28)]",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  GENERATING: "Generando",
  COMPLETED: "Completa",
  FAILED: "Fallida",
};

interface HistoryListProps {
  onOpenGuide: (guide: WorkGuideRecord) => void;
}

export function HistoryList({ onOpenGuide }: HistoryListProps) {
  const [guides, setGuides] = useState<WorkGuideListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGuideId, setLoadingGuideId] = useState<string | null>(null);

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllWorkGuides();
      setGuides(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGuides();
  }, [fetchGuides]);

  const openGuide = async (guide: WorkGuideListItem) => {
    if (guide.status !== "COMPLETED") {
      return;
    }

    setLoadingGuideId(guide.id);

    try {
      const record = await getWorkGuideById(guide.id);
      onOpenGuide(record);
    } finally {
      setLoadingGuideId(null);
    }
  };

  const retryGuide = async (guideId: string) => {
    await retryWorkGuide(guideId);
    await fetchGuides();
  };

  return (
    <Card className="border-border/70 bg-card/92 shadow-[0_24px_80px_rgba(19,36,53,0.12)]">
      <CardHeader className="gap-4 border-b border-border/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-display text-3xl">
              Historial protegido
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl leading-6">
              Solo ves las guias creadas desde tu sesion. Puedes reabrirlas,
              descargarlas o reintentar las fallidas.
            </CardDescription>
          </div>
          <Button
            className="rounded-full"
            variant="outline"
            onClick={() => void fetchGuides()}
          >
            <RefreshCcw className="size-4" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="grid place-items-center rounded-[var(--radius-3xl)] border border-dashed border-border bg-muted/35 px-6 py-16">
            <div className="flex items-center gap-3 text-muted-foreground">
              <RefreshCcw className="size-5 animate-spin" />
              Cargando historial...
            </div>
          </div>
        ) : guides.length === 0 ? (
          <div className="grid place-items-center rounded-[var(--radius-3xl)] border border-dashed border-border bg-muted/35 px-6 py-16 text-center">
            <div>
              <p className="font-display text-3xl text-foreground">
                Todavia no has generado guias
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Cuando generes tu primera guia, aparecera aqui con su estado,
                puntaje y acceso a revision.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {guides.map((guide) => (
              <article
                key={guide.id}
                className="grid gap-4 rounded-[var(--radius-3xl)] border border-border/70 bg-background/85 p-5 lg:grid-cols-[1fr_auto]"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusStyles[guide.status]}`}
                    >
                      {statusLabels[guide.status]}
                    </span>
                    {guide.reviewed ? (
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground">
                        Revisada
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-foreground">
                      {guide.topic}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {guide.targetAudience} ·{" "}
                      {guide.language === "en" ? "English" : "Espanol"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>
                      Creada: {new Date(guide.createdAt).toLocaleString("es-CO")}
                    </span>
                    <span>Puntaje: {guide.globalScore ?? "-"}</span>
                  </div>
                  {guide.errorMessage ? (
                    <div className="flex items-start gap-3 rounded-[var(--radius-2xl)] border border-[rgba(181,60,40,0.22)] bg-[rgba(181,60,40,0.08)] px-4 py-3 text-sm text-[rgb(136,43,28)]">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <span>{guide.errorMessage}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 lg:w-56">
                  {guide.status === "COMPLETED" ? (
                    <Button
                      className="rounded-full"
                      onClick={() => void openGuide(guide)}
                    >
                      <Eye className="size-4" />
                      {loadingGuideId === guide.id
                        ? "Abriendo..."
                        : "Abrir vista previa"}
                    </Button>
                  ) : null}

                  {guide.status === "FAILED" ? (
                    <Button
                      className="rounded-full"
                      variant="outline"
                      onClick={() => void retryGuide(guide.id)}
                    >
                      <Sparkles className="size-4" />
                      Reintentar guia
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
