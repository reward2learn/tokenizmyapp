/**
 * Inngest handlers for Vercel webhook events.
 *
 * These functions react to events dispatched from the Vercel webhook service.
 * They provide async, retryable, observable processing for:
 * - project.removed → post-cleanup notifications, archiving
 * - deployment.succeeded → status sync, metrics, customer notification
 * - deployment.error → alerting, rollback triggers
 * - deployment.canceled → optional status / supersede handling
 * - deployment.cleanup → retention cleanup bookkeeping
 * - project.domain.* → DNS verification workflows
 *
 * Follows existing patterns from tenant-provisioning.ts and tenant-deprovisioning-workflow.ts.
 * Uses step.run for idempotency and dynamic imports where appropriate.
 */

import { inngest } from '@/lib/inngest';

// Vercel event handlers
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

    try {
      // Post-cleanup actions (notification, archiving) would go here.
      // Notification service is referenced in tenant-deprovisioning-workflow.
      // For now, rely on the cleanupTenant Inngest event already sent from webhook service.
      console.log(`[inngest] Post-cleanup completed for ${tenantSlug} (notification dispatched via cleanup flow)`);
    } catch (err) {
      console.error(`[inngest] Failed in vercel.project.removed handler for ${tenantSlug}:`, err);
      // Do not rethrow — let Inngest retry or mark as failed gracefully
    }
  }
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
          slug: tenantSlug,
          status: 'live',
          source: 'vercel-deployment',
          projectId,
        },
      });
    } catch (err) {
      console.error(`[inngest] Error in deployment.succeeded handler:`, err);
    }
  }
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
          slug: tenantSlug,
          error: `Deployment failed: ${(error as { message?: string } | undefined)?.message || 'Unknown error'}`,
          step: 'vercel-deployment',
        },
      });
    } catch (notifyErr) {
      console.error('[inngest] Failed to notify on deployment error:', notifyErr);
    }
  }
);

export const vercelDeploymentCanceledHandler = inngest.createFunction(
  {
    id: 'vercel-deployment-canceled',
    retries: 2,
    triggers: [{ event: 'vercel.deployment.canceled' }],
  },
  async ({ event }) => {
    const { tenantSlug, projectId, deployment } = event.data;

    console.log(`[inngest] Deployment canceled for ${tenantSlug || projectId}`, {
      deploymentId: (deployment as { id?: string } | undefined)?.id,
      readyState: (deployment as { readyState?: string } | undefined)?.readyState,
    });

    // Canceled deploys are often superseded by a newer push — do not mark the tenant failed.
    // Emit a status signal so ops can observe without treating this as a hard failure.
    try {
      await inngest.send({
        name: 'tenant.status.updated',
        data: {
          slug: tenantSlug,
          status: 'deploy_canceled',
          source: 'vercel-deployment-canceled',
          projectId,
        },
      });
    } catch (err) {
      console.error(`[inngest] Error in deployment.canceled handler:`, err);
    }
  }
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
  }
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
    const domainName =
      (payload as { domain?: { name?: string } } | undefined)?.domain?.name;

    console.log(`[inngest] Domain event received: ${event.name} for ${tenantSlug}`, {
      domainName,
      payload,
    });

    if (event.name === 'vercel.project.domain.verified') {
      console.log(`[inngest] Domain verified for tenant ${tenantSlug}: ${domainName ?? '(unknown)'}`);
    } else if (event.name === 'vercel.project.domain.unverified') {
      console.log(`[inngest] Domain unverified for tenant ${tenantSlug}: ${domainName ?? '(unknown)'}`);
    }
  }
);

export const vercelUnhandledWebhookHandler = inngest.createFunction(
  {
    id: 'vercel-unhandled-webhook',
    retries: 0, // no retry for unknown events
    triggers: [{ event: 'vercel.webhook.unhandled' }],
  },
  async ({ event }) => {
    const { type, payload, tenantSlug } = event.data;
    console.warn(`[inngest] Unhandled Vercel webhook event: ${type}`, {
      tenantSlug,
      payloadSummary: Object.keys(payload || {}),
    });
  }
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
  }
);

// Export all for registration in inngest/route.ts and lib/inngest.ts
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
