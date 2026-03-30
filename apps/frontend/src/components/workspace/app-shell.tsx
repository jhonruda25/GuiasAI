"use client";

import {
  BookOpenText,
  History,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from "lucide-react";
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
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="hero-grid glass panel-outline overflow-hidden rounded-[2rem] p-5 md:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-white/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <BookOpenText className="size-3.5" />
              Editorial pedagógica asistida por IA
            </div>
            <div className="space-y-4">
              <h1 className="font-display editorial-heading text-fluid-title max-w-3xl text-foreground">
                Un estudio de trabajo para docentes que quieren producir mejor,
                no solo más rápido.
              </h1>
              <p className="max-w-2xl text-fluid-body leading-7 text-[var(--ink-soft)]">
                Crea guías evaluables, revisa el historial y prepara material
                con una presentación más sobria, clara y utilizable en clase.
              </p>
            </div>
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                onTabChange(value as "generator" | "history")
              }
            >
              <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-[1.4rem] bg-white/68 p-2 sm:w-fit">
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

          <div className="panel-outline grid gap-4 rounded-[1.8rem] bg-[linear-gradient(160deg,rgba(255,252,245,0.94),rgba(239,247,249,0.88))] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Sesion activa
                </p>
                <h2 className="mt-2 font-display text-2xl text-foreground">
                  {user.fullName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                <LayoutDashboard className="size-3.5" />
                Docente
              </span>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="panel-outline rounded-[1.45rem] bg-background/72 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Espacio
                </p>
                <p className="mt-2 font-medium text-foreground">
                  Generacion protegida por sesion
                </p>
              </div>
              <div className="panel-outline rounded-[1.45rem] bg-background/72 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Salida
                </p>
                <p className="mt-2 font-medium text-foreground">
                  Vista previa y exportacion docente
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="justify-between rounded-full bg-white/72"
              onClick={onLogout}
            >
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
