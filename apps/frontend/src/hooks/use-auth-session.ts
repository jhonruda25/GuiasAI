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
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 401) {
            reset();
          } else {
            reset();
          }
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
