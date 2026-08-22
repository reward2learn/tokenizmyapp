'use server';

import { createClient } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { ProductService } from '@/domain/commerce/product-service';

export type CheckoutProduct = {
  id: string;
  name: string;
  description?: string;
  /** Amount in the smallest currency unit (e.g. cents). Ignored when stripePriceId is set. */
  priceInCents: number;
  currency?: string;
  /**
   * When set, Checkout uses this Stripe Price instead of ad-hoc price_data.
   * Prefer for recurring / Dashboard-managed prices.
   */
  stripePriceId?: string;
};

function isStripePriceId(id: string): boolean {
  return id.startsWith('price_');
}

/**
 * Resolve a sellable product for Checkout.
 *
 * Lookup order:
 * 1. Active Product row by id
 * 2. Active Product row by slug
 * 3. If the id looks like a Stripe Price (`price_…`), treat it as a Dashboard price
 *
 * Product.metadata.stripePriceId (when present) wins over ad-hoc price_data.
 */
export async function getProduct(productId: string): Promise<CheckoutProduct | null> {
  const id = productId.trim();
  if (!id) return null;

  const db = createClient({ tier: 'public' });
  const products = new ProductService(db);

  const row =
    (await products.getById(id)) ??
    (await products.getBySlug(id));

  if (row) {
    if (!row.isActive) return null;

    const meta = row.metadata ?? {};
    const stripePriceId =
      typeof meta.stripePriceId === 'string' && meta.stripePriceId.startsWith('price_')
        ? meta.stripePriceId
        : undefined;

    return {
      id: row.id,
      name: row.name,
      description: row.summary || row.description || undefined,
      // Product.price is stored in the smallest currency unit (cents).
      priceInCents: row.price,
      currency: (row.currency || 'usd').toLowerCase(),
      stripePriceId,
    };
  }

  // No local catalog row — allow charging a Stripe Dashboard price directly.
  if (isStripePriceId(id)) {
    const price = await stripe.prices.retrieve(id, { expand: ['product'] });
    if (!price.active) return null;

    const productName =
      typeof price.product === 'string'
        ? price.product
        : price.product && !price.product.deleted
          ? price.product.name
          : id;

    return {
      id,
      name: productName,
      description: price.nickname ?? undefined,
      priceInCents: price.unit_amount ?? 0,
      currency: (price.currency || 'usd').toLowerCase(),
      stripePriceId: id,
    };
  }

  return null;
}

/**
 * Start an Embedded Checkout Session and return the client secret.
 * Runs only on the server (Vercel Function) — never expose STRIPE_SECRET_KEY.
 */
export async function startCheckoutSession(productId: string): Promise<string | null> {
  const product = await getProduct(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const lineItem = product.stripePriceId
    ? { price: product.stripePriceId, quantity: 1 }
    : {
        price_data: {
          currency: product.currency ?? 'usd',
          product_data: {
            name: product.name,
            ...(product.description ? { description: product.description } : {}),
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      };

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded_page',
    redirect_on_completion: 'never',
    line_items: [lineItem],
    mode: 'payment',
  });

  return session.client_secret;
}
