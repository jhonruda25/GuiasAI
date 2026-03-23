import { create } from 'zustand';

export interface Template {
  id: string;
  name: string;
  targetAudience: string;
  language: string;
  activities: { id: string; count: number | '' }[];
  createdAt: string;
}

interface TemplateState {
  templates: Template[];
  loadTemplates: () => void;
  saveTemplate: (template: Omit<Template, 'id' | 'createdAt'>) => void;
  deleteTemplate: (id: string) => void;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],

  loadTemplates: () => {
    try {
      const saved = localStorage.getItem('guiasai_templates');
      if (saved) {
        set({ templates: JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load templates', e);
    }
  },

  saveTemplate: (template) => {
    const newTemplate: Template = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().templates, newTemplate];
    localStorage.setItem('guiasai_templates', JSON.stringify(updated));
    set({ templates: updated });
  },

  deleteTemplate: (id) => {
    const updated = get().templates.filter((t) => t.id !== id);
    localStorage.setItem('guiasai_templates', JSON.stringify(updated));
    set({ templates: updated });
  },
}));
