import { describe, expect, it } from 'vitest';
import { resolveTemplateRoles, TEMPLATE_DEFAULT_ROLES } from '@/domain/tenant/template-default-roles';
import { TEMPLATE_CATALOG } from '@/domain/tenant/template-catalog';
import {
  TEMPLATE_ASSISTANT_PROFILES,
  resolveChatStarterPrompt,
} from '@/domain/tenant/template-assistant-profiles';

describe('template-default-roles', () => {
  it('covers every built-in template', () => {
    const missing = Object.keys(TEMPLATE_CATALOG).filter((id) => !TEMPLATE_DEFAULT_ROLES[id]);
    expect(missing).toEqual([]);
  });

  it('gives spas-and-wellness therapist/reception roles instead of nightclub titles', () => {
    const roles = resolveTemplateRoles(TEMPLATE_CATALOG['spas-and-wellness']);
    const codes = roles.map((r) => r.code);
    expect(codes).toContain('therapist');
    expect(codes).toContain('reception');
    expect(codes).not.toContain('entertainment');
  });
});

describe('resolveChatStarterPrompt', () => {
  it('uses the template-authored starter for spas-and-wellness', () => {
    const prompt = resolveChatStarterPrompt(TEMPLATE_ASSISTANT_PROFILES['spas-and-wellness']);
    expect(prompt).toContain('booking');
    expect(prompt).not.toContain('June 2027');
  });

  it('never returns the old RedRuby hardcoded message', () => {
    const prompt = resolveChatStarterPrompt(TEMPLATE_ASSISTANT_PROFILES['financial-analytics']);
    expect(prompt).not.toContain('June 2027');
    expect(prompt).not.toContain('Red Ruby');
  });
});

describe('template-chat-section-configs', () => {
  it('seeds every built-in template dashboard with chat_panel section config', () => {
    for (const [id, template] of Object.entries(TEMPLATE_CATALOG)) {
      const dashboard = template.defaultPages.find((p) => p.slug === 'dashboard');
      expect(dashboard?.blockTypes, `${id} dashboard`).toContain('chat_panel');
      const chatIdx = dashboard!.blockTypes.indexOf('chat_panel');
      expect(dashboard!.sectionConfigs?.[chatIdx]?.emptyStatePrompt, `${id} chat config`).toBeTruthy();
    }
  });

  it('uses template-specific starter for restaurant', () => {
    const dashboard = TEMPLATE_CATALOG.restaurant.defaultPages.find((p) => p.slug === 'dashboard');
    const chatIdx = dashboard!.blockTypes.indexOf('chat_panel');
    expect(dashboard!.sectionConfigs?.[chatIdx]?.emptyStatePrompt).toContain('covers');
  });
});
