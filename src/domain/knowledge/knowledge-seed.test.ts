import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  buildStructuredPromptFromSnippets,
  buildFallbackSnippets,
} from '@/domain/knowledge/knowledge-seed';
import { TEMPLATE_ASSISTANT_PROFILES } from '@/domain/tenant/template-assistant-profiles';

/** Stamp a deployment the way vercel-deploy-service does. */
function stampTemplate(templateId: keyof typeof TEMPLATE_ASSISTANT_PROFILES, label: string) {
  vi.stubEnv('NEXT_PUBLIC_TEMPLATE_ID', templateId);
  vi.stubEnv('NEXT_PUBLIC_TEMPLATE_LABEL', label);
  vi.stubEnv('TEMPLATE_PROFILE', JSON.stringify(TEMPLATE_ASSISTANT_PROFILES[templateId]));
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('buildStructuredPromptFromSnippets', () => {
  it('takes its persona from the deployment template', () => {
    vi.stubEnv('NEXT_PUBLIC_TENANT_DISPLAY_NAME', 'Grand Harbour Hotel');
    stampTemplate('hotel', 'Hotel & Hospitality');

    const prompt = buildStructuredPromptFromSnippets([]);

    expect(prompt).toContain('Grand Harbour Hotel AI');
    expect(prompt).toContain('hotel performance analyst');
    expect(prompt).toContain('RevPAR');
  });

  it('gives two different templates two different prompts', () => {
    vi.stubEnv('NEXT_PUBLIC_TENANT_DISPLAY_NAME', 'Same Name Ltd');

    stampTemplate('restaurant', 'Restaurant');
    const restaurant = buildStructuredPromptFromSnippets([]);

    stampTemplate('manufacturing', 'Manufacturing & Industrial');
    const factory = buildStructuredPromptFromSnippets([]);

    expect(restaurant).not.toBe(factory);
    expect(restaurant).toContain('covers');
    expect(factory).toContain('first-pass yield');
    expect(factory).not.toContain('covers');
  });

  it('quotes the template currency instead of a hardcoded one', () => {
    stampTemplate('restaurant', 'Restaurant');
    expect(buildStructuredPromptFromSnippets([])).toContain('Quote monetary amounts in USD');

    vi.stubEnv(
      'TEMPLATE_PROFILE',
      JSON.stringify({ ...TEMPLATE_ASSISTANT_PROFILES.restaurant, currency: 'EUR' }),
    );
    expect(buildStructuredPromptFromSnippets([])).toContain('Quote monetary amounts in EUR');
  });

  it('never emits the hardcoded targets or IDR rule that used to be unconditional', () => {
    // These two blocks were appended outside the snippet loop, so even a tenant
    // with its own knowledge received another tenant's revenue goals and was
    // told to answer in rupiah.
    stampTemplate('hotel', 'Hotel & Hospitality');
    const prompt = buildStructuredPromptFromSnippets([
      { key: 'own_data', category: 'overview', content: 'We operate 120 rooms in Lisbon.' },
    ]);

    expect(prompt).not.toContain('Monthly Projection Targets');
    expect(prompt).not.toContain('IDR');
    expect(prompt).not.toContain('BEP coverage');
    expect(prompt).toContain('We operate 120 rooms in Lisbon.');
  });

  it('still degrades to a neutral persona on an unstamped deployment', () => {
    // Apps deployed before template stamping existed have no TEMPLATE_PROFILE
    // until their next redeploy. They must be generic, not wrong.
    vi.stubEnv('NEXT_PUBLIC_TENANT_DISPLAY_NAME', 'Legacy App');
    const prompt = buildStructuredPromptFromSnippets([]);

    expect(prompt).toContain('Legacy App AI');
    expect(prompt).toContain('business operations assistant');
    expect(prompt).not.toContain('IDR');
  });

  it('stays inside the prompt size cap', () => {
    stampTemplate('restaurant', 'Restaurant');
    const huge = Array.from({ length: 40 }, (_, i) => ({
      key: `k${i}`,
      category: 'overview',
      content: 'x'.repeat(3000),
    }));
    expect(buildStructuredPromptFromSnippets(huge).length).toBeLessThanOrEqual(18_200);
  });
});

describe('buildFallbackSnippets', () => {
  it('describes this app rather than a business it has never heard of', () => {
    vi.stubEnv('NEXT_PUBLIC_TENANT_DISPLAY_NAME', 'Bright Smile Dental');
    stampTemplate('healthcare', 'Healthcare & Clinical');

    const snippets = buildFallbackSnippets();
    const text = snippets.map((s) => s.content).join(' ');

    expect(text).toContain('Bright Smile Dental');
    expect(text).toContain('Healthcare & Clinical');
    expect(text.toLowerCase()).not.toContain('nightclub');
  });

  it('says plainly that no data has been loaded', () => {
    // The old fallback recited another tenant's figures, which reads as this
    // tenant's own data. Admitting the gap is the whole improvement.
    stampTemplate('restaurant', 'Restaurant');
    const text = buildFallbackSnippets().map((s) => s.content).join(' ');
    expect(text).toContain('No business data has been loaded');
  });

  it('produces no invented figures', () => {
    stampTemplate('hotel', 'Hotel & Hospitality');
    const text = buildFallbackSnippets().map((s) => s.content).join(' ');
    // Any long digit run would be a fabricated amount — the old seed was full
    // of them ("IDR 2,235,602,109").
    expect(text).not.toMatch(/\d{4,}/);
  });
});
