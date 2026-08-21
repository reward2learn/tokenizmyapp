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
  // Marketing landing blocks — public homepage / marketing pages.
  'marketing_hero', 'capability_marquee', 'product_showcase', 'customer_proof',
  'faq', 'cta_banner', 'pricing_table',
] as const;

const AUTH_TIERS = ['public', 'pin', 'google'] as const;

/**
 * Loose config bag the model fills for marketing (and other) blocks.
 *
 * Kept permissive on purpose: a strict per-block discriminated union causes
 * Chat Completions JSON mode to fail validation on small shape mistakes, and
 * every block already reads config defensively at render time. Seed stores
 * whatever passes here; missing marketing fields fall back to component defaults.
 */
const sectionConfigSchema = z
  .object({
    headline: z.string().max(160).optional(),
    subheadline: z.string().max(320).optional(),
    heading: z.string().max(160).optional(),
    subheading: z.string().max(320).optional(),
    placeholder: z.string().max(240).optional(),
    ctaLabel: z.string().max(48).optional(),
    ctaHref: z.string().max(200).optional(),
    audiences: z.array(z.string().max(80)).max(8).optional(),
    quickStarts: z.array(z.string().max(80)).max(8).optional(),
    rows: z.array(z.array(z.string().max(48)).max(12)).max(6).optional(),
    items: z
      .array(
        z
          .object({
            question: z.string().max(240).optional(),
            answer: z.string().max(900).optional(),
            icon: z.string().max(40).optional(),
            title: z.string().max(100).optional(),
            body: z.string().max(500).optional(),
            quote: z.string().max(600).optional(),
            name: z.string().max(100).optional(),
            role: z.string().max(100).optional(),
          })
          .passthrough(),
      )
      .max(12)
      .optional(),
  })
  .passthrough()
  .optional();

const pageSectionSchema = z.object({
  blockType: z.enum(ALLOWED_BLOCKS),
  config: sectionConfigSchema,
});

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

/**
 * The persona for this template's AI assistant.
 *
 * Worth generating rather than defaulting: the administrator's brief IS a
 * description of the business, and it is the only description that exists for a
 * custom template. Falling back to a generic persona here would waste the one
 * piece of first-hand knowledge the platform has.
 *
 * Optional so a model that omits it still produces a usable template —
 * `resolveAssistantProfile()` then derives one from the label and description.
 */
const assistantProfileSchema = z.object({
  role: z.string().min(1).max(80),
  domain: z.string().min(1).max(200),
  currency: z.string().length(3),
  keyMetrics: z.array(z.string().min(1).max(60)).max(8),
  capabilities: z.array(z.string().min(1).max(160)).max(6),
  answerStyle: z.array(z.string().min(1).max(200)).max(6),
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
    /**
     * Ordered sections with optional authored config (headlines, FAQ items…).
     * Prefer this over a bare blockTypes list so marketing pages ship with copy.
     */
    sections: z.array(pageSectionSchema).min(1).max(10),
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
  assistant: assistantProfileSchema.optional(),
  /** One line on why this shape was chosen — shown to the admin for review. */
  rationale: z.string().max(600).optional(),
});

export type TemplateGeneration = z.infer<typeof templateGenerationSchema>;

/** Blocks that need real copy at seed time — empty config looks unfinished. */
const COPY_REQUIRED_BLOCKS = new Set<string>([
  'marketing_hero',
  'product_showcase',
  'capability_marquee',
  'faq',
  'cta_banner',
]);

/**
 * Stamp minTier and drop invented social-proof rows when the model ignored
 * the "don't invent customers" rule (empty name/quote → drop the item).
 */
function normalizeSectionConfig(
  blockType: string,
  config: Record<string, unknown>,
  authTier: (typeof AUTH_TIERS)[number],
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...config, minTier: authTier };

  if (
    (blockType === 'customer_proof' || blockType === 'testimonials') &&
    Array.isArray(next.items)
  ) {
    next.items = (next.items as Record<string, unknown>[]).filter((item) => {
      if (blockType === 'testimonials') {
        return typeof item.quote === 'string' && item.quote.trim().length > 0;
      }
      // customer_proof needs a real named customer — metrics alone are not enough.
      return typeof item.name === 'string' && item.name.trim().length > 0;
    });
  }

  return next;
}

function hasUsefulMarketingCopy(
  blockType: string,
  config: Record<string, unknown>,
): boolean {
  switch (blockType) {
    case 'marketing_hero':
      return typeof config.headline === 'string' && config.headline.trim().length > 0;
    case 'faq':
      return Array.isArray(config.items) && config.items.length > 0;
    case 'product_showcase':
      return Array.isArray(config.items) && config.items.length > 0;
    case 'capability_marquee':
      return Array.isArray(config.rows) && config.rows.length > 0;
    case 'cta_banner':
      return typeof config.heading === 'string' && config.heading.trim().length > 0;
    default:
      return true;
  }
}

