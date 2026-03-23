'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useWorkGuideStore } from '../store/work-guide.store';
import { workGuideApi } from '../services/work-guide.api';
import { getWorkGuideEventsUrl } from '../services/work-guide.api';

export function useWorkGuideSse(guideId: string | null) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const { setWorkGuide, setError, setStatus } = useWorkGuideStore();

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!guideId) return;

    const connectSSE = async () => {
      try {
        const statusResponse = await workGuideApi.getStatus(guideId);
        
        if (statusResponse.status === 'COMPLETED' && statusResponse.content) {
          setWorkGuide(statusResponse);
          return;
        }
        
        if (statusResponse.status === 'FAILED') {
          setError(statusResponse.errorMessage || 'Generation failed');
          return;
        }

        setStatus('generating');

        const eventSource = new EventSource(getWorkGuideEventsUrl(guideId), {
          withCredentials: true,
        });
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.status === 'COMPLETED') {
              void workGuideApi.getStatus(guideId).then((record) => {
                setWorkGuide(record);
              });
              cleanup();
            } else if (data.status === 'FAILED') {
              setError(data.error || 'Generation failed');
              cleanup();
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        };

        eventSource.onerror = () => {
          setError('Connection lost. Attempting to reconnect...');
          cleanup();
        };
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    connectSSE();

    return cleanup;
  }, [guideId, setWorkGuide, setError, setStatus, cleanup]);
}
