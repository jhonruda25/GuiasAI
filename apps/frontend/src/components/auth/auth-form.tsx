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
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-lg border-border/70 bg-card/95 shadow-[0_32px_90px_rgba(19,36,53,0.18)]">
        <CardHeader className="gap-4 border-b border-border/60 text-center">
          <div className="inline-flex self-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            GuiasAI
          </div>
          <div className="space-y-2">
            <CardTitle className="font-display text-4xl">{title}</CardTitle>
            <CardDescription className="text-sm leading-6">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="grid gap-5" onSubmit={onSubmit}>
            {children}
            {error ? (
              <div className="rounded-[var(--radius-2xl)] border border-[rgba(181,60,40,0.25)] bg-[rgba(181,60,40,0.08)] px-4 py-3 text-sm text-[rgb(136,43,28)]">
                {error}
              </div>
            ) : null}
            <Button className="h-12 rounded-full" type="submit" disabled={loading}>
              {loading ? "Procesando..." : submitLabel}
            </Button>

            {secondaryAction}
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footerLabel}{" "}
            <Link className="font-semibold text-primary hover:underline" href={footerHref}>
              {footerLinkText}
            </Link>
          </p>
        </CardContent>
      </Card>
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
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl"
      />
    </div>
  );
}
