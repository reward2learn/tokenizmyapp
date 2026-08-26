import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import {
  chatApi,
  type ChatAiOptionsData,
} from '@/store/apis/chat-api';
import {
  isClientClearSessionAction,
  isExplicitSessionRequest,
  type CreditTopUpAction,
} from '@/lib/chat/session-tools';
import {
  STUDIO_PROVIDER_ID,
  STORAGE_MODEL,
  STORAGE_PROVIDER,
  chatStreamSlice,
  clearMessages,
  clearPendingSessionActions,
  clearRateLimit,
  resetWarmState,
  sendStreamingMessage,
  setComposerInput,
  setPendingCreditTopUp,
  setSelectedModel,
  setSessionStatusMessage,
  setStreamError,
  setStreaming,
  setStudioWarmState,
  setTopUpDialog,
  startRateLimitCountdown,
  tickRateLimitCountdown,
  warmStudioModelFlow,
  type ChatStreamState,
} from '@/store/chat-stream-slice';

const RATE_LIMIT_PATTERN = /rate limit|too large|TPM|tokens per min|max_tokens/i;

function shouldWarmStudio(
  state: ChatStreamState,
  options: ChatAiOptionsData | undefined,
): { warm: boolean; model: string | null } {
  if (!options) return { warm: false, model: null };
  const effectiveProviderId = state.selectedProviderId ?? options.activeProviderId;
  const effectiveModel = state.selectedModel ?? options.activeModel;
  const studioIsDefault = options.activeProviderId === STUDIO_PROVIDER_ID;
  const studioSelected = effectiveProviderId === STUDIO_PROVIDER_ID;
  const warm = studioIsDefault && studioSelected && Boolean(effectiveModel);
  return { warm, model: effectiveModel };
}

function seedDefaultModel(
  state: ChatStreamState,
  options: ChatAiOptionsData,
): string | null {
  if (state.selectedModel) return null;
  const providerId = state.selectedProviderId ?? options.activeProviderId;
  if (!providerId) return null;
  return (
    (providerId === options.activeProviderId ? options.activeModel : null)
    ?? options.providers.find((p) => p.id === providerId)?.defaultModel
    ?? options.models[0]?.id
    ?? null
  );
}

function openCreditTopUp(
  action: CreditTopUpAction,
  dispatch: (action: unknown) => void,
): void {
  if (action.checkoutUrl && action.agentic) {
    window.open(action.checkoutUrl, '_blank', 'noopener,noreferrer');
    dispatch(setPendingCreditTopUp(null));
    return;
  }
  dispatch(setTopUpDialog({ orgId: action.orgId, packId: action.packId }));
  dispatch(setPendingCreditTopUp(null));
}

export const chatListener = createListenerMiddleware();

/** Persist composer provider/model picks to localStorage. */
chatListener.startListening({
  matcher: isAnyOf(
    chatStreamSlice.actions.setSelectedProviderId,
    chatStreamSlice.actions.setSelectedModel,
  ),
  effect: (action) => {
    try {
      if (chatStreamSlice.actions.setSelectedProviderId.match(action)) {
        const providerId = action.payload;
        if (providerId) {
          localStorage.setItem(STORAGE_PROVIDER, providerId);
          localStorage.removeItem(STORAGE_MODEL);
        }
        return;
      }
      if (chatStreamSlice.actions.setSelectedModel.match(action)) {
        const model = action.payload;
        if (model) localStorage.setItem(STORAGE_MODEL, model);
      }
    } catch {
      /* storage unavailable */
    }
  },
});

/** Seed default model and kick off Studio warm when AI options load. */
chatListener.startListening({
  matcher: chatApi.endpoints.getChatAiOptions.matchFulfilled,
  effect: (action, listenerApi) => {
    const options = action.payload.data;
    if (!options) return;

    const state = listenerApi.getState().chatStream;
    const fallback = seedDefaultModel(state, options);
    if (fallback) {
      listenerApi.dispatch(setSelectedModel(fallback));
    }

    const nextState = listenerApi.getState().chatStream;
    const { warm, model } = shouldWarmStudio(nextState, options);
    if (warm && model) {
      listenerApi.dispatch(warmStudioModelFlow({ model }));
    } else if (!warm) {
      listenerApi.dispatch(resetWarmState());
    }
  },
});

