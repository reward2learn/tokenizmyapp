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

// Vercel webhook events (dispatched from /api/webhooks/vercel)
export interface VercelEvents {
  'vercel.project.removed': {
    data: {
      tenantSlug: string;
      projectId: string;
      cleanupResult?: unknown;
      source?: string;
    };
  };
  'vercel.deployment.succeeded': {
    data: {
      tenantSlug?: string;
      projectId: string;
      deployment?: unknown;
      source?: string;
    };
  };
  'vercel.deployment.error': {
    data: {
tenantSlug?: string;
      projectId?: string;
      payload: unknown;
      source?: string;
    };
  };
  'vercel.domain.verified': {
    data: {
      tenantSlug?: string;
      projectId?: string;
      payload: unknown;
      source?: string;
    };
  };
  'vercel.domain.unverified': {
    data: {
      tenantSlug?: string;
      projectId?: string;
      payload: unknown;
      source?: string;
    };
  };
  'vercel.webhook.unhandled': {
    data: {
      type: string;
      payload: unknown;
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

// Note: Handlers and workflows are imported directly in route.ts to avoid
// circular dependencies with files that import { inngest } from '@/lib/inngest'.
// The createFunction calls in those modules ensure auto-registration with Inngest.
