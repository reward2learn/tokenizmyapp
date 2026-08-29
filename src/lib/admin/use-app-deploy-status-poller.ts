'use client';

/**
 * useAppDeployStatusPoller — Fetches Vercel deployment status for all apps
 * in a suite tenant when the tenant row is expanded. Returns a map of
 * appId → { status, appUrl, vercelState } for display in the app list.
 */
import { useState, useEffect, useCallback } from 'react';
import type { SuiteAppInstance } from '@/store/apis/tenant-api';
import { useLazyRefreshAppStatusQuery } from '@/store/apis/tenant-api';

export interface AppDeployStatus {
  status: SuiteAppInstance['status'];
  appUrl: string | null;
  vercelState: string;
  note?: string;
}

export interface AppDeployStatusMap {
  [appId: string]: AppDeployStatus | undefined;
}

export function useAppDeployStatusPoller(tenantSlug: string | null, apps: SuiteAppInstance[]) {
  const [refreshAppStatus] = useLazyRefreshAppStatusQuery();
  const [statusMap, setStatusMap] = useState<AppDeployStatusMap>({});
  const [isFetching, setIsFetching] = useState(false);

  const fetchAllAppStatuses = useCallback(async () => {
    if (!tenantSlug || apps.length === 0) return;

    setIsFetching(true);
    const newMap: AppDeployStatusMap = {};

    // Only fetch status for apps that have a vercelProjectId
    const appsToCheck = apps.filter((app) => app.vercelProjectId);

    // Fetch statuses in parallel with a small delay between batches
    const batchSize = 3;
    for (let i = 0; i < appsToCheck.length; i += batchSize) {
      const batch = appsToCheck.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (app) => {
          const result = await refreshAppStatus({ slug: tenantSlug, appId: app.appId }).unwrap();
          return {
            appId: app.appId,
            status: result.success ? {
              status: result.data?.status ?? app.status,
              appUrl: result.data?.appUrl ?? app.appUrl ?? null,
              vercelState: result.data?.vercelState ?? 'UNKNOWN',
              note: result.data?.note,
            } : undefined,
          };
        })
      );

      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value) {
          newMap[r.value.appId] = r.value.status;
        }
      });

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < appsToCheck.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    setStatusMap(newMap);
    setIsFetching(false);
  }, [tenantSlug, apps, refreshAppStatus]);

  // Auto-fetch when tenantSlug or apps change
  useEffect(() => {
    if (tenantSlug && apps.length > 0) {
      void fetchAllAppStatuses();
    }
  }, [tenantSlug, apps, fetchAllAppStatuses]);

  return {
    statusMap,
    isFetching,
    refetch: fetchAllAppStatuses,
  };
}
