'use client';

import { useEffect } from 'react';
import { AxiosError } from 'axios';
import { getCurrentUser } from '@/services/auth.api';
import { useSessionStore } from '@/store/session.store';

export function useAuthSession() {
  const { user, loading, hydrated, setLoading, setUser, reset } = useSessionStore();

  useEffect(() => {
    if (hydrated) {
      return;
    }

    let isMounted = true;

    const loadSession = async () => {
      setLoading(true);

      try {
        const { user: currentUser } = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (error) {
        if (isMounted) {
          // No user found or network error - stay logged out
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          // We mark it as hydrated so the effect only runs once
        }
      }
    };

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [hydrated, reset, setLoading, setUser]);

  return {
    user,
    loading,
    hydrated,
  };
}
