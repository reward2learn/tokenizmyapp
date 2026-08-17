/**
 * Custom Template Generator — turns a URL or knowledge-base content into a
 * reusable TemplateDefinition.
 *
 * Two inputs are supported, matching how an admin actually has information:
 *   - `url`       — scrape a live site (existing url-scraper-service) and infer
 *                   the sector, pages, nav and brand colours from it.
 *   - `knowledge` — paste or reference written requirements.
 *
 * Provider routing goes through resolveActiveAiConfig(), so a generation runs on
 * whatever provider/model the tenant configured (OpenAI, Vercel AI Gateway,
 * OpenCode Zen). Note this deliberately differs from schema-generator.ts, which
 * still imports `@ai-sdk/openai` directly and therefore ignores the tenant's
 * provider choice — that is a pre-existing inconsistency, not a pattern to copy.
 *
 * The model's output is never trusted: it is validated against a Zod schema and
 * every field is clamped to values the provisioning pipeline can actually
 * execute (known block types, known auth tiers, hex colours).
 */
import { z } from 'zod';
import { resolveActiveAiConfig } from '@/lib/ai-providers';
import { scrapeUrl } from '@/domain/ai/url-scraper-service';
import { withTimeout } from '@/lib/with-timeout';
import { DEFAULT_WEB3_WALLET } from '@/lib/web3/reown';
import type {
  TemplateCapabilities,
  TemplateDefinition,
  Web3WalletConfig,
} from '@/domain/tenant/template-catalog';
import { toCustomTemplateId, type CustomTemplateSourceKind } from '@/domain/tenant/custom-template-service';

/**
 * Block types the renderer can actually mount.
 *
 * Must stay a subset of BlockType in src/lib/page-catalog.ts — a generated page
 * referencing an unknown block renders as nothing, and the failure surfaces at
 * provisioning time rather than here.
 */
const ALLOWED_BLOCKS = [
  'hero', 'kpi_cards', 'metric_grid', 'chart_financial', 'lever_accordion',
  'action_checklist', 'doc_markdown', 'pnl_table', 'ops_admin_tabs',
  'z_report_form', 'costs_form', 'calendar_import', 'chat_panel',
  'review_blocks', 'reports_rollup', 'sheet_viewer', 'pack_table',
  'feature_grid', 'testimonials',
] as const;

const AUTH_TIERS = ['public', 'pin', 'google'] as const;

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'must be a 6-digit hex colour');

/**
 * Wallet shape the model must produce.
 *
 * `socialProviders` is limited to google and apple because those are the only
 * socials enabled on the platform's Reown project — a model that invents
 * "discord" would produce a button that cannot complete a login. Email is a
 * separate AppKit feature flag, not a social, hence `emailLogin`.
 */
const web3WalletSchema = z.object({
  enabled: z.boolean(),
  connectMode: z.enum(['social', 'injected', 'both']),
  socialProviders: z.array(z.enum(['google', 'apple'])),
  emailLogin: z.boolean(),
  chains: z.array(z.number().int().positive()),
  showBalances: z.boolean(),
  tokenGating: z.boolean(),
});

const templateGenerationSchema = z.object({
  label: z.string().min(1).max(60),
  description: z.string().min(1).max(400),
  /** MUI icon name, e.g. "Storefront". Validated loosely — a bad name degrades to a default icon. */
  icon: z.string().min(1).max(40),
  templateType: z.enum(['single', 'suite']),
  defaultColors: z.object({ primary: hexColor, secondary: hexColor }),
  defaultPages: z.array(z.object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    title: z.string().min(1),
    navLabel: z.string().optional(),
    authTier: z.enum(AUTH_TIERS),
    blockTypes: z.array(z.enum(ALLOWED_BLOCKS)).min(1),
  })).min(1).max(12),
  defaultNavItems: z.array(z.object({
    title: z.string().min(1),
    path: z.string().startsWith('/'),
    icon: z.string().min(1),
    authTier: z.enum(AUTH_TIERS),
  })).min(1).max(12),
  schemaOrgType: z.string().min(1),
  xsdStandard: z.string().min(1),
  web3Wallet: web3WalletSchema,
  /** One line on why this shape was chosen — shown to the admin for review. */
  rationale: z.string().max(600).optional(),
});

