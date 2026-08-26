'use client';

import { useMemo } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  resetWarmState,
  setSelectedModel,
  setSelectedProviderId,
  STUDIO_PROVIDER_ID,
} from '@/store/chat-stream-slice';
import type { AiProviderId } from '@/store/apis/config-api';
import {
  useGetChatAiOptionsQuery,
  type ChatAiHealthStatus,
  type ChatAiProviderHealth,
  type StudioWarmStatus,
} from '@/store/apis/chat-api';

/** Vertical 8px / horizontal 4px — shared by provider, model, and row spinner. */
const PICKER_FIELD_MARGIN = '8px 4px' as const;

function modelLabelWithStatus(studioActive: boolean, warmStatus: StudioWarmStatus): string {
  if (!studioActive || warmStatus !== 'warming') return 'Model';
  return 'Model — Loading…';
}

function healthIcon(status: ChatAiHealthStatus | 'healthy' | 'unhealthy' | undefined) {
  if (status === 'healthy') {
    return <CheckCircleIcon fontSize="inherit" color="success" sx={{ fontSize: 14 }} />;
  }
  if (status === 'unhealthy' || status === 'unconfigured') {
    return <ErrorIcon fontSize="inherit" color="error" sx={{ fontSize: 14 }} />;
  }
  return null;
}

/**
 * Provider → model selectors above the chat composer (always visible).
 * Sticky in Redux + localStorage; sent with each /api/chat request as
 * providerId / model overrides (does not rewrite Config defaults).
 *
 * Side effects (localStorage, default model seed, Studio warm) live in
 * chat-listener-middleware — this component is selectors + dispatch only.
 */
export function ComposerModelPicker() {
  const dispatch = useAppDispatch();
  const selectedProviderId = useAppSelector((s) => s.chatStream.selectedProviderId);
  const selectedModel = useAppSelector((s) => s.chatStream.selectedModel);
  const studioWarmStatus = useAppSelector((s) => s.chatStream.studioWarmStatus);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetChatAiOptionsQuery(
    selectedProviderId ? { providerId: selectedProviderId } : undefined,
  );

  const payload = data?.data;
  const providers = payload?.providers ?? [];
  const activeProviderId = payload?.activeProviderId ?? null;
  const activeModel = payload?.activeModel ?? null;
  const models = payload?.models ?? [];
  const providerHealth: ChatAiProviderHealth | null = payload?.providerHealth ?? null;

  const effectiveProviderId = selectedProviderId ?? activeProviderId;
  const effectiveModel = selectedModel ?? activeModel;
  const studioIsDefault = activeProviderId === STUDIO_PROVIDER_ID;
  const studioSelected = effectiveProviderId === STUDIO_PROVIDER_ID;
  const shouldWarmStudio = studioIsDefault && studioSelected && Boolean(effectiveModel);
  const studioWarming = shouldWarmStudio && studioWarmStatus === 'warming';

  const configuredProviders = useMemo(
    () => providers.filter((p) => p.configured),
    [providers],
  );

  const currentProviderHealth = useMemo(() => {
    if (providerHealth) return providerHealth;
    const match = providers.find((p) => p.id === effectiveProviderId);
    return match?.health ?? null;
  }, [effectiveProviderId, providerHealth, providers]);

  const modelHealth = useMemo(() => {
    if (!currentProviderHealth || currentProviderHealth.status !== 'healthy') {
      return {
        status: 'unhealthy' as const,
        message: currentProviderHealth?.message ?? 'Provider is not healthy',
      };
    }
    const modelId = effectiveModel;
    if (!modelId) {
      return { status: 'unhealthy' as const, message: 'No model selected' };
    }
    if (!models.some((m) => m.id === modelId)) {
      return { status: 'unhealthy' as const, message: `Model "${modelId}" is not available for this provider` };
    }
    return { status: 'healthy' as const };
  }, [currentProviderHealth, effectiveModel, models]);

  const providerUnhealthy = currentProviderHealth?.status === 'unhealthy' || currentProviderHealth?.status === 'unconfigured';
  const modelUnhealthy = modelHealth?.status === 'unhealthy';
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

  const onProviderChange = (providerId: AiProviderId) => {
    dispatch(setSelectedProviderId(providerId));
    dispatch(setSelectedModel(null));
    dispatch(resetWarmState());
  };

  const onModelChange = (model: string) => {
    dispatch(setSelectedModel(model));
    dispatch(resetWarmState());
  };

  if (isLoading) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%', minWidth: 0, m: PICKER_FIELD_MARGIN }}>
        <BrandedLoadingIndicator size={16} />
        <Typography variant="caption" color="text.secondary">
          Checking AI providers…
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

  if (configuredProviders.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ width: '100%', m: PICKER_FIELD_MARGIN }}>
        No AI provider configured. An admin must add a key in Config → AI Provider.
      </Typography>
    );
  }

  const pickerFieldSx = {
    width: '100%',
    minWidth: 0,
    flex: '1 1 100%',
    m: PICKER_FIELD_MARGIN,
    '@container chat-composer (min-width: 500px)': {
      flex: '1 1 0',
    },
  } as const;

  const rowSpinnerSx = {
    m: PICKER_FIELD_MARGIN,
    alignSelf: 'center',
    flexShrink: 0,
  } as const;

  return (
    <Stack spacing={0} sx={{ width: '100%', containerType: 'inline-size', containerName: 'chat-composer' }}>
      <Stack
        spacing={0}
        sx={{
          width: '100%',
          minWidth: 0,
          flexDirection: 'column',
          alignItems: 'stretch',
          '@container chat-composer (min-width: 500px)': {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'nowrap',
          },
        }}
      >
        <FormControl
          size="small"
          error={providerUnhealthy}
          sx={pickerFieldSx}
        >
          <InputLabel id="chat-provider-label">Provider</InputLabel>
          <Select
            labelId="chat-provider-label"
            label="Provider"
            value={effectiveProviderId ?? ''}
            onChange={(e) => onProviderChange(e.target.value as AiProviderId)}
          >
            {configuredProviders.map((p) => {
              const status = p.health?.status;
              const unhealthy = status === 'unhealthy' || status === 'unconfigured';
              return (
                <MenuItem key={p.id} value={p.id}>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    {healthIcon(status)}
                    <span>
                      {p.label}
                      {p.id === activeProviderId ? ' (default)' : ''}
                      {unhealthy ? ' — unavailable' : ''}
                    </span>
                  </Stack>
                </MenuItem>
              );
            })}
          </Select>
          {providerUnhealthy && currentProviderHealth?.message ? (
            <FormHelperText>{currentProviderHealth.message}</FormHelperText>
          ) : null}
        </FormControl>

        <FormControl
          size="small"
          disabled={loadingModels || providerUnhealthy || studioWarming}
          error={modelUnhealthy || (shouldWarmStudio && studioWarmStatus === 'error')}
          sx={pickerFieldSx}
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
          {modelUnhealthy && modelHealth?.message ? (
            <FormHelperText>{modelHealth.message}</FormHelperText>
          ) : null}
        </FormControl>

        {loadingModels ? (
          <CircularProgress size={18} sx={rowSpinnerSx} aria-label="Loading model list" />
        ) : null}
      </Stack>
    </Stack>
  );
}
