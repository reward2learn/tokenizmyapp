/**
 * Tenant-aware Terms of Service + Privacy Policy generator.
 *
 * Called during /config seed (and reprocess) when a workbook is analyzed.
 * Content is derived from:
 *   - Tenant identity (name, slug, URL, description)
 *   - Template / assistant profile (domain, capabilities, currency)
 *   - Full page catalog (routes, auth tiers, nav visibility)
 *   - Workbook analysis (company, period, sheets, categories)
 *
 * Output is markdown stored as knowledge snippets (`terms_of_service`,
 * `privacy_policy`) and served by /api/content for the public
 * /terms-of-service and /privacy-policy pages.
 */

import type { WorkbookAnalysis, SheetCategory } from '@/domain/excel/workbook-analyzer';
import type { PageDefinition } from '@/lib/page-catalog';
import { getFullCatalog } from '@/lib/page-catalog';
import { getTenantConfig, getTenantAppUrl } from '@shared/lib/config/tenant';
import {
  getAssistantProfile,
  getTemplateIdentity,
} from '@shared/lib/config/template-profile';

export interface LegalDocContext {
  businessName: string;
  tenantSlug: string;
  description: string;
  appUrl: string;
  templateId: string;
  templateLabel: string;
  domain: string;
  currency: string;
  capabilities: string[];
  /** Human-readable capability clauses for Terms / Privacy (user-extensible). */
  capabilityClauses: CapabilityLegalClauses;
  pages: Array<{
    slug: string;
    title: string;
    authTier: string;
    showInNav: boolean;
  }>;
  workbook: {
    fileName: string;
    company: string;
    period: string;
    sheetCount: number;
    categories: string[];
    sheetTitles: string[];
    summary: string;
  } | null;
  generatedAt: string;
}

export interface CapabilityLegalClauses {
  /** Bullet lines describing what the service does (Terms § Description). */
  serviceFeatures: string[];
  /** Bullet lines describing personal / business data processed (Privacy). */
  dataProcessed: string[];
  /** Bullet lines describing how data is used (Privacy). */
  dataUses: string[];
}

export interface GeneratedLegalDocs {
  termsMarkdown: string;
  privacyMarkdown: string;
  context: LegalDocContext;
}

const CATEGORY_DATA_LABELS: Partial<Record<SheetCategory, string>> = {
  daily_sales: 'daily sales and guest / transaction metrics',
  profit_loss: 'profit & loss and income statement figures',
  balance_sheet: 'balance sheet and liquidity figures',
  trial_balance: 'trial balance account balances',
  general_ledger: 'general ledger journal detail',
  cost_of_sales: 'cost of sales and COGS detail',
  month_on_month: 'month-on-month performance comparisons',
  break_even: 'break-even and coverage analysis',
  variance: 'budget vs actual variance figures',
  summary_pl: 'summary profit & loss rollups',
  summary_bs: 'summary balance sheet rollups',
};

/**
 * Map template capabilities + workbook categories into legal clause bullets.
 *
 * LEARNING HOOK — customize how your product capabilities appear in Terms
 * and Privacy. Defaults cover common TokenizMyApp surfaces; extend this for
 * industry-specific processing (e.g. health data, payments, POS).
 */
