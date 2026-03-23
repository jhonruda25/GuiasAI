'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllWorkGuides, getWorkGuideById, retryWorkGuide, type WorkGuideListItem, type WorkGuideRecord } from '@/services/work-guide.api';
import { WorkGuidePreview } from '@/components/work-guide/work-guide-preview';

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pendiente',
    GENERATING: 'Generando...',
    COMPLETED: 'Completada',
    FAILED: 'Fallida',
};

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    GENERATING: 'bg-blue-100 text-blue-800 border-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    FAILED: 'bg-red-100 text-red-800 border-red-200',
};

interface HistoryPanelProps {
    onNewGuide: () => void;
}

export function HistoryPanel({ onNewGuide }: HistoryPanelProps) {
    const [guides, setGuides] = useState<WorkGuideListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGuide, setSelectedGuide] = useState<WorkGuideRecord | null>(null);
    const [loadingGuide, setLoadingGuide] = useState(false);

    const fetchGuides = useCallback(async () => {
        try {
            const data = await getAllWorkGuides();
            setGuides(data);
        } catch (e) {
            console.error('Error fetching guides:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGuides();
    }, [fetchGuides]);

    const handleSelect = async (guide: WorkGuideListItem) => {
        if (guide.status !== 'COMPLETED') return;
        setLoadingGuide(true);
        try {
            const full = await getWorkGuideById(guide.id);
            setSelectedGuide(full);
        } catch (e) {
            console.error('Error loading guide:', e);
        } finally {
            setLoadingGuide(false);
        }
    };

    const handleBack = () => setSelectedGuide(null);

    const handleRetry = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            setGuides(prev => prev.map(g => g.id === id ? { ...g, status: 'GENERATING', errorMessage: null } : g));
            await retryWorkGuide(id);
        } catch (err) {
            console.error('Error retrying guide:', err);
            fetchGuides();
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (selectedGuide && selectedGuide.content) {
        return (
            <div>
                <button
                    onClick={handleBack}
                    className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    ← Volver al historial
                </button>
                <WorkGuidePreview
                    workGuide={{
                        ...selectedGuide.content,
                        id: selectedGuide.id,
                        language: selectedGuide.language,
                        reviewed: selectedGuide.reviewed,
                        reviewedBy: selectedGuide.reviewedBy,
                        reviewedAt: selectedGuide.reviewedAt,
                    }}
                    onReset={onNewGuide}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Historial de Guías</h2>
                <div className="flex gap-2">
                    <button
                        onClick={fetchGuides}
                        className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        ↻ Actualizar
                    </button>
                    <button
                        onClick={onNewGuide}
                        className="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        + Nueva Guía
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                </div>
            ) : guides.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <p className="text-4xl mb-3">📄</p>
                    <p className="font-medium">No hay guías generadas aún</p>
                    <p className="text-sm mt-1">Crea tu primera guía pedagógica</p>
                    <button
                        onClick={onNewGuide}
                        className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
                    >
                        Generar Guía
                    </button>
                </div>
            ) : (
                <div className="grid gap-3">
                    {guides.map((guide) => (
                        <div
                            key={guide.id}
                            onClick={() => handleSelect(guide)}
                            className={`
                border rounded-xl p-4 transition-all
                ${guide.status === 'COMPLETED'
                                    ? 'cursor-pointer hover:border-black hover:shadow-sm bg-white'
                                    : 'bg-gray-50 cursor-default opacity-80'}
              `}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate">{guide.topic}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{guide.targetAudience}</p>
                                    {guide.status === 'FAILED' && guide.errorMessage && (
                                        <div className="mt-1">
                                            <p className="text-xs text-red-600 truncate">{guide.errorMessage}</p>
                                            <button
                                                onClick={(e) => handleRetry(e, guide.id)}
                                                className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors font-medium flex items-center gap-1"
                                            >
                                                ↻ Reintentar Generación
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {guide.globalScore && guide.status === 'COMPLETED' && (
                                        <span className="text-xs text-gray-500">{guide.globalScore} pts</span>
                                    )}
                                    {guide.reviewed && (
                                        <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-green-100 text-green-800 border-green-200">
                                            ✓ Revisada
                                        </span>
                                    )}
                                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[guide.status]}`}>
                                        {STATUS_LABELS[guide.status]}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-400">{formatDate(guide.createdAt)}</p>
                                {guide.status === 'COMPLETED' && (
                                    <span className="text-xs text-gray-400">
                                        {loadingGuide ? 'Cargando...' : 'Ver y descargar →'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
