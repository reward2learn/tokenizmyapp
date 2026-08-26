import { describe, expect, it } from 'vitest';
import {
  addMessage,
  appendToken,
  chatStreamSlice,
  clearMessages,
  clearRateLimit,
  initChatPanel,
  recordTurnUsage,
  resetStream,
  setActiveTool,
  setComposerInput,
  setMessages,
  setStreamError,
  setStreaming,
  setTemplateDraft,
  startRateLimitCountdown,
  tickRateLimitCountdown,
} from '@/store/chat-stream-slice';

describe('chatStreamSlice', () => {
  it('accumulates streaming tokens', () => {
    let state = chatStreamSlice.reducer(undefined, setStreaming(true));
    state = chatStreamSlice.reducer(state, addMessage({ role: 'assistant', content: '' }));
    state = chatStreamSlice.reducer(state, appendToken('Hello'));
    state = chatStreamSlice.reducer(state, appendToken(' world'));
    expect(state.streamingText).toBe('Hello world');
    expect(state.isStreaming).toBe(true);
    expect(state.messages[0]?.content).toBe('Hello world');
  });

  it('records stream errors', () => {
    const state = chatStreamSlice.reducer(
      chatStreamSlice.reducer(undefined, setStreaming(true)),
      setStreamError('upstream failed'),
    );
    expect(state.error).toBe('upstream failed');
  });

  it('resetStream clears streaming state', () => {
    let state = chatStreamSlice.reducer(undefined, setStreaming(true));
    state = chatStreamSlice.reducer(state, appendToken('partial'));
    state = chatStreamSlice.reducer(state, setStreamError('oops'));
    state = chatStreamSlice.reducer(state, resetStream());
    expect(state.streamingText).toBe('');
    expect(state.isStreaming).toBe(false);
    expect(state.error).toBeNull();
    expect(state.pendingSessionActions).toEqual([]);
  });

  it('keeps the selected composer tool across a send', () => {
    // resetStream runs at the start of every send, not per session. Building a
    // template takes several turns (supply a URL, review, adjust), so clearing
    // the tool here would silently disarm it after the first message.
    let state = chatStreamSlice.reducer(undefined, setActiveTool('build_custom_template'));
    state = chatStreamSlice.reducer(state, resetStream());
    expect(state.activeTool).toBe('build_custom_template');
  });

  it('keeps an unsaved template draft across a send', () => {
    // resetStream fires at the start of every message. The draft has to survive
    // it, or asking the assistant a follow-up question ("what pages did it
    // pick?") would remove the Save & Create Template button before the
    // administrator ever pressed it.
    const draft = {
      label: 'Veterinary Clinic',
      description: 'Appointments and patient records.',
      icon: 'Pets',
      templateType: 'single' as const,
      definition: {},
      capabilities: {},
      sourceKind: 'prompt' as const,
      sourceRef: null,
      prompt: 'a vet clinic',
      pageTitles: ['Dashboard'],
      rationale: null,
      walletSummary: 'Web3 wallet not enabled.',
    };
    let state = chatStreamSlice.reducer(undefined, setTemplateDraft(draft));
    state = chatStreamSlice.reducer(state, resetStream());
    expect(state.templateDraft).toEqual(draft);

    // Clearing the chat DOES drop it — the card would otherwise offer to save a
    // template with no visible context for what it is.
    state = chatStreamSlice.reducer(state, clearMessages());
    expect(state.templateDraft).toBeNull();
  });

  it('setMessages replaces the conversation history', () => {
    const state = chatStreamSlice.reducer(
      undefined,
      setMessages([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ]),
    );
    expect(state.messages).toHaveLength(2);
    expect(state.messages[1]?.content).toBe('Hi there');
  });

  it('accumulates session usage across turns', () => {
    let state = chatStreamSlice.reducer(
      undefined,
      recordTurnUsage({
        promptTokens: 100,
        completionTokens: 40,
        credits: 2,
        consumed: 2,
        charged: true,
        balance: 98,
        model: 'gpt-4o-mini',
      }),
    );
    expect(state.sessionUsage.credits).toBe(2);
    expect(state.sessionUsage.promptTokens).toBe(100);
    expect(state.lastTurnUsage?.consumed).toBe(2);
    expect(state.conversationId).toBeTruthy();

    state = chatStreamSlice.reducer(
      state,
      recordTurnUsage({
        promptTokens: 50,
        completionTokens: 20,
        credits: 1,
        consumed: 1,
        charged: true,
        balance: 97,
      }),
    );
    expect(state.sessionUsage.credits).toBe(3);
    expect(state.sessionUsage.turns).toHaveLength(2);
    expect(state.lastTurnUsage?.balance).toBe(97);
  });

  it('clearMessages resets conversation usage and id', () => {
    let state = chatStreamSlice.reducer(
      undefined,
      recordTurnUsage({
        promptTokens: 10,
        completionTokens: 5,
        credits: 1,
        consumed: 1,
        charged: true,
        balance: 9,
      }),
    );
    state = chatStreamSlice.reducer(state, clearMessages());
    expect(state.sessionUsage.credits).toBe(0);
    expect(state.sessionUsage.turns).toEqual([]);
    expect(state.lastTurnUsage).toBeNull();
    expect(state.conversationId).toBeNull();
  });

  it('initChatPanel prefills composer from URL prompt once', () => {
    let state = chatStreamSlice.reducer(undefined, initChatPanel({ urlPrompt: 'Explain revenue' }));
    expect(state.composerInput).toBe('Explain revenue');
    expect(state.chatPanelInitialized).toBe(true);

    state = chatStreamSlice.reducer(state, initChatPanel({ urlPrompt: 'ignored' }));
    expect(state.composerInput).toBe('Explain revenue');
  });

  it('tracks rate-limit countdown in the store', () => {
    let state = chatStreamSlice.reducer(
      undefined,
      startRateLimitCountdown({ seconds: 3, failedMessage: 'retry me' }),
    );
    expect(state.rateLimitCountdown).toBe(3);
    expect(state.lastFailedMessage).toBe('retry me');

    state = chatStreamSlice.reducer(state, tickRateLimitCountdown());
    expect(state.rateLimitCountdown).toBe(2);

    state = chatStreamSlice.reducer(state, clearRateLimit());
    expect(state.rateLimitCountdown).toBeNull();
    expect(state.lastFailedMessage).toBeNull();
  });

  it('setComposerInput controls the composer text field', () => {
    const state = chatStreamSlice.reducer(undefined, setComposerInput('hello'));
    expect(state.composerInput).toBe('hello');
  });
});
