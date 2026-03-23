'use client';

import { useMemo } from 'react';
import type { Activity } from '@repo/schemas';
import { createSeededRandom, stringToSeed } from '@/lib/stable-random';

type WordScramble = Extract<Activity, { type: 'WORD_SCRAMBLE' }>;

function scrambleWord(word: string, seed: number) {
    const arr = word.split('');
    const random = createSeededRandom(seed);

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    // Si de casualidad quedó igual (en palabras grandes), volver a mezclar
    const scrambled = arr.join('');
    if (scrambled === word && word.length > 2) {
        return scrambleWord(word, seed + 1);
    }

    return scrambled;
}

export function WordScrambleActivity({ activity }: { activity: WordScramble }) {
    const seedBase = stringToSeed(
        `${activity.score}:${activity.words.map((item) => item.word).join('|')}`,
    );

    const scrambledWords = useMemo(() => {
        return activity.words.map((wordItem, idx) => ({
            ...wordItem,
            scrambled: scrambleWord(wordItem.word, seedBase + idx)
        }));
    }, [activity.words, seedBase]);

    return (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
            {scrambledWords.map((item, i) => (
                <div key={i} className="border border-gray-200 rounded p-3 flex flex-col justify-between">
                    <div>
                        <span className="bg-gray-100 font-mono text-lg font-bold tracking-[0.3em] px-2 py-1 rounded border border-gray-300 inline-block mb-2 text-center w-full">
                            {item.scrambled}
                        </span>
                        <p className="text-gray-600 mb-4 line-clamp-2">⭐ {item.hint}</p>
                    </div>

                    <div className="flex justify-center space-x-1 mt-2">
                        {item.word.split('').map((_, j: number) => (
                            <span key={j} className="border-b-2 border-black w-5 h-6 inline-block"></span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
