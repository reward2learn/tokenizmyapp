'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Tracks an element's content-box width via ResizeObserver.
 * Returns a stable ref to attach and the latest measured width (null before first measure).
 */
export function useElementWidth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setWidth(el.getBoundingClientRect().width);

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
