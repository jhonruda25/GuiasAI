"use client";

import { BookOpenText, Globe2, LogOut, Plus, Sparkles } from "lucide-react";
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

const modeTitles: Record<WorkspaceMode, string> = {
  generator: "Estudio de creacion",
  history: "Biblioteca",
  preview: "Mesa de revision",
  generating: "Produccion",
};

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
  const initials =
    user.fullName
      .split(" ")
      .slice(0, 2)
      .map((item) => item[0]?.toUpperCase() ?? "")
      .join("") || "U";

  return (
    <main className="relative min-h-screen fade-in editorial-gradient">
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="studio-shell overflow-hidden rounded-[1.9rem] border border-[rgba(33,62,74,0.16)] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <p className="font-display text-[1.8rem] font-black tracking-tight text-[var(--primary)]">
                    GuiasAI
                  </p>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                    Studio Editorial
                  </p>
                </div>
                <nav className="hidden items-center gap-2 md:flex">
                  <button
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeTab === "generator"
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border border-border/70 bg-white/85 text-[var(--ink-soft)]"
                    }`}
                    onClick={() => onTabChange("generator")}
                  >
                    Estudio
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeTab === "history"
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border border-border/70 bg-white/85 text-[var(--ink-soft)]"
                    }`}
                    onClick={() => onTabChange("history")}
                  >
                    Biblioteca
                  </button>
                </nav>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-white/80 text-[var(--ink-soft)] transition hover:text-[var(--primary)]"
                >
                  <Globe2 className="size-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-white/80 text-[var(--ink-soft)] transition hover:text-[var(--primary)]"
                >
                  <BookOpenText className="size-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_12px_25px_rgba(32,70,131,0.24)] transition hover:brightness-105"
                  onClick={() => onTabChange("generator")}
                >
                  Crear
                  <Plus className="size-4" />
                </button>
                <div className="inline-flex size-10 items-center justify-center rounded-full border border-[rgba(33,62,74,0.18)] bg-[rgba(255,255,255,0.86)] text-xs font-bold text-[var(--primary)]">
                  {initials}
                </div>
                <Button variant="outline" className="rounded-full" onClick={onLogout}>
                  <LogOut className="size-4" />
                  Salir
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[rgba(33,62,74,0.12)] bg-[rgba(255,255,255,0.78)] px-4 py-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <span className="section-kicker">{modeTitles[workspaceMode]}</span>
                  <h1 className="font-display text-fluid-title text-[var(--surface-ink)]">
                    {topic || "Nueva guia"}
                  </h1>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {targetAudience} / {language === "en" ? "English" : "Espanol"} /{" "}
                    {selectedActivities.length} bloques
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(33,62,74,0.12)] bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                  <Sparkles className="size-3.5 text-[var(--primary)]" />
                  {activeTab === "generator" ? "Modo Crear" : "Modo Biblioteca"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
