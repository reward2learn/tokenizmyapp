/**
 * POST /api/admin/tenants/[slug]/seed
 *
 * Runs seedTenantDefaults for the specified tenant.
 * Seeds: AppPages + PageSections, NavigationItems, AppSettings, SecurityGroups
 */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import { ensureTenantsTable } from '@/domain/tenant/tenant-service';
import { seedTenantDefaults, seedTemplateSecurityGroups, seedTemplateBranding, cleanTenantSeed, resolveTenantAdminEmail } from '@/domain/tenant/tenant-seed-service';
import { isPlatformApp } from '@shared/lib/config/tenant';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 min timeout for seeding

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const db = createRawClient();

  try {
    await ensureTenantsTable(db);

    // Fetch the tenant record
    const rows = await db.$queryRawUnsafe(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1;`, slug,
    ) as Record<string, unknown>[];
    if (rows.length === 0) return jsonError('Tenant not found', 404);

    const tenant = rows[0] as Record<string, unknown>;

    // A suite tenant's page/nav content is each app's own responsibility,
    // seeded via its own per-app Seed action (apps/[appId]/route.ts POST).
    // app_pages is keyed by a GLOBAL slug, not (tenant, app) — an unscoped
    // tenant-level seed would wipe and re-upsert every app's already-seeded
    // pages to app_id = NULL, clobbering the per-app scoping. So a
    // tenant-level seed against a suite tenant only seeds genuinely
    // tenant-wide data: branding, the default admin account, and security
    // groups — never page/nav content.
    const metadata = (tenant.metadata ?? {}) as Record<string, unknown>;
    const cfg = (metadata.config ?? {}) as Record<string, unknown>;
    const appPack = cfg.appPack as { apps?: unknown[] } | undefined;
    const isSuite = !!appPack && Array.isArray(appPack.apps) && appPack.apps.length > 0;

    // Tenants with their own dedicated database must be seeded there — the
    // tenant's own live app reads from that same URL via its own
    // POSTGRES_URL, not the root DB's tenant_slug-scoped rows. Re-seeding the
    // root DB instead (the old behavior) never reached the tenant's real DB.
    const dedicatedDbUrl = tenant.db_url as string | null;
    const dedicatedClient = dedicatedDbUrl
      ? new PrismaClient({ datasources: { db: { url: dedicatedDbUrl } } })
      : null;
    const seedDb = (dedicatedClient ?? db) as any;

    try {
      if (!isSuite) {
        // Single-template tenant — there's no separate per-app seed for it,
        // so the tenant-level run IS the whole app's seed. Fully clean before
        // rebuilding — every app in a suite independently inserts its own
        // copy of the template's default nav items, so a partial/scoped
        // clear leaves other apps' copies in place and repeated seeds
        // compound into duplicate nav entries. This wipes ALL pages,
        // sections, and nav items for the tenant first.
        await cleanTenantSeed(seedDb, tenant.slug as string);
      }

      const result = await seedTenantDefaults({
        slug: tenant.slug as string,
        displayName: tenant.display_name as string,
        template: tenant.template as string,
        primaryColor: (tenant.primary_color as string) || '#eb3d28',
        secondaryColor: (tenant.secondary_color as string) || '#0af9fe',
        adminEmail: resolveTenantAdminEmail(tenant.metadata as Record<string, unknown>),
        db: seedDb,
        skipContent: isSuite,
      });

      const groupsCount = await seedTemplateSecurityGroups(seedDb, tenant.template as string);

      await seedTemplateBranding(slug, seedDb, {
        primaryColor: (tenant.primary_color as string) || '#eb3d28',
        secondaryColor: (tenant.secondary_color as string) || '#0af9fe',
      });

      // ── Platform Admin post-seed: overwrite basic hero with full marketing content ──
      // The platform-admin template's default pages only include a basic hero block,
      // but the rich marketing content lives in page-catalog.ts as PLATFORM_HOME and
      // PLATFORM_PAGE_OVERRIDES. When the DB has rows the code-first fallback is
      // ignored, so we must write the full content here after the base seed completes.
      if (tenant.template === 'platform-admin') {
        try {
          // ── Home page: 7 marketing sections ──
          const homePageRows = (await seedDb.$queryRawUnsafe(
            `SELECT id FROM app_pages WHERE slug = 'home' AND tenant_slug = $1 LIMIT 1;`,
            slug,
          )) as { id: string }[];

          if (homePageRows.length > 0) {
            const homePageId = homePageRows[0].id;

            await seedDb.$executeRawUnsafe(
              `DELETE FROM page_sections WHERE page_id = $1;`,
              homePageId,
            );

            const homeSections: Array<{ blockType: string; config: Record<string, unknown> }> = [
              {
                blockType: 'marketing_hero',
                config: {
                  headline: 'The best AI app builder for business',
                  subheadline: 'Build custom software for your business without hiring a developer.',
                  audiences: ['Internal software', 'Customer software', 'Marketing & SEO', 'Mobile apps'],
                  quickStarts: ['CRM', 'ERP', 'HR portal', 'Inventory tracker', 'Operations dashboard'],
                  placeholder: 'Describe the app you want — "a CRM for my 75 person sales team"…',
                  ctaLabel: 'Try it',
                  ctaHref: '/admin',
                  minTier: 'public',
                },
              },
              {
                blockType: 'customer_proof',
                config: { heading: 'Customer results', minTier: 'public' },
              },
              {
                blockType: 'product_showcase',
                config: {
                  heading: 'From idea to published app in minutes',
                  items: [
                    { icon: 'chat', title: 'Build by chatting', body: 'Describe what you want and watch it get built. Change your mind and say so — the app updates with you.' },
                    { icon: 'builtin', title: 'Everything is built in', body: 'Auth, database, hosting, file storage, AI and API integrations ship with every app. Nothing to wire up, nothing extra to buy.' },
                    { icon: 'publish', title: 'Publish in a click', body: 'Every app deploys to its own URL immediately. Connect a custom domain when you are ready to make it yours.' },
                    { icon: 'scale', title: 'Scale without thinking about it', body: 'Apps run serverless on Vercel with a Postgres database per tenant, so traffic spikes are the platform\'s problem, not yours.' },
                    { icon: 'govern', title: 'Govern with confidence', body: 'Roles, security groups and per-app permissions decide who sees what. Each tenant\'s data lives in its own database.' },
                  ],
                  minTier: 'public',
                },
              },
              {
                blockType: 'capability_marquee',
                config: {
                  heading: 'Everything you need is built-in',
                  subheading: 'Auth, hosting, database, payments, email, AI and hundreds of other features, available the moment your app exists.',
                  rows: [
                    ['Auth', 'Users', 'Database', 'Backend', 'Payments', 'Email', 'Storage', 'Hosting', 'Domains'],
                    ['Files & media', 'CMS', 'Search', 'Branding', 'SEO', 'Mobile', 'Internationalization', 'Chat', 'Notifications'],
                    ['AI text generation', 'AI image generation', 'AI speech', 'AI transcription', 'Chatbots', 'AI Gateway', 'Realtime'],
                    ['Roles & permissions', 'Security', 'Secrets', 'Analytics', 'Audits', 'Version control', 'Scheduled events'],
                  ],
                  minTier: 'public',
                },
              },
              {
                blockType: 'testimonials',
                config: { heading: 'What customers say', minTier: 'public' },
              },
              {
                blockType: 'faq',
                config: {
                  heading: 'Frequently asked questions',
                  items: [
                    { question: 'What is TokenizMyApp?', answer: 'An AI app builder for businesses. You describe the software your business needs and it builds a working application — database, screens, permissions and hosting included — without hiring a developer.' },
                    { question: 'How does it work?', answer: '1. Chat with the AI about what you want to build.\n2. Watch it get built.\n3. Publish the app to its own URL, or to a domain you own.\n4. Keep chatting to change it.' },
                    { question: 'What can I build?', answer: 'Internal tools like CRMs, ERPs, HR portals, inventory trackers and operations dashboards, as well as customer-facing sites and portals. Templates cover restaurants, hotels, retail, healthcare, logistics, property, education, professional services, manufacturing and wellness.' },
                    { question: 'Do I need coding experience?', answer: 'No. You describe what you need in plain language. Everything technical — the database, the API, authentication, deployment — is handled for you.' },
                    { question: 'Can I publish to my own domain?', answer: 'Yes. Every app gets a free URL immediately, and you can connect a custom domain on a paid plan.' },
                    { question: 'Who can see my data?', answer: 'Each tenant gets its own Postgres database rather than sharing one. Access inside an app is controlled by roles and security groups that you configure.' },
                    { question: 'What does it cost?', answer: 'There is a free plan with a monthly allowance of AI credits, and paid plans that add custom domains, more apps and a larger allowance. You can start without a card.' },
                  ],
                  minTier: 'public',
                },
              },
              {
                blockType: 'cta_banner',
                config: {
                  heading: 'Start building for free',
                  subheading: 'No credit card required. Describe your idea and start building in seconds.',
                  ctaLabel: 'Start building',
                  ctaHref: '/admin',
                  minTier: 'public',
                },
              },
            ];

            for (let i = 0; i < homeSections.length; i++) {
              const section = homeSections[i];
              await seedDb.$executeRawUnsafe(
                `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
                 VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb));`,
                `home:section:${i}`,
                homePageId,
                i,
                section.blockType,
                JSON.stringify(section.config),
              );
            }

            console.log(`[seed] Platform admin home page seeded with ${homeSections.length} marketing sections`);
          }

          // ── Dashboard / Pricing page: update title + 3 sections ──
          const dashPageRows = (await seedDb.$queryRawUnsafe(
            `SELECT id FROM app_pages WHERE slug = 'dashboard' AND tenant_slug = $1 LIMIT 1;`,
            slug,
          )) as { id: string }[];

          if (dashPageRows.length > 0) {
            const dashPageId = dashPageRows[0].id;

            await seedDb.$executeRawUnsafe(
              `UPDATE app_pages SET title = 'Pricing', nav_label = 'Pricing' WHERE id = $1;`,
              dashPageId,
            );

            await seedDb.$executeRawUnsafe(
              `DELETE FROM page_sections WHERE page_id = $1;`,
              dashPageId,
            );

            const dashSections: Array<{ blockType: string; config: Record<string, unknown> }> = [
              {
                blockType: 'pricing_table',
                config: {
                  heading: 'Pricing',
                  subheading: 'Start for free and upgrade as you grow.',
                  highlightPlanId: 'business',
                  ctaHref: '/admin',
                  minTier: 'public',
                },
              },
              {
                blockType: 'faq',
                config: {
                  heading: 'Frequently asked questions',
                  items: [
                    { question: 'Can I change my plan at any time?', answer: 'Yes. Upgrades take effect immediately and are charged pro rata for the rest of the current period, without resetting your billing date. Downgrades take effect at the end of the period you have already paid for, so you keep what you bought.' },
                    { question: 'What are AI credits?', answer: 'Credits are spent when the platform generates something for you — an app, a schema, a template, or a chat reply. Each plan includes a monthly allowance, and credits expire 30 days after they are granted. You can buy top-ups on a paid plan.' },
                    { question: 'What happens if I run out of credits?', answer: 'Work already in progress finishes rather than failing halfway. The shortfall is recorded and the next generation is blocked until it is settled, which the next monthly allowance does automatically.' },
                    { question: 'What payment methods do you accept?', answer: 'Cards, through Stripe. Card details are entered directly with Stripe and never reach our servers. Other payment methods are handled case by case on Enterprise.' },
                    { question: 'What does hosting cost?', answer: 'Hosting, the database, authentication, storage and email are included in every plan. Paid plans include a larger share of cloud usage.' },
                    { question: 'Can I use my own AI provider key?', answer: 'Yes, on paid plans. You can bring your own provider key; AI credit usage is still metered against your plan balance so spend stays visible and capped.' },
                  ],
                  minTier: 'public',
                },
              },
              {
                blockType: 'cta_banner',
                config: {
                  heading: 'Start building for free',
                  subheading: 'No credit card required.',
                  ctaLabel: 'Start building',
                  ctaHref: '/admin',
                  minTier: 'public',
                },
              },
            ];

            for (let i = 0; i < dashSections.length; i++) {
              const section = dashSections[i];
              await seedDb.$executeRawUnsafe(
                `INSERT INTO page_sections (id, page_id, sort_order, block_type, config)
                 VALUES ($1, $2, $3, CAST($4 AS "BlockType"), CAST($5 AS jsonb));`,
                `dashboard:section:${i}`,
                dashPageId,
                i,
                section.blockType,
                JSON.stringify(section.config),
              );
            }

            console.log(`[seed] Platform admin pricing page seeded with ${dashSections.length} sections`);
          }

          console.log('[seed] Platform admin marketing content seeded');
        } catch (marketingErr) {
          console.error('[seed] Failed to seed platform admin marketing content:', marketingErr);
        }
      }

      if (result.errors?.length > 0) {
        console.error(`[seed] Seed errors for "${slug}":`, result.errors);
      }

      const dbTarget: 'dedicated' | 'root' = dedicatedClient ? 'dedicated' : 'root';
      const scope: 'tenant-wide' | 'full' = isSuite ? 'tenant-wide' : 'full';

      // result.pages/navItems are just insert-loop counters — they prove a
      // statement didn't throw, not that a row now actually exists in this
      // tenant's real database. Re-query the target connection so the
      // response reflects what's actually persisted, not what was attempted.
      // Skipped for a suite tenant — this run never touches page/nav content,
      // so counting it here would misrepresent what this seed actually did.
      let verifiedPages: number | undefined;
      let verifiedNavItems: number | undefined;
      if (!isSuite) {
        const verifyDb = seedDb as { $queryRawUnsafe: (sql: string, ...params: unknown[]) => Promise<{ count: bigint }[]> };
        const [verifiedPagesRows, verifiedNavRows] = await Promise.all([
          verifyDb.$queryRawUnsafe(`SELECT COUNT(*) AS count FROM app_pages WHERE tenant_slug = $1;`, tenant.slug as string),
          verifyDb.$queryRawUnsafe(`SELECT COUNT(*) AS count FROM navigation_items WHERE tenant_slug = $1;`, tenant.slug as string),
        ]);
        verifiedPages = Number(verifiedPagesRows[0]?.count ?? 0);
        verifiedNavItems = Number(verifiedNavRows[0]?.count ?? 0);
      }

      console.log(`[seed] Seed complete for "${slug}" (${dbTarget} DB, ${scope} scope): ${verifiedPages !== undefined ? `${result.pages} pages attempted / ${verifiedPages} verified, ${result.navItems} nav items attempted / ${verifiedNavItems} verified, ` : ''}${groupsCount} groups`);

      return jsonOk({
        seeded: true,
        scope,
        pages: result.pages,
        navItems: result.navItems,
        verifiedPages,
        verifiedNavItems,
        dbTarget,
        groups: groupsCount,
        settings: result.settings,
        adminSeeded: result.adminSeeded,
        errors: result.errors || [],
      });
    } finally {
      if (dedicatedClient) await dedicatedClient.$disconnect();
    }
  } catch (err) {
    console.error(`[seed] POST /${slug}/seed error:`, err);
    return jsonError('Failed to seed tenant: ' + (err as Error).message, 500);
  }
}
