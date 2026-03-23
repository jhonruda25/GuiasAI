import { create } from 'zustand';
import type { WorkGuideRecord } from '@/services/work-guide.api';

type GenerationStatus = 'idle' | 'loading' | 'generating' | 'completed' | 'error';

interface WorkGuideState {
  status: GenerationStatus;
  guideId: string | null;
  workGuide: WorkGuideRecord | null;
  error: string | null;
  
  setStatus: (status: GenerationStatus) => void;
  setGuideId: (guideId: string) => void;
  setWorkGuide: (workGuide: WorkGuideRecord) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useWorkGuideStore = create<WorkGuideState>((set) => ({
  status: 'idle',
  guideId: null,
  workGuide: null,
  error: null,

  setStatus: (status) => set({ status }),
  setGuideId: (guideId) => set({ guideId }),
  setWorkGuide: (workGuide) => set({ workGuide, status: 'completed', guideId: workGuide.id }),
  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),
  reset: () => set({ status: 'idle', guideId: null, workGuide: null, error: null }),
}));
