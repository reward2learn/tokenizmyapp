/**
 * Invoice history — Phase 6.
 *
 * GET /api/admin/organizations/[orgId]/invoices
 *
 * Read straight from Stripe rather than mirrored into our database. Invoices
 * are Stripe's record, not ours: totals change with credit notes, refunds and
 * tax adjustments, and a local copy would drift from the document the customer
 * can actually download. The hosted invoice URL is the authoritative artefact.
 */
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { sessionIsPlatformAdmin } from '@/lib/auth/jwt';
import { jsonError, jsonOk } from '@/lib/api/response';
import { getOrganization } from '@/domain/billing/organization-service';
import { getStripeLinkage } from '@/domain/billing/stripe-service';
import { getStripe } from '@/lib/billing/stripe-client';

export const dynamic = 'force-dynamic';

const INVOICE_LIMIT = 24;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
): Promise<Response> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;
  if (!sessionIsPlatformAdmin(guard.session)) return jsonError('Platform admin only', 403);

  const { orgId } = await params;
  const stripe = getStripe();

  // An unconfigured deployment has no invoices, which is not an error — the
  // tab renders an empty state rather than a failure.
  if (!stripe) return jsonOk({ invoices: [], stripeConfigured: false });

  const db = createRawClient();
  try {
    const organization = await getOrganization(db, orgId);
    if (!organization) return jsonError('Organization not found', 404);

    const { customerId } = await getStripeLinkage(orgId, db);
    if (!customerId) return jsonOk({ invoices: [], stripeConfigured: true });

    const list = await stripe.invoices.list({ customer: customerId, limit: INVOICE_LIMIT });

    return jsonOk({
      stripeConfigured: true,
      invoices: list.data.map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        // Amounts are in the invoice's own currency's minor unit; the currency
        // travels with them so the UI never assumes USD.
        amountDue: invoice.amount_due,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        created: new Date(invoice.created * 1000).toISOString(),
        periodStart: new Date(invoice.period_start * 1000).toISOString(),
        periodEnd: new Date(invoice.period_end * 1000).toISOString(),
        hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
        invoicePdf: invoice.invoice_pdf ?? null,
      })),
    });
  } catch (err) {
    return jsonError('Failed to load invoices: ' + (err as Error).message, 500);
  }
}
