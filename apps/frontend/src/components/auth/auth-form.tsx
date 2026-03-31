"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
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
  const visualPills = [
    {
      icon: "/assets/icons/icon-freepik-1-4326138.png",
      title: "Portadas",
      subtitle: "Con atmosfera",
    },
    {
      icon: "/assets/icons/icon-freepik-10-3756049.png",
      title: "Ritmo",
      subtitle: "Lectura guiada",
    },
    {
      icon: "/assets/icons/icon-freepik-11-15717628.png",
      title: "Entrega",
      subtitle: "Lista para aula",
    },
  ];

  return (
    <div className="grid min-h-[100dvh] place-items-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="hero-grid w-full max-w-6xl">
        <section className="studio-shell relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute -left-20 -top-24 size-56 rounded-full bg-[rgba(35,79,117,0.14)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-24 size-64 rounded-full bg-[rgba(231,184,94,0.16)] blur-3xl" />
          <div className="max-w-2xl space-y-7">
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

            <article className="relative overflow-hidden rounded-[1.45rem] border border-[rgba(255,255,255,0.35)] bg-[rgba(255,255,255,0.62)] p-3 shadow-[0_22px_34px_rgba(22,39,60,0.08)] backdrop-blur">
              <div className="relative h-40 overflow-hidden rounded-[1.1rem]">
                <Image
                  src="/assets/covers/cover-freepik-education.jpg"
                  alt="Editorial education cover"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 560px"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(12,29,52,0.62),rgba(12,29,52,0.1)_58%,rgba(231,184,94,0.28))]" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/82">
                      Layout editorial
                    </p>
                    <p className="mt-1 font-display text-xl leading-none text-white">
                      Diseno con imagenes reales
                    </p>
                  </div>
                  <span className="rounded-full border border-white/35 bg-white/16 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                    Visual
                  </span>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {visualPills.map((pill) => (
                  <div
                    key={pill.title}
                    className="flex items-center gap-2 rounded-xl border border-border/60 bg-white/86 px-2.5 py-2"
                  >
                    <div className="relative size-7 overflow-hidden rounded-md border border-border/60 bg-white">
                      <Image
                        src={pill.icon}
                        alt={pill.title}
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--surface-ink)]">
                        {pill.title}
                      </p>
                      <p className="truncate text-[0.68rem] text-[var(--ink-soft)]">
                        {pill.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
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
