"use client";

import { BookOpenText, History, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/services/auth.api";

interface AppShellProps {
  activeTab: "generator" | "history";
  onTabChange: (value: "generator" | "history") => void;
  onLogout: () => void;
  user: SessionUser;
  children: ReactNode;
}

export function AppShell({
  activeTab,
  onTabChange,
  onLogout,
  user,
  children,
}: AppShellProps) {
  return (
    <main className="min-h-screen fade-in">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="grid gap-6 rounded-[var(--radius-4xl)] border border-border/80 glass p-5 shadow-[0_24px_80px_rgba(19,36,53,0.08)] md:grid-cols-[1.3fr_0.9fr] md:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <BookOpenText className="size-3.5" />
              Editorial pedagógica asistida por IA
            </div>
            <div className="space-y-3">
              <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
                GuiasAI para docentes que necesitan material claro, rapido y listo para aula.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Crea guias evaluables, revisa tu historial y exporta materiales con una presentacion
                editorial pensada para primaria y secundaria.
              </p>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as "generator" | "history")}>
              <TabsList>
                <TabsTrigger value="generator">
                  <Sparkles className="mr-2 size-4" />
                  Generar guia
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="mr-2 size-4" />
                  Historial
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-4 rounded-[var(--radius-3xl)] border border-border/70 bg-[linear-gradient(160deg,rgba(255,251,242,0.9),rgba(240,248,247,0.94))] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Sesion activa
                </p>
                <h2 className="mt-2 font-display text-2xl text-foreground">{user.fullName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                <LayoutDashboard className="size-3.5" />
                Docente
              </span>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Espacio</p>
                <p className="mt-2 font-medium text-foreground">Generacion protegida por sesion</p>
              </div>
              <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Salida</p>
                <p className="mt-2 font-medium text-foreground">Vista previa y exportacion docente</p>
              </div>
            </div>

            <Button variant="outline" className="justify-between rounded-full" onClick={onLogout}>
              Cerrar sesion
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
