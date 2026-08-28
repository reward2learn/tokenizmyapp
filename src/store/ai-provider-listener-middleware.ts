import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@/store';
import { chatApi } from '@/store/apis/chat-api';
import { configApi } from '@/store/apis/config-api';
import {
  activateAiProviderSelection,
  clearAiProviderKeyDraft,
  hydrateAiProviderFromStatus,
  saveAiProviderKeyDraft,
  seedAiProviderModelFromCatalog,
  setAiProviderId,
} from '@/store/ai-provider-config-slice';
import { resetWarmState, setSelectedModel as setChatSelectedModel } from '@/store/chat-stream-slice';

export const aiProviderListener = createListenerMiddleware();

const startAiProviderListening = aiProviderListener.startListening.withTypes<
  RootState,
  AppDispatch
>();

/** First status load — default picker to the active provider. */
startAiProviderListening({
  matcher: configApi.endpoints.getAiProviderStatus.matchFulfilled,
  effect: (action, listenerApi) => {
    const status = action.payload.data;
    if (!status) return;

    const { statusHydrated } = listenerApi.getState().aiProviderConfig;
    if (statusHydrated) return;

    listenerApi.dispatch(
      hydrateAiProviderFromStatus({
        providerId: status.activeProviderId ?? 'openai',
        modelId: status.activeModel,
      }),
    );
  },
});

/** After save/clear/activate — refresh status, models, and chat options. */
startAiProviderListening({
  matcher: isAnyOf(
    activateAiProviderSelection.fulfilled,
    saveAiProviderKeyDraft.fulfilled,
    clearAiProviderKeyDraft.fulfilled,
  ),
  effect: (action, listenerApi) => {
    if (activateAiProviderSelection.fulfilled.match(action)) {
      const { modelId } = action.payload;
      listenerApi.dispatch(
        configApi.endpoints.getAiProviderStatus.initiate(undefined, { forceRefetch: true }),
      );
      void listenerApi.dispatch(
        chatApi.endpoints.getChatAiOptions.initiate(undefined, { forceRefetch: true }),
      );
      if (modelId) {
        listenerApi.dispatch(setChatSelectedModel(modelId));
        listenerApi.dispatch(resetWarmState());
      }
      return;
    }

    listenerApi.dispatch(
      configApi.endpoints.getAiProviderStatus.initiate(undefined, { forceRefetch: true }),
    );

    const { selectedProviderId } = listenerApi.getState().aiProviderConfig;
    const status = configApi.endpoints.getAiProviderStatus.select()(listenerApi.getState())?.data
      ?.data;
    const provider = status?.providers.find((p) => p.id === selectedProviderId);
    if (provider?.configured) {
      listenerApi.dispatch(
        configApi.endpoints.getAiModels.initiate(selectedProviderId, { forceRefetch: true }),
      );
    }
  },
});

/** Model catalog loaded — seed picker when empty or stale. */
startAiProviderListening({
  matcher: configApi.endpoints.getAiModels.matchFulfilled,
  effect: (action, listenerApi) => {
    const providerId = action.meta.arg.originalArgs;
    const models = action.payload.data?.models ?? [];
    if (models.length === 0) return;

    const { selectedProviderId } = listenerApi.getState().aiProviderConfig;
    if (providerId !== selectedProviderId) return;

    const status = configApi.endpoints.getAiProviderStatus.select()(listenerApi.getState())?.data
      ?.data;
    const isActive = status?.activeProviderId === selectedProviderId;
    const providerMeta = status?.providers.find((p) => p.id === selectedProviderId);
    const preferredModelId = isActive
      ? status?.activeModel
      : providerMeta?.defaultModel ?? null;

    listenerApi.dispatch(seedAiProviderModelFromCatalog({ models, preferredModelId }));
  },
});

/** Provider switch — prefetch models when the provider is already configured. */
startAiProviderListening({
  actionCreator: setAiProviderId,
  effect: (action, listenerApi) => {
    const status = configApi.endpoints.getAiProviderStatus.select()(listenerApi.getState())?.data
      ?.data;
    const provider = status?.providers.find((p) => p.id === action.payload);
    if (provider?.configured) {
      listenerApi.dispatch(configApi.endpoints.getAiModels.initiate(action.payload, { forceRefetch: true }));
    }
  },
});

export const aiProviderListenerMiddleware = aiProviderListener.middleware;
