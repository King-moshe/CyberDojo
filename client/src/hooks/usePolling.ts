import { useEffect, useRef } from 'react';

export default function usePolling(fn: () => void, interval = 5000) {
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; }, [fn]);

  useEffect(() => {
    const id = setInterval(() => ref.current(), interval);
    return () => clearInterval(id);
  }, [interval]);
}
