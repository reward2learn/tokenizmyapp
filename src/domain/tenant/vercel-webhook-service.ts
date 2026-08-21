/**
 * Vercel Webhook Service — production-ready handler for Vercel platform events.
 *
 * Features:
 * - HMAC-SHA1/SHA256 signature verification (x-vercel-signature / x-vercel-signature-256)
 * - Tenant lookup by Tenant.vercelProjectId (or slug / metadata name fallback)
 * - Exact routing for subscribed Vercel event types
 * - cleanupTenant() on project.removed + Inngest dispatch for async work
 * - Best-effort audit logging to WebhookEvent
 *
 * Usage in route.ts:
 *   const result = await handleVercelWebhook(rawBody, request.headers);
 */

import crypto from 'node:crypto';
import { z } from 'zod';
import { inngest } from '@/lib/inngest';
import { cleanupTenant } from './tenant-cleanup-service';
import { createBaseClient } from '@/lib/db';

const VercelEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  createdAt: z.number().optional(),
  payload: z.record(z.any()),
});

type VercelEvent = z.infer<typeof VercelEventSchema>;

/** Official Vercel webhook `type` strings we subscribe to + handle. */
type VercelEventType =
  | 'project.removed'
  | 'deployment.succeeded'
  | 'deployment.error'
  | 'deployment.canceled'
  | 'deployment.cleanup'
  | 'project.domain.verified'
  | 'project.domain.unverified'
  | string;

interface WebhookResult {
  success: boolean;
  eventType: string;
  tenantSlug?: string;
  action?: string;
  error?: string;
}

/**
 * Prefer payload.project.*; for project.removed / project.* the project is at payload.id/name.
 * Never treat deployment.id as a project id.
 */
function extractProjectRef(type: string, payload: Record<string, any>) {
  const projectId: string | undefined =
    payload.project?.id ??
    (type === 'project.removed' || type.startsWith('project.') ? payload.id : undefined);
  const projectName: string | undefined =
    payload.project?.name ?? payload.name;
  return { projectId, projectName };
}

/**
 * Vercel signs with HMAC SHA1 (x-vercel-signature, 40 hex chars) or SHA256
 * (x-vercel-signature-256, 64 hex chars). Detect by length.
 */
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) {
    console.warn('[vercel-webhook] Missing signature or secret');
    return false;
  }

  try {
    const algorithm = signature.length === 64 ? 'sha256' : 'sha1';
    const computedHex = crypto.createHmac(algorithm, secret).update(rawBody).digest('hex');

    if (computedHex.length !== signature.length) {
      console.warn(
        `[vercel-webhook] Signature length mismatch: computed=${computedHex.length} received=${signature.length}`,
      );
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(computedHex, 'hex'),
      Buffer.from(signature, 'hex'),
    );
  } catch (err) {
    console.error('[vercel-webhook] Signature verification error:', err);
    return false;
  }
}

async function findTenantByVercelId(
  projectId: string | undefined,
  projectName: string | undefined,
): Promise<string | null> {
  if (!projectId && !projectName) return null;

  const db = createBaseClient();
  try {
    const tenant = await db.tenant.findFirst({
      where: projectId
        ? { vercelProjectId: projectId }
        : {
            OR: [
              { slug: projectName },
              { metadata: { path: ['vercelProjectName'], equals: projectName } },
            ],
          },
      select: { slug: true },
    });
    return tenant?.slug ?? null;
  } catch (err) {
    console.error('[vercel-webhook] Tenant lookup failed:', err);
    return null;
  }
}

async function recordWebhookEvent(
  type: string,
  payload: unknown,
  status: 'success' | 'failed' | 'ignored' = 'success',
  error?: string,
  durationMs?: number,
) {
  try {
    const db = createBaseClient();
    const config = await db.webhookConfig.findFirst({
      where: { provider: 'vercel', isActive: true },
      select: { id: true },
    });
    if (!config) return;
    await db.webhookEvent.create({
      data: {
        configId: config.id,
        eventType: type,
        payload: payload as object,
        status,
        errorMessage: error,
        durationMs: durationMs || 0,
      },
    });
  } catch (err) {
    console.warn('[vercel-webhook] Could not record webhook event to DB:', err);
  }
}

