'use client';
import type { Activity } from '@repo/schemas';

interface Props {
  activity: Activity;
  language?: string;
}

export function DictationActivity({ activity, language }: Props) {
  if (activity.type !== 'DICTATION') return null;
  
  const isEn = language === 'en';
  const typedActivity = activity as Extract<Activity, { type: 'DICTATION' }>;
  const paragraphs = typedActivity.paragraphs || [];
  const instructions = typedActivity.instructions || '';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 italic">{instructions}</p>
      {paragraphs.map((paragraph, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="text-xs text-gray-500 mb-2">
            {isEn ? 'Paragraph' : 'Párrafo'} {idx + 1} ({paragraph.word_count} {isEn ? 'words' : 'palabras'})
          </div>
          <div className="leading-relaxed text-sm font-serif">
            {paragraph.text.split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-1">{word}</span>
            ))}
          </div>
        </div>
      ))}
      <div className="text-xs text-gray-500 mt-2">
        {isEn ? 'Write the previous paragraph in the blanks.' : 'Escribe el párrafo anterior en los espacios en blanco.'}
      </div>
    </div>
  );
}
