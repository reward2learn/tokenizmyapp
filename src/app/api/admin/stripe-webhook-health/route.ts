/**
 * POST /api/admin/stripe-webhook-health
 *
 * Server-side Stripe webhook checklist for Flight Check. Same logic as
 * /api/cron/stripe-webhook-health but authenticated with admin JWT.
 */
import { z } from 'zod';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { runStripeWebhookHealthCheck } from '@/domain/billing/stripe-webhook-health-service';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  projectId: z.string().trim().optional(),
  projectNameHint: z.string().trim().optional(),
  allowFactoryFallback: z.boolean().optional(),
  billingTarget: z.boolean().optional(),
});

export async function POST(request: Request): Promise<Response> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: z.infer<typeof bodySchema> = {};
  try {
    body = bodySchema.parse(await request.json().catch(() => ({})));
  } catch (err) {
    return jsonError(
      err instanceof z.ZodError ? err.errors.map((e) => e.message).join('; ') : 'Invalid body',
      400,
    );
  }

  try {
    const result = await runStripeWebhookHealthCheck({
      projectId: body.projectId,
      projectNameHint: body.projectNameHint,
      billingTarget: body.billingTarget ?? true,
      allowFactoryFallback: body.allowFactoryFallback,
    });
    return jsonOk(result);
  } catch (err) {
    return jsonError(
      `Stripe webhook health check failed: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}