function buildSystemPrompt(): string {
  return [
    'You design application templates for a multi-tenant business app platform.',
    'Given a description of a business, produce a template: its pages, navigation, brand colours and metadata.',
    '',
    `Pages may only use these block types: ${ALLOWED_BLOCKS.join(', ')}.`,
    `Auth tiers: public (anyone), pin (staff), google (signed-in owner/admin).`,
    '',
    'Each page has a "sections" array. Every section is { blockType, config }.',
    'Write config copy for THIS business — not generic SaaS filler.',
    'Config fields by blockType:',
    '- marketing_hero: headline, subheadline, audiences[], quickStarts[], placeholder, ctaLabel, ctaHref ("/admin" or "/dashboard").',
    '- product_showcase: heading, items[{ icon, title, body }] (3–5 capabilities).',
    '- capability_marquee: heading, subheading, rows (2–4 arrays of short labels).',
    '- faq: heading, items[{ question, answer }] (4–7 Q&As grounded in the brief).',
    '- cta_banner: heading, subheading, ctaLabel, ctaHref.',
    '- pricing_table: heading, subheading only (plans come from the platform).',
    '- customer_proof / testimonials: heading only; leave items empty unless the source names real customers — never invent social proof.',
    '- hero: headline, subtitle (optional). Other operational blocks: config may be {}.',
    '',
    'Rules:',
    '- Always include a public landing page and a dashboard.',
    '- For the public landing page, prefer marketing blocks (marketing_hero, product_showcase,',
    '  capability_marquee, faq, cta_banner) over a plain hero, and fill their config.',
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
    '',
    'Assistant persona ("assistant"): describe the AI assistant this app should have.',
    '- role: what it is, e.g. "veterinary clinic operations analyst". Lower case, no company name.',
    '- domain: the subject it covers, in a short phrase.',
    '- currency: ISO 4217 code for this business (e.g. USD, EUR, IDR, GBP). Infer it from the',
    '  source material or the location when either indicates one; otherwise use USD.',
    '- keyMetrics: 3-6 metrics a operator in THIS industry actually tracks. Use the industry\'s own',
    '  vocabulary (a hotel tracks RevPAR, a clinic tracks appointment utilisation). Do not list',
    '  generic finance metrics unless the business is genuinely finance-led.',
    '- capabilities: 3-5 things the assistant can help with, each starting with a verb.',
    '- answerStyle: 3-5 imperative instructions for how it should answer in this domain.',
    'Write these for the industry, not for this one company — the template may be reused.',
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
  /**
   * Administrator this generation runs for. Must be the same identity the
   * caller's pre-flight gate used, or an exempt operator passes the gate and is
   * then charged anyway — accruing debt that blocks the whole platform org.
   */
  viewerEmail?: string | null;
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
        viewerEmail: input.viewerEmail,
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

  const defaultPages = g.defaultPages.map((page) => {
    const blockTypes = page.sections.map((s) => s.blockType);
    const sectionConfigs = page.sections.map((s) =>
      normalizeSectionConfig(s.blockType, s.config ?? {}, page.authTier),
    );

    for (let i = 0; i < page.sections.length; i++) {
      const bt = page.sections[i].blockType;
      if (!COPY_REQUIRED_BLOCKS.has(bt)) continue;
      if (!hasUsefulMarketingCopy(bt, sectionConfigs[i])) {
        console.warn(
          `[custom-template-generator] Page "${page.slug}" section ${bt} has thin config; component defaults will fill gaps.`,
        );
      }
    }

    return {
      slug: page.slug,
      title: page.title,
      navLabel: page.navLabel,
      authTier: page.authTier,
      blockTypes,
      sectionConfigs,
    };
  });

  const definition: TemplateDefinition = {
    id,
    label: g.label,
    description: g.description,
    icon: g.icon,
    templateType: g.templateType,
    source: 'custom',
    defaultColors: g.defaultColors,
    defaultPages,
    defaultNavItems: g.defaultNavItems,
    schemaOrgType: g.schemaOrgType,
    xsdStandard: g.xsdStandard,
    capabilities: { web3Wallet },
    // Carried through so apps built from this template inherit an assistant
    // that knows the industry. Omitted when the model did not produce one —
    // resolveAssistantProfile() then derives a persona from label/description
    // rather than storing a placeholder that looks authored.
    ...(g.assistant ? { assistant: g.assistant } : {}),
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
