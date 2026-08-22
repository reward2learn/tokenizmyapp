import { describe, expect, it } from 'vitest';

/**
 * Mirrors pickEnvValue STRIPE_WEBHOOK_SECRET branch for unit tests.
 */
function pickWebhookSecretValue(
  rows: Array<{ key: string; value?: string; target?: string[] }>,
): string | null {
  const matching = rows.filter((e) => e.key === 'STRIPE_WEBHOOK_SECRET' && e.value?.trim());
  if (matching.length === 0) return null;
  const whsecRows = matching.filter((e) => e.value!.trim().startsWith('whsec_'));
  if (whsecRows.length > 0) {
    const production = whsecRows.find((e) => e.target?.includes('production'));
    return (production ?? whsecRows[0]).value!.trim();
  }
  const production = matching.find((e) => e.target?.includes('production'));
  return (production ?? matching[0]).value!.trim();
}

describe('pickWebhookSecretValue', () => {
  it('prefers whsec_ over Marketplace eyJ when both exist', () => {
    const value = pickWebhookSecretValue([
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        value: 'eyJ_marketplace_token',
        target: ['production', 'preview', 'development'],
      },
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        value: 'whsec_real_secret',
        target: ['production', 'preview', 'development'],
      },
    ]);
    expect(value).toBe('whsec_real_secret');
  });

  it('returns eyJ when it is the only row', () => {
    const value = pickWebhookSecretValue([
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        value: 'eyJ_only',
        target: ['production'],
      },
    ]);
    expect(value).toBe('eyJ_only');
  });
});
