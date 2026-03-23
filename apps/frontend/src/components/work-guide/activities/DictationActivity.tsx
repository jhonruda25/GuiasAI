'use client';
import type { Activity } from '@repo/schemas';

interface Props {
  activity: Activity;
}

export function DictationActivity({ activity }: Props) {
  if (activity.type !== 'DICTATION') return null;
  
  const typedActivity = activity as Extract<Activity, { type: 'DICTATION' }>;
  const paragraphs = typedActivity.paragraphs || [];
  const instructions = typedActivity.instructions || '';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 italic">{instructions}</p>
      {paragraphs.map((paragraph, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="text-xs text-gray-500 mb-2">
            Párrafo {idx + 1} ({paragraph.word_count} palabras)
          </div>
          <div className="leading-relaxed text-sm font-serif">
            {paragraph.text.split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-1">{word}</span>
            ))}
          </div>
        </div>
      ))}
      <div className="text-xs text-gray-500 mt-2">
        Escribe el párrafo anterior en los espacios en blanco.
      </div>
    </div>
  );
}
