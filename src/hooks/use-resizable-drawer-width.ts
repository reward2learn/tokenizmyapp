'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

export type DrawerAnchor = 'left' | 'right';

export interface UseResizableDrawerWidthOptions {
  storageKey: string;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  anchor: DrawerAnchor;
  enabled?: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readStoredWidth(storageKey: string): number | null {
  try {
    const raw = globalThis.localStorage?.getItem(storageKey);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function useResizableDrawerWidth({
  storageKey,
  defaultWidth,
  minWidth,
  maxWidth,
  anchor,
  enabled = true,
}: UseResizableDrawerWidthOptions) {
  const [width, setWidthState] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const widthRef = useRef(defaultWidth);

  useEffect(() => {
    const stored = readStoredWidth(storageKey);
    if (stored !== null) {
      const clamped = clamp(stored, minWidth, maxWidth);
      setWidthState(clamped);
      widthRef.current = clamped;
    }
  }, [storageKey, minWidth, maxWidth]);

  const persistWidth = useCallback(
    (next: number) => {
      const clamped = clamp(next, minWidth, maxWidth);
      widthRef.current = clamped;
      setWidthState(clamped);
      try {
        globalThis.localStorage?.setItem(storageKey, String(clamped));
      } catch {
        // ignore storage errors
      }
    },
    [storageKey, minWidth, maxWidth],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = widthRef.current;
      setIsResizing(true);

      const onPointerMove = (moveEvent: PointerEvent) => {
        const delta =
          anchor === 'right'
            ? startX - moveEvent.clientX
            : moveEvent.clientX - startX;
        const viewportMax = Math.floor(window.innerWidth * 0.92);
        const effectiveMax = Math.min(maxWidth, viewportMax);
        const next = clamp(startWidth + delta, minWidth, effectiveMax);
        widthRef.current = next;
        setWidthState(next);
      };

      const onPointerUp = () => {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        persistWidth(widthRef.current);
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    },
    [anchor, enabled, maxWidth, minWidth, persistWidth],
  );

  return { width, isResizing, onPointerDown };
}
