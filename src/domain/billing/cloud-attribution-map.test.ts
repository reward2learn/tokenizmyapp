import { describe, expect, it, vi } from 'vitest';
import {
  allocateByWeights,
  loadCloudAttributionMap,
  neonBranchNameForSlug,
  totalAttributedProjects,
} from '@/domain/billing/cloud-attribution-map';

describe('neonBranchNameForSlug', () => {
  it('prefixes tenant-', () => {
    expect(neonBranchNameForSlug('acme')).toBe('tenant-acme');
  });
});

describe('loadCloudAttributionMap', () => {
  it('collects root and suite vercelProjectIds and branch names', async () => {
    const db = {
      $queryRawUnsafe: vi.fn(async () => [
        {
          organization_id: 'org_1',
          slug: 'acme',
          vercel_project_id: 'prj_root',
          metadata: {
            config: {
              appPack: {
                apps: [
                  { appId: 'sales', vercelProjectId: 'prj_sales' },
                  { appId: 'ops', vercelProjectId: null },
                ],
              },
            },
          },
        },
      ]),
    } as unknown as Parameters<typeof loadCloudAttributionMap>[0];

    const map = await loadCloudAttributionMap(db);
    const entry = map.get('org_1');
    expect(entry?.projectIds).toEqual(['prj_root', 'prj_sales']);
    expect(entry?.branchNames).toEqual(['tenant-acme']);
    expect(entry?.projects).toHaveLength(2);
    expect(totalAttributedProjects(map)).toBe(2);
  });

  it('returns empty map when tenants table is missing', async () => {
    const db = {
      $queryRawUnsafe: vi.fn(async () => {
        throw new Error('relation does not exist');
      }),
    } as unknown as Parameters<typeof loadCloudAttributionMap>[0];
    expect(await loadCloudAttributionMap(db)).toEqual(new Map());
  });
});

describe('allocateByWeights residual', () => {
  it('always sums to 100% of the total', () => {
    for (const total of [1, 7, 100, 1018]) {
      for (const weights of [[1], [1, 1], [1, 2, 3], [5, 0, 2]]) {
        const shares = allocateByWeights(total, weights);
        expect(shares.reduce((a, b) => a + b, 0)).toBe(weights.every((w) => w === 0) ? 0 : total);
      }
    }
  });
});
