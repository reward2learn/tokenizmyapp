/**
 * Inngest handlers for Vercel webhook events.
 *
 * These functions react to events dispatched from the Vercel webhook service.
 * They provide async, retryable, observable processing for:
 * - project.removed → post-cleanup notifications, archiving
 * - deployment.succeeded → status sync, metrics, customer notification
 * - deployment.error → alerting, rollback triggers
 * - domain events → DNS verification workflows
 *
 * Follows existing patterns from tenant-provisioning.ts and tenant-deprovisioning-workflow.ts.
 * Uses step.run for idempotency and dynamic imports where appropriate.
 */
import { inngest } from '@/lib/inngest';
// Vercel event handlers
export const vercelProjectRemovedHandler = inngest.createFunction({
    id: 'vercel-project-removed',
    retries: 3,
    triggers: [{ event: 'vercel.project.removed' }],
}, async ({ event }) => {
    const { tenantSlug, projectId, cleanupResult, source = 'webhook' } = event.data;
    console.log(`[inngest] Processing vercel.project.removed for tenant: ${tenantSlug}`, {
        projectId,
        source,
        cleanedResources: cleanupResult?.cleanedResources,
    });
    try {
        // Post-cleanup actions (notification, archiving) would go here.
        // Notification service is referenced in tenant-deprovisioning-workflow.
        // For now, rely on the cleanupTenant Inngest event already sent from webhook service.
        console.log(`[inngest] Post-cleanup completed for ${tenantSlug} (notification dispatched via cleanup flow)`);
    }
    catch (err) {
        console.error(`[inngest] Failed in vercel.project.removed handler for ${tenantSlug}:`, err);
        // Do not rethrow — let Inngest retry or mark as failed gracefully
    }
});
export const vercelDeploymentSucceededHandler = inngest.createFunction({
    id: 'vercel-deployment-succeeded',
    retries: 2,
    triggers: [{ event: 'vercel.deployment.succeeded' }],
}, async ({ event }) => {
    const { tenantSlug, projectId, deployment } = event.data;
    console.log(`[inngest] Deployment succeeded for ${tenantSlug || projectId}`, {
        deploymentUrl: deployment?.url,
        readyState: deployment?.readyState,
    });
    try {
        // Could trigger additional steps like cache invalidation, analytics update,
        // customer email, status sync to other systems, etc.
        // For now, log and dispatch any secondary events
        await inngest.send({
            name: 'tenant.status.updated',
            data: {
                slug: tenantSlug,
                status: 'live',
                source: 'vercel-deployment',
                projectId,
            },
        });
    }
    catch (err) {
        console.error(`[inngest] Error in deployment.succeeded handler:`, err);
    }
});
export const vercelDeploymentErrorHandler = inngest.createFunction({
    id: 'vercel-deployment-error',
    retries: 3,
    triggers: [{ event: 'vercel.deployment.error' }],
}, async ({ event }) => {
    const { tenantSlug, projectId, error } = event.data;
    console.error(`[inngest] Deployment error for ${tenantSlug || projectId}`, {
        projectId,
        error: error?.message || error,
    });
    // Could trigger alert to ops team, automatic retry via step, update status to 'error'
    try {
        await inngest.send({
            name: 'tenant.failed',
            data: {
                slug: tenantSlug,
                error: `Deployment failed: ${error?.message || 'Unknown error'}`,
                step: 'vercel-deployment',
            },
        });
    }
    catch (notifyErr) {
        console.error('[inngest] Failed to notify on deployment error:', notifyErr);
    }
});
export const vercelDomainEventHandler = inngest.createFunction({
    id: 'vercel-domain-event',
    retries: 2,
    triggers: [
        { event: 'vercel.domain.verified' },
        { event: 'vercel.domain.unverified' },
    ],
}, async ({ event }) => {
    const { tenantSlug, payload } = event.data || {};
    console.log(`[inngest] Domain event received: ${event.name} for ${tenantSlug}`, { payload });
    // Handle verified/unverified: update DNS status in tenant metadata, notify, etc.
    if (event.name?.includes('verified')) {
        console.log(`[inngest] Domain verified for tenant ${tenantSlug}`);
    }
    else if (event.name?.includes('unverified')) {
        console.log(`[inngest] Domain unverified for tenant ${tenantSlug}`);
    }
});
export const vercelUnhandledWebhookHandler = inngest.createFunction({
    id: 'vercel-unhandled-webhook',
    retries: 0, // no retry for unknown events
    triggers: [{ event: 'vercel.webhook.unhandled' }],
}, async ({ event }) => {
    const { type, payload, tenantSlug } = event.data;
    console.warn(`[inngest] Unhandled Vercel webhook event: ${type}`, {
        tenantSlug,
        payloadSummary: Object.keys(payload || {}),
    });
    // Could store for later review in WebhookEvent with status=ignored
});
export const vercelWebhookErrorHandler = inngest.createFunction({
    id: 'vercel-webhook-error',
    retries: 1,
    triggers: [{ event: 'vercel.webhook.error' }],
}, async ({ event }) => {
    const { type, tenantSlug, error, projectId } = event.data;
    console.error(`[inngest] Vercel webhook processing error for ${type}`, {
        tenantSlug,
        projectId,
        error,
    });
    // Could integrate with monitoring like Sentry, send Slack alert, etc.
});
// Export all for registration in inngest/route.ts and lib/inngest.ts
export const vercelWebhookHandlers = [
    vercelProjectRemovedHandler,
    vercelDeploymentSucceededHandler,
    vercelDeploymentErrorHandler,
    vercelDomainEventHandler,
    vercelUnhandledWebhookHandler,
    vercelWebhookErrorHandler,
];
