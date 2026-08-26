import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { consumeSseStream } from '@/lib/chat/sse-parser';
import {
  isChatSessionAction,
  type ChatComposerTool,
  type ChatSessionAction,
  type CreditTopUpAction,
  type CustomTemplateDraft,
} from '@/lib/chat/session-tools';
import type { ChatAttachment } from '@/lib/chat/attachments';
import type { AiProviderId } from '@/store/apis/config-api';
import { chatApi, type StudioWarmStatus } from '@/store/apis/chat-api';
import type { ChatTurnUsage } from '@/lib/billing/ai-usage-summary';
import { organizationApi } from '@/store/apis/organization-api';

export const STORAGE_PROVIDER = 'chat.selectedProviderId';
export const STORAGE_MODEL = 'chat.selectedModel';
export const STUDIO_PROVIDER_ID: AiProviderId = 'ollama-studio';
const AI_FINDINGS_CONTEXT_KEY = 'ai_findings_context';

function readComposerPrefs(): { providerId: AiProviderId | null; model: string | null } {
  if (typeof window === 'undefined') return { providerId: null, model: null };
  try {
    const providerId = localStorage.getItem(STORAGE_PROVIDER) as AiProviderId | null;
    const model = localStorage.getItem(STORAGE_MODEL);
    return { providerId, model };
  } catch {
    return { providerId: null, model: null };
  }
}

export interface ChatStreamMessage {
  role: 'user' | 'assistant';
  content: string;
  attachments?: ChatAttachment[];
}

export interface ChatSessionUsageTotals {
  promptTokens: number;
  completionTokens: number;
  credits: number;
  consumed: number;
  turns: ChatTurnUsage[];
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
  /** Provider selected in Tools & Options for the next prompt (null = workspace default). */
  selectedProviderId: AiProviderId | null;
  /** Model selected in Tools & Options for the next prompt (null = workspace default). */
  selectedModel: string | null;
  /** Mac Studio Ollama warm-up (shown in the conversation panel). */
  studioWarmStatus: StudioWarmStatus;
  studioWarmModel: string | null;
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
  /** Stable id for this chat session — sent as meter refId and reset on clear. */
  conversationId: string | null;
  /** Running totals for the current conversation. */
  sessionUsage: ChatSessionUsageTotals;
  /** Most recent turn's usage (for the popover "last turn" breakdown). */
  lastTurnUsage: ChatTurnUsage | null;
  /** Composer text field — Redux-controlled so listeners can prefill/retry. */
  composerInput: string;
  /** Dedupes Mac Studio warm POST + poll for a provider:model pair. */
  warmTargetKey: string | null;
  /** Rate-limit auto-retry countdown (seconds remaining). */
  rateLimitCountdown: number | null;
  /** Last user message saved when a rate limit error occurs. */
  lastFailedMessage: string | null;
  /** Ephemeral status line (save, attach, session actions). */
  sessionStatusMessage: string | null;
  /** Stripe top-up dialog opened by purchase_credits tool. */
  topUpDialog: { orgId: string; packId: string } | null;
  /** One-shot panel init (URL prompt + sessionStorage context). */
  chatPanelInitialized: boolean;
}

const emptySessionUsage = (): ChatSessionUsageTotals => ({
  promptTokens: 0,
  completionTokens: 0,
  credits: 0,
  consumed: 0,
  turns: [],
});

const composerPrefs = readComposerPrefs();

const initialState: ChatStreamState = {
  messages: [],
  streamingText: '',
  isStreaming: false,
  error: null,
  pendingSessionActions: [],
  pendingCreditTopUp: null,
  activeTool: null,
  selectedProviderId: composerPrefs.providerId,
  selectedModel: composerPrefs.model,
  studioWarmStatus: 'idle',
  studioWarmModel: null,
  templateDraft: null,
  conversationId: null,
  sessionUsage: emptySessionUsage(),
  lastTurnUsage: null,
  composerInput: '',
  warmTargetKey: null,
  rateLimitCountdown: null,
  lastFailedMessage: null,
  sessionStatusMessage: null,
  topUpDialog: null,
  chatPanelInitialized: false,
};

