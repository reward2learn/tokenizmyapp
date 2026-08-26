/**
 * On-demand platform data tools for the factory chat assistant.
 *
 * Read-only lookups against the control-plane DB and Vercel API. Gated to
 * platform administrators on the factory app — same boundary as admin APIs.
 */
import {
  fetchOrganizationsBillingContext,
  fetchPlatformRegistry,
  fetchVercelInventoryContext,
  type PlatformRegistryQuery,
} from '@/lib/chat/platform-context';

export const PLATFORM_TOOL_INSTRUCTIONS = `Platform data lookup tools are available on this control-plane workspace.
Call them whenever the user asks about tenants, apps, deployments, organizations, billing credits, or Vercel project registration — including follow-up questions in an ongoing conversation.
Do not guess counts or statuses; query first, then answer from the tool result.
Never disclose database URLs, API keys, OAuth secrets, or Stripe identifiers.

- query_platform_registry — tenant/app inventory. Use status (e.g. "error", "live"), tenantSlug, or errorsOnly=true to narrow results.
- query_organizations_billing — organizations with plan, subscription status, and AI credit balances. Optional orgSlug filter.
- query_vercel_inventory — registered deploy targets vs Vercel team projects not linked in the registry.`;

export const PLATFORM_OPENAI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'query_platform_registry',
      description:
        'Query the live tenant and app registry: counts, statuses, suite apps, and deployment URLs. Use filters for follow-up questions.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Filter tenants by status (e.g. live, deploying, error).',
          },
          tenantSlug: {
            type: 'string',
            description: 'Return a single tenant by slug.',
          },
          errorsOnly: {
            type: 'boolean',
            description: 'When true, only tenants or suite apps with error/deploying/provisioning states.',
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'query_organizations_billing',
      description:
        'Query organizations with subscription plan, status, and AI credit balances. Lists tenant slugs owned by each org.',
      parameters: {
        type: 'object',
        properties: {
          orgSlug: {
            type: 'string',
            description: 'Optional organization slug to narrow to one org.',
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'query_vercel_inventory',
      description:
        'Compare Vercel team projects with the tenant registry — shows registered deploy targets and unregistered projects.',
      parameters: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    },
  },
];

const PLATFORM_TOOL_NAMES = new Set(
  PLATFORM_OPENAI_TOOLS.map((tool) => tool.function.name),
);

export function isPlatformToolName(name: string): boolean {
  return PLATFORM_TOOL_NAMES.has(name);
}

export interface PlatformToolContext {
  isPlatformAdmin: boolean;
}

export async function executePlatformTool(
  toolName: string,
  rawArgs: string,
  ctx: PlatformToolContext,
): Promise<string> {
  if (!ctx.isPlatformAdmin) {
    return 'Platform data lookup is restricted to platform administrators.';
  }

  let args: Record<string, unknown> = {};
  if (rawArgs.trim()) {
    try {
      args = JSON.parse(rawArgs) as Record<string, unknown>;
    } catch {
      return 'Tool arguments were invalid JSON.';
    }
  }

  switch (toolName) {
    case 'query_platform_registry': {
      const query: PlatformRegistryQuery = {};
      if (typeof args.status === 'string' && args.status.trim()) {
        query.status = args.status.trim();
      }
      if (typeof args.tenantSlug === 'string' && args.tenantSlug.trim()) {
        query.tenantSlug = args.tenantSlug.trim();
      }
      if (args.errorsOnly === true) {
        query.errorsOnly = true;
      }
      return fetchPlatformRegistry(query);
    }
    case 'query_organizations_billing': {
      const orgSlug = typeof args.orgSlug === 'string' ? args.orgSlug.trim() : undefined;
      return fetchOrganizationsBillingContext(orgSlug || undefined);
    }
    case 'query_vercel_inventory':
      return fetchVercelInventoryContext();
    default:
      return `Unknown platform tool: ${toolName}`;
  }
}
