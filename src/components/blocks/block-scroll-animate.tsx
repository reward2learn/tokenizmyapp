'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import { resolveBlockAnimate } from '@/lib/schemas/block-animate';

/** Tracks blocks that have already revealed this session (survives Strict Mode remounts). */
const revealedKeys = new Set<string>();

function isInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  return rect.top < vh * 0.92 && rect.bottom > vh * 0.08 && rect.left < vw && rect.right > 0;
}

export interface BlockScrollAnimateProps {
  /** Stable per-section id (e.g. page slug + section id) — used to animate at most once. */
  animationKey: string;
  animate?: unknown;
  disabled?: boolean;
  children: ReactNode;
}

export function BlockScrollAnimate({
  animationKey,
  animate,
  disabled = false,
  children,
}: BlockScrollAnimateProps) {
  const resolved = resolveBlockAnimate(animate);
  const ref = useRef<HTMLDivElement>(null);
  const alreadyRevealed = revealedKeys.has(animationKey);
  const [visible, setVisible] = useState(alreadyRevealed);
  const [transitionOn, setTransitionOn] = useState(false);

  useLayoutEffect(() => {
    if (disabled || !resolved.enabled) {
      revealedKeys.add(animationKey);
      setVisible(true);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealedKeys.add(animationKey);
      setVisible(true);
      return;
    }

    if (revealedKeys.has(animationKey)) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      if (revealedKeys.has(animationKey)) return;
      revealedKeys.add(animationKey);
      requestAnimationFrame(() => {
        setTransitionOn(true);
        requestAnimationFrame(() => setVisible(true));
      });
    };

    if (isInViewport(el)) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animationKey, disabled, resolved.enabled]);

  const showFinal = disabled || !resolved.enabled || visible;

  return (
    <Box
      ref={ref}
      sx={{
        transform: showFinal
          ? `translateY(${resolved.translateYTo}px)`
          : `translateY(${resolved.translateYFrom}px)`,
        opacity: showFinal ? resolved.alphaTo : resolved.alphaFrom,
        transition: transitionOn
          ? `transform ${resolved.durationMs}ms ease-out ${resolved.delayMs}ms, opacity ${resolved.durationMs}ms ease-out ${resolved.delayMs}ms`
          : 'none',
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
