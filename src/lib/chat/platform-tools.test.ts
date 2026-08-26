import { describe, expect, it, vi, beforeEach } from 'vitest';
import { executePlatformTool, isPlatformToolName } from '@/lib/chat/platform-tools';

vi.mock('@/lib/chat/platform-context', () => ({
  fetchPlatformRegistry: vi.fn(async (query: { errorsOnly?: boolean }) =>
    query.errorsOnly ? 'registry-errors' : 'registry-all',
  ),
  fetchOrganizationsBillingContext: vi.fn(async (orgSlug?: string) =>
    orgSlug ? `billing-${orgSlug}` : 'billing-all',
  ),
  fetchVercelInventoryContext: vi.fn(async () => 'vercel-inventory'),
}));

import {
  fetchOrganizationsBillingContext,
  fetchPlatformRegistry,
  fetchVercelInventoryContext,
} from '@/lib/chat/platform-context';

describe('isPlatformToolName', () => {
  it('recognizes platform query tools', () => {
    expect(isPlatformToolName('query_platform_registry')).toBe(true);
    expect(isPlatformToolName('query_organizations_billing')).toBe(true);
    expect(isPlatformToolName('query_vercel_inventory')).toBe(true);
    expect(isPlatformToolName('save_conversation')).toBe(false);
  });
});

describe('executePlatformTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuses non-platform admins', async () => {
    const result = await executePlatformTool('query_platform_registry', '{}', { isPlatformAdmin: false });
    expect(result).toContain('restricted');
    expect(fetchPlatformRegistry).not.toHaveBeenCalled();
  });

  it('queries the tenant registry with filters', async () => {
    const result = await executePlatformTool(
      'query_platform_registry',
      JSON.stringify({ status: 'error', errorsOnly: true }),
      { isPlatformAdmin: true },
    );
    expect(fetchPlatformRegistry).toHaveBeenCalledWith({ status: 'error', errorsOnly: true });
    expect(result).toBe('registry-errors');
  });

  it('queries organization billing', async () => {
    const result = await executePlatformTool(
      'query_organizations_billing',
      JSON.stringify({ orgSlug: 'default' }),
      { isPlatformAdmin: true },
    );
    expect(fetchOrganizationsBillingContext).toHaveBeenCalledWith('default');
    expect(result).toBe('billing-default');
  });

  it('queries vercel inventory', async () => {
    const result = await executePlatformTool('query_vercel_inventory', '{}', { isPlatformAdmin: true });
    expect(fetchVercelInventoryContext).toHaveBeenCalled();
    expect(result).toBe('vercel-inventory');
  });
});