function ensureConversationId(state: ChatStreamState): string {
  if (state.conversationId) return state.conversationId;
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  state.conversationId = id;
  return id;
}

function applyTurnUsage(state: ChatStreamState, usage: ChatTurnUsage): void {
  state.lastTurnUsage = usage;
  state.sessionUsage.promptTokens += usage.promptTokens;
  state.sessionUsage.completionTokens += usage.completionTokens;
  state.sessionUsage.credits += usage.credits;
  state.sessionUsage.consumed += usage.consumed;
  state.sessionUsage.turns.push(usage);
}

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
  const chatState = getState().chatStream;
  const { activeTool, selectedProviderId, selectedModel } = chatState;
  let conversationId = chatState.conversationId;
  if (!conversationId) {
    conversationId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    dispatch(setConversationId(conversationId));
  }

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
        conversationId,
        ...(attachments?.length ? { attachments } : {}),
        // Explicit composer selection — forces the matching tool on server-side
        // instead of relying on the message-phrasing heuristic.
        ...(activeTool ? { activeTool } : {}),
        ...(selectedProviderId ? { providerId: selectedProviderId } : {}),
        ...(selectedModel ? { model: selectedModel } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed (${response.status})`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const payload = await response.json() as {
        data?: {
          reply?: string;
          templateDraft?: CustomTemplateDraft;
          creditTopUp?: CreditTopUpAction;
          usage?: ChatTurnUsage;
        };
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
      if (payload.data?.usage) {
        dispatch(recordTurnUsage(payload.data.usage));
        if (payload.data.usage.charged) {
          dispatch(organizationApi.util.invalidateTags(['Credits']));
        }
      }
      return;
    }

    const reader = response.body;
    if (!reader) {
      throw new Error('Streaming response body was empty.');
    }

    let streamError: string | null = null;
    let chargedThisTurn = false;

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

      if (event.type === 'usage') {
        dispatch(recordTurnUsage(event.usage));
        if (event.usage.charged) chargedThisTurn = true;
        return;
      }

      if (event.type === 'error') {
        streamError = event.error;
      }
    });

    if (chargedThisTurn) {
      dispatch(organizationApi.util.invalidateTags(['Credits']));
    }

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

/** Background Mac Studio warm: POST once, then poll /api/ps until ready. */
export const warmStudioModelFlow = createAsyncThunk<
  void,
  { model: string },
  { state: { chatStream: ChatStreamState } }
>('chatStream/warmStudioModelFlow', async ({ model }, { dispatch, getState }) => {
  const targetKey = `${STUDIO_PROVIDER_ID}:${model}`;
  const state = getState().chatStream;
  if (state.warmTargetKey === targetKey && state.studioWarmStatus === 'ready') return;

  dispatch(setWarmTargetKey(targetKey));
  dispatch(setStudioWarmState({ status: 'warming', model }));

  try {
    const postResult = await dispatch(
      chatApi.endpoints.warmStudioModel.initiate({ model, providerId: STUDIO_PROVIDER_ID }),
    );
    if ('data' in postResult && postResult.data?.data?.status === 'ready') {
      dispatch(setStudioWarmState({ status: 'ready', model }));
      return;
    }
  } catch {
    // POST may fail offline — polling can still recover.
  }

  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const current = getState().chatStream;
    if (current.warmTargetKey !== targetKey) return;

    const poll = await dispatch(
      chatApi.endpoints.getStudioWarmStatus.initiate(
        { model, providerId: STUDIO_PROVIDER_ID },
        { forceRefetch: true },
      ),
    );
    if ('data' in poll && poll.data?.data?.status === 'ready') {
      dispatch(setStudioWarmState({ status: 'ready', model }));
      return;
    }
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
      state.conversationId = null;
      state.sessionUsage = emptySessionUsage();
      state.lastTurnUsage = null;
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
    setSelectedProviderId(state, action: { payload: AiProviderId | null }) {
      state.selectedProviderId = action.payload;
      // Changing provider clears a model that may not exist on the new provider.
      state.selectedModel = null;
      state.warmTargetKey = null;
      if (action.payload !== STUDIO_PROVIDER_ID) {
        state.studioWarmStatus = 'idle';
        state.studioWarmModel = null;
      }
    },
    setSelectedModel(state, action: { payload: string | null }) {
      state.selectedModel = action.payload;
      state.warmTargetKey = null;
      state.studioWarmStatus = 'idle';
      state.studioWarmModel = null;
    },
    setWarmTargetKey(state, action: { payload: string | null }) {
      state.warmTargetKey = action.payload;
    },
    resetWarmState(state) {
      state.warmTargetKey = null;
      state.studioWarmStatus = 'idle';
      state.studioWarmModel = null;
    },
    setComposerInput(state, action: { payload: string }) {
      state.composerInput = action.payload;
    },
    initChatPanel(state, action: PayloadAction<{ urlPrompt?: string | null } | undefined>) {
      if (state.chatPanelInitialized) return;
      state.chatPanelInitialized = true;

      const urlPrompt = action.payload?.urlPrompt?.trim();
      if (urlPrompt && !state.composerInput) {
        state.composerInput = urlPrompt;
      }

      if (typeof window !== 'undefined') {
        try {
          const context = sessionStorage.getItem(AI_FINDINGS_CONTEXT_KEY);
          if (context && !state.composerInput) {
            state.composerInput = context;
            sessionStorage.removeItem(AI_FINDINGS_CONTEXT_KEY);
          }
        } catch {
          /* storage unavailable */
        }
      }
    },
    startRateLimitCountdown(
      state,
      action: PayloadAction<{ seconds: number; failedMessage: string }>,
    ) {
      state.rateLimitCountdown = action.payload.seconds;
      state.lastFailedMessage = action.payload.failedMessage;
    },
    tickRateLimitCountdown(state) {
      if (state.rateLimitCountdown === null) return;
      state.rateLimitCountdown = Math.max(0, state.rateLimitCountdown - 1);
    },
    clearRateLimit(state) {
      state.rateLimitCountdown = null;
      state.lastFailedMessage = null;
    },
    setSessionStatusMessage(state, action: { payload: string | null }) {
      state.sessionStatusMessage = action.payload;
    },
    setTopUpDialog(state, action: { payload: { orgId: string; packId: string } | null }) {
      state.topUpDialog = action.payload;
    },
    setStudioWarmState(
      state,
      action: { payload: { status: StudioWarmStatus; model?: string | null } },
    ) {
      state.studioWarmStatus = action.payload.status;
      if (action.payload.model !== undefined) {
        state.studioWarmModel = action.payload.model;
      }
      if (action.payload.status === 'idle') {
        state.studioWarmModel = null;
      }
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
    setConversationId(state, action: { payload: string | null }) {
      state.conversationId = action.payload;
    },
    recordTurnUsage(state, action: { payload: ChatTurnUsage }) {
      ensureConversationId(state);
      applyTurnUsage(state, action.payload);
    },
  },
});

export const {
  addMessage,
  appendToken,
  clearMessages,
  clearPendingSessionActions,
  clearRateLimit,
  clearTemplateDraft,
  initChatPanel,
  queueSessionAction,
  recordTurnUsage,
  resetStream,
  resetWarmState,
  setActiveTool,
  setComposerInput,
  setConversationId,
  setSelectedProviderId,
  setSelectedModel,
  setSessionStatusMessage,
  setStudioWarmState,
  setMessages,
  setPendingCreditTopUp,
  setStreamError,
  setStreaming,
  setTemplateDraft,
  setTopUpDialog,
  setWarmTargetKey,
  startRateLimitCountdown,
  tickRateLimitCountdown,
} = chatStreamSlice.actions;

/** Selectors for chat UI — keep components thin. */
export const selectComposerInput = (s: { chatStream: ChatStreamState }) => s.chatStream.composerInput;
export const selectRateLimitCountdown = (s: { chatStream: ChatStreamState }) => s.chatStream.rateLimitCountdown;
export const selectSessionStatusMessage = (s: { chatStream: ChatStreamState }) => s.chatStream.sessionStatusMessage;
export const selectTopUpDialog = (s: { chatStream: ChatStreamState }) => s.chatStream.topUpDialog;
export const selectStudioWarm = (s: { chatStream: ChatStreamState }) => ({
  status: s.chatStream.studioWarmStatus,
  model: s.chatStream.studioWarmModel,
});