/** Re-evaluate Studio warm when provider/model changes after options are cached. */
chatListener.startListening({
  matcher: isAnyOf(
    chatStreamSlice.actions.setSelectedProviderId,
    chatStreamSlice.actions.setSelectedModel,
    chatStreamSlice.actions.resetWarmState,
  ),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState().chatStream;
    const providerArg = state.selectedProviderId ?? undefined;
    const cached = chatApi.endpoints.getChatAiOptions.select(
      providerArg ? { providerId: providerArg } : undefined,
    )(listenerApi.getState());
    const options = cached?.data?.data;
    if (!options) return;

    const { warm, model } = shouldWarmStudio(state, options);
    if (warm && model) {
      listenerApi.dispatch(warmStudioModelFlow({ model }));
    } else {
      listenerApi.dispatch(resetWarmState());
    }
  },
});

/** Detect rate-limit errors and start the auto-retry countdown. */
chatListener.startListening({
  actionCreator: setStreamError,
  effect: (action, listenerApi) => {
    const error = action.payload;
    if (!error || !RATE_LIMIT_PATTERN.test(error)) return;

    const messages = listenerApi.getState().chatStream.messages;
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser?.content) return;

    listenerApi.dispatch(startRateLimitCountdown({
      seconds: 60,
      failedMessage: lastUser.content,
    }));
  },
});

/** Tick rate-limit countdown; auto-retry when it reaches zero. */
chatListener.startListening({
  actionCreator: startRateLimitCountdown,
  effect: async (_action, listenerApi) => {
    listenerApi.cancelActiveListeners();

    while (true) {
      const { rateLimitCountdown } = listenerApi.getState().chatStream;
      if (rateLimitCountdown === null) return;
      if (rateLimitCountdown <= 0) break;
      await listenerApi.delay(1000);
      listenerApi.dispatch(tickRateLimitCountdown());
    }

    const { lastFailedMessage } = listenerApi.getState().chatStream;
    if (!lastFailedMessage) {
      listenerApi.dispatch(clearRateLimit());
      return;
    }

    listenerApi.dispatch(clearMessages());
    listenerApi.dispatch(setComposerInput(lastFailedMessage));
    listenerApi.dispatch(clearRateLimit());
    await listenerApi.delay(500);
    listenerApi.dispatch(sendStreamingMessage({ message: lastFailedMessage, history: [] }));
  },
});

/** Process queued session actions once streaming finishes. */
chatListener.startListening({
  actionCreator: setStreaming,
  effect: (action, listenerApi) => {
    if (action.payload !== false) return;

    const state = listenerApi.getState().chatStream;
    if (!state.pendingSessionActions.length) return;

    const actions = [...state.pendingSessionActions];
    listenerApi.dispatch(clearPendingSessionActions());

    const lastUserMessage = [...state.messages].reverse().find((msg) => msg.role === 'user');
    const explicitSessionRequest = isExplicitSessionRequest(lastUserMessage?.content ?? '');

    let shouldClear = false;
    for (const sessionAction of actions) {
      if (sessionAction === 'save_conversation') {
        listenerApi.dispatch(chatApi.util.invalidateTags(['Conversations']));
        listenerApi.dispatch(setSessionStatusMessage('Conversation saved.'));
      }
      if (sessionAction === 'open_credit_topup') {
        const topUp = listenerApi.getState().chatStream.pendingCreditTopUp;
        if (topUp) {
          openCreditTopUp(topUp, listenerApi.dispatch);
        }
      }
      if (isClientClearSessionAction(sessionAction) && explicitSessionRequest) {
        shouldClear = true;
      }
    }

    if (shouldClear) {
      listenerApi.dispatch(clearMessages());
      listenerApi.dispatch(setComposerInput(''));
    }
  },
});

/** Open credit top-up dialog when payload arrives after streaming. */
chatListener.startListening({
  actionCreator: setPendingCreditTopUp,
  effect: (action, listenerApi) => {
    const topUp = action.payload;
    if (!topUp) return;
    if (listenerApi.getState().chatStream.isStreaming) return;
    openCreditTopUp(topUp, listenerApi.dispatch);
  },
});

/** Mark Studio warm complete when poll query succeeds. */
chatListener.startListening({
  matcher: chatApi.endpoints.getStudioWarmStatus.matchFulfilled,
  effect: (action, listenerApi) => {
    if (action.payload.data?.status !== 'ready') return;
    const model = action.payload.data.model ?? action.meta.arg.originalArgs.model;
    listenerApi.dispatch(setStudioWarmState({ status: 'ready', model }));
  },
});

export const chatListenerMiddleware = chatListener.middleware;
