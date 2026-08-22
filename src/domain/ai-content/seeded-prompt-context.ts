/**
 * Builds extra prompt context from rows already written by Config → Upload & Seed.
 * Generate Content should use this inventory in addition to the Excel extract so
 * narrative matches Review Data (projections, targets, levers, snippets, tasks).
 */

import type { DbClient } from '@/lib/db';
import { getCurrentAppId } from '@shared/lib/config/tenant';

/** Snippet keys that are binary/cache blobs — never dump into the AI prompt. */
const CACHE_OR_BINARY_KEYS = new Set([
  'workbook_data',
  'workbook_formulas',
  'workbook_sheet_viewer_config',
]);

/**
 * TODO (you): pick which seeded knowledge_snippet keys should always be injected
 * into Generate Content. Prefer short, high-signal narrative/metrics keys.
 * Leave the array empty to auto-include every non-cache snippet (capped below).
 *
 * Examples from a typical finance reseed:
 *   'situation_summary', 'current_metrics', 'five_levers', 'key_risks',
 *   'priority_actions_p0', 'monthly_targets_table', 'workbook_summary'
 */
export const PREFERRED_SNIPPET_KEYS: string[] = [
  // ← fill 3–8 keys here, or leave empty for auto-include
];

const MAX_SNIPPET_CHARS = 4_000;
const MAX_TOTAL_CONTEXT_CHARS = 48_000;

function fmtMoney(n: unknown): string {
  const v = typeof n === 'bigint' ? Number(n) : Number(n);
  if (!Number.isFinite(v)) return '—';
  return `IDR ${Math.round(v).toLocaleString('id-ID')}`;
}

/**
 * Load seeded inventory for the current suite app and format it as markdown
 * appended to the Generate Content prompt.
 */
export async function buildSeededPromptContext(db: DbClient): Promise<string> {
  const appId = getCurrentAppId();
  const sections: string[] = [
    `## Seeded database inventory (appId="${appId || '(default)'}")`,
    ``,
    `The following was already written by Config → Upload & Seed. Prefer these`,
    `figures when they conflict with a stale on-disk workbook extract.`,
    ``,
  ];

  const [projections, targets, levers, actionItems, tasks, snippets] = await Promise.all([
    db.financialProjection.findMany({
      where: { appId },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
      take: 48,
    }),
    db.monthlyTarget.findMany({
      where: { appId },
      orderBy: { month: 'asc' },
      take: 24,
    }),
    db.lever.findMany({
      where: { appId },
      orderBy: { num: 'asc' },
    }),
    db.actionItem.findMany({
      where: { appId },
      orderBy: [{ priority: 'asc' }, { sortOrder: 'asc' }],
      take: 40,
    }),
    db.task.findMany({
      where: { appId },
      orderBy: [{ priority: 'asc' }, { sortOrder: 'asc' }],
      take: 40,
      include: { assignments: { include: { role: true } } },
    }),
    db.knowledgeSnippet.findMany({
      where: { appId },
      orderBy: { key: 'asc' },
    }),
  ]);

  if (projections.length > 0) {
    sections.push(`### Financial projections (${projections.length} rows)`);
    sections.push(`| Period | Type | Scenario | Revenue | EBITDA | Net Income |`);
    sections.push(`|--------|------|----------|---------|--------|------------|`);
    for (const p of projections) {
      sections.push(
        `| ${p.period} | ${p.dataType} | ${p.scenario} | ${fmtMoney(p.revenue)} | ${fmtMoney(p.ebitda)} | ${fmtMoney(p.netIncome)} |`,
      );
    }
    sections.push(``);
  }

  if (targets.length > 0) {
    sections.push(`### Monthly targets (${targets.length})`);
    sections.push(`| Month | Target Revenue | Target EBITDA | Guests |`);
    sections.push(`|-------|----------------|---------------|--------|`);
    for (const t of targets) {
      sections.push(
        `| ${t.month} | ${fmtMoney(t.targetRevenue)} | ${fmtMoney(t.targetEbitda)} | ${t.targetGuests ?? '—'} |`,
      );
    }
    sections.push(``);
  }

  if (levers.length > 0) {
    sections.push(`### Levers (${levers.length})`);
    for (const l of levers) {
      sections.push(`- **${l.num}. ${l.name}** — ${l.impact}`);
    }
    sections.push(``);
  }

  if (actionItems.length > 0) {
    sections.push(`### Action items (${actionItems.length})`);
    for (const a of actionItems) {
      sections.push(`- [${a.completed ? 'x' : ' '}] ${a.priority}: ${a.label}`);
    }
    sections.push(``);
  }

  if (tasks.length > 0) {
    sections.push(`### Tasks (${tasks.length})`);
    for (const t of tasks) {
      const roles = t.assignments?.map((x) => x.role?.name ?? x.role?.code).filter(Boolean) ?? [];
      sections.push(
        `- ${t.priority} ${t.title}${roles.length ? ` (owners: ${roles.join(', ')})` : ''}`,
      );
    }
    sections.push(``);
  }

  const preferred = PREFERRED_SNIPPET_KEYS.filter(Boolean);
  const narrativeSnippets = snippets.filter((s) => {
    if (CACHE_OR_BINARY_KEYS.has(s.key)) return false;
    if (s.category === 'cache') return false;
    if (!s.content || s.content.length === 0) return false;
    if (preferred.length > 0) return preferred.includes(s.key);
    return true;
  });

  if (narrativeSnippets.length > 0) {
    sections.push(`### Knowledge snippets (${narrativeSnippets.length})`);
    for (const s of narrativeSnippets) {
      const body =
        s.content.length > MAX_SNIPPET_CHARS
          ? `${s.content.slice(0, MAX_SNIPPET_CHARS)}\n…(truncated)`
          : s.content;
      sections.push(`#### ${s.key} (${s.category})`);
      sections.push(body);
      sections.push(``);
    }
  }

  let text = sections.join('\n');
  if (text.length > MAX_TOTAL_CONTEXT_CHARS) {
    text = `${text.slice(0, MAX_TOTAL_CONTEXT_CHARS)}\n\n…(seeded context truncated)`;
  }
  return text;
}
