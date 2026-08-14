import { inngest } from '@/lib/inngest';

export const provisionTenant = inngest.createFunction(
  { id: 'provision-tenant', retries: 3, triggers: [{ event: 'tenant.created' }] },
  async ({ event, step }) => {
    const { slug, displayName, templateId, prompt, primaryColor, secondaryColor, metadata } = event.data;

    // Step 1: Provision Neon database (if API key available)
    const dbInfo = await step.run('provision-db', async () => {
      try {
        const { provisionTenantDatabase } = await import('@/domain/tenant/neon-provision-service');
        return await provisionTenantDatabase(slug);
      } catch (err) {
        console.warn('[workflow] Neon provisioning skipped:', err);
        return null; // Continue without isolated DB
      }
    });

    // Step 2: Generate schema from prompt (if prompt provided)
    const schemaResult = await step.run('generate-schema', async () => {
      if (!prompt) return null;
      try {
        const { generateSchemaFromPrompt } = await import('@/domain/ai/schema-generator');
        const { compileToZModel } = await import('@/domain/ai/zmodel-compiler');
        const schema = await generateSchemaFromPrompt(prompt, templateId);
        const zmodel = compileToZModel(schema);
        return { schema, zmodel };
      } catch (err) {
        console.warn('[workflow] Schema generation skipped:', err);
        return null;
      }
    });

    // Step 3: Run migrations (if DB was provisioned and schema was generated)
    await step.run('run-migrations', async () => {
      if (!dbInfo || !schemaResult) return null;
      try {
        const { runMigrations } = await import('@/domain/tenant/migration-runner');
        return await runMigrations(dbInfo.pooledUrl, schemaResult.zmodel);
      } catch (err) {
        console.warn('[workflow] Migrations skipped:', err);
        return null;
      }
    });

    // Step 4: Seed tenant defaults — into this tenant's own dedicated
    // database when Neon provisioning succeeded, never the root DB.
    await step.run('seed-defaults', async () => {
      try {
        const { seedTenantDefaults, seedTemplateSecurityGroups, resolveTenantAdminEmail } = await import('@/domain/tenant/tenant-seed-service');
        const { PrismaClient } = await import('@/generated/prisma');
        const { createRawClient } = await import('@/lib/db');
        const dedicatedClient = dbInfo?.pooledUrl
          ? new PrismaClient({ datasources: { db: { url: dbInfo.pooledUrl } } })
          : null;
        const db = (dedicatedClient ?? createRawClient()) as any;
        try {
          await seedTenantDefaults({
            slug, displayName, template: templateId,
            primaryColor, secondaryColor,
            adminEmail: resolveTenantAdminEmail(metadata as Record<string, unknown>),
            db,
          });
          await seedTemplateSecurityGroups(db, templateId);
        } finally {
          if (dedicatedClient) await dedicatedClient.$disconnect();
        }
        return true;
      } catch (err) {
        console.error('[workflow] Seed failed:', err);
        throw err; // This step should not fail
      }
    });

    // Step 5: Deploy to Vercel — pointed at this tenant's own database.
    const deployResult = await step.run('deploy-to-vercel', async () => {
      try {
        const { deployTenant } = await import('@/domain/tenant/vercel-deploy-service');
        const result = await deployTenant({
          slug, displayName, template: templateId,
          primaryColor, secondaryColor,
          dbUrl: dbInfo?.pooledUrl ? { pooled: dbInfo.pooledUrl, direct: dbInfo.directUrl } : null,
          metadata,
        });
        return result;
      } catch (err) {
        console.error('[workflow] Deploy failed:', err);
        throw err;
      }
    });

    // Step 6: Update tenant record
    await step.run('update-tenant-record', async () => {
      const { createRawClient } = await import('@/lib/db');
      const db = createRawClient() as any;
      await db.$executeRawUnsafe(
        `UPDATE tenants SET status = 'live', vercel_project_id = $1, app_url = $2, db_url = $3, updated_at = CURRENT_TIMESTAMP WHERE slug = $4;`,
        deployResult.projectId, deployResult.appUrl, dbInfo?.pooledUrl ?? null, slug,
      );
      return true;
    });

    // Step 7: Emit deployed event
    await step.sendEvent('emit-tenant-deployed', {
      name: 'tenant.deployed',
      data: { slug, appUrl: deployResult.appUrl, projectId: deployResult.projectId },
    });

    return { appUrl: deployResult.appUrl, projectId: deployResult.projectId };
  },
);
