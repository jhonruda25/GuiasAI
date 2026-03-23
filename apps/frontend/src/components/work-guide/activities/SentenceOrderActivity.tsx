'use client';
import type { Activity } from '@repo/schemas';
import { shuffleWithSeed, stringToSeed } from '@/lib/stable-random';

interface Props {
  activity: Activity;
}

export function SentenceOrderActivity({ activity }: Props) {
  if (activity.type !== 'SENTENCE_ORDER') return null;
  
  const typedActivity = activity as Extract<Activity, { type: 'SENTENCE_ORDER' }>;
  const sentences = typedActivity.sentences || [];
  const instructions = typedActivity.instructions || '';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 italic">{instructions}</p>
      <ol className="list-decimal pl-6 space-y-4">
        {sentences.map((item, idx) => (
          <li key={idx} className="text-sm">
            <div className="flex flex-wrap gap-2 mt-2">
              {shuffleWithSeed(item.words, stringToSeed(`${item.original}:${idx}`)).map((word, wordIdx) => (
                <span 
                  key={wordIdx} 
                  className="inline-block px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
            <div className="mt-2 border-b border-dashed border-gray-300 pb-2">
              <span className="text-xs text-gray-500">Ordena las palabras: </span>
              <span className="text-xs text-gray-400 italic">______ ______ ______</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
