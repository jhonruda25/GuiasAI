'use client';
import Image from 'next/image';
import type { Activity } from '@repo/schemas';

interface Props { activity: Extract<Activity, { type: 'SEQUENTIAL_IMAGE_ANALYSIS' }>; language?: string }

export function SequentialImageActivity({ activity, language }: Props) {
    const isEn = language === 'en';
    const hasImages = activity.generated_images && activity.generated_images.length > 0;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {activity.image_prompts.map((prompt, i) => (
                    <div key={i} className="border border-gray-300 rounded-lg overflow-hidden">
                        {hasImages && activity.generated_images![i] ? (
                            <div className="relative h-40 w-full">
                                <Image
                                    src={activity.generated_images![i]}
                                    alt={`${isEn ? 'Image' : 'Imagen'} ${i + 1}`}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-center p-3">
                                <p className="text-xs text-gray-500 italic">{prompt}</p>
                            </div>
                        )}
                        <div className="p-2 bg-gray-50 text-center">
                            <span className="text-xs font-semibold text-gray-600">{isEn ? 'Image' : 'Imagen'} {i + 1}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-3 mt-2">
                <p className="font-semibold text-sm">{isEn ? 'Questions:' : 'Preguntas:'}</p>
                <ol className="list-decimal pl-6 space-y-4">
                    {activity.questions.map((q, i) => (
                        <li key={i} className="text-sm">
                            {q}
                            <div className="mt-1 border-b border-dashed border-gray-400 w-full" />
                            <div className="mt-1 border-b border-dashed border-gray-400 w-3/4" />
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
