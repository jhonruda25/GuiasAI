"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Eye,
  LibraryBig,
  RefreshCcw,
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
  COMPLETED: "Lista",
  FAILED: "Fallida",
};

type HistoryFilter = "all" | "completed" | "failed";

interface HistoryListProps {
  onOpenGuide: (guide: WorkGuideRecord) => void;
}

function getGuideCover(topic: string, status: string) {
  const tones = [
    "from-[rgba(34,74,108,0.94)] via-[rgba(76,105,122,0.94)] to-[rgba(241,191,95,0.82)]",
    "from-[rgba(43,94,76,0.94)] via-[rgba(83,126,108,0.92)] to-[rgba(243,207,130,0.8)]",
    "from-[rgba(96,67,43,0.94)] via-[rgba(135,104,76,0.92)] to-[rgba(244,220,169,0.84)]",
  ];
  const hash = topic.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseTone = tones[hash % tones.length];

  if (status === "FAILED") {
    return "from-[rgba(125,51,39,0.95)] via-[rgba(160,89,70,0.9)] to-[rgba(246,210,190,0.82)]";
  }

  if (status === "GENERATING") {
    return "from-[rgba(30,85,112,0.95)] via-[rgba(63,127,156,0.9)] to-[rgba(205,232,244,0.82)]";
  }

  return baseTone;
}

export function HistoryList({ onOpenGuide }: HistoryListProps) {
  const [guides, setGuides] = useState<WorkGuideListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGuideId, setLoadingGuideId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("all");

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

  const completedCount = guides.filter((guide) => guide.status === "COMPLETED").length;
  const failedCount = guides.filter((guide) => guide.status === "FAILED").length;
  const filteredGuides = guides.filter((guide) => {
    if (activeFilter === "completed") {
      return guide.status === "COMPLETED";
    }

    if (activeFilter === "failed") {
      return guide.status === "FAILED";
    }

    return true;
  });

  return (
    <Card className="paper-panel overflow-hidden bg-card/95">
      <CardHeader className="gap-5 border-b border-border/60 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="section-kicker">
              <LibraryBig className="size-3.5" />
              Biblioteca personal
            </div>
            <div className="space-y-2">
              <CardTitle className="font-display text-3xl">
                Tus guias dejan de verse como filas y pasan a sentirse como una coleccion.
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6">
                Reabre lo que ya funciona, detecta fallos y conserva un archivo
                visual del material que has construido para clase.
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: `Todo (${guides.length})` },
              { id: "completed", label: `Listas (${completedCount})` },
              { id: "failed", label: `Fallidas (${failedCount})` },
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === filter.id
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_12px_25px_rgba(34,74,108,0.2)]"
                    : "border border-[rgba(33,62,74,0.12)] bg-white/82 text-[var(--ink-soft)] hover:border-[rgba(34,74,108,0.22)]"
                }`}
                onClick={() => setActiveFilter(filter.id as HistoryFilter)}
              >
                {filter.label}
              </button>
            ))}
            <Button
              className="rounded-full border-[rgba(33,62,74,0.12)] bg-white/82"
              variant="outline"
              onClick={() => void fetchGuides()}
            >
              <RefreshCcw className="size-4" />
              Actualizar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {loading ? (
          <div className="grid place-items-center rounded-[var(--radius-3xl)] border border-dashed border-border bg-muted/35 px-6 py-16">
            <div className="flex items-center gap-3 text-muted-foreground">
              <RefreshCcw className="size-5 animate-spin" />
              Cargando biblioteca...
            </div>
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="grid place-items-center rounded-[var(--radius-3xl)] border border-dashed border-border bg-muted/35 px-6 py-16 text-center">
            <div>
              <p className="font-display text-3xl text-foreground">
                Tu biblioteca todavia esta vacia
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Cuando generes material, aparecera aqui con estado, puntaje y
                acceso directo a revision.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredGuides.map((guide) => (
              <article
                key={guide.id}
                className="overflow-hidden rounded-[1.9rem] border border-[rgba(33,62,74,0.1)] bg-[rgba(255,255,255,0.88)] shadow-[0_22px_38px_rgba(27,42,61,0.08)]"
              >
                <div
                  className={`relative overflow-hidden bg-gradient-to-br ${getGuideCover(
                    guide.topic,
                    guide.status,
                  )} p-5 text-white`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_42%)]" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] backdrop-blur ${statusStyles[guide.status]}`}
                      >
                        {statusLabels[guide.status]}
                      </span>
                      {guide.reviewed ? (
                        <span className="rounded-full bg-white/20 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                          Revisada
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-12 space-y-2">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/72">
                        Guia docente
                      </p>
                      <h3 className="font-display text-3xl leading-tight text-white">
                        {guide.topic}
                      </h3>
                      <p className="text-sm text-white/78">
                        {guide.targetAudience} /{" "}
                        {guide.language === "en" ? "English" : "Espanol"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.2rem] bg-[rgba(246,241,231,0.72)] px-3 py-3">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Creada
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {new Date(guide.createdAt).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-[rgba(239,247,246,0.72)] px-3 py-3">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Puntaje
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {guide.globalScore ?? "-"}
                      </p>
                    </div>
                  </div>

                  {guide.errorMessage ? (
                    <div className="flex items-start gap-3 rounded-[1.3rem] border border-[rgba(181,60,40,0.22)] bg-[rgba(181,60,40,0.08)] px-4 py-3 text-sm text-[rgb(136,43,28)]">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <span>{guide.errorMessage}</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-6 text-[var(--ink-soft)]">
                      {guide.status === "COMPLETED"
                        ? "Lista para reabrir, revisar y exportar de nuevo."
                        : guide.status === "GENERATING"
                          ? "Sigue en produccion. Puedes actualizar la biblioteca para ver cambios."
                          : "Aun no termina. Mantendra su lugar en la biblioteca cuando quede lista."}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {guide.status === "COMPLETED" ? (
                      <Button
                        className="rounded-full"
                        onClick={() => void openGuide(guide)}
                      >
                        <Eye className="size-4" />
                        {loadingGuideId === guide.id
                          ? "Abriendo..."
                          : "Abrir guia"}
                      </Button>
                    ) : null}

                    {guide.status === "FAILED" ? (
                      <Button
                        className="rounded-full"
                        variant="outline"
                        onClick={() => void retryGuide(guide.id)}
                      >
                        <Sparkles className="size-4" />
                        Reintentar
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
