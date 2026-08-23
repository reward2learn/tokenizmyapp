'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import { resolveBlockAnimate } from '@/lib/schemas/block-animate';

export interface BlockScrollAnimateProps {
  animate?: unknown;
  disabled?: boolean;
  children: ReactNode;
}

export function BlockScrollAnimate({ animate, disabled = false, children }: BlockScrollAnimateProps) {
  const resolved = resolveBlockAnimate(animate);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (disabled || !resolved.enabled || reduceMotion) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [disabled, resolved.enabled, reduceMotion]);

  const showFinal = disabled || !resolved.enabled || reduceMotion || visible;

  return (
    <Box
      ref={ref}
      sx={{
        transform: showFinal
          ? `translateY(${resolved.translateYTo}px)`
          : `translateY(${resolved.translateYFrom}px)`,
        opacity: showFinal ? resolved.alphaTo : resolved.alphaFrom,
        transition: `transform ${resolved.durationMs}ms ease-out ${resolved.delayMs}ms, opacity ${resolved.durationMs}ms ease-out ${resolved.delayMs}ms`,
        '@media (prefers-reduced-motion: reduce)': {
          transform: 'none',
          opacity: 1,
          transition: 'none',
        },
      }}
    >
      {children}
    </Box>
  );
}