export function buildCapabilityLegalClauses(
  capabilities: string[],
  workbookCategories: string[],
  pages: LegalDocContext['pages'],
): CapabilityLegalClauses {
  const serviceFeatures: string[] = [];
  const dataProcessed: string[] = [];
  const dataUses: string[] = [];

  const hasPage = (...slugs: string[]) =>
    pages.some((p) => slugs.includes(p.slug));
  const hasBlockish = (needle: string) =>
    pages.some((p) => p.slug.includes(needle));

  // ── Built-in page / surface mapping ────────────────────
  if (hasPage('dashboard', 'home')) {
    serviceFeatures.push(
      'Interactive business dashboard with KPIs, charts, and operational summaries',
    );
    dataUses.push('Display dashboards and performance summaries to authorized users');
  }
  if (hasPage('summary')) {
    serviceFeatures.push('Executive summary and narrative business overview');
  }
  if (hasPage('review') || hasBlockish('review') || hasBlockish('part-')) {
    serviceFeatures.push(
      'Business review documentation generated from uploaded financial workbooks',
    );
    dataUses.push('Generate and store business review and analysis documents');
  }
  if (hasPage('tasks')) {
    serviceFeatures.push('Action / task tracking tied to turnaround or operating plans');
    dataProcessed.push('Task titles, owners, due dates, and completion status');
  }
  if (hasPage('ops-admin', 'ops-tracking') || hasBlockish('ops')) {
    serviceFeatures.push(
      'Operations admin tools for entering and tracking daily operational metrics',
    );
    dataProcessed.push(
      'Operational metrics entered by administrators (for example revenue, costs, staffing)',
    );
  }
  if (hasPage('ops-chat') || hasBlockish('chat')) {
    serviceFeatures.push(
      'AI chat assistant that answers questions about workbook and business data',
    );
    dataProcessed.push('Chat messages and conversation context sent to the AI provider');
    dataUses.push('Process natural-language queries via the configured AI provider');
  }
  if (hasPage('config') || hasPage('settings')) {
    serviceFeatures.push(
      'Configuration surfaces for uploading source workbooks and managing app settings',
    );
    dataProcessed.push('Uploaded Excel workbooks and derived sheet metadata');
  }
  if (pages.some((p) => p.slug.startsWith('sheet-') || p.slug === 'workbook')) {
    serviceFeatures.push(
      'Workbook sheet viewers that mirror tabs from the uploaded Excel file',
    );
  }

  // ── Template capability strings ────────────────────────
  for (const cap of capabilities) {
    const trimmed = cap.trim();
    if (!trimmed) continue;
    if (!serviceFeatures.some((f) => f.toLowerCase().includes(trimmed.toLowerCase()))) {
      serviceFeatures.push(trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
    }
  }

  // ── Workbook category → data inventory ─────────────────
  for (const cat of workbookCategories) {
    const label = CATEGORY_DATA_LABELS[cat as SheetCategory] ?? `${cat.replace(/_/g, ' ')} workbook data`;
    if (!dataProcessed.includes(label)) dataProcessed.push(label);
  }

  // ── TODO(learning): add your domain-specific clauses ───
  // Example: if your template processes payments or PII beyond the defaults,
  // push additional bullets onto serviceFeatures / dataProcessed / dataUses.
  // Keep language accurate — these strings are shown on public legal pages.
  //
  // if (capabilities.includes('payment-processing')) {
  //   dataProcessed.push('Payment method tokens (handled by the payment provider; we do not store full card numbers)');
  //   dataUses.push('Process transactions and reconcile settlement reports');
  // }

  if (serviceFeatures.length === 0) {
    serviceFeatures.push(
      'Authenticated access to business data, reports, and operational tools for this tenant application',
    );
  }
  if (dataProcessed.length === 0) {
    dataProcessed.push(
      'Account profile data from Google sign-in (name, email, profile image) when used',
      'Business and financial data imported from uploaded workbooks',
    );
  }
  if (dataUses.length === 0) {
    dataUses.push(
      'Authenticate users and enforce role-based access',
      'Render reports, dashboards, and documents within the application',
    );
  }

  return { serviceFeatures, dataProcessed, dataUses };
}

function formatAuthTierLabel(tier: string): string {
  switch (tier) {
    case 'public':
      return 'Public (no sign-in)';
    case 'pin':
      return 'PIN / staff access';
    case 'google':
      return 'Google sign-in required';
    default: {
      const _exhaustive: string = tier;
      return _exhaustive;
    }
  }
}

export function buildLegalDocContext(
  analysis?: WorkbookAnalysis | null,
  catalogPages?: PageDefinition[],
): LegalDocContext {
  const tenant = getTenantConfig();
  const identity = getTemplateIdentity();
  const profile = getAssistantProfile();
  const pages = (catalogPages ?? Object.values(getFullCatalog())).map((p) => ({
    slug: p.slug,
    title: p.title,
    authTier: p.authTier,
    showInNav: p.showInNav !== false,
  }));

  const workbook = analysis
    ? {
        fileName: analysis.fileName,
        company: analysis.company || tenant.displayName,
        period: analysis.period || 'Not specified',
        sheetCount: analysis.sheetCount,
        categories: analysis.categoriesFound,
        sheetTitles: analysis.sheets.map((s) => s.title || s.tabName),
        summary: analysis.summary,
      }
    : null;

  const businessName =
    workbook?.company?.trim() || tenant.displayName || 'the Business';

  const capabilityClauses = buildCapabilityLegalClauses(
    profile.capabilities,
    workbook?.categories ?? [],
    pages,
  );

  return {
    businessName,
    tenantSlug: tenant.slug,
    description: tenant.description,
    appUrl: getTenantAppUrl(),
    templateId: identity.id || 'default',
    templateLabel: identity.label || 'Business application',
    domain: profile.domain,
    currency: profile.currency,
    capabilities: profile.capabilities,
    capabilityClauses,
    pages,
    workbook,
    generatedAt: new Date().toISOString().slice(0, 10),
  };
}

function bulletList(items: string[]): string {
  return items.map((i) => `- ${i}`).join('\n');
}

function buildAccessSection(ctx: LegalDocContext): string {
  const publicPages = ctx.pages.filter((p) => p.authTier === 'public');
  const restricted = ctx.pages.filter((p) => p.authTier !== 'public');

  const lines: string[] = [
    `## Access and Authentication`,
    ``,
    `### Public areas`,
  ];

  if (publicPages.length) {
    lines.push(
      `The following areas are publicly accessible without authentication:`,
      ``,
      bulletList(publicPages.map((p) => `**${p.title}** (\`/${p.slug}\`)`)),
    );
  } else {
    lines.push(`Public marketing or legal pages may be available without authentication.`);
  }

  lines.push(``, `### Restricted areas`);
  if (restricted.length) {
    lines.push(
      `Other application pages require authentication. Access tiers in this deployment:`,
      ``,
      bulletList(
        [...new Set(restricted.map((p) => p.authTier))].map(
          (t) => `${formatAuthTierLabel(t)} — ${restricted.filter((p) => p.authTier === t).length} page(s)`,
        ),
      ),
      ``,
      `Sign-in may use Google OAuth and/or a site PIN, depending on how this tenant is configured.`,
    );
  } else {
    lines.push(`Restricted pages require an authorized Google account or PIN.`);
  }

  return lines.join('\n');
}

function buildWorkbookSection(ctx: LegalDocContext): string {
  if (!ctx.workbook) {
    return [
      `## Source data`,
      ``,
      `This application may store business documents and operational data uploaded by authorized administrators.`,
    ].join('\n');
  }

  const w = ctx.workbook;
  return [
    `## Source workbook`,
    ``,
    `Content and metrics in this application are derived in part from an uploaded workbook:`,
    ``,
    `- **File**: ${w.fileName}`,
    `- **Company detected**: ${w.company}`,
    `- **Period**: ${w.period}`,
    `- **Sheets**: ${w.sheetCount}`,
    w.sheetTitles.length
      ? `- **Tabs**: ${w.sheetTitles.slice(0, 12).join(', ')}${w.sheetTitles.length > 12 ? `, and ${w.sheetTitles.length - 12} more` : ''}`
      : '',
    w.summary ? `- **Summary**: ${w.summary}` : '',
    ``,
    `Uploaded workbooks are processed to generate pages, knowledge snippets, and AI-assisted documents. Only authorized users may upload or replace source files.`,
  ]
    .filter((l) => l !== '')
    .join('\n');
}

export function generateTermsOfService(ctx: LegalDocContext): string {
  const { businessName, appUrl, templateLabel, domain, currency, capabilityClauses } = ctx;

  return [
    `# Terms of Service`,
    ``,
    `*Last updated: ${ctx.generatedAt}*`,
    ``,
    `## 1. Acceptance of Terms`,
    ``,
    `By accessing or using the application at **${appUrl}** (the "Site") operated by **${businessName}** ("we," "us," or "our"), you agree to these Terms of Service ("Terms"). If you do not agree, do not use the Site.`,
    ``,
    `These Terms form a binding agreement between you and ${businessName}. The Site is a **${templateLabel}** deployment for **${domain}** and may present figures in **${currency}** where applicable.`,
    ``,
    `## 2. Description of Service`,
    ``,
    ctx.description ? `${ctx.description}` : '',
    ``,
    `The Site provides the following capabilities:`,
    ``,
    bulletList(capabilityClauses.serviceFeatures),
    ``,
    buildAccessSection(ctx),
    ``,
    buildWorkbookSection(ctx),
    ``,
    `## 3. Acceptable Use`,
    ``,
    `You agree to use the Site only for lawful purposes and in accordance with these Terms. You agree not to:`,
    ``,
    `- Attempt to gain unauthorized access to restricted areas, accounts, or systems`,
    `- Upload malware, or content you do not have rights to process`,
    `- Misrepresent your identity or authority when signing in`,
    `- Scrape, reverse engineer, or overload the Site except as allowed by applicable law`,
    `- Use AI chat or exported reports to violate confidentiality obligations you owe to ${businessName}`,
    ``,
    `## 4. Intellectual Property`,
    ``,
    `The Site software, design, and generated documents remain owned by ${businessName} and its licensors. Uploaded workbooks and business data remain owned by the uploading organization, subject to the license needed to operate the Site.`,
    ``,
    `## 5. Disclaimers`,
    ``,
    `Financial analyses, AI responses, and generated documents are provided for internal business decision support. They are **not** formal accounting, tax, or legal advice. Always verify figures against source systems before relying on them for statutory filings.`,
    ``,
    `THE SITE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, TO THE MAXIMUM EXTENT PERMITTED BY LAW.`,
    ``,
    `## 6. Limitation of Liability`,
    ``,
    `To the fullest extent permitted by law, ${businessName} is not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or business opportunities arising from use of the Site.`,
    ``,
    `## 7. Changes`,
    ``,
    `We may update these Terms when the application is reconfigured (for example after a new workbook seed). The "Last updated" date above reflects the most recent generation. Continued use after changes constitutes acceptance.`,
    ``,
    `## 8. Contact`,
    ``,
    `Questions about these Terms: contact the administrators of **${businessName}** (tenant \`${ctx.tenantSlug}\`).`,
    ``,
  ]
    .filter((l) => l !== undefined)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function generatePrivacyPolicy(ctx: LegalDocContext): string {
  const { businessName, appUrl, capabilityClauses, domain } = ctx;

  return [
    `# Privacy Policy`,
    ``,
    `*Last updated: ${ctx.generatedAt}*`,
    ``,
    `## 1. Introduction`,
    ``,
    `**${businessName}** ("we," "us," or "our") operates **${appUrl}** (the "Site"). This Privacy Policy explains how we collect, use, disclose, and protect information when you use the Site — a ${domain} application provisioned for this tenant.`,
    ``,
    `By using the Site, you consent to the practices described here.`,
    ``,
    `## 2. Information We Collect`,
    ``,
    `### 2.1 Information you provide`,
    ``,
    bulletList(capabilityClauses.dataProcessed),
    ``,
    `### 2.2 Information collected automatically`,
    ``,
    `- **Session data**: HTTP cookies and signed session tokens to keep you signed in`,
    `- **Technical logs**: Standard hosting logs (IP address, user agent, timestamps) retained for security and reliability`,
    ``,
    `### 2.3 Information from third parties`,
    ``,
    `If you sign in with Google, we receive your name, email address, and profile image according to the permissions you grant. We do not receive Google passwords.`,
    ``,
    buildWorkbookSection(ctx),
    ``,
    `## 3. How We Use Information`,
    ``,
    bulletList(capabilityClauses.dataUses),
    `- Improve reliability, diagnose errors, and secure the Site`,
    `- We do **not** sell personal information or use contact details for unrelated marketing`,
    ``,
    `## 4. AI processing`,
    ``,
    `When you use AI features (chat, content generation, workbook comprehension), prompts and relevant business context may be sent to the configured AI provider to produce responses. Do not paste secrets or unnecessary personal data into chat.`,
    ``,
    `## 5. Data storage and security`,
    ``,
    `- Application data is stored in a PostgreSQL database bound to this deployment`,
    `- Sensitive credentials (PIN hashes, API keys) are encrypted or hashed before storage`,
    `- Session cookies are transmitted over HTTPS in production`,
    ``,
    `No method of transmission or storage is 100% secure; we apply industry-standard safeguards appropriate to a business operations app.`,
    ``,
    `## 6. Data sharing`,
    ``,
    `We share data only with:`,
    ``,
    `- **Infrastructure providers** (hosting, database) under their data processing terms`,
    `- **AI providers** when you use AI features, limited to the content needed for the request`,
    `- **Authorities** when required by law`,
    ``,
    `We do not sell personal data.`,
    ``,
    `## 7. Retention`,
    ``,
    `Business and workbook-derived data is retained while the tenant application is active and until an authorized administrator deletes or reseeds it. Session and log data is retained for shorter operational windows.`,
    ``,
    `## 8. Your rights`,
    ``,
    `Depending on your jurisdiction, you may have rights to access, correct, or delete personal data we hold about you. Contact the administrators of **${businessName}** (tenant \`${ctx.tenantSlug}\`) to make a request.`,
    ``,
    `## 9. Children's privacy`,
    ``,
    `The Site is intended for business users and is not directed at children under 16.`,
    ``,
    `## 10. Changes`,
    ``,
    `This policy may be regenerated when the application is reconfigured from a new workbook or template capabilities change. The "Last updated" date reflects the latest generation.`,
    ``,
    `## 11. Contact`,
    ``,
    `Privacy questions: contact the administrators of **${businessName}**.`,
    ``,
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generate Terms + Privacy markdown from optional workbook analysis and the
 * live page catalog / tenant / template profile.
 */
export function generateLegalDocuments(
  analysis?: WorkbookAnalysis | null,
  catalogPages?: PageDefinition[],
): GeneratedLegalDocs {
  const context = buildLegalDocContext(analysis, catalogPages);
  return {
    termsMarkdown: generateTermsOfService(context),
    privacyMarkdown: generatePrivacyPolicy(context),
    context,
  };
}
