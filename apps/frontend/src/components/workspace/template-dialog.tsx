"use client";

import { useEffect, useState } from "react";
import { BookmarkPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTemplateStore, type Template } from "@/store/template.store";
import {
  activityLookup,
  normalizeSelectedActivities,
  type SelectedActivity,
} from "@/lib/work-guide-options";

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadTemplate: (template: Template) => void;
  currentActivities: SelectedActivity[];
  currentAudience: string;
  currentLanguage: string;
}

export function TemplateDialog({
  open,
  onOpenChange,
  onLoadTemplate,
  currentActivities,
  currentAudience,
  currentLanguage,
}: TemplateDialogProps) {
  const { templates, loadTemplates, saveTemplate, deleteTemplate } =
    useTemplateStore();
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [loadTemplates, open]);

  const handleSave = () => {
    if (!templateName.trim()) {
      return;
    }

    saveTemplate({
      name: templateName.trim(),
      targetAudience: currentAudience,
      language: currentLanguage,
      activities: normalizeSelectedActivities(currentActivities),
    });
    setTemplateName("");
    setShowSaveForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-[2rem] border-[rgba(33,62,74,0.12)] bg-[linear-gradient(180deg,rgba(255,252,245,0.98),rgba(245,248,247,0.98))] p-0 shadow-[0_30px_60px_rgba(19,36,53,0.16)]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.7fr)]">
          <div className="border-b border-[rgba(33,62,74,0.08)] p-6 lg:border-b-0 lg:border-r">
            <DialogHeader className="space-y-4 text-left">
              <div className="section-kicker">
                <BookmarkPlus className="size-3.5" />
                Plantillas docentes
              </div>
              <div className="space-y-2">
                <DialogTitle className="font-display text-3xl">
                  Guarda recetas de trabajo y vuelve a entrar con contexto.
                </DialogTitle>
                <DialogDescription className="text-sm leading-6 text-[var(--ink-soft)]">
                  Las plantillas te evitan reconstruir la mezcla de actividades
                  cada vez. El estudio deberia recordarte, no obligarte a
                  repetir.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="mt-6 rounded-[1.7rem] border border-[rgba(33,62,74,0.1)] bg-white/82 p-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Configuracion actual
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-[rgba(245,241,232,0.78)] px-3 py-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Curso
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {currentAudience}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-[rgba(239,247,246,0.78)] px-3 py-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Idioma
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {currentLanguage === "en" ? "English" : "Espanol"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {normalizeSelectedActivities(currentActivities).map((activity) => (
                  <span
                    key={activity.id}
                    className="rounded-full border border-[rgba(33,62,74,0.1)] bg-white px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {activityLookup[activity.id].label} x {activity.count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            {showSaveForm ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Nombre de la plantilla</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(event) => setTemplateName(event.target.value)}
                    placeholder="Ejemplo: Taller de ciencias para quinto"
                    className="h-12 rounded-[1.2rem] border-[rgba(33,62,74,0.12)] bg-white/84"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 rounded-full"
                    variant="outline"
                    onClick={() => setShowSaveForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button className="flex-1 rounded-full" onClick={handleSave}>
                    Guardar plantilla
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  className="w-full rounded-full"
                  variant="outline"
                  onClick={() => setShowSaveForm(true)}
                >
                  Guardar configuracion actual
                </Button>

                {templates.length === 0 ? (
                  <div className="rounded-[var(--radius-3xl)] border border-dashed border-border bg-white/72 px-5 py-10 text-center">
                    <p className="font-display text-xl text-foreground">
                      Aun no tienes plantillas guardadas
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Guarda tus combinaciones frecuentes para abrir el estudio
                      ya orientado.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {templates.map((template) => (
                      <article
                        key={template.id}
                        className="flex items-start justify-between gap-4 rounded-[var(--radius-3xl)] border border-[rgba(33,62,74,0.1)] bg-white/82 p-4"
                      >
                        <button
                          className="flex-1 text-left"
                          onClick={() => {
                            onLoadTemplate(template);
                            onOpenChange(false);
                          }}
                        >
                          <p className="font-semibold text-foreground">
                            {template.name}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {template.targetAudience} / {template.activities.length}{" "}
                            actividades /{" "}
                            {template.language === "en" ? "English" : "Espanol"}
                          </p>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Eliminar plantilla ${template.name}`}
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
