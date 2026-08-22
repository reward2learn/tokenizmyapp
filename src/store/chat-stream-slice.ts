import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { consumeSseStream } from '@/lib/chat/sse-parser';
import {
  isChatSessionAction,
  type ChatComposerTool,
  type ChatSessionAction,
  type CreditTopUpAction,
  type CustomTemplateDraft,
} from '@/lib/chat/session-tools';
import type { ChatAttachment } from '@/lib/chat/attachments';

export interface ChatStreamMessage {
  role: 'user' | 'assistant';
  content: string;
  attachments?: ChatAttachment[];
}

export interface ChatStreamState {
  messages: ChatStreamMessage[];
  streamingText: string;
  isStreaming: boolean;
  error: string | null;
  pendingSessionActions: ChatSessionAction[];
  /** Top-up dialog payload from purchase_credits tool. */
  pendingCreditTopUp: CreditTopUpAction | null;
  /**
   * Tool selected in the chat composer, e.g. "Custom Template Build".
   *
   * Lives in the store rather than component state: the composer sets it, the
   * send thunk reads it, and it must survive the panel unmounting (the chat
   * drawer closes and reopens between turns). Sticky until explicitly cleared.
   */
  activeTool: ChatComposerTool | null;
  /**
   * A template the assistant designed but has NOT saved.
   *
   * Held in the store, not in the message text, because the confirmation card
   * needs the whole definition to POST back on save — regenerating it to
   * confirm would charge credits twice and could produce a different template.
   * Survives the chat drawer closing between turns, like activeTool.
   *
   * One at a time: a second design supersedes the first, matching what the
   * administrator sees in the transcript.
   */
  templateDraft: CustomTemplateDraft | null;
}

const initialState: ChatStreamState = {
  messages: [],
  streamingText: '',
  isStreaming: false,
  error: null,
  pendingSessionActions: [],
  pendingCreditTopUp: null,
  activeTool: null,
  templateDraft: null,
};

export const sendStreamingMessage = createAsyncThunk<
  void,
  { message: string; history: ChatStreamMessage[]; attachments?: ChatAttachment[] },
  { rejectValue: string; state: { chatStream: ChatStreamState } }
>('chatStream/sendStreamingMessage', async ({ message, history, attachments }, { dispatch, getState, rejectWithValue }) => {
  const trimmedMessage = message.trim();
  if (!trimmedMessage && !attachments?.length) {
    return;
  }

  // Read from the store rather than an argument so every caller sends the
  // selected tool without having to thread it through.
  const activeTool = getState().chatStream.activeTool;

  dispatch(resetStream());
  dispatch(addMessage({
    role: 'user',
    content: trimmedMessage,
    ...(attachments?.length ? { attachments } : {}),
  }));
  dispatch(addMessage({ role: 'assistant', content: '' }));
  dispatch(setStreaming(true));

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: trimmedMessage,
        history,
        stream: true,
        ...(attachments?.length ? { attachments } : {}),
        // Explicit composer selection — forces the matching tool on server-side
        // instead of relying on the message-phrasing heuristic.
        ...(activeTool ? { activeTool } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed (${response.status})`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const payload = await response.json() as {
        data?: { reply?: string; templateDraft?: CustomTemplateDraft; creditTopUp?: CreditTopUpAction };
        error?: string;
      };
      const reply = payload.data?.reply ?? payload.error ?? 'No reply returned.';
      dispatch(appendToken(reply));
      // The non-streaming path returns the draft in the body rather than as an
      // SSE event; both must surface the confirmation card.
      if (payload.data?.templateDraft) {
        dispatch(setTemplateDraft(payload.data.templateDraft));
      }
      if (payload.data?.creditTopUp) {
        dispatch(setPendingCreditTopUp(payload.data.creditTopUp));
      }
      return;
    }

    const reader = response.body;
    if (!reader) {
      throw new Error('Streaming response body was empty.');
    }

    let streamError: string | null = null;

    await consumeSseStream(reader, (event) => {
      if (event.type === 'token') {
        dispatch(appendToken(event.token));
        return;
      }

      if (event.type === 'action') {
        if (isChatSessionAction(event.action)) {
          dispatch(queueSessionAction(event.action));
        }
        return;
      }

      if (event.type === 'template_draft') {
        dispatch(setTemplateDraft(event.draft));
        return;
      }

      if (event.type === 'credit_topup') {
        dispatch(setPendingCreditTopUp(event.creditTopUp));
        return;
      }

      if (event.type === 'error') {
        streamError = event.error;
      }
    });

    if (streamError) {
      throw new Error(streamError);
    }
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'Chat stream failed';
    dispatch(setStreamError(messageText));
    return rejectWithValue(messageText);
  } finally {
    dispatch(setStreaming(false));
  }
});

export const chatStreamSlice = createSlice({
  name: 'chatStream',
  initialState,
  reducers: {
    addMessage(state, action: { payload: ChatStreamMessage }) {
      state.messages.push(action.payload);
    },
    setMessages(state, action: { payload: ChatStreamMessage[] }) {
      state.messages = action.payload;
      state.streamingText = '';
      state.error = null;
    },
    clearMessages(state) {
      state.messages = [];
      state.streamingText = '';
      state.error = null;
      state.pendingSessionActions = [];
      // The confirmation card belongs to the conversation that produced it —
      // leaving it behind would offer to save a template with no visible
      // context for what it is.
      state.templateDraft = null;
    },
    appendToken(state, action: { payload: string }) {
      state.streamingText += action.payload;
      const last = state.messages[state.messages.length - 1];
      if (last?.role === 'assistant') {
        last.content += action.payload;
      }
    },
    setStreaming(state, action: { payload: boolean }) {
      state.isStreaming = action.payload;
    },
    setStreamError(state, action: { payload: string | null }) {
      state.error = action.payload;
    },
    resetStream(state) {
      state.streamingText = '';
      state.isStreaming = false;
      state.error = null;
      state.pendingSessionActions = [];
    },
    setActiveTool(state, action: { payload: ChatComposerTool | null }) {
      state.activeTool = action.payload;
    },
    setTemplateDraft(state, action: { payload: CustomTemplateDraft }) {
      state.templateDraft = action.payload;
    },
    clearTemplateDraft(state) {
      state.templateDraft = null;
    },
    queueSessionAction(state, action: { payload: ChatSessionAction }) {
      state.pendingSessionActions.push(action.payload);
    },
    clearPendingSessionActions(state) {
      state.pendingSessionActions = [];
    },
    setPendingCreditTopUp(state, action: { payload: CreditTopUpAction | null }) {
      state.pendingCreditTopUp = action.payload;
    },
  },
});

export const {
  addMessage,
  appendToken,
  clearMessages,
  clearPendingSessionActions,
  clearTemplateDraft,
  queueSessionAction,
  resetStream,
  setActiveTool,
  setMessages,
  setPendingCreditTopUp,
  setStreamError,
  setStreaming,
  setTemplateDraft,
} = chatStreamSlice.actions;
