'use client';

import CircularProgress from '@mui/material/CircularProgress';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  resetWarmState,
  setSelectedModel,
  STUDIO_PROVIDER_ID,
} from '@/store/chat-stream-slice';
import {
  useGetChatAiOptionsQuery,
  type StudioWarmStatus,
} from '@/store/apis/chat-api';

/** Vertical 8px / horizontal 4px — shared by model field and row spinner. */
const PICKER_FIELD_MARGIN = '8px 4px' as const;

function modelLabelWithStatus(studioActive: boolean, warmStatus: StudioWarmStatus): string {
  if (!studioActive || warmStatus !== 'warming') return 'Model';
  return 'Model — Loading…';
}

/**
 * Model selector above the chat composer.
 *
 * Provider is fixed to the tenant's Config default (often ollama-studio).
 * Users only pick among models for that provider; admins change providers in
 * Config → AI Provider / tenant AI setup.
 */
export function ComposerModelPicker() {
  const dispatch = useAppDispatch();
  const selectedModel = useAppSelector((s) => s.chatStream.selectedModel);
  const studioWarmStatus = useAppSelector((s) => s.chatStream.studioWarmStatus);

  // Always load options for the tenant default provider — never a chat override.
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetChatAiOptionsQuery();

  const payload = data?.data;
  const activeProviderId = payload?.activeProviderId ?? null;
  const activeModel = payload?.activeModel ?? null;
  const models = payload?.models ?? [];
  const providerHealth = payload?.providerHealth ?? null;
  const providers = payload?.providers ?? [];

  const effectiveModel = selectedModel ?? activeModel;
  const studioIsDefault = activeProviderId === STUDIO_PROVIDER_ID;
  const shouldWarmStudio = studioIsDefault && Boolean(effectiveModel);
  const studioWarming = shouldWarmStudio && studioWarmStatus === 'warming';

  const configuredDefault = Boolean(
    activeProviderId
    && providers.some((p) => p.id === activeProviderId && p.configured),
  );

  const modelHealth = (() => {
    if (!providerHealth || providerHealth.status !== 'healthy') {
      return {
        status: 'unhealthy' as const,
        message: providerHealth?.message ?? 'Provider is not healthy',
      };
    }
    if (!effectiveModel) {
      return { status: 'unhealthy' as const, message: 'No model selected' };
    }
    if (!models.some((m) => m.id === effectiveModel)) {
      return {
        status: 'unhealthy' as const,
        message: `Model "${effectiveModel}" is not available for this provider`,
      };
    }
    return { status: 'healthy' as const };
  })();

  const providerUnhealthy = providerHealth?.status === 'unhealthy'
    || providerHealth?.status === 'unconfigured';
  const modelUnhealthy = modelHealth.status === 'unhealthy';
  const loadingModels = isFetching && !isLoading;
  const modelFieldLabel = modelLabelWithStatus(shouldWarmStudio, studioWarmStatus);

  const errorMessage = (() => {
    if (isError) {
      if (error && typeof error === 'object' && 'data' in error) {
        const dataErr = (error as { data?: { error?: string } }).data?.error;
        if (dataErr) return dataErr;
      }
      return 'Failed to load AI options';
    }
    if (data && !data.success && data.error) return data.error;
    return null;
  })();

  const onModelChange = (model: string) => {
    dispatch(setSelectedModel(model));
    dispatch(resetWarmState());
  };

  if (isLoading) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%', minWidth: 0, m: PICKER_FIELD_MARGIN }}>
        <BrandedLoadingIndicator size={16} />
        <Typography variant="caption" color="text.secondary">
          Checking AI models…
        </Typography>
      </Stack>
    );
  }

  if (errorMessage) {
    return (
      <Typography variant="caption" color="error" sx={{ width: '100%', m: PICKER_FIELD_MARGIN }}>
        {errorMessage}
      </Typography>
    );
  }

  if (!configuredDefault) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ width: '100%', m: PICKER_FIELD_MARGIN }}>
        No AI provider configured. An admin must set the default in Config → AI Provider.
      </Typography>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={0}
      sx={{
        width: '100%',
        minWidth: 0,
        alignItems: 'center',
        containerType: 'inline-size',
        containerName: 'chat-composer',
      }}
    >
      <FormControl
        size="small"
        disabled={loadingModels || providerUnhealthy || studioWarming}
        error={modelUnhealthy || (shouldWarmStudio && studioWarmStatus === 'error') || providerUnhealthy}
        sx={{
          width: '100%',
          minWidth: 0,
          flex: 1,
          m: PICKER_FIELD_MARGIN,
        }}
      >
        <InputLabel id="chat-model-label">{modelFieldLabel}</InputLabel>
        <Select
          labelId="chat-model-label"
          label={modelFieldLabel}
          value={effectiveModel ?? ''}
          onChange={(e) => onModelChange(e.target.value)}
        >
          {models.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.label}
            </MenuItem>
          ))}
        </Select>
        {providerUnhealthy && providerHealth?.message ? (
          <FormHelperText>{providerHealth.message}</FormHelperText>
        ) : modelUnhealthy && modelHealth.message ? (
          <FormHelperText>{modelHealth.message}</FormHelperText>
        ) : null}
      </FormControl>

      {loadingModels ? (
        <CircularProgress
          size={18}
          sx={{ m: PICKER_FIELD_MARGIN, flexShrink: 0 }}
          aria-label="Loading model list"
        />
      ) : null}
    </Stack>
  );
}
