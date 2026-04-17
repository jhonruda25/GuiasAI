'use client';
import { useMemo } from 'react';
import type { Activity } from '@repo/schemas';
import { createSeededRandom, stringToSeed } from '@/lib/stable-random';

interface Props {
    activity: Extract<Activity, { type: 'WORD_SEARCH' }>;
    language?: string;
    theme?: { color: string; emoji: string; };
}

// Simple word search grid generator
function generateWordSearch(words: string[], size = 12): string[][] {
    const grid: string[][] = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => '')
    );
    const random = createSeededRandom(stringToSeed(words.join('|')));

    const directions = [
        [0, 1], [1, 0], [1, 1], [0, -1], [-1, 0],
    ];

    const cleanWords = words
        .map((w) => w.toUpperCase().replace(/[^A-ZÁÉÍÓÚÜÑ]/g, ''))
        .filter((w) => w.length <= size);

    for (const word of cleanWords) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
            attempts++;
            const [dr, dc] = directions[Math.floor(random() * directions.length)];
            const row = Math.floor(random() * size);
            const col = Math.floor(random() * size);
            const endRow = row + dr * (word.length - 1);
            const endCol = col + dc * (word.length - 1);
            if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

            let canPlace = true;
            for (let i = 0; i < word.length; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (grid[r][c] !== '' && grid[r][c] !== word[i]) { canPlace = false; break; }
            }
            if (canPlace) {
                for (let i = 0; i < word.length; i++) grid[row + dr * i][col + dc * i] = word[i];
                placed = true;
            }
        }
    }

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++)
            if (!grid[r][c]) grid[r][c] = letters[Math.floor(random() * letters.length)];

    return grid;
}

export function WordSearchGrid({ activity, language, theme }: Props) {
    const isEn = language === 'en';
    const words = activity.items.map((item) => item.word);
    const grid = useMemo(() => generateWordSearch(words), [words]);

    // Dynamic styles based on AI theme
    const borderColor = theme?.color || '#d1d5db'; // default gray-300
    const backgroundColor = theme ? `${theme.color}15` : 'transparent'; // 15 = ~8% opacity hex

    return (
        <div className="space-y-4 rounded-xl p-6 border-4" style={{ borderColor, backgroundColor }}>

            {/* Top decorative emojis */}
            {theme?.emoji && (
                <div className="flex justify-around text-2xl mb-4 select-none" aria-hidden="true">
                    {[...Array(7)].map((_, i) => <span key={`top-${i}`}>{theme.emoji}</span>)}
                </div>
            )}

            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold uppercase tracking-widest" style={{ color: theme?.color || 'inherit' }}>
                    {isEn ? 'WORD SEARCH' : 'SOPA DE LETRAS'}
                </h3>
            </div>

            <div className="overflow-x-auto flex justify-center">
                <table className="border-collapse bg-white shadow-sm" style={{ border: `3px solid ${borderColor}` }}>
                    <tbody>
                        {grid.map((row, r) => (
                            <tr key={r}>
                                {row.map((cell, c) => (
                                    <td
                                        key={c}
                                        className="border w-8 h-8 md:w-10 md:h-10 text-center text-sm md:text-base font-mono font-bold select-none transition-colors hover:bg-black/5"
                                        style={{ borderColor }}
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom decorative emojis */}
            {theme?.emoji && (
                <div className="flex justify-around text-2xl mt-4 mb-6 select-none" aria-hidden="true">
                    {[...Array(7)].map((_, i) => <span key={`bottom-${i}`}>{theme.emoji}</span>)}
                </div>
            )}

            <div className="mt-8 p-4 bg-white/80 rounded-lg shadow-sm border" style={{ borderColor: `${borderColor}40` }}>
                <p className="font-semibold text-sm mb-2">{isEn ? 'Words to find:' : 'Palabras a encontrar:'}</p>
                <div className="flex flex-wrap gap-2">
                    {activity.items.map((item, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm font-medium border border-gray-300">
                            {item.word}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
