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
import { vercelApi, vercelApiWithToken, resolveBearerToken } from './vercel-deploy-service';
import { deleteNeonDatabase } from './neon-provision-service';
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
    if (tenantDbUrl) {
      try {
        await deleteNeonDatabase(tenantDbUrl);
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

/**
 * Delete a Vercel project by ID.
 * Handles cases where the project may already be deleted or inaccessible.
 */
export async function deleteVercelProject(projectId: string): Promise<void> {
  try {
    logger.info(`Attempting to delete Vercel project: ${projectId}`);

    // Try to get the project first to verify it exists
    const getRes = await vercelApiTryBoth(`/v10/projects/${projectId}`);
    
    if (getRes.status === 404) {
      logger.info(`Vercel project ${projectId} already does not exist (404)`);
      return;
    }

    if (!getRes.ok) {
      // If we can't get the project but it's not 404, try to delete anyway
      logger.warn(`Could not verify Vercel project ${projectId} existence: ${getRes.status}`);
    }

    // Attempt deletion
    const deleteRes = await vercelApi(`/v10/projects/${projectId}`, {
      method: 'DELETE',
    });

    if (deleteRes.ok) {
      logger.info(`Successfully deleted Vercel project ${projectId}`);
      return;
    }

    if (deleteRes.status === 404) {
      logger.info(`Vercel project ${projectId} already deleted (404)`);
      return;
    }

    throw new Error(`Vercel API returned ${deleteRes.status}: ${await deleteRes.text()}`);
  } catch (err) {
    // If the project is already deleted, that's fine
    if (err instanceof Error && err.message.includes('404')) {
      logger.info(`Vercel project ${projectId} already deleted or not found`);
      return;
    }
    throw err;
  }
}

/**
 * Helper function to try Vercel API calls with and without teamId.
 * Similar to vercelApiTryBoth but exported for use in this service.
 */
async function vercelApiTryBoth(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await resolveBearerToken();
  const withTeam = await vercelApiWithToken(token, path, options, true);
  if (withTeam.ok) return withTeam;

  const withoutTeam = await vercelApiWithToken(token, path, options, false);
  if (withoutTeam.ok) return withoutTeam;

  // Return the more useful response: prefer non-404 over 404
  if (withTeam.status !== 404 && withTeam.status !== 403) return withTeam;
  return withoutTeam;
}