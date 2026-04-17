'use client';
import type { Activity } from '@repo/schemas';

interface Props { activity: Extract<Activity, { type: 'BONUS' }>, language?: string }

export function BonusActivity({ activity, language }: Props) {
    const isEn = language === 'en';
    return (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
            <p className="font-bold text-amber-800 mb-2">⭐ {isEn ? 'Creative Challenge:' : 'Reto Creativo:'}</p>
            <p className="text-sm text-amber-900">{activity.challenge}</p>
            <div className="mt-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border-b border-dashed border-amber-400 h-6" />
                ))}
            </div>
        </div>
    );
}
