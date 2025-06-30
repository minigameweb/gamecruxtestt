import { useEffect, useRef } from 'react';

export const useInterval = (callback: () => void, delay?: number | undefined, pause?: boolean) => {
  const savedCallback = useRef<() => void>(null!);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    if (delay !== null && !pause) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay, pause]);
}