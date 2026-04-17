'use client';
import type { Activity } from '@repo/schemas';

interface Props {
  activity: Activity;
  language?: string;
}

export function TableCompletionActivity({ activity, language }: Props) {
  if (activity.type !== 'TABLE_COMPLETION') return null;
  
  const isEn = language === 'en';
  const typedActivity = activity as Extract<Activity, { type: 'TABLE_COMPLETION' }>;
  const table = typedActivity.table || { headers: [], rows: [] };
  const instructions = typedActivity.instructions || '';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 italic">{instructions}</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              {table.headers.map((header, idx) => (
                <th key={idx} className="border border-gray-300 p-2 font-bold text-center">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {table.headers.map((header, colIdx) => (
                  <td key={colIdx} className="border border-gray-300 p-2 min-w-24">
                    <div className="h-6 border-b border-gray-300"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">
        {isEn ? 'Complete the table with the correct information.' : 'Completa la tabla con la información correcta.'}
      </p>
    </div>
  );
}
