'use client';
import type { Activity } from '@repo/schemas';
import { shuffleWithSeed, stringToSeed } from '@/lib/stable-random';

interface Props { activity: Extract<Activity, { type: 'MATCH_CONCEPTS' }> & { language?: string } }

export function MatchConceptsActivity({ activity }: Props) {
    const isEn = activity.language === 'en';
    const concepts = activity.pairs.map((p) => p.concept);
    const definitions = shuffleWithSeed(
        activity.pairs.map((pair) => pair.definition),
        stringToSeed(activity.pairs.map((pair) => `${pair.concept}:${pair.definition}`).join('|')),
    );

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div className="space-y-3">
                    <p className="font-semibold text-xs uppercase tracking-wide text-gray-500 mb-1">{isEn ? 'Concepts' : 'Conceptos'}</p>
                    {concepts.map((concept, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-sm font-medium">{concept}</span>
                            <span className="flex-1 border-b border-dashed border-gray-400 min-w-[40px]" />
                            <div className="w-3 h-3 rounded-full border-2 border-gray-600 bg-white" />
                        </div>
                    ))}
                </div>
                <div className="space-y-3">
                    <p className="font-semibold text-xs uppercase tracking-wide text-gray-500 mb-1">{isEn ? 'Definitions' : 'Definiciones'}</p>
                    {definitions.map((def, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border-2 border-gray-600 bg-white flex-shrink-0" />
                            <span className="text-sm">{def}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
