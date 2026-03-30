"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, FileText, LibraryBig, Printer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  title: string;
  description: string;
  submitLabel: string;
  footerLabel: string;
  footerHref: string;
  footerLinkText: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string | null;
  children?: ReactNode;
  secondaryAction?: ReactNode;
}

const highlights = [
  {
    icon: LibraryBig,
    label: "Biblioteca personal",
    copy: "Historial claro para volver a abrir material y no perder trabajo util.",
  },
  {
    icon: Sparkles,
    label: "Recetas docentes",
    copy: "Mezclas de actividades pensadas para clase, no menus tecnicos vacios.",
  },
  {
    icon: Printer,
    label: "Salida imprimible",
    copy: "La pieza final se revisa como documento listo para aula.",
  },
] as const;

export function AuthForm({
  title,
  description,
  submitLabel,
  footerLabel,
  footerHref,
  footerLinkText,
  onSubmit,
  loading,
  error,
  children,
  secondaryAction,
}: AuthFormProps) {
  return (
    <div className="grid min-h-[100dvh] place-items-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="hero-grid w-full max-w-7xl">
        <section className="studio-shell relative overflow-hidden rounded-[2.2rem] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,221,163,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(82,118,137,0.18),transparent_34%)]" />

          <div className="relative grid h-full gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.58fr)]">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(33,62,74,0.1)] bg-white/74 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--primary)] shadow-sm">
                  <span className="inline-block h-2 w-2 rounded-full bg-[rgba(207,170,61,0.95)]" />
                  Estudio editorial para docentes
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                    GuiasAI
                  </p>
                  <h1 className="font-display text-fluid-display editorial-heading max-w-3xl">
                    Guias que se sienten listas para aula, no solo generadas.
                  </h1>
                  <p className="max-w-2xl text-fluid-body text-[var(--ink-soft)]">
                    Convierte temas de clase en material pedagogico con una
                    presencia visual mas seria, revision integrada y salida que
                    no averguenza imprimir.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {highlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.label}
                      className="paper-panel rounded-[1.6rem] bg-white/72 p-4"
                    >
                      <div className="flex items-center gap-2 text-[var(--primary)]">
                        <Icon className="size-4" />
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {item.label}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                        {item.copy}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute left-4 top-4 h-[19rem] w-[15rem] rotate-[-8deg] rounded-[1.7rem] border border-[rgba(33,62,74,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,242,230,0.92))] p-4 shadow-[0_26px_50px_rgba(27,42,61,0.14)]">
                <div className="rounded-[1.3rem] bg-[linear-gradient(135deg,rgba(34,74,108,0.94),rgba(74,117,135,0.84))] p-4 text-white">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/72">
                    Guia en portada
                  </p>
                  <h3 className="mt-3 font-display text-3xl leading-tight">
                    Ecosistemas
                  </h3>
                  <p className="mt-2 text-sm text-white/80">Tercero / Espanol</p>
                </div>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-[1rem] bg-[rgba(245,241,232,0.9)] px-3 py-3 text-sm text-[var(--ink-soft)]">
                    Sopa de letras, completar espacios y relacionar conceptos.
                  </div>
                  <div className="flex items-center justify-between rounded-[1rem] bg-white px-3 py-3 text-sm">
                    <span className="font-medium text-foreground">
                      Lista para revision
                    </span>
                    <ArrowUpRight className="size-4 text-[var(--primary)]" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-2 right-3 h-[17rem] w-[13.5rem] rotate-[8deg] rounded-[1.7rem] border border-[rgba(33,62,74,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(238,246,245,0.94))] p-4 shadow-[0_26px_50px_rgba(27,42,61,0.12)]">
                <div className="flex items-center justify-between">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Rubrica
                  </p>
                  <FileText className="size-4 text-[var(--primary)]" />
                </div>
                <div className="mt-4 grid gap-3">
                  {["Excelente", "Bueno", "Por reforzar"].map((level) => (
                    <div
                      key={level}
                      className="rounded-[1rem] border border-[rgba(33,62,74,0.08)] bg-white px-3 py-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {level}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                        Observaciones listas para revision docente y exportacion.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Card className="paper-panel w-full overflow-hidden rounded-[2rem] bg-card/96 premium-shadow">
          <CardHeader className="gap-5 border-b border-border/60 px-5 py-6 sm:px-7">
            <div className="inline-flex w-fit items-center rounded-full border border-[rgba(34,74,108,0.16)] bg-[rgba(34,74,108,0.08)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
              Acceso seguro
            </div>
            <div className="space-y-2">
              <CardTitle className="font-display text-fluid-title editorial-heading">
                {title}
              </CardTitle>
              <CardDescription className="max-w-md text-sm leading-6 text-[var(--ink-soft)]">
                {description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-5 py-6 sm:px-7 sm:py-7">
            <form className="grid gap-5" onSubmit={onSubmit}>
              {children}
              {error ? (
                <div className="rounded-[1.4rem] border border-[rgba(181,60,40,0.22)] bg-[rgba(181,60,40,0.08)] px-4 py-3 text-sm text-[rgb(136,43,28)]">
                  {error}
                </div>
              ) : null}
              <Button
                className="h-12 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_16px_30px_rgba(34,74,108,0.25)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/95"
                type="submit"
                disabled={loading}
              >
                {loading ? "Procesando..." : submitLabel}
              </Button>

              {secondaryAction}
            </form>
            <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                {footerLabel}{" "}
                <Link className="font-semibold text-[var(--primary)] hover:underline" href={footerHref}>
                  {footerLinkText}
                </Link>
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
                Sesion protegida por cookie
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2.5">
      <Label
        htmlFor={id}
        className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]"
      >
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-[1.2rem] border-[rgba(33,62,74,0.14)] bg-[rgba(255,252,247,0.94)] px-4 shadow-none transition-[border-color,box-shadow,background-color] focus-visible:border-primary/45 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10"
      />
    </div>
  );
}
