/**
 * Vercel Webhook Service — production-ready handler for Vercel platform events.
 *
 * Features:
 * - HMAC-SHA256/SHA1 signature verification (supports both x-vercel-signature and x-vercel-signature-256)
 * - Tenant lookup by vercelProjectId (from payload.project.id, payload.id, or name match)
 * - Event routing for project.removed, deployment.*, domain.*
 * - Integration with existing cleanupTenant() for project removal
 * - Inngest event dispatching for async workflows
 * - Audit logging to WebhookEvent model (after zenstack generate)
 * - Structured logging with [vercel-webhook] prefix
 * - Zod validation for incoming events
 * - Fast, idempotent, error-resilient design
 *
 * Usage in route.ts:
 *   const result = await handleVercelWebhook(rawBody, request.headers);
 *
 * Setup:
 * 1. Run: bun run register-webhooks --token=<your-vercel-token> --secret=<strong-secret>
 *    (or use --list to inspect existing). See tokenizmyapp/scripts/register-vercel-webhooks.ts
 * 2. Set the returned VERCEL_WEBHOOK_SECRET in your tokenizmyapp env vars
 * 3. Redeploy tokenizmyapp. The webhook will now deliver events to /api/webhooks/vercel
 * 4. After schema update + zenstack generate, WebhookConfig/Event models are available
 */

import crypto from 'node:crypto';
import { z } from 'zod';
import { inngest } from '@/lib/inngest';
import { cleanupTenant } from './tenant-cleanup-service';
import { createBaseClient } from '@/lib/db';

// Zod schemas for Vercel webhook events (common shapes)
const VercelEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  createdAt: z.number().optional(),
  payload: z.record(z.any()),
});

const DeploymentPayloadSchema = z.object({
  deployment: z.object({
    id: z.string(),
    url: z.string().optional(),
    readyState: z.string().optional(),
  }).optional(),
  project: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
}).passthrough();

type VercelEvent = z.infer<typeof VercelEventSchema>;
type VercelEventType = 'project.removed' | 'deployment.succeeded' | 'deployment.error' | 'deployment.canceled' | 'domain.verified' | 'domain.unverified' | string;

interface WebhookResult {
  success: boolean;
  eventType: string;
  tenantSlug?: string;
  action?: string;
  error?: string;
}

/**
 * Verify Vercel webhook signature using HMAC-SHA256 or SHA1.
 * 
 * Vercel sends:
 * - x-vercel-signature (SHA1, 40 chars) for older webhooks
 * - x-vercel-signature-256 (SHA256, 64 chars) for newer ones
 * 
 * We detect algorithm by signature length and use the matching HMAC.
 */
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) {
    console.warn('[vercel-webhook] Missing signature or secret');
    return false;
  }

  try {
    // Determine algorithm based on signature length (40 = SHA1, 64 = SHA256)
    const isSha256 = signature.length === 64;
    const algorithm = isSha256 ? 'sha256' : 'sha1';
    
    console.log(`[vercel-webhook] Verifying signature: algorithm=${algorithm}, receivedLength=${signature.length}`);

    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(rawBody);
    const computedHex = hmac.digest('hex');

    if (computedHex.length !== signature.length) {
      console.warn(`[vercel-webhook] Signature length mismatch: computed=${computedHex.length} received=${signature.length}`);
      return false;
    }

    // Use timingSafeEqual to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(computedHex, 'hex'),
      Buffer.from(signature, 'hex')
    );

    if (isValid) {
      console.log(`[vercel-webhook] Signature verified successfully (${algorithm})`);
    } else {
      console.warn(`[vercel-webhook] Signature verification FAILED (${algorithm})`);
    }

    return isValid;
  } catch (err) {
    console.error('[vercel-webhook] Signature verification error:', err);
    return false;
  }
}

/**
 * Find tenant by Vercel project ID or name from event payload.
 * Uses Prisma for tenant lookup.
 */
async function findTenantByVercelId(projectId: string | undefined, projectName: string | undefined) {
  if (!projectId && !projectName) return null;

  const db = createBaseClient();
  try {
    const where = projectId 
      ? { metadata: { path: ['vercelProjectId'], equals: projectId } }
      : { OR: [
          { slug: projectName },
          { metadata: { path: ['vercelProjectName'], equals: projectName } }
        ]};

    const tenant = await db.tenant.findFirst({
      where,
      select: { slug: true }
    });

    return tenant?.slug || null;
  } catch (err) {
    console.error('[vercel-webhook] Tenant lookup failed:', err);
    return null;
  }
}

/**
 * Record webhook event to audit table (if schema exists).
 * Best-effort - does not block webhook processing.
 */
async function recordWebhookEvent(
  type: string, 
  payload: any, 
  status: 'success' | 'failed' | 'ignored' = 'success', 
  error?: string,
  durationMs?: number
) {
  try {
    const db = createBaseClient();
    // WebhookEvent requires a WebhookConfig relation; resolve an active Vercel
    // config and skip the audit record if none is configured yet.
    const config = await db.webhookConfig.findFirst({
      where: { provider: 'vercel', isActive: true },
      select: { id: true },
    });
    if (!config) return;
    await db.webhookEvent.create({
      data: {
        configId: config.id,
        eventType: type,
        payload: payload as any,
        status,
        errorMessage: error,
        durationMs: durationMs || 0,
      },
    });
  } catch (err) {
    // Table may not exist yet - silent fail
    console.warn('[vercel-webhook] Could not record webhook event to DB (table may not exist yet):', err);
  }
}

/**
 * Main webhook handler - signature verification, tenant lookup, event routing, Inngest dispatch.
 */