export type TemplateGeneration = z.infer<typeof templateGenerationSchema>;

function buildSystemPrompt(): string {
  return [
    'You design application templates for a multi-tenant business app platform.',
    'Given a description of a business, produce a template: its pages, navigation, brand colours and metadata.',
    '',
    `Pages may only use these block types: ${ALLOWED_BLOCKS.join(', ')}.`,
    `Auth tiers: public (anyone), pin (staff), google (signed-in owner/admin).`,
    '',
    'Rules:',
    '- Always include a public landing page and a dashboard.',
    '- Put operational/staff pages behind "pin" and financial or admin pages behind "google".',
    '- Every navigation path must correspond to a page slug ("/" is allowed for the landing page).',
    '- Choose brand colours from the source material when available, otherwise pick a sober pair with good contrast.',
    '- schemaOrgType must be a real schema.org type. xsdStandard names the closest W3C/industry XML standard.',
    '',
    'Web3 wallet (provider: Reown AppKit): enable it ONLY when the business genuinely involves tokens,',
    'NFTs, crypto payments, memberships or loyalty that benefits from on-chain ownership. Most businesses',
    'do not need it — set enabled=false rather than adding it speculatively. When enabled, prefer',
    'connectMode "social" so users sign in with a familiar identity instead of managing a seed phrase.',
    'socialProviders may only contain "google" and "apple" — those are the socials enabled on the',
    'platform Reown project. Set emailLogin true to also offer email sign-in. Default chain is 8453 (Base).',
    'Even when the wallet is disabled, still return a complete web3Wallet object with enabled=false.',
  ].join('\n');
}

function buildUserPrompt(brief: string, sourceText: string | null): string {
  const parts = [`Requirements from the administrator:\n${brief}`];
  if (sourceText) {
    // Truncated hard: a long site dump crowds out the instructions and pushes
    // token cost up for no gain in template quality.
    parts.push(`\nSource material (may be partial):\n${sourceText.slice(0, 6000)}`);
  }
  return parts.join('\n');
}

export interface GenerateTemplateInput {
  /** The administrator's brief — what kind of app they want. */
  brief: string;
  sourceKind: CustomTemplateSourceKind;
  /** Required when sourceKind === 'url'. */
  url?: string;
  /** Required when sourceKind === 'knowledge'. */
  knowledgeContent?: string;
  /** Force the wallet on/off regardless of the model's judgement. */
  web3WalletOverride?: Partial<Web3WalletConfig> & { enabled: boolean };
}

export interface GenerateTemplateResult {
  definition: TemplateDefinition;
  capabilities: TemplateCapabilities;
  sourceRef: string | null;
  rationale: string | null;
  providerId: string;
  model: string;
}

/** Strip markdown fences a model may wrap JSON in. */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  return start !== -1 && end > start ? body.slice(start, end + 1) : body;
}

/**
 * Generate a template.
 *
 * Uses Chat Completions with a JSON instruction rather than the AI SDK's
 * `generateObject`, because that helper binds to a specific provider package
 * and this must run on whichever OpenAI-compatible provider the tenant selected.
 */
