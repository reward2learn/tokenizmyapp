import { inngest } from '@/lib/inngest';
import { logger } from '@/lib/logger';
import { sendTenantCleanupNotification } from '@/lib/notifications/tenant-notifications';
import { cleanupTenant } from '@/domain/tenant/tenant-cleanup-service';

/**
 * Inngest workflow for tenant deprovisioning.
 * 
 * This workflow handles the asynchronous cleanup of tenant resources after deletion.
 * It runs after the tenant record is deleted and coordinates:
 * - Neon database deprovisioning
 * - Vercel project deletion
 * - OAuth resource cleanup
 * - Notification to administrators
 */
export const tenantDeprovisioningWorkflow = inngest.createFunction(
  {
    id: 'tenant-deprovisioning',
    retries: 3,
    triggers: [{ event: 'tenant.deprovisioning.completed' }],
  },
  async ({ event }) => {
    const { tenantSlug, cleanedResources, errors } = event.data;

    logger.info(`Starting tenant deprovisioning workflow for ${tenantSlug}`, {
      cleanedResources,
      errors,
    });

    try {
      // Send notification about deprovisioning completion
      await sendTenantCleanupNotification({
        tenantSlug,
        cleanedResources,
        errors,
        timestamp: new Date(),
      });

      logger.info(`Tenant deprovisioning workflow completed for ${tenantSlug}`);
    } catch (err) {
      logger.error(`Failed to send deprovisioning notification for ${tenantSlug}:`, err);
      // Don't fail the workflow on notification errors
    }
  }
);

/**
 * Inngest event definition for tenant deprovisioning completion.
 */
export interface TenantDeprovisioningCompletedEvent {
  name: 'tenant.deprovisioning.completed';
  data: {
    tenantSlug: string;
    cleanedResources: {
      database?: boolean;
      vercelProject?: boolean;
      oauth?: boolean;
    };
    errors: string[];
  };
}