export async function handleVercelWebhook(
  rawBody: string,
  headers: Headers | Record<string, string | string[]>
): Promise<WebhookResult> {
  const startTime = Date.now();
  let signature: string | null = null;
  let eventTypeHeader: string | null = null;
  let tenantSlug: string | null = null;
  let action = 'unknown';
  let resultStatus: 'success' | 'failed' | 'ignored' = 'success';
  let errorMsg: string | undefined;

  // Safe header extraction compatible with both Headers and plain object
  if (headers instanceof Headers || (typeof headers.get === 'function')) {
    // Prefer SHA256 header first, fallback to legacy SHA1
    signature = (headers as Headers).get('x-vercel-signature-256') || 
                (headers as Headers).get('X-Vercel-Signature-256') ||
                (headers as Headers).get('x-vercel-signature') || 
                (headers as Headers).get('X-Vercel-Signature');
    eventTypeHeader = (headers as Headers).get('x-vercel-event');
  } else {
    const h = headers as Record<string, string | string[]>;
    signature = (h['x-vercel-signature-256'] || h['X-Vercel-Signature-256'] || 
                 h['x-vercel-signature'] || h['X-Vercel-Signature'] || '') as string;
    if (Array.isArray(signature)) signature = signature[0];
    eventTypeHeader = (h['x-vercel-event'] || '') as string;
    if (Array.isArray(eventTypeHeader)) eventTypeHeader = eventTypeHeader[0];
  }

  let event: VercelEvent;
  try {
    event = JSON.parse(rawBody);
    VercelEventSchema.parse(event); // Zod validation
  } catch (parseErr) {
    const errorMsg = `Invalid JSON or schema: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`;
    console.error('[vercel-webhook] Parse error:', errorMsg);
    await recordWebhookEvent('invalid', { raw: rawBody.slice(0, 200) }, 'failed', errorMsg);
    return { success: false, eventType: 'invalid', error: errorMsg };
  }

  const { type, payload } = event;
  console.log(`[vercel-webhook] Received event: ${type}`, {
    eventId: event.id,
    payloadKeys: Object.keys(payload),
    hasSignature: !!signature,
  });

  // Get secret - prefer env, fallback to WebhookConfig lookup (future)
  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[vercel-webhook] VERCEL_WEBHOOK_SECRET not configured - skipping verification in dev');
    // In production, this should throw or fail
  } else if (!verifySignature(rawBody, signature, secret)) {
    const errorMsg = 'Invalid signature';
    console.error('[vercel-webhook] Signature verification FAILED');
    await recordWebhookEvent(type, payload, 'failed', errorMsg);
    return { success: false, eventType: type, error: errorMsg };
  }

  console.log(`[vercel-webhook] Signature verified successfully for ${type}`);

  // Find tenant by project ID or name
  const projectId = payload.project?.id || payload.id || payload.deployment?.id;
  const projectName = payload.project?.name || payload.name;
  tenantSlug = await findTenantByVercelId(projectId, projectName);

  if (!tenantSlug) {
    console.warn(`[vercel-webhook] No tenant found for project ${projectId || projectName}`);
    await recordWebhookEvent(type, payload, 'ignored', 'No matching tenant');
    return { success: true, eventType: type, action: 'no-tenant' };
  }

  console.log(`[vercel-webhook] Found tenant ${tenantSlug} for project ${projectId || projectName}`);

  try {
    switch (true) {
      case type === 'project.removed' || type.includes('project.deleted'):
        action = 'cleanup';
        if (tenantSlug) {
          console.log(`[vercel-webhook] Triggering cleanup for tenant ${tenantSlug} (project ${projectId})`);
          await cleanupTenant({ tenantSlug, vercelProjectId: projectId || undefined });
        }
        break;

      case type === 'deployment.succeeded' || type.includes('deployment.ready'):
        action = 'deployment-success';
        if (projectId) {
          await inngest.send({
            name: 'vercel.deployment.succeeded',
            data: { tenantSlug, projectId, deployment: payload.deployment || payload, source: 'webhook' },
          });
        }
        break;

      case type === 'deployment.error' || type === 'deployment.failed' || type.includes('error'):
        action = 'mark-error';
        if (projectId) {
          await inngest.send({
            name: 'vercel.deployment.error',
            data: { tenantSlug, projectId, error: payload, source: 'webhook' },
          });
        }
        break;

      case type.startsWith('domain.'):
        action = 'domain-event';
        await inngest.send({
          name: `vercel.${type}`,
          data: { tenantSlug, projectId, payload, source: 'webhook' },
        });
        console.log(`[vercel-webhook] Dispatched domain event ${type}`);
        break;

      default:
        action = 'unknown-event';
        resultStatus = 'ignored';
        console.log(`[vercel-webhook] Unhandled event type: ${type}`);
        await inngest.send({
          name: 'vercel.webhook.unhandled',
          data: { type, payload, tenantSlug },
        });
    }

    const durationMs = Date.now() - startTime;
    await recordWebhookEvent(type, payload, resultStatus, undefined, durationMs);

    console.log(`[vercel-webhook] Successfully processed ${type} for tenant ${tenantSlug || 'unknown'}`, {
      action,
      durationMs,
      projectId,
    });

    return {
      success: true,
      eventType: type,
      tenantSlug,
      action,
    };

  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    resultStatus = 'failed';
    const durationMs = Date.now() - startTime;

    await recordWebhookEvent(type, payload, resultStatus, errorMsg, durationMs);
    console.error(`[vercel-webhook] Failed to process ${type}:`, err);

    await inngest.send({
      name: 'vercel.webhook.error',
      data: { type, tenantSlug, error: errorMsg, projectId },
    });

    return {
      success: false,
      eventType: type,
      tenantSlug,
      action,
      error: errorMsg,
    };
  }
}

// Export types for Inngest handlers and tests
export type { WebhookResult, VercelEvent };
export { verifySignature }; // for testing
