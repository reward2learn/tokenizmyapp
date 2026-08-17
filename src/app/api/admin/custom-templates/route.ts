/**
 * Custom template registry.
 *
 * GET    /api/admin/custom-templates — list stored custom templates
 * POST   /api/admin/custom-templates — generate one from a URL or knowledge content
 *
 * POST is the endpoint the chat assistant's "Custom Template Build" tool calls.
 * It generates, validates and stores in one step so a template is never left
 * half-created; `dryRun` returns the generated definition without storing it,
 * which is what the chat flow uses to show a preview before the admin confirms.
 */
import { NextResponse } from 'next/server';
import { createRawClient } from '@/lib/db';
import { requireWriteAuth } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  listCustomTemplates,
  saveCustomTemplate,
  type CustomTemplateSourceKind,
} from '@/domain/tenant/custom-template-service';
import { generateCustomTemplate } from '@/domain/tenant/custom-template-generator';

export const dynamic = 'force-dynamic';
// Scrape + model round-trip; well above the default but below the 300s ceiling
// already used by the AI content route.
export const maxDuration = 300;

function isSourceKind(value: unknown): value is CustomTemplateSourceKind {
  return value === 'url' || value === 'knowledge' || value === 'prompt';
}

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const db = createRawClient();
  try {
    const templates = await listCustomTemplates(db);
    return jsonOk({ templates });
  } catch (err) {
    return jsonError('Failed to list custom templates: ' + (err as Error).message, 500);
  }
}

// Returns Response rather than NextResponse: the credit gate builds its 402
// with `jsonErrorLite`, which deliberately avoids importing next/server.
export async function POST(request: Request): Promise<Response> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  // ── Save-only path ──
  //
  // The chat assistant designs a template and hands the draft to the
  // administrator for review; "Save & Create Template" posts it back here.
  // Deliberately does NOT regenerate: generation costs credits and is
  // non-deterministic, so re-running it on confirm would both double-charge and
  // risk storing a different template from the one that was approved.
  //
  // No credit gate for the same reason — the generation this draft came from
  // was already metered.
  if (body.draft && typeof body.draft === 'object') {
    const draft = body.draft as Record<string, unknown>;
    const definition = draft.definition;
    const label = typeof draft.label === 'string' ? draft.label.trim() : '';

    // The draft round-trips through the browser, so it is untrusted input even
    // though this route is admin-only. Validate the parts that must be usable —
    // a definition with no pages provisions an app with nothing in it.
    if (!label) return jsonError('draft.label is required', 400);
    if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
      return jsonError('draft.definition must be an object', 400);
    }
    const pages = (definition as Record<string, unknown>).defaultPages;
    if (!Array.isArray(pages) || pages.length === 0) {
      return jsonError('draft.definition.defaultPages must be a non-empty array', 400);
    }

    const draftSourceKind = isSourceKind(draft.sourceKind) ? draft.sourceKind : 'prompt';

    try {
      const record = await saveCustomTemplate(
        {
          label,
          description: typeof draft.description === 'string' ? draft.description : '',
          icon: typeof draft.icon === 'string' && draft.icon ? draft.icon : 'Dashboard',
          templateType: draft.templateType === 'suite' ? 'suite' : 'single',
          definition: definition as never,
          capabilities: (draft.capabilities ?? {}) as never,
          sourceKind: draftSourceKind,
          sourceRef: typeof draft.sourceRef === 'string' ? draft.sourceRef : null,
          prompt: typeof draft.prompt === 'string' ? draft.prompt : null,
          createdBy: guard.session?.sub ?? null,
        },
        createRawClient(),
      );
      return jsonOk({ stored: true, template: record }, { status: 201 });
    } catch (err) {
      return jsonError('Failed to save the template: ' + (err as Error).message, 500);
    }
  }

  const brief = typeof body.brief === 'string' ? body.brief.trim() : '';
  if (!brief) return jsonError('brief is required — describe the app the template should build', 400);

  const sourceKind = isSourceKind(body.sourceKind) ? body.sourceKind : 'prompt';
  const url = typeof body.url === 'string' ? body.url.trim() : undefined;
  const knowledgeContent =
    typeof body.knowledgeContent === 'string' ? body.knowledgeContent : undefined;

  if (sourceKind === 'url' && !url) {
    return jsonError('url is required when sourceKind is "url"', 400);
  }
  if (sourceKind === 'knowledge' && !knowledgeContent?.trim()) {
    return jsonError('knowledgeContent is required when sourceKind is "knowledge"', 400);
  }

  // `web3Wallet: true|false` forces the capability on or off; omitted leaves it
  // to the model, which is instructed to default to off.
  const web3WalletOverride =
    typeof body.web3Wallet === 'boolean'
      ? { enabled: body.web3Wallet }
      : undefined;

  const db = createRawClient();

  // Pre-flight credit gate. Charged to the platform org — a custom template is
  // built by an administrator for reuse, not on behalf of any one tenant.
  // Returns 402, which the client already handles as the AI upsell path.
  const { requireCreditsForOrg, resolvePlatformOrgId, CREDIT_FLOORS } = await import(
    '@/domain/billing/credit-service'
  );
  const gate = await requireCreditsForOrg(
    await resolvePlatformOrgId(db),
    db,
    CREDIT_FLOORS.templateGeneration,
  );
  if (!gate.ok) return gate.response;

  try {
    const generated = await generateCustomTemplate({
      brief,
      sourceKind,
      url,
      knowledgeContent,
      web3WalletOverride,
    });

    if (body.dryRun === true) {
      return jsonOk({
        stored: false,
        template: generated.definition,
        capabilities: generated.capabilities,
        rationale: generated.rationale,
        provider: { id: generated.providerId, model: generated.model },
      });
    }

    const record = await saveCustomTemplate(
      {
        label: generated.definition.label,
        description: generated.definition.description,
        icon: generated.definition.icon,
        templateType: generated.definition.templateType,
        definition: generated.definition,
        capabilities: generated.capabilities,
        sourceKind,
        sourceRef: generated.sourceRef,
        prompt: brief,
        createdBy: guard.session?.sub ?? null,
      },
      db,
    );

    return jsonOk(
      {
        stored: true,
        template: record,
        rationale: generated.rationale,
        provider: { id: generated.providerId, model: generated.model },
      },
      { status: 201 },
    );
  } catch (err) {
    const message = (err as Error).message;
    // The generator raises this when no provider/key/model is configured;
    // surface it as 402 so the client reuses the existing AI upsell path.
    if (/No AI provider is configured/i.test(message)) return jsonError(message, 402);
    return jsonError('Template generation failed: ' + message, 500);
  }
}
