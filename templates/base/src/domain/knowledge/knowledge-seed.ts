import { getTenantConfig } from '@shared/lib/config/tenant';
import {
  getAssistantProfile,
  getTemplateIdentity,
  NEUTRAL_ASSISTANT_PROFILE,
  type AssistantProfile,
} from '@shared/lib/config/template-profile';

/**
 * Assistant knowledge: the system prompt, and the fallback used when an app has
 * no knowledge of its own yet.
 *
 * ## What used to be here
 *
 * A hardcoded corpus describing one specific nightclub — eight snippets of its
 * financials plus a full exit-viability memo naming its shareholders — used as
 * the fallback for EVERY app built from EVERY template. Because a freshly
 * provisioned tenant's `knowledge_snippets` table is empty by definition, every
 * new tenant introduced itself as that business.
 *
 * Two further blocks were appended unconditionally, so even a tenant with its
 * own knowledge still received them: thirteen months of that nightclub's
 * revenue targets, and answer rules instructing the model to format money in
 * IDR and to highlight break-even coverage.
 *
 * ## What replaces it
 *
 * The persona now comes from the app's template (see
 * shared/lib/config/template-profile.ts), the targets come from the tenant's
 * own `monthly_targets` table, and the fallback describes the app's shape while
 * stating plainly that no data has been loaded. That tenant's real content
 * lives in its own database rows, where it always belonged.
 */

export interface KnowledgeSeedSnippet {
  key: string;
  category: string;
  content: string;
}

/** Ensure stored snippets never contradict the deployment's tenant display name. */
function normalizeSnippetsForTenant(
  snippets: { key: string; category: string; content: string }[],
  tenantName: string,
): { key: string; category: string; content: string }[] {
  return snippets.map((s) =>
    s.key === 'business_name' ? { ...s, content: tenantName } : s,
  );
}

function buildStructuredPromptFromSnippetsImpl(
  snippets: { key: string; category: string; content: string }[],
  tenantName: string,
  profile: AssistantProfile,
): string {
  const byCategory = new Map<string, string[]>();
  for (const s of snippets) {
    const list = byCategory.get(s.category) ?? [];
    // Truncate individual snippets to 1500 chars to stay under 6000 TPM for search-preview
    const truncated = s.content.length > 1500
      ? s.content.slice(0, 1500) + '\n\n[...content truncated for prompt size — full data available in the Business Review parts]'
      : s.content;
    list.push(truncated);
    byCategory.set(s.category, list);
  }

  const sections: string[] = [
    `You are ${tenantName} AI — the ${profile.role} for ${tenantName}.`,
    '',
    '## Your Role',
    `Help management understand and act on ${profile.domain} for ${tenantName}.`,
  ];

  if (profile.capabilities.length > 0) {
    sections.push('', 'You can:', ...profile.capabilities.map((c) => `- ${c}`));
  }

  if (profile.keyMetrics.length > 0) {
    sections.push(
      '',
      '## Metrics That Matter Here',
      profile.keyMetrics.join(', ') + '.',
    );
  }

  const categoryTitles: Record<string, string> = {
    overview: '## Key Business Information',
    strategy: '## Revenue & Growth Strategy',
    metrics: '## Metrics & Targets',
    actions: '## Priority Actions',
    risks: '## Key Risks to Monitor',
  };

  // Priority order: core categories first, then document/analysis last
  const priorityOrder = ['overview', 'strategy', 'metrics', 'actions', 'risks'];
  const processed = new Set<string>();

  // 1) Add prioritized categories first
  for (const cat of priorityOrder) {
    const contents = byCategory.get(cat);
    if (!contents || contents.length === 0) continue;
    processed.add(cat);
    const title = categoryTitles[cat] ?? `## ${cat}`;
    sections.push('', title, contents.join('\n\n'));
  }

  // 2) Add remaining categories (document, analysis, etc.) with tighter limits
  for (const [category, contents] of byCategory) {
    if (processed.has(category)) continue;
    processed.add(category);
    // For non-core categories, combine and cap at 1000 chars total
    const combined = contents.join('\n\n');
    const limited = combined.length > 1000
      ? combined.slice(0, 1000) + '\n\n[...additional data truncated — see full documents in the Business Review section]'
      : combined;
    sections.push('', `## ${category}`, limited);
  }

  // Targets used to be spliced in here from a hardcoded constant — one specific
  // tenant's thirteen months of revenue and guest goals, appended to EVERY
  // app's prompt regardless of template or tenant. They now come from that
  // tenant's own `monthly_targets` table, and an app with none says nothing
  // rather than borrowing somebody else's.

  const answerRules = profile.answerStyle.length > 0
    ? profile.answerStyle
    : NEUTRAL_ASSISTANT_PROFILE.answerStyle;

  sections.push(
    '',
    '## How You Answer',
    // The currency line was previously hardcoded to IDR, which reached tenants
    // trading in every other currency on earth.
    `1. Quote monetary amounts in ${profile.currency} unless the data itself states another currency.`,
    ...answerRules.map((rule, index) => `${index + 2}. ${rule}`),
    `${answerRules.length + 2}. Use live database data for performance questions rather than reciting this brief.`,
  );

  let result = sections.join('\n');

  // Hard cap at 18000 chars (~4500 tokens) to stay within 6000 TPM rate limit
  if (result.length > 18000) {
    result = result.slice(0, 18000) + '\n\n[System prompt truncated to fit rate limits — full context available in the Business Review parts]';
  }

  return result;
}

