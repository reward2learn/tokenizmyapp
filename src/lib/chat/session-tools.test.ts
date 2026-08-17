import { describe, expect, it, vi } from 'vitest';
import {
  availableComposerTools,
  executeSessionTool,
  CHAT_COMPOSER_TOOLS,
  type SessionToolContext,
} from '@/lib/chat/session-tools';
import { parseSsePayload } from '@/lib/chat/sse-parser';

function ctx(overrides: Partial<SessionToolContext> = {}): SessionToolContext {
  return {
    db: {} as SessionToolContext['db'],
    userName: 'Admin',
    messages: [],
    ...overrides,
  };
}

describe('availableComposerTools', () => {
  it('offers the template builder only to a platform admin inside /admin', () => {
    expect(availableComposerTools({ isPlatformAdmin: true, isAdminRoute: true }))
      .toHaveLength(CHAT_COMPOSER_TOOLS.length);
  });

  it('hides it from a platform admin outside /admin', () => {
    // Scope, not security: the tool writes platform-wide configuration, so
    // offering it from a tenant dashboard invites confusion about what is being
    // changed and for whom.
    expect(availableComposerTools({ isPlatformAdmin: true, isAdminRoute: false }))
      .toEqual([]);
  });

  it('hides it from a non-admin even inside /admin', () => {
    expect(availableComposerTools({ isPlatformAdmin: false, isAdminRoute: true }))
      .toEqual([]);
  });
});

describe('build_custom_template access control', () => {
  it('refuses a non-admin even when the tool is somehow armed', async () => {
    // The picker gating is presentation; a crafted request can set activeTool
    // freely. This is the boundary that actually holds.
    const result = await executeSessionTool(
      'build_custom_template',
      JSON.stringify({ brief: 'A busy neighbourhood bakery selling bread and pastries to walk-in customers, tracking daily sales and waste.', sourceKind: 'prompt' }),
      ctx({ isPlatformAdmin: false }),
    );

    expect(result.toolMessage).toContain('restricted to platform administrators');
    expect(result.templateDraft).toBeUndefined();
  });

  it('refuses a brief too thin to design from', async () => {
    // Generation costs credits and takes a model round-trip, so a bare phrase
    // should send the assistant back to ask rather than burn a run.
    const result = await executeSessionTool(
      'build_custom_template',
      JSON.stringify({ brief: 'a bakery', sourceKind: 'prompt' }),
      ctx({ isPlatformAdmin: true }),
    );

    expect(result.toolMessage).toContain('too thin');
    expect(result.templateDraft).toBeUndefined();
  });

  it('requires a url when sourceKind is url', async () => {
    const result = await executeSessionTool(
      'build_custom_template',
      JSON.stringify({
        brief: 'A busy neighbourhood bakery selling bread and pastries to walk-in customers.',
        sourceKind: 'url',
      }),
      ctx({ isPlatformAdmin: true }),
    );

    expect(result.toolMessage).toContain('web address');
    expect(result.templateDraft).toBeUndefined();
  });
});

describe('build_custom_template draft', () => {
  it('returns a draft without storing anything', async () => {
    const saveCustomTemplate = vi.fn();

    vi.doMock('@/domain/tenant/custom-template-generator', () => ({
      generateCustomTemplate: async () => ({
        definition: {
          id: 'custom-bakery',
          label: 'Bakery',
          description: 'Daily sales and waste tracking for a bakery.',
          icon: 'BakeryDining',
          templateType: 'single',
          defaultPages: [{ title: 'Dashboard' }, { title: 'Orders' }],
        },
        capabilities: { web3Wallet: { enabled: false } },
        sourceRef: null,
        rationale: 'A counter-service bakery needs sales and waste, not bookings.',
        providerId: 'openai',
        model: 'gpt-4o',
      }),
    }));
    vi.doMock('@/domain/tenant/custom-template-service', () => ({ saveCustomTemplate }));
    vi.doMock('@/domain/billing/credit-service', () => ({
      requireCreditsForOrg: async () => ({ ok: true, balance: 100 }),
      resolvePlatformOrgId: async () => 'org_platform',
      MIN_CREDITS_TO_START: 1,
    }));

    const { executeSessionTool: execute } = await import('@/lib/chat/session-tools');
    const result = await execute(
      'build_custom_template',
      JSON.stringify({
        brief: 'A busy neighbourhood bakery selling bread and pastries to walk-in customers, tracking daily sales and waste.',
        sourceKind: 'prompt',
      }),
      ctx({ isPlatformAdmin: true }),
    );

    // The whole point of the change: designing must not write anything.
    expect(saveCustomTemplate).not.toHaveBeenCalled();
    expect(result.templateDraft?.label).toBe('Bakery');
    expect(result.templateDraft?.pageTitles).toEqual(['Dashboard', 'Orders']);

    // The model must not tell the administrator it created something.
    expect(result.toolMessage).toContain('NOT been saved');
    expect(result.toolMessage).toContain('Save & Create Template');

    vi.doUnmock('@/domain/tenant/custom-template-generator');
    vi.doUnmock('@/domain/tenant/custom-template-service');
    vi.doUnmock('@/domain/billing/credit-service');
  });
});

describe('template_draft stream event', () => {
  it('parses the draft out of the SSE payload', () => {
    const draft = { label: 'Bakery', pageTitles: ['Dashboard'] };
    expect(parseSsePayload({ type: 'template_draft', draft })).toEqual([
      { type: 'template_draft', draft },
    ]);
  });

  it('ignores a draft event with no payload', () => {
    expect(parseSsePayload({ type: 'template_draft' })).toEqual([]);
  });
});
