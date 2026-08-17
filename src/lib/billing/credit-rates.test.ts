import { describe, expect, it } from 'vitest';
import { creditsForUsage, RATE_CARD, DEFAULT_RATE } from '@/lib/billing/credit-rates';

describe('creditsForUsage', () => {
  it('charges nothing only when no tokens were exchanged', () => {
    expect(creditsForUsage('gpt-4o', 0, 0)).toBe(0);
  });

  it('never charges less than one credit for a real call', () => {
    // A one-token call costs a fraction of a credit; rounding it to zero would
    // make tiny calls free and uncapped.
    expect(creditsForUsage('gpt-4o-mini', 1, 1)).toBe(1);
  });

  it('charges output more than input at the same volume', () => {
    const input = creditsForUsage('gpt-4o', 100_000, 0);
    const output = creditsForUsage('gpt-4o', 0, 100_000);
    expect(output).toBeGreaterThan(input);
  });

  it('resolves a dated model name to its family rate', () => {
    expect(creditsForUsage('gpt-4o-2024-08-06', 100_000, 100_000)).toBe(
      creditsForUsage('gpt-4o', 100_000, 100_000),
    );
  });

  it('does not let a mini model fall through to the flagship rate', () => {
    // The trap: `gpt-4o-mini-2024-07-18` starts with `gpt-4o-`, so a naive
    // prefix match bills a cheap model at four times its rate.
    const mini = creditsForUsage('gpt-4o-mini-2024-07-18', 100_000, 100_000);
    const flagship = creditsForUsage('gpt-4o-2024-08-06', 100_000, 100_000);
    expect(mini).toBeLessThan(flagship);
    expect(mini).toBe(creditsForUsage('gpt-4o-mini', 100_000, 100_000));
  });

  it('bills an unknown model at no less than the flagship rate', () => {
    // An unmapped model must never undercharge — that is the direction that
    // costs real money.
    const unknown = creditsForUsage('some-new-model-v9', 100_000, 100_000);
    const flagship = creditsForUsage('gpt-4o', 100_000, 100_000);
    expect(unknown).toBeGreaterThanOrEqual(flagship);
  });

  it('treats a missing model name as unknown rather than free', () => {
    expect(creditsForUsage(null, 10_000, 10_000)).toBeGreaterThan(0);
    expect(creditsForUsage(undefined, 10_000, 10_000)).toBeGreaterThan(0);
  });

  it('prices every rate-card entry with output above input', () => {
    // Output tokens cost more than input at every provider we route to, so an
    // entry where they are equal or inverted is a data-entry error, not a
    // pricing decision.
    for (const [model, rate] of Object.entries(RATE_CARD)) {
      expect(rate.inputPer1K, `${model} input`).toBeGreaterThan(0);
      expect(rate.outputPer1K, `${model} output`).toBeGreaterThan(rate.inputPer1K);
    }
    expect(DEFAULT_RATE.outputPer1K).toBeGreaterThan(DEFAULT_RATE.inputPer1K);
  });
});
