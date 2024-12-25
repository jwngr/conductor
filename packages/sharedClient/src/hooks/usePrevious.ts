import {useEffect, useRef} from 'react';

/**
 * A hook that returns the previous value of a state variable.
 *
 * @example
 * ```ts
 * const [count, setCount] = useState(0);
 * const previousCount = usePrevious(count);
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
