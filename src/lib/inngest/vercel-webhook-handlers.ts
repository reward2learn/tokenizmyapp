/**
 * Inngest handlers for Vercel webhook events.
 *
 * Dispatched from vercel-webhook-service.ts for:
 * - project.removed
 * - deployment.succeeded / error / canceled / cleanup
 * - project.domain.verified / unverified
 */

import { inngest } from '@/lib/inngest';
import { getVercelClient, withTeamId } from '@/domain/tenant/vercel-sdk-client';
import { notifyOps } from '@/lib/notifications/tenant-notifications';

/** Vercel deployment states that mean another build is still running. */
const IN_FLIGHT_STATES = new Set(['BUILDING', 'QUEUED', 'INITIALIZING']);

/**
 * Returns true when the project has another deployment still building
 * (excluding the canceled deployment that triggered this webhook).
 */
async function hasOtherDeployInFlight(
  projectId: string,
  canceledDeploymentId?: string,
): Promise<boolean> {
  try {
    const client = await getVercelClient();
    const response = await withTeamId((teamId) =>
      client.deployments.getDeployments({
        projectId,
        teamId,
        limit: 15,
        // Comma-separated states per Vercel API
        state: 'BUILDING,QUEUED,INITIALIZING',
      }),
    );

    const deployments = response.deployments ?? [];
    // Response is already filtered to in-flight states; exclude the canceled uid.
    return deployments.some((d) => {
      if (canceledDeploymentId && d.uid === canceledDeploymentId) return false;
      return IN_FLIGHT_STATES.has(d.readyState);
    });
  } catch (err) {
    // If we cannot inspect Vercel, assume nothing else is building so we treat
    // cancel as failure and alert ops rather than silently ignoring.
    console.warn('[inngest] Could not check in-flight deployments; assuming none:', err);
    return false;
  }
}

export const vercelProjectRemovedHandler = inngest.createFunction(
  {
    id: 'vercel-project-removed',
    retries: 3,
    triggers: [{ event: 'vercel.project.removed' }],
  },
  async ({ event }) => {
    const { tenantSlug, projectId, cleanupResult, source = 'webhook' } = event.data;

    console.log(`[inngest] Processing vercel.project.removed for tenant: ${tenantSlug}`, {
      projectId,
      source,
      cleanedResources: (cleanupResult as { cleanedResources?: unknown } | undefined)?.cleanedResources,
    });
  },
);

export const vercelDeploymentSucceededHandler = inngest.createFunction(
  {
    id: 'vercel-deployment-succeeded',
    retries: 2,
    triggers: [{ event: 'vercel.deployment.succeeded' }],
  },
  async ({ event }) => {
    const { tenantSlug, projectId, deployment } = event.data;

    console.log(`[inngest] Deployment succeeded for ${tenantSlug || projectId}`, {
      deploymentUrl: (deployment as { url?: string } | undefined)?.url,
      readyState: (deployment as { readyState?: string } | undefined)?.readyState,
    });

    try {
      await inngest.send({
        name: 'tenant.status.updated',
        data: {
          slug: tenantSlug ?? '',
          status: 'live',
          source: 'vercel-deployment',
          projectId,
        },
      });
    } catch (err) {
      console.error(`[inngest] Error in deployment.succeeded handler:`, err);
    }
  },
);

export const vercelDeploymentErrorHandler = inngest.createFunction(
  {
    id: 'vercel-deployment-error',
    retries: 3,
    triggers: [{ event: 'vercel.deployment.error' }],
  },
  async ({ event }) => {
    const { tenantSlug, projectId, error } = event.data;

    console.error(`[inngest] Deployment error for ${tenantSlug || projectId}`, {
      projectId,
      error: (error as { message?: string } | undefined)?.message || error,
    });

    try {
      await inngest.send({
        name: 'tenant.failed',
        data: {
          slug: tenantSlug ?? '',
          error: `Deployment failed: ${(error as { message?: string } | undefined)?.message || 'Unknown error'}`,
          step: 'vercel-deployment',
        },
      });
    } catch (notifyErr) {
      console.error('[inngest] Failed to notify on deployment error:', notifyErr);
    }
  },
);