/** Public API — resolves tenant name from env vars at call time. */
export function buildStructuredPromptFromSnippets(
  snippets: { key: string; category: string; content: string }[],
): string {
  const tenant = getTenantConfig();
  return buildStructuredPromptFromSnippetsImpl(
    normalizeSnippetsForTenant(snippets, tenant.displayName),
    tenant.displayName,
    getAssistantProfile(),
  );
}

/**
 * Fallback knowledge for an app whose `knowledge_snippets` table is empty.
 *
 * Previously this was eight snippets of one nightclub's financials plus its
 * full exit-viability memo — so a brand-new tenant of any kind introduced
 * itself as that business and answered questions about its supplier debt.
 *
 * The replacement describes the app's *shape* (what it is for, what it can do)
 * and is explicit that no business data has been loaded yet. An assistant that
 * admits it has no data is useful; one that confidently recites someone else's
 * is worse than useless.
 *
 * Provisioning seeds real snippets into the tenant's own database (see
 * seedTenantKnowledge), so this should only be reached by apps created before
 * that existed, or where seeding failed.
 */
export function buildFallbackSnippets(): KnowledgeSeedSnippet[] {
  const tenant = getTenantConfig();
  const profile = getAssistantProfile();
  const { label } = getTemplateIdentity();

  const descriptor = label ? `a ${label} application` : 'a business operations application';

  return [
    {
      key: 'app_overview',
      category: 'overview',
      content:
        `${tenant.displayName} is ${descriptor} covering ${profile.domain}. ` +
        'No business data has been loaded into this workspace yet, so there are no ' +
        'figures to report. An administrator can add data through the admin section ' +
        'or by uploading a workbook under Config.',
    },
    ...(profile.capabilities.length > 0
      ? [{
          key: 'assistant_capabilities',
          category: 'overview',
          content:
            `Once data is loaded, this assistant can: ${profile.capabilities.join('; ')}.`,
        }]
      : []),
    ...(profile.keyMetrics.length > 0
      ? [{
          key: 'domain_metrics',
          category: 'metrics',
          content:
            `The metrics that matter for ${profile.domain} are: ${profile.keyMetrics.join(', ')}. ` +
            'None are currently populated.',
        }]
      : []),
  ];
}
