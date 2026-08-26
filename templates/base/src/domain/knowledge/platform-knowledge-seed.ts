/**
 * Platform-scoped assistant knowledge for tokenizmyapp (the tenant factory).
 */
import type { DbClient } from '@/lib/db';
import { getCurrentAppId, getTenantConfig } from '@shared/lib/config/tenant';
import { TEMPLATE_ASSISTANT_PROFILES } from '@/domain/tenant/template-assistant-profiles';
import { TEMPLATE_CATALOG } from '@/domain/tenant/template-catalog';
import type { KnowledgeSeedSnippet } from '@/domain/knowledge/knowledge-seed';

const PLATFORM_TEMPLATE_ID = 'platform-admin' as const;

export const RED_RUBY_SNIPPET_KEYS = [
  'business_name',
  'location',
  'situation_summary',
  'current_metrics',
  'target_metrics',
  'five_levers',
  'priority_actions_p0',
  'priority_actions_p1',
  'priority_actions_p2',
  'key_risks',
  'strategic_partnerships',
  'monthly_targets_table',
] as const;

export function buildPlatformKnowledgeSnippets(): KnowledgeSeedSnippet[] {
  const tenant = getTenantConfig();
  const template = TEMPLATE_CATALOG[PLATFORM_TEMPLATE_ID];
  const profile = TEMPLATE_ASSISTANT_PROFILES[PLATFORM_TEMPLATE_ID];

  return [
    {
      key: 'app_overview',
      category: 'overview',
      content:
        `${tenant.displayName} is the ${template.label} control plane — ${template.description} ` +
        'This workspace manages tenant applications, deployments, and platform configuration. ' +
        'It is not a single operating business; do not describe nightclub, venue, or tenant-specific financials unless loaded explicitly for a named tenant.',
    },
    {
      key: 'assistant_capabilities',
      category: 'overview',
      content: `This assistant can: ${profile.capabilities.join('; ')}.`,
    },
    {
      key: 'domain_metrics',
      category: 'metrics',
      content:
        `Platform metrics that matter: ${profile.keyMetrics.join(', ')}. ` +
        'None are populated from a tenant workbook in this workspace.',
    },
  ];
}

export async function seedPlatformKnowledge(db: DbClient, appId = getCurrentAppId()): Promise<number> {
  const tenant = getTenantConfig();
  const snippets = buildPlatformKnowledgeSnippets();
  let written = 0;

  for (const key of RED_RUBY_SNIPPET_KEYS) {
    try {
      await db.knowledgeSnippet.deleteMany({ where: { key, appId } });
    } catch {
      // non-fatal
    }
  }

  for (const snippet of snippets) {
    await db.knowledgeSnippet.upsert({
      where: { key_appId: { key: snippet.key, appId } },
      create: { ...snippet, appId },
      update: { category: snippet.category, content: snippet.content },
    });
    written += 1;
  }

  console.log(
    `[platform-knowledge] Seeded ${written} snippet(s) for "${tenant.displayName}" (appId="${appId || '(default)'}")`,
  );
  return written;
}
