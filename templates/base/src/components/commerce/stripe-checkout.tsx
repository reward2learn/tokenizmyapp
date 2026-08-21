'use client';

import { useCallback } from 'react';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { startCheckoutSession } from '@/app/actions/stripe';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

/**
 * Embedded Stripe Checkout for a single product.
 * Mount on a checkout page when Stripe is enabled for this tenant app.
 */
export default function StripeCheckout({ productId }: { productId: string }) {
  const fetchClientSecret = useCallback(
    () => startCheckoutSession(productId),
    [productId],
  );

  if (!stripePromise) {
    return (
      <div id="checkout">
        <p>Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in Vercel env.</p>
      </div>
    );
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
