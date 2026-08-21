import 'server-only';

import Stripe from 'stripe';

/**
 * Server-only Stripe client for this tenant app on Vercel.
 *
 * Keys come from Vercel project env (pushed by the platform admin Stripe step /
 * stripe-env route) — never hardcode secrets in the repo.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Keep in sync with the control-plane pin in src/lib/billing/stripe-client.ts
  apiVersion: '2026-07-29.dahlia',
  typescript: true,
});
