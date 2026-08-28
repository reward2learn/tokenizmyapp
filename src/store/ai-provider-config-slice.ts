import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AiModelOption } from '@/store/apis/config-api';
import { configApi } from '@/store/apis/config-api';
import { chatApi } from '@/store/apis/chat-api';
import { resetWarmState, setSelectedModel as setChatSelectedModel } from '@/store/chat-stream-slice';

export interface AiProviderConfigState {
  selectedProviderId: string;
  selectedModel: AiModelOption | null;
  /** Draft API key — never persisted in Redux after save. */
  apiKeyDraft: string;
  message: string | null;
  error: string | null;
  /** User picked a model manually — skip auto-seed from catalog. */
  modelTouched: boolean;
  statusHydrated: boolean;
}

const initialState: AiProviderConfigState = {
  selectedProviderId: 'openai',
  selectedModel: null,
  apiKeyDraft: '',
  message: null,
  error: null,
  modelTouched: false,
  statusHydrated: false,
};

export const saveAiProviderKeyDraft = createAsyncThunk<
  void,
  void,
  { rejectValue: string; state: { aiProviderConfig: AiProviderConfigState } }
>('aiProviderConfig/saveKey', async (_arg, { getState, dispatch, rejectWithValue }) => {
  const { selectedProviderId, apiKeyDraft } = getState().aiProviderConfig;
  const trimmed = apiKeyDraft.trim();
  if (!trimmed) return rejectWithValue('Paste an API key before saving.');

  try {
    await dispatch(
      configApi.endpoints.saveAiProvider.initiate({
        providerId: selectedProviderId,
        apiKey: trimmed,
      }),
    ).unwrap();
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Could not save API key.');
  }
});

export const clearAiProviderKeyDraft = createAsyncThunk<
  void,
  void,
  { rejectValue: string; state: { aiProviderConfig: AiProviderConfigState } }
>('aiProviderConfig/clearKey', async (_arg, { getState, dispatch, rejectWithValue }) => {
  const { selectedProviderId } = getState().aiProviderConfig;
  try {
    await dispatch(
      configApi.endpoints.clearAiProviderKey.initiate({ providerId: selectedProviderId }),
    ).unwrap();
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Could not remove API key.');
  }
});

export const activateAiProviderSelection = createAsyncThunk<
  { modelId: string | undefined; providerLabel: string },
  void,
  { rejectValue: string; state: { aiProviderConfig: AiProviderConfigState } }
>('aiProviderConfig/activate', async (_arg, { getState, dispatch, rejectWithValue }) => {
  const { selectedProviderId, selectedModel } = getState().aiProviderConfig;
  if (!selectedModel?.id) return rejectWithValue('Pick a model before activating.');

  try {
    const result = await dispatch(
      configApi.endpoints.saveAiProvider.initiate({
        providerId: selectedProviderId,
        model: selectedModel.id,
        activate: true,
      }),
    ).unwrap();

    const label =
      result.data?.providers.find((p) => p.id === selectedProviderId)?.label ?? 'Provider';

    return { modelId: selectedModel.id, providerLabel: label };
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Could not activate provider.');
  }
});

export const aiProviderConfigSlice = createSlice({
  name: 'aiProviderConfig',
  initialState,
  reducers: {
    setAiProviderId(state, action: PayloadAction<string>) {
      if (state.selectedProviderId === action.payload) return;
      state.selectedProviderId = action.payload;
      state.selectedModel = null;
      state.modelTouched = false;
      state.message = null;
      state.error = null;
    },
    setAiProviderModel(state, action: PayloadAction<AiModelOption | null>) {
      state.selectedModel = action.payload;
      state.modelTouched = Boolean(action.payload);
    },
    setAiProviderApiKeyDraft(state, action: PayloadAction<string>) {
      state.apiKeyDraft = action.payload;
    },
    hydrateAiProviderFromStatus(
      state,
      action: PayloadAction<{ providerId: string; modelId?: string | null }>,
    ) {
      state.selectedProviderId = action.payload.providerId;
      state.statusHydrated = true;
      if (!state.modelTouched && action.payload.modelId) {
        state.selectedModel = { id: action.payload.modelId, label: action.payload.modelId };
      }
    },
    seedAiProviderModelFromCatalog(
      state,
      action: PayloadAction<{ models: AiModelOption[]; preferredModelId?: string | null }>,
    ) {
      if (state.modelTouched) {
        if (state.selectedModel && action.payload.models.some((m) => m.id === state.selectedModel?.id)) {
          return;
        }
      }
      const preferred = action.payload.preferredModelId;
      const match =
        (preferred ? action.payload.models.find((m) => m.id === preferred) : null)
        ?? action.payload.models[0]
        ?? null;
      state.selectedModel = match;
    },
    clearAiProviderFeedback(state) {
      state.message = null;
      state.error = null;
    },
    resetAiProviderConfigState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveAiProviderKeyDraft.pending, (state) => {
        state.message = null;
        state.error = null;
      })
      .addCase(saveAiProviderKeyDraft.fulfilled, (state) => {
        state.apiKeyDraft = '';
        state.message = 'API key saved.';
      })
      .addCase(saveAiProviderKeyDraft.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Could not save API key.';
      })
      .addCase(clearAiProviderKeyDraft.pending, (state) => {
        state.message = null;
        state.error = null;
      })
      .addCase(clearAiProviderKeyDraft.fulfilled, (state) => {
        state.message = 'Database key removed.';
      })
      .addCase(clearAiProviderKeyDraft.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Could not remove API key.';
      })
      .addCase(activateAiProviderSelection.pending, (state) => {
        state.message = null;
        state.error = null;
      })
      .addCase(activateAiProviderSelection.fulfilled, (state, action) => {
        const { modelId, providerLabel } = action.payload;
        state.message = `${providerLabel} is now the active AI provider${modelId ? ` (model: ${modelId})` : ''}.`;
        state.modelTouched = false;
      })
      .addCase(activateAiProviderSelection.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Could not activate provider.';
      });
  },
});

export const {
  setAiProviderId,
  setAiProviderModel,
  setAiProviderApiKeyDraft,
  hydrateAiProviderFromStatus,
  seedAiProviderModelFromCatalog,
  clearAiProviderFeedback,
  resetAiProviderConfigState,
} = aiProviderConfigSlice.actions;