export async function generateCustomTemplate(
  input: GenerateTemplateInput,
): Promise<GenerateTemplateResult> {
  const ai = await withTimeout(
    resolveActiveAiConfig(),
    15_000,
    'resolveActiveAiConfig',
  );
  if (!ai) {
    throw new Error(
      'No AI provider is configured. Set a provider, API key and model before generating a template.',
    );
  }

  let sourceText: string | null = null;
  let sourceRef: string | null = null;

  if (input.sourceKind === 'url') {
    if (!input.url) throw new Error('A URL is required when generating from a web address.');
    // Scraping a third-party site can hang; the whole request runs inside a
    // serverless function with a hard ceiling.
    const scraped = await withTimeout(scrapeUrl(input.url), 20_000, 'scrapeUrl');
    sourceRef = scraped.url;
    sourceText = [
      `Business name: ${scraped.businessName}`,
      `Title: ${scraped.title}`,
      `Description: ${scraped.description}`,
      scraped.address ? `Address: ${scraped.address}` : '',
      scraped.brandColors.primary ? `Brand primary: ${scraped.brandColors.primary}` : '',
      scraped.brandColors.secondary ? `Brand secondary: ${scraped.brandColors.secondary}` : '',
      '',
      scraped.textContent,
    ].filter(Boolean).join('\n');
  } else if (input.sourceKind === 'knowledge') {
    if (!input.knowledgeContent?.trim()) {
      throw new Error('Knowledge content is required when generating from a knowledge base.');
    }
    sourceText = input.knowledgeContent;
    sourceRef = 'knowledge-base';
  }

  const response = await fetch(ai.provider.chatCompletionsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ai.apiKey}`,
    },
    body: JSON.stringify({
      model: ai.model,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(input.brief, sourceText) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `${ai.provider.label} returned ${response.status} while generating the template. ${body.slice(0, 300)}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  // Meter platform-key usage. Charged to the platform org because a custom
  // template belongs to no single tenant — see resolvePlatformOrgId(). BYOK is
  // never charged (the tenant pays the provider directly).
  //
  // Non-blocking and metered AFTER the call: the tokens are already spent by
  // this point, so a failure to record them must not also destroy the result
  // the administrator paid for. The pre-flight gate in the route is where
  // generation is actually refused.
  if (ai.keySource === 'env') {
    try {
      const { meterAiUsageForOrg, resolvePlatformOrgId } = await import(
        '@/domain/billing/credit-service'
      );
      await meterAiUsageForOrg({
        orgId: await resolvePlatformOrgId(),
        model: ai.model,
        promptTokens: payload.usage?.prompt_tokens ?? 0,
        completionTokens: payload.usage?.completion_tokens ?? 0,
        keySource: ai.keySource,
        refType: 'custom_template_generation',
        refId: input.sourceKind,
      });
    } catch (err) {
      console.warn(
        '[custom-template-generator] Metering failed (non-blocking):',
        err instanceof Error ? err.message : err,
      );
    }
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('The AI provider returned an empty response.');

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(extractJson(content));
  } catch {
    throw new Error('The AI provider returned content that is not valid JSON.');
  }

  const parsed = templateGenerationSchema.safeParse(parsedJson);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`The generated template failed validation: ${issues}`);
  }

  const g = parsed.data;
  const id = toCustomTemplateId(g.label);

  // An explicit admin override always beats the model's judgement — the wallet
  // is a product decision, not something to infer from marketing copy.
  const web3Wallet: Web3WalletConfig = input.web3WalletOverride
    ? { ...DEFAULT_WEB3_WALLET, ...g.web3Wallet, ...input.web3WalletOverride }
    : g.web3Wallet;

  const definition: TemplateDefinition = {
    id,
    label: g.label,
    description: g.description,
    icon: g.icon,
    templateType: g.templateType,
    source: 'custom',
    defaultColors: g.defaultColors,
    defaultPages: g.defaultPages,
    defaultNavItems: g.defaultNavItems,
    schemaOrgType: g.schemaOrgType,
    xsdStandard: g.xsdStandard,
    capabilities: { web3Wallet },
  };

  return {
    definition,
    capabilities: { web3Wallet },
    sourceRef,
    rationale: g.rationale ?? null,
    providerId: ai.provider.id,
    model: ai.model,
  };
}
