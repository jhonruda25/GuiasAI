'use client';
import type { Activity } from '@repo/schemas';

interface Props {
  activity: Activity;
}

export function ErrorIdentificationActivity({ activity }: Props) {
  if (activity.type !== 'ERROR_IDENTIFICATION') return null;
  
  const typedActivity = activity as Extract<Activity, { type: 'ERROR_IDENTIFICATION' }>;
  const sentences = typedActivity.sentences || [];
  const instructions = typedActivity.instructions || '';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 italic">{instructions}</p>
      <ol className="list-decimal pl-6 space-y-4">
        {sentences.map((sentence, idx) => (
          <li key={idx} className="text-sm">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
              <p className="font-medium text-red-800">{sentence.sentence_with_error}</p>
            </div>
            <div className="ml-2 space-y-2">
              <div className="text-xs text-gray-600">
                <strong>Errores identificados:</strong>
              </div>
              {sentence.errors?.map((error, errIdx) => (
                <div key={errIdx} className="ml-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-red-100 p-2 rounded">
                    <span className="font-bold">Error:</span> {error.error}
                  </div>
                  <div className="bg-green-100 p-2 rounded">
                    <span className="font-bold">Corrección:</span> {error.correction}
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <span className="text-xs font-bold">Tu respuesta:</span>
                <div className="mt-1 text-gray-400 italic">Escribe los errores que encontraste y sus correcciones</div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
