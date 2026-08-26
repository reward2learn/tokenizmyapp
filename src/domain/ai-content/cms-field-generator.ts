import { getAssistantProfile } from '@shared/lib/config/template-profile';
import { getTenantConfig } from '@shared/lib/config/tenant';
import {
  getBlockUseCase,
  getFieldSpec,
  type CmsFieldValueType,
} from '@/lib/cms-block-field-catalog';
import type { ActiveAiConfig } from '@/lib/ai-providers';
import { resolveChatCompletionsUrl } from '@/lib/ai-providers';
import { meterAiUsage } from '@/domain/billing/credit-service';
import { toAiUsageSummary, type AiUsageSummary } from '@/lib/billing/ai-usage-summary';

export interface GenerateCmsFieldInput {
  pageSlug: string;
  pageTitle: string;
  blockType: string;
  fieldKey: string;
  fieldPath?: string;
  fieldType?: CmsFieldValueType;
  currentConfig: Record<string, unknown>;
  currentValue?: unknown;
  ai: ActiveAiConfig;
  tenantSlug: string;
  viewerEmail?: string | null;
  viewerUserId?: string | null;
}

export interface GenerateCmsFieldResult {
  value: unknown;
  /** Null only when metering failed; charged usage always returned when possible. */
  usage: AiUsageSummary | null;
}

function audienceContext(): string {
  const tenant = getTenantConfig();
  const profile = getAssistantProfile();
  const lines = [
    `Business / app: ${tenant.displayName}`,
    tenant.description ? `Description: ${tenant.description}` : '',
    `Industry domain: ${profile.domain}`,
    `Assistant role: ${profile.role}`,
    profile.keyMetrics.length ? `Key metrics: ${profile.keyMetrics.join(', ')}` : '',
    `Currency context: ${profile.currency}`,
    `Writing style: ${profile.answerStyle.join('; ')}`,
  ];
  return lines.filter(Boolean).join('\n');
}

function outputInstructions(fieldType: CmsFieldValueType, spec: ReturnType<typeof getFieldSpec>): string {
  switch (fieldType) {
    case 'multiline':
    case 'text':
    case 'url':
    case 'markdown':
      return 'Return JSON: { "value": "<string>" } — no markdown fences around the JSON.';
    case 'string_array':
      return 'Return JSON: { "value": ["item1", "item2"] } with 2–6 concise strings.';
    case 'faq_items':
      return 'Return JSON: { "value": [{ "question": "...", "answer": "..." }] } with 3–6 pairs. Answers may use Markdown.';
    case 'showcase_items':
      return 'Return JSON: { "value": [{ "title": "...", "body": "..." }] } with 3–5 capability cards.';
    case 'nav_buttons':
      return 'Return JSON: { "value": [{ "label": "...", "href": "/path" }] } with 1–2 buttons.';
    case 'json_rows':
      return 'Return JSON: { "value": <appropriate array or object for this field> }. Valid JSON only.';
    case 'enum':
      return `Return JSON: { "value": "<one of: ${(spec.enumValues ?? []).join(', ')}>" }`;
    default: {
      const _exhaustive: never = fieldType;
      return _exhaustive;
    }
  }
}

function summarizeConfig(config: Record<string, unknown>, omitKey: string): string {
  const copy = { ...config };
  delete copy[omitKey];
  delete copy.minTier;
  const json = JSON.stringify(copy, null, 2);
  if (json.length <= 4000) return json;
  return `${json.slice(0, 4000)}\n…(truncated)`;
}

export async function generateCmsFieldValue(input: GenerateCmsFieldInput): Promise<GenerateCmsFieldResult> {
  const fieldType = input.fieldType ?? getFieldSpec(input.blockType, input.fieldKey).type;
  const spec = getFieldSpec(input.blockType, input.fieldKey);
  const useCase = getBlockUseCase(input.blockType);

  const userPrompt = [
    `Generate CMS copy for a single block setting field.`,
    ``,
    `## Page`,
    `Title: ${input.pageTitle}`,
    `Slug: /${input.pageSlug}`,
    ``,
    `## Block`,
    `Type: ${input.blockType}`,
    `Use case: ${useCase}`,
    ``,
    `## Audience & app context`,
    audienceContext(),
    ``,
    `## Field to generate`,
    `Key: ${input.fieldPath ?? input.fieldKey}`,
    `Label: ${spec.label}`,
    `Purpose: ${spec.description}`,
    ``,
    `## Other fields already in this block config (for consistency — do not repeat verbatim)`,
    summarizeConfig(input.currentConfig, input.fieldKey),
    ``,
    input.currentValue !== undefined && input.currentValue !== null && input.currentValue !== ''
      ? `## Current value (improve or replace)\n${JSON.stringify(input.currentValue)}`
      : '## Current value\n(empty — write fresh copy)',
    ``,
    `## Output`,
    outputInstructions(fieldType, spec),
    `Match the tone of this business. Be specific to the domain — no generic SaaS filler.`,
    `Do not invent named customers unless the field is customer_proof with permissioned data.`,
  ].join('\n');

  const response = await fetch(resolveChatCompletionsUrl(input.ai.provider), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.ai.apiKey}`,
    },
    body: JSON.stringify({
      model: input.ai.model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert CMS copywriter for business operations apps. Return only valid JSON with a single key "value".',
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`${input.ai.provider.label} API error (${response.status}): ${errBody}`);
  }

  const result = await response.json();
  const reply = result.choices?.[0]?.message?.content ?? '';
  const providerUsage = result.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined;
  const tokens = {
    promptTokens: providerUsage?.prompt_tokens ?? 0,
    completionTokens: providerUsage?.completion_tokens ?? 0,
  };

  let usage: AiUsageSummary | null = null;
  try {
    const meter = await meterAiUsage({
      tenantSlug: input.tenantSlug,
      model: input.ai.model,
      promptTokens: tokens.promptTokens,
      completionTokens: tokens.completionTokens,
      keySource: input.ai.keySource,
      refType: 'content_generation',
      refId: `cms_field:${input.pageSlug}:${input.blockType}:${input.fieldKey}`,
      viewerEmail: input.viewerEmail,
      viewerUserId: input.viewerUserId,
      provider: input.ai.provider.id,
    });
    usage = toAiUsageSummary(meter, tokens, { model: input.ai.model });
  } catch {
    // non-blocking — still return token counts so the client can show activity
    usage = toAiUsageSummary(null, tokens, { model: input.ai.model });
  }

  let parsed: { value?: unknown };
  try {
    parsed = JSON.parse(reply) as { value?: unknown };
  } catch {
    const jsonMatch = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!jsonMatch) throw new Error('AI response was not valid JSON');
    parsed = JSON.parse(jsonMatch[1]!) as { value?: unknown };
  }

  if (parsed.value === undefined) {
    throw new Error('AI response missing "value" key');
  }

  return { value: parsed.value, usage };
}