export const vercelDeploymentCanceledHandler = inngest.createFunction(
  {
    id: 'vercel-deployment-canceled',
    retries: 2,
    triggers: [{ event: 'vercel.deployment.canceled' }],
  },
  async ({ event, step }) => {
    const { tenantSlug, projectId, deployment } = event.data;
    const deploymentId =
      (deployment as { id?: string; uid?: string } | undefined)?.id ??
      (deployment as { uid?: string } | undefined)?.uid;

    console.log(`[inngest] Deployment canceled for ${tenantSlug || projectId}`, {
      deploymentId,
      readyState: (deployment as { readyState?: string } | undefined)?.readyState,
    });

    // Always notify ops that a cancel occurred.
    await step.run('notify-ops-cancel', async () => {
      await notifyOps({
        title: `Deployment canceled for ${tenantSlug || projectId}`,
        severity: 'warning',
        tenantSlug: tenantSlug || undefined,
        projectId,
        details: { deploymentId, reason: 'vercel.deployment.canceled' },
      });
    });

    const inFlight = await step.run('check-in-flight-deploy', async () => {
      if (!projectId) return false;
      return hasOtherDeployInFlight(projectId, deploymentId);
    });

    if (inFlight) {
      // Another deploy is already building — cancel is expected (superseded). Ignore.
      console.log(
        `[inngest] Ignoring cancel for ${tenantSlug || projectId}: another deploy is in flight`,
        { deploymentId },
      );
      await step.run('notify-ops-ignored', async () => {
        await notifyOps({
          title: `Deploy cancel ignored (superseded) for ${tenantSlug || projectId}`,
          severity: 'info',
          tenantSlug: tenantSlug || undefined,
          projectId,
          details: { deploymentId, action: 'ignored_in_flight' },
        });
      });
      return { action: 'ignored_in_flight', deploymentId };
    }

    // No other deploy in flight — treat cancel as failure.
    await step.run('mark-tenant-failed', async () => {
      await inngest.send({
        name: 'tenant.failed',
        data: {
          slug: tenantSlug ?? '',
          error: `Deployment canceled with no replacement build in flight (deployment: ${deploymentId ?? 'unknown'})`,
          step: 'vercel-deployment-canceled',
        },
      });
    });

    await step.run('notify-ops-failure', async () => {
      await notifyOps({
        title: `Deployment cancel treated as failure for ${tenantSlug || projectId}`,
        severity: 'error',
        tenantSlug: tenantSlug || undefined,
        projectId,
        details: { deploymentId, action: 'treated_as_failure' },
      });
    });

    return { action: 'treated_as_failure', deploymentId };
  },
);

export const vercelDeploymentCleanupHandler = inngest.createFunction(
  {
    id: 'vercel-deployment-cleanup',
    retries: 1,
    triggers: [{ event: 'vercel.deployment.cleanup' }],
  },
  async ({ event }) => {
    const { tenantSlug, projectId, deployment } = event.data;

    // Fires after Vercel's retention window when a deployment is permanently deleted.
    console.log(`[inngest] Deployment cleanup for ${tenantSlug || projectId}`, {
      deploymentId: (deployment as { id?: string } | undefined)?.id,
    });
  },
);

export const vercelDomainEventHandler = inngest.createFunction(
  {
    id: 'vercel-domain-event',
    retries: 2,
    triggers: [
      { event: 'vercel.project.domain.verified' },
      { event: 'vercel.project.domain.unverified' },
    ],
  },
  async ({ event }) => {
    const { tenantSlug, payload } = event.data || {};
    const domainName = (payload as { domain?: { name?: string } } | undefined)?.domain?.name;

    console.log(`[inngest] Domain event received: ${event.name} for ${tenantSlug}`, {
      domainName,
    });

    if (event.name === 'vercel.project.domain.verified') {
      console.log(`[inngest] Domain verified for tenant ${tenantSlug}: ${domainName ?? '(unknown)'}`);
    } else if (event.name === 'vercel.project.domain.unverified') {
      console.log(`[inngest] Domain unverified for tenant ${tenantSlug}: ${domainName ?? '(unknown)'}`);
    }
  },
);

export const vercelUnhandledWebhookHandler = inngest.createFunction(
  {
    id: 'vercel-unhandled-webhook',
    retries: 0,
    triggers: [{ event: 'vercel.webhook.unhandled' }],
  },
  async ({ event }) => {
    const { type, payload, tenantSlug } = event.data;
    console.warn(`[inngest] Unhandled Vercel webhook event: ${type}`, {
      tenantSlug,
      payloadSummary: Object.keys((payload as object) || {}),
    });
  },
);

export const vercelWebhookErrorHandler = inngest.createFunction(
  {
    id: 'vercel-webhook-error',
    retries: 1,
    triggers: [{ event: 'vercel.webhook.error' }],
  },
  async ({ event }) => {
    const { type, tenantSlug, error, projectId } = event.data;
    console.error(`[inngest] Vercel webhook processing error for ${type}`, {
      tenantSlug,
      projectId,
      error,
    });
  },
);

export const vercelWebhookHandlers = [
  vercelProjectRemovedHandler,
  vercelDeploymentSucceededHandler,
  vercelDeploymentErrorHandler,
  vercelDeploymentCanceledHandler,
  vercelDeploymentCleanupHandler,
  vercelDomainEventHandler,
  vercelUnhandledWebhookHandler,
  vercelWebhookErrorHandler,
];
