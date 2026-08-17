import { describe, expect, it } from 'vitest';
import {
  addMessage,
  appendToken,
  chatStreamSlice,
  resetStream,
  setActiveTool,
  setMessages,
  setStreamError,
  setStreaming,
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
    expect(state).toEqual({
      messages: [],
      streamingText: '',
      isStreaming: false,
      error: null,
      pendingSessionActions: [],
      activeTool: null,
    });
  });

  it('keeps the selected composer tool across a send', () => {
    // resetStream runs at the start of every send, not per session. Building a
    // template takes several turns (supply a URL, review, adjust), so clearing
    // the tool here would silently disarm it after the first message.
    let state = chatStreamSlice.reducer(undefined, setActiveTool('build_custom_template'));
    state = chatStreamSlice.reducer(state, resetStream());
    expect(state.activeTool).toBe('build_custom_template');
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
});
