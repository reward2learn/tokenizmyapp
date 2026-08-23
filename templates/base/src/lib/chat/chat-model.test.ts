import { afterEach, describe, expect, it } from 'vitest';
import { resolveChatCompletionModel, resolveEffectiveChatModel } from '@/lib/chat/chat-model';

describe('resolveChatCompletionModel', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('does not default to deprecated search-preview when web search is enabled', () => {
    delete process.env.OPENAI_WEB_SEARCH_MODEL;
    process.env.OPENAI_CHAT_MODEL = 'gpt-4o-mini';
    expect(resolveChatCompletionModel(true)).toBe('gpt-4o-mini');
  });

  it('ignores deprecated OPENAI_WEB_SEARCH_MODEL values', () => {
    process.env.OPENAI_WEB_SEARCH_MODEL = 'gpt-4o-mini-search-preview';
    process.env.OPENAI_CHAT_MODEL = 'gpt-4o-mini';
    expect(resolveChatCompletionModel(true)).toBe('gpt-4o-mini');
  });

  it('honors a non-deprecated OPENAI_WEB_SEARCH_MODEL override', () => {
    process.env.OPENAI_WEB_SEARCH_MODEL = 'gpt-4o-mini';
    expect(resolveChatCompletionModel(true)).toBe('gpt-4o-mini');
  });

  it('uses configured chat model when web search is disabled', () => {
    process.env.OPENAI_CHAT_MODEL = 'gpt-4o-mini';
    expect(resolveChatCompletionModel(false)).toBe('gpt-4o-mini');
  });
});

describe('resolveEffectiveChatModel', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('prefers the active model over env defaults', () => {
    process.env.OPENAI_CHAT_MODEL = 'gpt-4o-mini';
    expect(resolveEffectiveChatModel('gpt-4o', false)).toBe('gpt-4o');
  });

  it('keeps the active model when web search is enabled (no search-preview override)', () => {
    expect(resolveEffectiveChatModel('gpt-4o', true)).toBe('gpt-4o');
  });

  it('rejects deprecated search-preview as the active model', () => {
    process.env.OPENAI_CHAT_MODEL = 'gpt-4o-mini';
    expect(resolveEffectiveChatModel('gpt-4o-mini-search-preview', true)).toBe('gpt-4o-mini');
  });
});
