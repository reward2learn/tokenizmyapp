import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  aiGenerateErrorMessage,
  AI_CREDITS_EMPTY_MESSAGE,
  formatUsageMessage,
} from '@/hooks/use-ai-credit-feedback';

describe('aiGenerateErrorMessage', () => {
  it('maps 402 gate errors to the billing CTA message', () => {
    expect(
      aiGenerateErrorMessage({ status: 402, data: { error: 'This organization has no AI credits remaining.' } }),
    ).toBe(AI_CREDITS_EMPTY_MESSAGE);
  });

  it('passes through non-credit API errors', () => {
    expect(
      aiGenerateErrorMessage({ status: 500, data: { error: 'AI response was not valid JSON' } }),
    ).toBe('AI response was not valid JSON');
  });

  it('falls back for unknown shapes', () => {
    expect(aiGenerateErrorMessage(null)).toBe('Generation failed');
  });
});

describe('formatUsageMessage', () => {
  it('shows credits used and remaining when charged', () => {
    expect(
      formatUsageMessage({
        promptTokens: 100,
        completionTokens: 50,
        credits: 2,
        consumed: 2,
        charged: true,
        balance: 48,
      }),
    ).toBe('Used 2 credits · 48 remaining');
  });

  it('does not treat byok as free when charged', () => {
    expect(
      formatUsageMessage({
        promptTokens: 10,
        completionTokens: 5,
        credits: 1,
        consumed: 1,
        charged: true,
        balance: 99,
        byok: true,
      }),
    ).toBe('Used 1 credit · 99 remaining');
  });

  it('says Not billed when charged is false (metering skipped / incomplete)', () => {
    expect(
      formatUsageMessage({
        promptTokens: 10,
        completionTokens: 5,
        credits: 1,
        consumed: 0,
        charged: false,
        balance: 100,
      }),
    ).toBe('Not billed');
  });

  it('flags metering incomplete when uncharged with no balance', () => {
    expect(
      formatUsageMessage({
        promptTokens: 9153,
        completionTokens: 523,
        credits: 5,
        consumed: 0,
        charged: false,
        balance: null,
        model: 'gpt-4.1',
      }),
    ).toBe('Not billed · metering incomplete (~5 credits)');
  });
});

describe('CMS generate usage payload shape', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('field generate result includes optional usage', () => {
    const payload = {
      success: true,
      data: {
        value: 'Hello',
        usage: {
          promptTokens: 200,
          completionTokens: 80,
          credits: 1,
          consumed: 1,
          charged: true,
          balance: 99,
          model: 'gpt-4o-mini',
        },
      },
    };
    expect(payload.data.usage?.charged).toBe(true);
    expect(payload.data.usage?.consumed).toBe(1);
  });

  it('dashboard slice result includes optional usage', () => {
    const payload = {
      success: true,
      data: {
        slice: 'levers',
        value: [{ num: 1, title: 'A' }],
        usage: null,
      },
    };
    expect(payload.data.usage).toBeNull();
  });
});
