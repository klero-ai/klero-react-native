import { useCallback, useRef } from 'react';
import type { KleroEventMap, KleroMessage } from './types';

type EventCallback<K extends keyof KleroEventMap> = (
  data: KleroEventMap[K]
) => void;

type EventListeners = {
  [K in keyof KleroEventMap]?: Set<EventCallback<K>>;
};

/**
 * Hook for managing Klero event listeners
 *
 * @example
 * ```tsx
 * const { on, off, handleMessage } = useKleroEvents();
 *
 * useEffect(() => {
 *   const unsubscribe = on('survey:completed', (data) => {
 *     console.log('Survey completed:', data.responseUlid);
 *   });
 *   return unsubscribe;
 * }, [on]);
 * ```
 */
export function useKleroEvents() {
  const listenersRef = useRef<EventListeners>({});

  /**
   * Subscribe to a Klero event
   */
  const on = useCallback(
    <K extends keyof KleroEventMap>(
      event: K,
      callback: EventCallback<K>
    ): (() => void) => {
      if (!listenersRef.current[event]) {
        (listenersRef.current as Record<string, Set<unknown>>)[event as string] = new Set();
      }
      (listenersRef.current[event] as Set<EventCallback<K>>).add(callback);

      // Return unsubscribe function
      return () => {
        (listenersRef.current[event] as Set<EventCallback<K>>)?.delete(
          callback
        );
      };
    },
    []
  );

  /**
   * Unsubscribe from a Klero event
   */
  const off = useCallback(
    <K extends keyof KleroEventMap>(
      event: K,
      callback: EventCallback<K>
    ): void => {
      (listenersRef.current[event] as Set<EventCallback<K>>)?.delete(callback);
    },
    []
  );

  /**
   * Handle a message from the WebView
   * Pass this to the WebView's onMessage prop
   */
  const handleMessage = useCallback((messageData: string) => {
    try {
      const message = JSON.parse(messageData) as KleroMessage<unknown>;

      // Extract event name from type (e.g., "klero:survey:completed" -> "survey:completed")
      const eventName = message.type.replace(
        /^klero:/,
        ''
      ) as keyof KleroEventMap;

      const listeners = listenersRef.current[eventName];
      if (listeners) {
        listeners.forEach((callback) => {
          (callback as EventCallback<typeof eventName>)(
            message.data as KleroEventMap[typeof eventName]
          );
        });
      }
    } catch (e) {
      console.warn('Klero: Failed to parse message', e);
    }
  }, []);

  return {
    on,
    off,
    handleMessage,
  };
}