function getHeader(
  headers: Headers | Record<string, string | string[]>,
  name: string,
): string | null {
  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name);
  }
  const record = headers as Record<string, string | string[]>;
  const value = record[name] ?? record[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * Main webhook handler — signature verification, tenant lookup, event routing, Inngest dispatch.
 */
export async function handleVercelWebhook(
  rawBody: string,
  headers: Headers | Record<string, string | string[]>,
): Promise<WebhookResult> {
  const startTime = Date.now();
  let action = 'unknown';
  let resultStatus: 'success' | 'failed' | 'ignored' = 'success';
  let tenantSlug: string | null = null;

  const signature =
    getHeader(headers, 'x-vercel-signature-256') ||
    getHeader(headers, 'X-Vercel-Signature-256') ||
    getHeader(headers, 'x-vercel-signature') ||
    getHeader(headers, 'X-Vercel-Signature');

  let event: VercelEvent;
  try {
    event = JSON.parse(rawBody);
    VercelEventSchema.parse(event);
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

  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[vercel-webhook] VERCEL_WEBHOOK_SECRET not configured — skipping verification in dev');
  } else if (!verifySignature(rawBody, signature, secret)) {
    const errorMsg = 'Invalid signature';
    console.error('[vercel-webhook] Signature verification FAILED');
    await recordWebhookEvent(type, payload, 'failed', errorMsg);
    return { success: false, eventType: type, error: errorMsg };
  }

  const { projectId, projectName } = extractProjectRef(type, payload);
  tenantSlug = await findTenantByVercelId(projectId, projectName);

  if (!tenantSlug) {
    console.warn(`[vercel-webhook] No tenant found for project ${projectId || projectName}`);
    await recordWebhookEvent(type, payload, 'ignored', 'No matching tenant');
    return { success: true, eventType: type, action: 'no-tenant' };
  }

  console.log(`[vercel-webhook] Found tenant ${tenantSlug} for project ${projectId || projectName}`);

  try {
    // Match official Vercel webhook type strings exactly (see scripts/register-vercel-webhooks.ts).
    switch (type as VercelEventType) {
      case 'project.removed': {
        action = 'cleanup';
        console.log(`[vercel-webhook] Triggering cleanup for tenant ${tenantSlug} (project ${projectId})`);
        const cleanupResult = await cleanupTenant({
          tenantSlug,
          vercelProjectId: projectId || undefined,
        });
        await inngest.send({
          name: 'vercel.project.removed',
          data: {
            tenantSlug,
            projectId: projectId || '',
            cleanupResult,
            source: 'webhook',
          },
        });
        break;
      }

      case 'deployment.succeeded': {
        action = 'deployment-success';
        await inngest.send({
          name: 'vercel.deployment.succeeded',
          data: {
            tenantSlug,
            projectId: projectId || '',
            deployment: payload.deployment || payload,
            source: 'webhook',
          },
        });
        break;
      }

      case 'deployment.error': {
        action = 'mark-error';
        await inngest.send({
          name: 'vercel.deployment.error',
          data: {
            tenantSlug,
            projectId,
            error: payload,
            source: 'webhook',
          },
        });
        break;
      }

      case 'deployment.canceled': {
        action = 'deployment-canceled';
        await inngest.send({
          name: 'vercel.deployment.canceled',
          data: {
            tenantSlug,
            projectId: projectId || '',
            deployment: payload.deployment || payload,
            source: 'webhook',
          },
        });
        break;
      }

      case 'deployment.cleanup': {
        action = 'deployment-cleanup';
        await inngest.send({
          name: 'vercel.deployment.cleanup',
          data: {
            tenantSlug,
            projectId: projectId || '',
            deployment: payload.deployment || payload,
            source: 'webhook',
          },
        });
        break;
      }

      case 'project.domain.verified':
      case 'project.domain.unverified': {
        action = 'domain-event';
        await inngest.send({
          name:
            type === 'project.domain.verified'
              ? 'vercel.project.domain.verified'
              : 'vercel.project.domain.unverified',
          data: { tenantSlug, projectId, payload, source: 'webhook' },
        });
        console.log(`[vercel-webhook] Dispatched domain event ${type}`);
        break;
      }

      default: {
        action = 'unknown-event';
        resultStatus = 'ignored';
        console.log(`[vercel-webhook] Unhandled event type: ${type}`);
        await inngest.send({
          name: 'vercel.webhook.unhandled',
          data: { type, payload, tenantSlug },
        });
      }
    }

    const durationMs = Date.now() - startTime;
    await recordWebhookEvent(type, payload, resultStatus, undefined, durationMs);

    console.log(`[vercel-webhook] Successfully processed ${type} for tenant ${tenantSlug}`, {
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
    const errorMsg = err instanceof Error ? err.message : String(err);
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
      tenantSlug: tenantSlug ?? undefined,
      action,
      error: errorMsg,
    };
  }
}

export type { WebhookResult, VercelEvent };
export { verifySignature };
