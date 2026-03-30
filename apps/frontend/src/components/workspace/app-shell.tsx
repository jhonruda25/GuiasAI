"use client";

import {
  BookMarked,
  LibraryBig,
  LogOut,
  NotebookTabs,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { SelectedActivity } from "@/lib/work-guide-options";
import type { SessionUser } from "@/services/auth.api";

type WorkspaceMode = "generator" | "history" | "preview" | "generating";

interface AppShellProps {
  activeTab: "generator" | "history";
  workspaceMode: WorkspaceMode;
  topic: string;
  targetAudience: string;
  language: string;
  selectedActivities: SelectedActivity[];
  onTabChange: (value: "generator" | "history") => void;
  onLogout: () => void;
  user: SessionUser;
  children: ReactNode;
}

const modeCopy: Record<
  WorkspaceMode,
  { label: string; title: string; description: string }
> = {
  generator: {
    label: "Estudio de creacion",
    title: "Disena una guia que se sienta lista para aula desde el primer paso.",
    description:
      "El espacio prioriza decisiones docentes: tema, curso, mezcla pedagogica y resultado imprimible.",
  },
  history: {
    label: "Biblioteca personal",
    title: "Tus materiales dejan de verse como registros y pasan a sentirse como una coleccion util.",
    description:
      "Consulta, reabre y recupera guias con el mismo criterio visual con el que luego las presentas.",
  },
  preview: {
    label: "Mesa de revision",
    title: "Revisa la pieza final como un documento de trabajo, no como un JSON con maquillaje.",
    description:
      "El objetivo aqui es validar estructura, claridad y salida de impresion antes de compartirla.",
  },
  generating: {
    label: "Produccion en curso",
    title: "La guia se esta armando en tu estudio editorial.",
    description:
      "Mientras el sistema genera contenido, el espacio conserva contexto de clase y de formato.",
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppShell({
  activeTab,
  workspaceMode,
  topic,
  targetAudience,
  language,
  selectedActivities,
  onTabChange,
  onLogout,
  user,
  children,
}: AppShellProps) {
  const activeCopy = modeCopy[workspaceMode];

  return (
    <main className="min-h-screen fade-in">
      <section className="mx-auto flex w-full max-w-[96rem] flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="studio-shell overflow-hidden rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(23rem,0.65fr)]">
            <div className="grid gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="section-kicker">
                  <NotebookTabs className="size-3.5" />
                  GuiasAI studio
                </span>
                <span className="rounded-full border border-[rgba(33,62,74,0.1)] bg-white/80 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                  {activeCopy.label}
                </span>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.38fr)]">
                <div className="space-y-4">
                  <h1 className="font-display editorial-heading text-fluid-title max-w-4xl text-foreground">
                    {activeCopy.title}
                  </h1>
                  <p className="max-w-3xl text-fluid-body leading-7 text-[var(--ink-soft)]">
                    {activeCopy.description}
                  </p>
                </div>

                <article className="paper-panel grid gap-4 p-5">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Estado del estudio
                  </p>
                  <div className="grid gap-3 text-sm text-[var(--ink-soft)]">
                    <div className="flex items-center justify-between gap-4">
                      <span>Curso</span>
                      <strong className="text-right font-semibold text-foreground">
                        {targetAudience}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Idioma</span>
                      <strong className="font-semibold text-foreground">
                        {language === "en" ? "English" : "Espanol"}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Bloques activos</span>
                      <strong className="font-semibold text-foreground">
                        {selectedActivities.length}
                      </strong>
                    </div>
                  </div>
                </article>
              </div>

              <nav className="grid gap-3 md:grid-cols-[max-content_max-content_1fr]">
                <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-[rgba(33,62,74,0.08)] bg-[rgba(255,250,242,0.86)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeTab === "generator"
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_12px_25px_rgba(34,74,108,0.22)]"
                        : "text-[var(--ink-soft)] hover:bg-white"
                    }`}
                    onClick={() => onTabChange("generator")}
                  >
                    <Sparkles className="size-4" />
                    Crear
                  </button>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeTab === "history"
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_12px_25px_rgba(34,74,108,0.22)]"
                        : "text-[var(--ink-soft)] hover:bg-white"
                    }`}
                    onClick={() => onTabChange("history")}
                  >
                    <LibraryBig className="size-4" />
                    Biblioteca
                  </button>
                </div>

                <div className="rounded-[1.5rem] border border-[rgba(33,62,74,0.08)] bg-[rgba(255,250,242,0.86)] px-4 py-3 text-sm text-[var(--ink-soft)]">
                  <span className="font-semibold text-foreground">
                    {workspaceMode === "preview"
                      ? "Vista activa"
                      : workspaceMode === "generating"
                        ? "Produccion activa"
                        : "Tema en mesa"}
                  </span>
                  <p className="mt-1 truncate">
                    {topic || "Aun no has definido el tema de la guia."}
                  </p>
                </div>
              </nav>
            </div>

            <aside className="paper-panel relative overflow-hidden p-5 sm:p-6">
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(207,170,61,0.2),transparent_70%)]" />

              <div className="relative grid gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Docente en sesion
                    </p>
                    <div>
                      <h2 className="font-display text-2xl text-foreground">
                        {user.fullName}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="grid size-12 place-items-center rounded-[1.2rem] border border-[rgba(33,62,74,0.12)] bg-white text-sm font-semibold text-foreground shadow-[0_14px_28px_rgba(32,48,68,0.12)]">
                    {getInitials(user.fullName)}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <article className="rounded-[1.5rem] border border-[rgba(33,62,74,0.1)] bg-[rgba(255,255,255,0.76)] p-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Flujo
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Crear, revisar y exportar sin salir del mismo espacio.
                    </p>
                  </article>
                  <article className="rounded-[1.5rem] border border-[rgba(33,62,74,0.1)] bg-[rgba(255,255,255,0.76)] p-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Presentacion
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      El sistema apunta a material usable, no a borradores feos.
                    </p>
                  </article>
                </div>

                <div className="rounded-[1.5rem] border border-dashed border-[rgba(33,62,74,0.16)] bg-[rgba(248,244,234,0.9)] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Recordatorio editorial
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    Un buen material para docentes no solo debe funcionar. Debe
                    verse suficientemente serio como para que valga la pena
                    imprimirlo o compartirlo.
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="justify-between rounded-full border-[rgba(33,62,74,0.14)] bg-white/78"
                  onClick={onLogout}
                >
                  Cerrar sesion
                  <LogOut className="size-4" />
                </Button>
              </div>
            </aside>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
