'use client';

import { useState, useEffect } from 'react';
import { useTemplateStore, type Template } from '@/store/template.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (template: Template) => void;
  currentActivities: { id: string; count: number | '' }[];
  currentAudience: string;
  currentLanguage: string;
}

export function TemplateModal({
  isOpen,
  onClose,
  onLoadTemplate,
  currentActivities,
  currentAudience,
  currentLanguage,
}: TemplateModalProps) {
  const { templates, loadTemplates, saveTemplate, deleteTemplate } = useTemplateStore();
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, loadTemplates]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!templateName.trim()) return;
    saveTemplate({
      name: templateName,
      targetAudience: currentAudience,
      language: currentLanguage,
      activities: currentActivities,
    });
    setTemplateName('');
    setShowSaveForm(false);
  };

  const handleLoad = (template: Template) => {
    onLoadTemplate(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Plantillas Guardadas</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {showSaveForm ? (
          <div className="space-y-4">
            <div>
              <Label>Nombre de la plantilla</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ej: Examen de Ciencias"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSaveForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button
              onClick={() => setShowSaveForm(true)}
              className="w-full mb-4"
              variant="outline"
            >
              + Guardar Configuración Actual
            </Button>

            {templates.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay plantillas guardadas.<br />
                <span className="text-sm">Guarda tu configuración actual para reutilizarla después.</span>
              </p>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-3 hover:border-black transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 cursor-pointer" onClick={() => handleLoad(template)}>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-500">
                          {template.targetAudience} · {template.activities.length} actividades
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplate(template.id);
                        }}
                        className="text-red-500 hover:text-red-700 text-xs px-2"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
