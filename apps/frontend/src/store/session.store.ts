import { create } from 'zustand';
import type { SessionUser } from '@/services/auth.api';

interface SessionState {
  user: SessionUser | null;
  loading: boolean;
  hydrated: boolean;
  setLoading: (loading: boolean) => void;
  setUser: (user: SessionUser | null) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  loading: true,
  hydrated: false,
  setLoading: (loading) => set({ loading }),
  setUser: (user) => set({ user, loading: false, hydrated: true }),
  reset: () => set({ user: null, loading: false, hydrated: true }),
}));
