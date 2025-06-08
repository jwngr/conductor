import {useEffect, useRef, useState} from 'react';

import type {Task} from '@shared/types/utils.types';

export function useTimeout(callback: Task, delay: number | null): void {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay]);
}

export function useDelayedVisibility(delay = 150): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useTimeout(() => setIsVisible(true), delay);

  return isVisible;
}
