/**
 * Code-first page catalog — fallback SSoT when Neon has no AppPage row.
 * Supports static catalog entries and dynamically registered pages
 * (e.g. from workbook analysis after an Excel upload).
 *
 * Runtime resolution prefers DB (see page-resolver.ts) except the platform
 * factory `home`, which stays catalog-owned. Tenant apps do not inherit the
 * TokenizMyApp marketing homepage from this catalog.
 */
import { isPlatformApp } from '@shared/lib/config/tenant';
import { tierAllowsAccess } from '@/lib/auth/tier-access';

export type AuthTier = 'public' | 'pin' | 'google';

export type BlockType =
  | 'hero'
  | 'metric_grid'
  | 'chart_financial'
  | 'lever_accordion'
  | 'action_checklist'
  | 'doc_markdown'
  | 'pnl_table'
  | 'ops_admin_tabs'
  | 'z_report_form'
  | 'costs_form'
  | 'calendar_import'
  | 'chat_panel'
  | 'review_blocks'
  | 'kpi_cards'
  | 'reports_rollup'
  | 'sheet_viewer'
  | 'pack_table'
  | 'feature_grid'
  | 'testimonials'
  // Marketing landing blocks (roadmap Phase 7).
  | 'marketing_hero'
  | 'capability_marquee'
  | 'product_showcase'
  | 'customer_proof'
  | 'faq'
  | 'cta_banner'
  | 'pricing_table';

export interface PageSectionDefinition {
  /** Present when loaded from Neon — required for inline CMS edits. */
  id?: string;
  sortOrder?: number;
  blockType: BlockType;
  config: Record<string, unknown>;
}

export interface PageDefinition {
  slug: string;
  title: string;
  authTier: AuthTier;
  navLabel?: string;
  showInNav?: boolean;
  pdfExport?: boolean;
  /** Security-group codes required to see this page in nav / access it (membership-based). */
  requiredGroups?: string[];
  sections: PageSectionDefinition[];
}

export interface ReviewPartDefinition {
  partSlug: string;
  partKey: string;
  title: string;
  authTier: AuthTier;
}

/** Parts from the uploaded Business Review — populated dynamically at render time. */

/** Static parts A–G exist for backward compatibility with legacy seeded docs. Dynamic parts override these. */
const STATIC_PARTS: Record<string, ReviewPartDefinition> = {
  'part-a': {
    partSlug: 'part-a',
    partKey: 'A',
    title: 'Part A: Current Situation — The Numbers',
    authTier: 'google',
  },
  'part-b': {
    partSlug: 'part-b',
    partKey: 'B',
    title: 'Part B: The 10-Year Growth Model',
    authTier: 'google',
  },
  'part-c': {
    partSlug: 'part-c',
    partKey: 'C',
    title: 'Part C: Revenue Optimization Strategy',
    authTier: 'google',
  },
  'part-d': {
    partSlug: 'part-d',
    partKey: 'D',
    title: 'Part D: Cost Management',
    authTier: 'google',
  },
  'part-e': {
    partSlug: 'part-e',
    partKey: 'E',
    title: 'Part E: Risk Register',
    authTier: 'google',
  },
  'part-f': {
    partSlug: 'part-f',
    partKey: 'F',
    title: 'Part F: StarWORLD Membership Program',
    authTier: 'google',
  },
  'part-g': {
    partSlug: 'part-g',
    partKey: 'G',
    title: 'Part G: Immediate Actions (Next 30 Days)',
    authTier: 'google',
  },
};

/** Dynamic parts populated from parsed Business Review MD uploaded via /config. */
let DYNAMIC_PARTS: Record<string, ReviewPartDefinition> = {};

export function setDynamicReviewParts(parts: ReviewPartDefinition[]): void {
  DYNAMIC_PARTS = Object.fromEntries(
    parts.map((p) => [p.partSlug, p]),
  );
}

/**
 * Dynamic getter that merges static + any runtime-registered parts.
 * Use instead of REVIEW_PART_CATALOG so that setDynamicReviewParts() calls
 * are reflected immediately.
 */
export function getReviewPartCatalog(): Record<string, ReviewPartDefinition> {
  return { ...STATIC_PARTS, ...DYNAMIC_PARTS };
}

/** @deprecated Use getReviewPartCatalog() — this const is frozen at module load time. */
export const REVIEW_PART_CATALOG: Record<string, ReviewPartDefinition> = {
  ...STATIC_PARTS,
  ...DYNAMIC_PARTS,
};

