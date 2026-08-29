'use client';

/**
 * useDeployStatusPoller — Automatically fetches Vercel deployment status
 * for all tenants when the admin page loads. Returns a map of
 * slug → DeployStatusResponse for display in the tenant list.
 */
import { useState, useEffect, useCallback } from 'react';
import type { DeployStatusResponse } from '@/store/apis/tenant-api';
import { useListTenantsQuery, useLazyGetDeployStatusQuery } from '@/store/apis/tenant-api';

export interface DeployStatusMap {
  [slug: string]: DeployStatusResponse | undefined;
}

export function useDeployStatusPoller() {
  const { data: tenantsData } = useListTenantsQuery();
  const [getDeployStatus] = useLazyGetDeployStatusQuery();
  const [statusMap, setStatusMap] = useState<DeployStatusMap>({});
  const [isFetching, setIsFetching] = useState(false);

  const fetchAllStatuses = useCallback(async () => {
    const tenants = tenantsData?.data?.tenants ?? [];
    if (tenants.length === 0) return;

    setIsFetching(true);
    const newMap: DeployStatusMap = {};

    // Fetch statuses in parallel with a small delay between batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < tenants.length; i += batchSize) {
      const batch = tenants.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (t) => {
          const result = await getDeployStatus(t.slug).unwrap();
          return { slug: t.slug, status: result.success ? result.data : undefined };
        })
      );

      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value) {
          newMap[r.value.slug] = r.value.status;
        }
      });

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < tenants.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    setStatusMap(newMap);
    setIsFetching(false);
  }, [tenantsData, getDeployStatus]);

  // Auto-fetch on mount when tenants are available
  useEffect(() => {
    if (tenantsData?.data?.tenants && tenantsData.data.tenants.length > 0) {
      void fetchAllStatuses();
    }
  }, [tenantsData, fetchAllStatuses]);

  return {
    statusMap,
    isFetching,
    refetch: fetchAllStatuses,
  };
}
