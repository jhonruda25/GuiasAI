"use client";

import { LibraryBig, LogOut, Sparkles } from "lucide-react";
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
  return (
    <main className="min-h-screen fade-in">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="studio-shell rounded-[1.8rem] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <span className="section-kicker">{modeTitles[workspaceMode]}</span>
                <h1 className="font-display text-fluid-title">
                  {topic || "Nueva guia"}
                </h1>
                <p className="text-sm text-[var(--ink-soft)]">
                  {targetAudience} / {language === "en" ? "English" : "Espanol"} /{" "}
                  {selectedActivities.length} bloques
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-border/60 bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                  {user.fullName}
                </span>
                <Button variant="outline" className="rounded-full" onClick={onLogout}>
                  <LogOut className="size-4" />
                  Cerrar
                </Button>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "generator"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/70 bg-white/80 text-[var(--ink-soft)]"
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
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/70 bg-white/80 text-[var(--ink-soft)]"
                }`}
                onClick={() => onTabChange("history")}
              >
                <LibraryBig className="size-4" />
                Biblioteca
              </button>
            </nav>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
