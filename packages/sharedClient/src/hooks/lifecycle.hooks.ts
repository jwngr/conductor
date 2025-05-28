import {useEffect, useRef} from 'react';

import {logger} from '@shared/services/logger.shared';

import type {Task} from '@shared/types/utils.types';

/**
 * Returns a ref object which is true on the first mount of the component, or false on subsequent mounts.
 */
export function useIsMounted(): React.RefObject<boolean> {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}

/**
 * Returns true on the first mount of the component, or false on subsequent mounts.
 */
export function useIsFirstMount(): boolean {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return false;
}

/**
 * Runs a callback only on the first mount of the component. The provided callback should
 * be memoized since it is not included in any dependency array.
 */
export function useFirstMountEffect(callback: Task): void {
  const hasRun = useRef(false);
  const savedCallback = useRef(callback);

  if (savedCallback.current !== callback) {
    logger.warn('Callback identity changed between renders. Consider memoizing it.');
  }

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      savedCallback.current();
    }
  }, []);
}
