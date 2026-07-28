/**
 * Tenant Cleanup Service — coordinates resource cleanup for deleted tenants.
 *
 * Handles idempotent cleanup of:
 * - Neon database deprovisioning
 * - Vercel project deletion
 * - OAuth resource cleanup
 * - Inngest workflow triggers
 *
 * All operations are designed to be safe for already-deleted resources.
 */
import { getSecret, deleteSecret } from '@/lib/secrets';
import { decrypt } from '@/lib/crypto';
import { inngest } from '@/lib/inngest';
import { deleteVercelProject } from './vercel-deploy-service';
import { deprovisionTenantDatabase } from './neon-provision-service';
import { deleteGoogleOAuthCredentials } from './google-cloud-service';
import { logger } from '@/lib/logger';

interface TenantCleanupResult {
  success: boolean;
  errors: string[];
  cleanedResources: {
    database?: boolean;
    vercelProject?: boolean;
    oauth?: boolean;
  };
}

interface CleanupContext {
  tenantSlug: string;
  tenantDbUrl?: string;
  vercelProjectId?: string;
  googleClientId?: string;
  googleProjectId?: string;
}

export async function cleanupTenant(context: CleanupContext): Promise<TenantCleanupResult> {
  const result: TenantCleanupResult = {
    success: true,
    errors: [],
    cleanedResources: {},
  };

  const { tenantSlug, tenantDbUrl, vercelProjectId, googleClientId, googleProjectId } = context;

  try {
    logger.info(`Starting cleanup for tenant: ${tenantSlug}`);

    // 1. Clean up Neon database
    if (tenantSlug) {
      try {
        await deprovisionTenantDatabase(tenantSlug);
        result.cleanedResources.database = true;
        logger.info(`Successfully deprovisioned Neon database for ${tenantSlug}`);
      } catch (err) {
        result.errors.push(`Neon database cleanup failed: ${err instanceof Error ? err.message : String(err)}`);
        result.success = false;
        logger.warn(`Neon database cleanup failed for ${tenantSlug}:`, err);
      }
    }

    // 2. Clean up Vercel project
    if (vercelProjectId) {
      try {
        await deleteVercelProject(vercelProjectId);
        result.cleanedResources.vercelProject = true;
        logger.info(`Successfully deleted Vercel project ${vercelProjectId} for ${tenantSlug}`);
      } catch (err) {
        result.errors.push(`Vercel project deletion failed: ${err instanceof Error ? err.message : String(err)}`);
        result.success = false;
        logger.warn(`Vercel project deletion failed for ${tenantSlug}:`, err);
      }
    }

    // 3. Clean up Google OAuth credentials
    if (googleClientId && googleProjectId) {
      try {
        await deleteGoogleOAuthCredentials(googleClientId, googleProjectId);
        result.cleanedResources.oauth = true;
        logger.info(`Successfully cleaned up Google OAuth credentials for ${tenantSlug}`);
      } catch (err) {
        result.errors.push(`Google OAuth cleanup failed: ${err instanceof Error ? err.message : String(err)}`);
        result.success = false;
        logger.warn(`Google OAuth cleanup failed for ${tenantSlug}:`, err);
      }
    }

    // 4. Clean up stored secrets
    try {
      const secretsToDelete = [
        `TENANT_${tenantSlug}_OAUTH`,
        `TENANT_${tenantSlug}_DATABASE`,
        `TENANT_${tenantSlug}_CONFIG`,
      ];

      for (const secretKey of secretsToDelete) {
        const secret = await getSecret(secretKey);
        if (secret) {
          await deleteSecret(secretKey);
          logger.info(`Deleted secret: ${secretKey}`);
        }
      }
    } catch (err) {
      result.errors.push(`Secret cleanup failed: ${err instanceof Error ? err.message : String(err)}`);
      result.success = false;
      logger.warn(`Secret cleanup failed for ${tenantSlug}:`, err);
    }

    // 5. Trigger Inngest deprovisioning workflow
    try {
      await inngest.send({
        name: 'tenant.deprovisioning.completed',
        data: {
          tenantSlug,
          cleanedResources: result.cleanedResources,
          errors: result.errors,
        },
      });
      logger.info(`Triggered Inngest deprovisioning workflow for ${tenantSlug}`);
    } catch (err) {
      result.errors.push(`Inngest workflow trigger failed: ${err instanceof Error ? err.message : String(err)}`);
      result.success = false;
      logger.warn(`Inngest workflow trigger failed for ${tenantSlug}:`, err);
    }

    logger.info(`Tenant cleanup completed for ${tenantSlug}`, {
      cleanedResources: result.cleanedResources,
      errors: result.errors,
    });

    return result;
  } catch (err) {
    result.errors.push(`Unexpected cleanup error: ${err instanceof Error ? err.message : String(err)}`);
    result.success = false;
    logger.error(`Unexpected error during tenant cleanup for ${tenantSlug}:`, err);
    return result;
  }
}
