"use client";

import type { ReactNode } from "react";
import Link from "next/link";
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
      <div className="hero-grid w-full max-w-6xl">
        <section className="studio-shell rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <div className="max-w-2xl space-y-6">
            <span className="section-kicker">Estudio para docentes</span>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              GuiasAI
            </p>
            <h1 className="font-display editorial-heading text-fluid-title">
              Crea guias claras, revisables y listas para aula.
            </h1>
            <p className="max-w-xl text-fluid-body leading-7 text-[var(--ink-soft)]">
              Menos interfaz decorativa y mas foco en resultados docentes:
              crear, revisar y exportar en un flujo sencillo.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-white/70 px-3 py-2 text-xs font-semibold text-[var(--ink-soft)]">
                Biblioteca
              </div>
              <div className="rounded-xl border border-border/60 bg-white/70 px-3 py-2 text-xs font-semibold text-[var(--ink-soft)]">
                Recetas
              </div>
              <div className="rounded-xl border border-border/60 bg-white/70 px-3 py-2 text-xs font-semibold text-[var(--ink-soft)]">
                Exportacion
              </div>
            </div>
          </div>
        </section>

        <Card className="paper-panel w-full overflow-hidden rounded-[2rem] bg-card/96">
          <CardHeader className="gap-3 border-b border-border/60 px-5 py-6 sm:px-7">
            <div className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary">
              Acceso seguro
            </div>
            <CardTitle className="font-display text-fluid-title">{title}</CardTitle>
            <CardDescription className="max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 py-6 sm:px-7">
            <form className="grid gap-5" onSubmit={onSubmit}>
              {children}
              {error ? (
                <div className="rounded-[1.2rem] border border-[rgba(181,60,40,0.22)] bg-[rgba(181,60,40,0.08)] px-4 py-3 text-sm text-[rgb(136,43,28)]">
                  {error}
                </div>
              ) : null}
              <Button
                className="h-12 rounded-full"
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
                <Link className="font-semibold text-primary hover:underline" href={footerHref}>
                  {footerLinkText}
                </Link>
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
                Sesion protegida
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
        className="h-12 rounded-[1rem] border-border/70 bg-white/90 px-4 focus-visible:ring-3 focus-visible:ring-primary/15"
      />
    </div>
  );
}
