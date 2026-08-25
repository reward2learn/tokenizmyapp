'use client';

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Box from '@mui/material/Box';
import {
  containerAnimateDelayMs,
  resolveBlockAnimate,
  type BlockAnimateConfig,
} from '@/lib/schemas/block-animate';

/** Tracks blocks revealed on the current route (survives Strict Mode remounts). */
const revealedKeys = new Set<string>();
let activeRouteKey = '';

/** Clear revealed state when the user navigates to a different route. */
export function resetBlockScrollAnimationsForRoute(routeKey: string): void {
  if (routeKey !== activeRouteKey) {
    revealedKeys.clear();
    activeRouteKey = routeKey;
  }
}

function isInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  return rect.top < vh * 0.92 && rect.bottom > vh * 0.08 && rect.left < vw && rect.right > 0;
}

interface BlockAnimateContextValue {
  claimIndex: () => number;
  visible: boolean;
  transitionOn: boolean;
  resolved: BlockAnimateConfig;
  disabled: boolean;
}

const BlockAnimateContext = createContext<BlockAnimateContextValue | null>(null);

function useBlockAnimateContext(): BlockAnimateContextValue | null {
  return useContext(BlockAnimateContext);
}

function animateContainerSx(
  resolved: BlockAnimateConfig,
  index: number,
  showFinal: boolean,
  transitionOn: boolean,
) {
  const delay = containerAnimateDelayMs(resolved, index);
  return {
    transform: showFinal
      ? `translateY(${resolved.translateYTo}px)`
      : `translateY(${resolved.translateYFrom}px)`,
    opacity: showFinal ? resolved.alphaTo : resolved.alphaFrom,
    transition: transitionOn
      ? `transform ${resolved.durationMs}ms ease-out ${delay}ms, opacity ${resolved.durationMs}ms ease-out ${delay}ms`
      : 'none',
    '@media (prefers-reduced-motion: reduce)': {
      transform: 'none',
      opacity: 1,
      transition: 'none',
    },
  };
}

export interface BlockAnimateContainerProps {
  children: ReactNode;
  /** Override auto-assigned stagger index. */
  index?: number;
}

/** Animates one logical container inside a block with staggered delay from block settings. */
export function BlockAnimateContainer({ children, index }: BlockAnimateContainerProps) {
  const ctx = useBlockAnimateContext();
  if (!ctx) return <>{children}</>;

  const assignedIndex = index ?? ctx.claimIndex();
  const showFinal = ctx.disabled || !ctx.resolved.enabled || ctx.visible;

  return (
    <Box sx={animateContainerSx(ctx.resolved, assignedIndex, showFinal, ctx.transitionOn)}>
      {children}
    </Box>
  );
}

export interface BlockAnimateRootProps {
  children: ReactNode;
}

/** Staggers each direct child as its own animated container. */
export function BlockAnimateRoot({ children }: BlockAnimateRootProps) {
  return (
    <>
      {Children.map(children, (child, index) => {
        if (child == null || child === false) return null;
        if (!isValidElement(child)) {
          return (
            <BlockAnimateContainer key={index} index={index}>
              {child}
            </BlockAnimateContainer>
          );
        }
        return (
          <BlockAnimateContainer key={child.key ?? index} index={index}>
            {child}
          </BlockAnimateContainer>
        );
      })}
    </>
  );
}

export interface BlockScrollAnimateProps {
  /** Stable per-section slot (page slug + sort order) — used to animate at most once. */
  animationKey: string;
  animate?: unknown;
  disabled?: boolean;
  /** When true, children supply their own BlockAnimateContainer / BlockAnimateRoot. */
  staggerChildren?: boolean;
  children: ReactNode;
}

export function BlockScrollAnimate({
  animationKey,
  animate,
  disabled = false,
  staggerChildren = false,
  children,
}: BlockScrollAnimateProps) {
  const resolved = resolveBlockAnimate(animate);
  const ref = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const alreadyRevealed = revealedKeys.has(animationKey);
  const [visible, setVisible] = useState(alreadyRevealed);
  const [transitionOn, setTransitionOn] = useState(false);

  indexRef.current = 0;

  const ctx = useMemo<BlockAnimateContextValue>(
    () => ({
      claimIndex: () => indexRef.current++,
      visible,
      transitionOn,
      resolved,
      disabled: disabled || !resolved.enabled,
    }),
    [disabled, resolved, transitionOn, visible],
  );

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

  const content =
    staggerChildren ? (
      children
    ) : (
      <BlockAnimateContainer index={0}>{children}</BlockAnimateContainer>
    );

  return (
    <BlockAnimateContext.Provider value={ctx}>
      <Box ref={ref}>{content}</Box>
    </BlockAnimateContext.Provider>
  );
}
