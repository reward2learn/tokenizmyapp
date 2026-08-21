import 'server-only';

import Stripe from 'stripe';

/**
 * Server-only Stripe client for this tenant app on Vercel.
 *
 * Keys are provisioned by either:
 * - Vercel Marketplace “Install Stripe” OAuth (preferred) — writes
 *   STRIPE_SECRET_KEY (+ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for the client)
 * - Platform admin key push via the factory stripe-env route
 *
 * Prefer Marketplace so secrets never leave Vercel’s integration boundary.
 */
const secretKey =
  process.env.STRIPE_SECRET_KEY
  ?? process.env.STRIPE_API_KEY
  ?? '';

if (!secretKey && process.env.NODE_ENV !== 'production') {
  console.warn(
    '[stripe] STRIPE_SECRET_KEY is not set. Install Stripe from the Vercel Marketplace '
    + 'or push keys from the factory admin wizard.',
  );
}

export const stripe = new Stripe(secretKey || 'sk_test_placeholder', {
  // Keep in sync with the control-plane pin in src/lib/billing/stripe-client.ts
  apiVersion: '2026-07-29.dahlia',
  typescript: true,
});