/** Dynamic pages registered at runtime (e.g. from workbook analysis after reseed). */
let DYNAMIC_PAGES: Record<string, PageDefinition> = {};

/**
 * Register dynamically generated pages — called after workbook analysis
 * during the reseed pipeline so sheet-derived analytics pages appear in the nav.
 */
export function setDynamicPages(pages: PageDefinition[]): void {
  DYNAMIC_PAGES = Object.fromEntries(pages.map((p) => [p.slug, p]));
}

/**
 * Pages that differ on the platform's own console.
 *
 * The console runs the same codebase as every app it provisions, so most pages
 * are shared — but a few mean different things. `/dashboard` on a tenant app is
 * that business's operating dashboard; on the console there is no business to
 * report on, and the useful thing to show a signed-out visitor is what the
 * product costs.
 *
 * Applied over PAGE_CATALOG rather than branching inside it, so a tenant app's
 * dashboard is untouched and the override is visible in one place.
 */
const PLATFORM_PAGE_OVERRIDES: Record<string, PageDefinition> = {
  dashboard: {
    slug: 'dashboard',
    title: 'Pricing',
    navLabel: 'Pricing',
    showInNav: true,
    authTier: 'public',
    sections: [
      {
        // Generated from src/lib/billing/plans.ts — the same source that drives
        // Stripe prices, the monthly credit grant and every entitlement check.
        // Hand-written pricing copy starts lying the moment either side moves.
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
            {
              question: 'Can I change my plan at any time?',
              answer:
                'Yes. Upgrades take effect immediately and are charged pro rata for the rest of the current period, without resetting your billing date. Downgrades take effect at the end of the period you have already paid for, so you keep what you bought.',
            },
            {
              question: 'What are AI credits?',
              answer:
                'Credits are spent when the platform generates something for you — an app, a schema, a template, or a chat reply. Each plan includes a monthly allowance, and credits expire 30 days after they are granted. You can buy top-ups on a paid plan.',
            },
            {
              question: 'What happens if I run out of credits?',
              answer:
                'Work already in progress finishes rather than failing halfway. The shortfall is recorded and the next generation is blocked until it is settled, which the next monthly allowance does automatically.',
            },
            {
              question: 'What payment methods do you accept?',
              answer:
                'Cards, through Stripe. Card details are entered directly with Stripe and never reach our servers. Other payment methods are handled case by case on Enterprise.',
            },
            {
              question: 'What does hosting cost?',
              answer:
                'Hosting, the database, authentication, storage and email are included in every plan. Paid plans include a larger share of cloud usage.',
            },
            {
              question: 'Can I use my own AI provider key?',
              answer:
                'Yes, on paid plans. You can bring your own provider key; AI credit usage is still metered against your plan balance so spend stays visible and capped.',
            },
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
    ],
  },
};

/**
 * Factory marketing homepage — platform app only.
 * Tenant landings come from seeded `page_sections` / CMS, not this copy.
 */
const PLATFORM_HOME: PageDefinition = {
  slug: 'home',
  title: 'Home',
  navLabel: 'Home',
  showInNav: true,
  authTier: 'public',
  // Landing arc per roadmap §1.12: capability -> proof -> objections -> CTA.
  // The ordering is the argument; moving a section changes what the page
  // claims even when every section still reads correctly on its own.
  sections: [
      {
        blockType: 'marketing_hero',
        config: {
          headline: 'The best AI app builder for business',
          subheadline:
            'Build custom software for your business without hiring a developer.',
          audiences: ['Internal software', 'Customer software', 'Marketing & SEO', 'Mobile apps'],
          quickStarts: ['CRM', 'ERP', 'HR portal', 'Inventory tracker', 'Operations dashboard'],
          placeholder: 'Describe the app you want — "a CRM for my 75 person sales team"…',
          ctaLabel: 'Try it',
          ctaHref: '/admin',
          minTier: 'public',
        },
      },
      {
        // Empty until real customers agree to appear. See customer-proof-block.
        blockType: 'customer_proof',
        config: { heading: 'Customer results', minTier: 'public' },
      },
      {
        blockType: 'product_showcase',
        config: {
          heading: 'From idea to published app in minutes',
          items: [
            {
              icon: 'chat',
              title: 'Build by chatting',
              body: 'Describe what you want and watch it get built. Change your mind and say so — the app updates with you.',
            },
            {
              icon: 'builtin',
              title: 'Everything is built in',
              body: 'Auth, database, hosting, file storage, AI and API integrations ship with every app. Nothing to wire up, nothing extra to buy.',
            },
            {
              icon: 'publish',
              title: 'Publish in a click',
              body: 'Every app deploys to its own URL immediately. Connect a custom domain when you are ready to make it yours.',
            },
            {
              icon: 'scale',
              title: 'Scale without thinking about it',
              body: 'Apps run serverless on Vercel with a Postgres database per tenant, so traffic spikes are the platform\u2019s problem, not yours.',
            },
            {
              icon: 'govern',
              title: 'Govern with confidence',
              body: 'Roles, security groups and per-app permissions decide who sees what. Each tenant\u2019s data lives in its own database.',
            },
          ],
          minTier: 'public',
        },
      },
      {
        blockType: 'capability_marquee',
        config: {
          heading: 'Everything you need is built-in',
          subheading:
            'Auth, hosting, database, payments, email, AI and hundreds of other features, available the moment your app exists.',
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
        // No quotes are shipped by default — the block renders its empty state
        // until real, permissioned testimonials are added to this config.
        blockType: 'testimonials',
        config: {
          heading: 'What customers say',
          minTier: 'public',
        },
      },
      {
        blockType: 'faq',
        config: {
          heading: 'Frequently asked questions',
          items: [
            {
              question: 'What is TokenizMyApp?',
              answer:
                'An AI app builder for businesses. You describe the software your business needs and it builds a working application — database, screens, permissions and hosting included — without hiring a developer.',
            },
            {
              question: 'How does it work?',
              answer:
                '1. Chat with the AI about what you want to build.\n2. Watch it get built.\n3. Publish the app to its own URL, or to a domain you own.\n4. Keep chatting to change it.',
            },
            {
              question: 'What can I build?',
              answer:
                'Internal tools like CRMs, ERPs, HR portals, inventory trackers and operations dashboards, as well as customer-facing sites and portals. Templates cover restaurants, hotels, retail, healthcare, logistics, property, education, professional services, manufacturing and wellness.',
            },
            {
              question: 'Do I need coding experience?',
              answer:
                'No. You describe what you need in plain language. Everything technical — the database, the API, authentication, deployment — is handled for you.',
            },
            {
              question: 'Can I publish to my own domain?',
              answer:
                'Yes. Every app gets a free URL immediately, and you can connect a custom domain on a paid plan.',
            },
            {
              question: 'Who can see my data?',
              answer:
                'Each tenant gets its own Postgres database rather than sharing one. Access inside an app is controlled by roles and security groups that you configure.',
            },
            {
              question: 'What does it cost?',
              answer:
                'There is a free plan with a monthly allowance of AI credits, and paid plans that add custom domains, more apps and a larger allowance. You can start without a card.',
            },
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
    ],
};


/** Tenant landing — CEO overview: ops KPIs for the selected month, then AI narrative. */
const TENANT_HOME: PageDefinition = {
  slug: 'home',
  title: 'Home',
  navLabel: 'Home',
  showInNav: true,
  authTier: 'public',
  sections: [
    { blockType: 'hero', config: { badge: 'CEO Overview', minTier: 'public' } },
    { blockType: 'kpi_cards', config: { variant: 'ops', minTier: 'google' } },
    {
      blockType: 'doc_markdown',
      config: { source: 'executive-summary', title: 'Executive Summary', minTier: 'google' },
    },
    { blockType: 'review_blocks', config: { minTier: 'google' } },
    { blockType: 'action_checklist', config: { minTier: 'pin' } },
  ],
};


/** Combined static + dynamic page catalog (evaluated lazily so dynamic pages are included). */
export function getFullCatalog(): Record<string, PageDefinition> {
  return {
    ...PAGE_CATALOG,
    // Factory marketing home + pricing override — not inherited by tenant apps.
    ...(isPlatformApp() ? { home: PLATFORM_HOME, ...PLATFORM_PAGE_OVERRIDES } : { home: TENANT_HOME }),
    ...DYNAMIC_PAGES,
  };
}

export const PAGE_CATALOG: Record<string, PageDefinition> = {
  dashboard: {
    slug: 'dashboard',
    title: 'Dashboard',
    navLabel: 'Dashboard',
    showInNav: true,
    authTier: 'public',
    sections: [
      {
        blockType: 'hero',
        config: {
          badge: 'July 2026 · Exit Viability Review',
          headline: 'Business Review',
          subtitle:
            'Exit-viability assessment for PT Taman Bintang Bali — revenue under pressure, margin erosion detected, shareholder seeking pathway out.',
          minTier: 'public',
        },
      },
      // {
      //   blockType: 'chart_financial',
      //   config: { variant: 'dashboard', scenario: 'conservative', minTier: 'google' },
      // },
      {
        blockType: 'action_checklist',
        config: { minTier: 'pin' },
      },
      {
        blockType: 'metric_grid',
        config: { minTier: 'google' },
      },
      {
        blockType: 'lever_accordion',
        config: { title: 'The 5 Levers', minTier: 'google' },
      },
    ],
  },
  summary: {
    slug: 'summary',
    title: 'Executive Summary',
    navLabel: 'Summary',
    showInNav: true,
    authTier: 'google',
    pdfExport: true,
    sections: [{ blockType: 'doc_markdown', config: { source: 'executive-summary' } }],
  },
  'ops-admin': {
    slug: 'ops-admin',
    title: 'Ops Admin',
    navLabel: 'Ops Admin',
    showInNav: true,
    authTier: 'pin',
    requiredGroups: ['ops-admin'],
    sections: [{ blockType: 'ops_admin_tabs', config: {} }],
  },
  review: {
    slug: 'review',
    title: 'Business Review',
    navLabel: 'Review',
    showInNav: true,
    authTier: 'google',
    pdfExport: true,
    sections: [{ blockType: 'review_blocks', config: {} }],
  },
  'ops-tracking': {
    slug: 'ops-tracking',
    title: 'Financial Tracking',
    navLabel: 'Tracking',
    showInNav: true,
    authTier: 'google',
    sections: [
      { blockType: 'kpi_cards', config: { variant: 'ops' } },
      { blockType: 'reports_rollup', config: {} },
      { blockType: 'chart_financial', config: { variant: 'ops' } },
      { blockType: 'pnl_table', config: {} },
    ],
  },
  'ops-chat': {
    slug: 'ops-chat',
    title: 'AI Chat',
    navLabel: 'AI Chat',
    showInNav: true,
    authTier: 'google',
    sections: [{ blockType: 'chat_panel', config: {} }],
  },
  tasks: {
    slug: 'tasks',
    title: 'Exit-Viability Tasks',
    navLabel: 'Tasks',
    showInNav: true,
    authTier: 'google',
    sections: [],
  },
  admin: {
    slug: 'admin',
    title: 'Platform Admin',
    navLabel: 'Admin',
    showInNav: true,
    authTier: 'pin',
    sections: [],
  },
  config: {
    slug: 'config',
    title: 'Source Config',
    navLabel: 'Config',
    showInNav: true,
    authTier: 'pin',
    sections: [],
  },
  settings: {
    slug: 'settings',
    title: 'Settings',
    navLabel: 'Settings',
    showInNav: true,
    // The page itself is gated at google (it reaches billing); the nav item
    // must match so the drawer only offers it to signed-in admins.
    authTier: 'google',
    sections: [],
  },
  'terms-of-service': {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    showInNav: false,
    authTier: 'public',
    sections: [{ blockType: 'doc_markdown', config: { source: 'terms-of-service.html' } }],
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    showInNav: false,
    authTier: 'public',
    sections: [{ blockType: 'doc_markdown', config: { source: 'privacy-policy.html' } }],
  },
};

export { tierAllowsAccess } from '@/lib/auth/tier-access';

export function listNavPages(tier: AuthTier, groups: string[] = []): PageDefinition[] {
  return Object.values(getFullCatalog())
    .filter((p) => p.showInNav !== false)
    .filter((p) => tierAllowsAccess(tier, p.authTier))
    .filter((p) => !p.requiredGroups || p.requiredGroups.length === 0 || groups.includes('platform-admin') || p.requiredGroups.some((g) => groups.includes(g)))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function resolvePage(slug: string): PageDefinition | null {
  return getFullCatalog()[slug] ?? null;
}

export function resolveReviewPart(partSlug: string): ReviewPartDefinition | null {
  return getReviewPartCatalog()[partSlug] ?? null;
}

export function listReviewParts(): ReviewPartDefinition[] {
  return Object.values(getReviewPartCatalog()).sort((a, b) =>
    a.partKey.localeCompare(b.partKey),
  );
}

/** Descriptive title without the "Part X: " catalog prefix. */
export function getReviewPartDisplayTitle(title: string): string {
  return title.replace(/^Part [A-O]: /, '');
}

// === Settings page ===

const SETTINGS_PAGE: PageDefinition = {
  slug: 'settings',
  title: 'Settings',
  authTier: 'google',
  navLabel: 'Settings',
  showInNav: true,
  pdfExport: false,
  requiredGroups: [],
  sections: [],
};

export { SETTINGS_PAGE };
