"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
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
import type { SelectedActivity } from "@/lib/work-guide-options";

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
      activities: currentActivities,
    });
    setTemplateName("");
    setShowSaveForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plantillas docentes</DialogTitle>
          <DialogDescription>
            Guarda combinaciones de idioma, grado y actividades para reutilizar
            tu flujo de trabajo.
          </DialogDescription>
        </DialogHeader>

        {showSaveForm ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Nombre de la plantilla</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="Ejemplo: Taller de ciencias para quinto"
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
              <div className="rounded-[var(--radius-3xl)] border border-dashed border-border bg-muted/40 px-5 py-10 text-center">
                <p className="font-display text-xl text-foreground">
                  Aun no tienes plantillas guardadas
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Guarda tus selecciones frecuentes para armar guias mas rapido.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {templates.map((template) => (
                  <article
                    key={template.id}
                    className="flex items-start justify-between gap-4 rounded-[var(--radius-3xl)] border border-border bg-background/80 p-4"
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
                        {template.targetAudience} · {template.activities.length}{" "}
                        actividades ·{" "}
                        {template.language === "en" ? "Ingles" : "Espanol"}
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
      </DialogContent>
    </Dialog>
  );
}
