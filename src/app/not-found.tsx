import Link from 'next/link';
import { DEFAULT_MODE, NEUTRALS, RADIUS, TYPE } from '@/theme/design-tokens';

// Rendered outside the MUI ThemeProvider, so the tokens are read directly
// rather than through `useTheme()` — same values, no provider dependency.
const n = NEUTRALS[DEFAULT_MODE];

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        gap: '0.75rem',
        fontFamily: TYPE.fontFamily,
        background: n.background,
        color: n.text,
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          lineHeight: 1.1,
          fontWeight: TYPE.display.weight,
          letterSpacing: TYPE.display.tracking,
          margin: 0,
        }}
      >
        404
      </h1>
      <p style={{ fontSize: '1rem', margin: 0, color: n.textMuted }}>This page does not exist.</p>
      <Link
        href="/dashboard"
        style={{
          marginTop: '0.75rem',
          padding: '0.5rem 1rem',
          borderRadius: `${RADIUS.control}px`,
          border: `1px solid ${n.border}`,
          background: n.surface,
          color: n.text,
          fontSize: TYPE.control.size,
          fontWeight: TYPE.control.weight,
          textDecoration: 'none',
        }}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
