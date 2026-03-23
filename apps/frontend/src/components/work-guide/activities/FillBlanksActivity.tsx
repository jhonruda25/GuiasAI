'use client';
import type { Activity } from '@repo/schemas';

interface Props { activity: Extract<Activity, { type: 'FILL_BLANKS' }> }

export function FillBlanksActivity({ activity }: Props) {
    return (
        <div className="space-y-3">
            <ol className="list-decimal pl-6 space-y-4">
                {activity.sentences.map((sentence, i) => {
                    // Replace [word] with a blank line
                    const rendered = sentence.full_sentence.replace(/\[([^\]]+)\]/g, '___________');
                    return (
                        <li key={i} className="text-sm leading-relaxed">
                            {rendered}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
