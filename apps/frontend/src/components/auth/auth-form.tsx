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
        <section className="glass panel-outline relative overflow-hidden rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="mesh-gradient absolute inset-0 opacity-90" />
          <div className="absolute -right-10 top-8 h-28 w-28 rounded-full bg-[rgba(38,92,186,0.12)] blur-2xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 translate-y-1/3 rounded-full bg-[rgba(226,173,63,0.16)] blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/60 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary shadow-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-accent" />
                Estudio docente
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  GuiasAI
                </p>
                <h1 className="font-display text-fluid-display editorial-heading max-w-xl">
                  Material pedagógico con presencia editorial.
                </h1>
                <p className="max-w-xl text-fluid-body text-[var(--ink-soft)]">
                  Organiza clases, genera actividades evaluables y mantén una
                  línea visual más sobria que las típicas herramientas de IA.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="panel-outline rounded-[1.6rem] bg-white/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Ritmo
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  Generación asistida en minutos.
                </p>
              </div>
              <div className="panel-outline rounded-[1.6rem] bg-white/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Control
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  Revisión, historial y sesiones protegidas.
                </p>
              </div>
              <div className="panel-outline rounded-[1.6rem] bg-white/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Aula
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  Salidas listas para primaria y secundaria.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Card className="panel-outline w-full overflow-hidden rounded-[2rem] border-border/70 bg-card/96 premium-shadow">
          <CardHeader className="gap-5 border-b border-border/60 px-5 py-6 sm:px-7">
            <div className="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary">
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
                className="h-12 rounded-full bg-primary text-primary-foreground shadow-[0_14px_35px_rgba(52,89,166,0.26)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/95"
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
                Sesión por cookie protegida
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
        className="h-12 rounded-[1.2rem] border-border/70 bg-[rgba(255,252,247,0.94)] px-4 shadow-none transition-[border-color,box-shadow,background-color] focus-visible:border-primary/45 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10"
      />
    </div>
  );
}
