import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'tokenizmyapp',
  name: 'TOKENIZMYAPP Orchestrator',
});

// Event types
export interface TenantEvents {
  'tenant.created': {
    data: {
      slug: string;
      displayName: string;
      templateId: string;
      prompt?: string;
      primaryColor: string;
      secondaryColor: string;
      metadata: Record<string, unknown>;
    };
  };
  'tenant.provisioned': {
    data: {
      slug: string;
      dbUrl?: string;
      branchId?: string;
    };
  };
  'tenant.schema-generated': {
    data: {
      slug: string;
      schema: unknown;
      zmodel: string;
    };
  };
  'tenant.deployed': {
    data: {
      slug: string;
      appUrl: string;
      projectId: string;
    };
  };
  'tenant.failed': {
    data: {
      slug: string;
      error: string;
      step: string;
    };
  };
  'tenant.deprovisioning.completed': {
    data: {
      tenantSlug: string;
      cleanedResources: {
        database?: boolean;
        vercelProject?: boolean;
        oauth?: boolean;
      };
      errors: string[];
    };
  };
}

// Import and register workflows
import { tenantDeprovisioningWorkflow } from './inngest/tenant-deprovisioning-workflow';
import { vercelWebhookHandlers } from './inngest/vercel-webhook-handlers';

// Re-export for route.ts and other consumers
export { tenantDeprovisioningWorkflow };

// Vercel webhook events (dispatched from /api/webhooks/vercel)
export interface VercelEvents {
  'vercel.project.removed': {
    data: {
      tenantSlug: string;
      projectId: string;
      cleanupResult?: any;
      source?: string;
    };
  };
  'vercel.deployment.succeeded': {
    data: {
      tenantSlug?: string;
      projectId: string;
      deployment?: any;
      source?: string;
    };
  };
  'vercel.deployment.error': {
    data: {
      tenantSlug?: string;
      projectId?: string;
      error?: any;
      source?: string;
    };
  };
  'vercel.domain.verified': {
    data: {
      tenantSlug?: string;
      projectId?: string;
      payload: any;
      source?: string;
    };
  };
  'vercel.domain.unverified': {
    data: {
      tenantSlug?: string;
      projectId?: string;
      payload: any;
      source?: string;
    };
  };
  'vercel.webhook.unhandled': {
    data: {
      type: string;
      payload: any;
      tenantSlug?: string;
    };
  };
  'vercel.webhook.error': {
    data: {
      type: string;
      tenantSlug?: string;
      projectId?: string;
      error: string;
    };
  };
  'tenant.status.updated': {
    data: {
      slug: string;
      status: string;
      source: string;
      projectId?: string;
    };
  };
}

// Combined events interface
export type InngestEvents = TenantEvents & VercelEvents;

// Import handlers (they auto-register via inngest.createFunction)
vercelWebhookHandlers; // side-effect import ensures registration

// Workflows are automatically registered when imported.
// Explicit array is used in src/app/api/inngest/route.ts for serve()
export { vercelWebhookHandlers };
