/**
 * Tenant Notifications — handles alerts for tenant lifecycle events
 * (provisioning success, cleanup completion, errors).
 * 
 * Currently a stub that logs to console following project [tag] patterns.
 * In production this would integrate with email (Resend), Slack webhooks,
 * or in-app notification service.
 */

export interface TenantCleanupNotification {
  tenantSlug: string;
  cleanedResources: {
    database?: boolean;
    vercelProject?: boolean;
    oauth?: boolean;
  };
  errors: string[];
  timestamp: Date;
}

/**
 * Send notification about tenant cleanup completion.
 * Non-blocking — failures are logged but do not fail the workflow.
 */
export async function sendTenantCleanupNotification(
  notification: TenantCleanupNotification
): Promise<void> {
  const { tenantSlug, cleanedResources, errors, timestamp } = notification;
  
  console.log(`[tenant-notifications] Sending cleanup notification for tenant: ${tenantSlug}`, {
    cleanedResources,
    errorCount: errors.length,
    timestamp: timestamp.toISOString(),
  });

  if (errors.length > 0) {
    console.warn(`[tenant-notifications] Cleanup completed with errors for ${tenantSlug}:`, errors);
  } else {
    console.log(`[tenant-notifications] ✅ Cleanup successful for ${tenantSlug}`);
  }

  // TODO: Integrate with real notification system (e.g. send to admin Slack channel. Implementation pending.
  // email to platform owner, or persist to notifications table)
}

export type OpsAlertSeverity = 'info' | 'warning' | 'error';

export interface OpsAlert {
  title: string;
  severity: OpsAlertSeverity;
  tenantSlug?: string;
  projectId?: string;
  details?: Record<string, unknown>;
}

/**
 * Notify ops about a platform event (deploy cancel, failures, etc.).
 * Non-blocking stub — logs structured output; wire Slack/email later.
 */
export async function notifyOps(alert: OpsAlert): Promise<void> {
  const { title, severity, tenantSlug, projectId, details } = alert;
  const logFn = severity === 'error' ? console.error : severity === 'warning' ? console.warn : console.log;

  logFn(`[ops-alert][${severity}] ${title}`, {
    tenantSlug,
    projectId,
    ...details,
    timestamp: new Date().toISOString(),
  });

  // TODO: Deliver to Slack / email / PagerDuty when ops channel is configured.
}
