/**
 * Cloud Credits Collector — /api/cron/cloud-credits
 *
 * Phase 5: meters what deployed tenant apps actually consume on Vercel + Neon.
 *
 * Workflow (initial implementation):
 * 1. Fetch all tenants with Vercel project IDs
 * 2. Poll Vercel API for function invocation metrics
 * 3. Write UsageRecord entries (idempotent per tenant + resource + period)
 * 4. Update CloudBalance (balance may go negative per Hercules model)
 *
 * Idempotency: UsageRecord upsert per (tenant_slug, resource, period_start).
 * Re-running the same period overwrites rather than duplicates.
 *
 * Time-driven (cron), not event-driven: usage APIs are polled on a schedule.
 * See vercel.json for cron registration.
 *
 * Auth: Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled invocations.
 */
import { jsonError, jsonOk } from '@/lib/api/response';
import { createRawClient } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return jsonError(
      'CRON_SECRET is not set — refusing to run cloud credits collector unauthenticated.',
      503,
    );
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return jsonError('Unauthorized', 401);
  }

  try {
    const db = createRawClient();

    // Period boundaries: current calendar day
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 1);

    // Fetch all organizations with their tenants
    const orgs = (await db.$queryRawUnsafe(
      `SELECT id, slug FROM organizations WHERE id IS NOT NULL`
    )) as Record<string, unknown>[];

    let totalTenants = 0;

    for (const org of orgs) {
      const orgId = (org as any).id;
      const orgSlug = (org as any).slug;

      // Get tenants for this organization
      const tenants = (await db.$queryRawUnsafe(
        `SELECT slug, vercel_project_id FROM tenants WHERE organization_id = $1`,
        orgId
      )) as Record<string, unknown>[];

      for (const tenant of tenants) {
        const tenantSlug = (tenant as any).slug;
        const projectId = (tenant as any).vercel_project_id;

        // Fetch Vercel metrics for this tenant's project
        const vercelToken = process.env.VERCEL_TOKEN?.trim();

        if (projectId && vercelToken) {
          const vercelRes = await fetch(
            `https://api.vercel.com/v9/projects/${projectId}`,
            {
              headers: { Authorization: `Bearer ${vercelToken}` },
            }
          );

          if (vercelRes.ok) {
            const vercelData = await vercelRes.json();
            const metrics = vercelData.metrics;

            // Write UsageRecord for function invocations (idempotent)
            await db.$executeRawUnsafe(
              `INSERT INTO usage_records (tenant_slug, resource, period_start, period_end, quantity)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (tenant_slug, resource, period_start)
               DO UPDATE SET quantity = EXCLUDED.quantity, period_end = EXCLUDED.period_end, created_at = NOW()`,
              [tenantSlug, 'function_invocations', periodStart.toISOString(), periodEnd.toISOString(), metrics?.functionExecutionCount ?? 0]
            );

            // Write UsageRecord for function duration (GB-hrs)
            await db.$executeRawUnsafe(
              `INSERT INTO usage_records (tenant_slug, resource, period_start, period_end, quantity)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (tenant_slug, resource, period_start)
               DO UPDATE SET quantity = EXCLUDED.quantity, period_end = EXCLUDED.period_end, created_at = NOW()`,
              [tenantSlug, 'function_duration', periodStart.toISOString(), periodEnd.toISOString(), Math.round((metrics?.functionDuration ?? 0) * 100) / 100]
            );

            // Write UsageRecord for bandwidth (GB)
            await db.$executeRawUnsafe(
              `INSERT INTO usage_records (tenant_slug, resource, period_start, period_end, quantity)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (tenant_slug, resource, period_start)
               DO UPDATE SET quantity = EXCLUDED.quantity, period_end = EXCLUDED.period_end, created_at = NOW()`,
              [tenantSlug, 'bandwidth', periodStart.toISOString(), periodEnd.toISOString(), Math.round((metrics?.bandwidth ?? 0) * 100) / 100]
            );
          }
        }

        // Write placeholder UsageRecord for database usage
        // (Neon API integration would go here in full implementation)
        await db.$executeRawUnsafe(
          `INSERT INTO usage_records (tenant_slug, resource, period_start, period_end, quantity)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (tenant_slug, resource, period_start)
           DO UPDATE SET quantity = EXCLUDED.quantity, period_end = EXCLUDED.period_end, created_at = NOW()`,
          [tenantSlug, 'database_storage', periodStart.toISOString(), periodEnd.toISOString(), 0]
        );

        await db.$executeRawUnsafe(
          `INSERT INTO usage_records (tenant_slug, resource, period_start, period_end, quantity)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (tenant_slug, resource, period_start)
           DO UPDATE SET quantity = EXCLUDED.quantity, period_end = EXCLUDED.period_end, created_at = NOW()`,
          [tenantSlug, 'database_compute_hours', periodStart.toISOString(), periodEnd.toISOString(), 0]
        );

        totalTenants++;
      }
    }

    // Update CloudBalance (placeholder: balance = 0, full rate card later)
    // Balance may go negative (Hercules model). Full implementation reads plan,
    // applies cloud_multiplier, and debits overage.
    const allOrgs = (await db.$queryRawUnsafe(
      `SELECT id FROM organizations`
    )) as Record<string, unknown>[];

    for (const org of orgs) {
      const orgId = (org as any).id;
      await db.$executeRawUnsafe(
        `INSERT INTO cloud_balances (org_id, balance_cents, auto_top_up_threshold, auto_top_up_amount)
         VALUES ($1, 0, 20, 0)
         ON CONFLICT (org_id)
         DO UPDATE SET balance_cents = 0, auto_top_up_threshold = 20, auto_top_up_amount = 0,
           recorded_at = NOW()`,
        [orgId]
      );
    }

    return jsonOk({ 
      processedOrgs: allOrgs.length,
      processedTenants: totalTenants,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString()
    });
  } catch (err) {
    console.error('[cloud-credits] Collector failed:', err);
    return jsonError('Cloud credits collector failed: ' + (err as Error).message, 500);
  }
}