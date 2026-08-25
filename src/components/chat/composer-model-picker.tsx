'use client';

import { useEffect, useMemo } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
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
import { setSelectedModel, setSelectedProviderId } from '@/store/chat-stream-slice';
import type { AiProviderId } from '@/store/apis/config-api';
import {
  useGetChatAiOptionsQuery,
  type ChatAiHealthStatus,
  type ChatAiProviderHealth,
} from '@/store/apis/chat-api';

const STORAGE_PROVIDER = 'chat.selectedProviderId';
const STORAGE_MODEL = 'chat.selectedModel';

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
 */
export function ComposerModelPicker() {
  const dispatch = useAppDispatch();
  const selectedProviderId = useAppSelector((s) => s.chatStream.selectedProviderId);
  const selectedModel = useAppSelector((s) => s.chatStream.selectedModel);

  useEffect(() => {
    try {
      const storedProvider = localStorage.getItem(STORAGE_PROVIDER) as AiProviderId | null;
      const storedModel = localStorage.getItem(STORAGE_MODEL);
      if (storedProvider) dispatch(setSelectedProviderId(storedProvider));
      if (storedModel) dispatch(setSelectedModel(storedModel));
    } catch {
      // ignore private-mode / SSR
    }
  }, [dispatch]);

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

  // Seed a default model when none is chosen yet (after options load / provider change).
  useEffect(() => {
    if (!payload || selectedModel) return;
    const pid = selectedProviderId ?? payload.activeProviderId;
    if (!pid) return;
    const fallback =
      (pid === payload.activeProviderId ? payload.activeModel : null)
      ?? payload.providers.find((p) => p.id === pid)?.defaultModel
      ?? payload.models[0]?.id
      ?? null;
    if (fallback) dispatch(setSelectedModel(fallback));
  }, [dispatch, payload, selectedModel, selectedProviderId]);

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
    try {
      localStorage.setItem(STORAGE_PROVIDER, providerId);
      localStorage.removeItem(STORAGE_MODEL);
    } catch {
      // ignore
    }
  };

  const onModelChange = (model: string) => {
    dispatch(setSelectedModel(model));
    try {
      localStorage.setItem(STORAGE_MODEL, model);
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%', minWidth: 0 }}>
        <CircularProgress size={16} />
        <Typography variant="caption" color="text.secondary">
          Checking AI providers…
        </Typography>
      </Stack>
    );
  }

  if (errorMessage) {
    return (
      <Typography variant="caption" color="error" sx={{ width: '100%' }}>
        {errorMessage}
      </Typography>
    );
  }

  if (configuredProviders.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
        No AI provider configured. An admin must add a key in Config → AI Provider.
      </Typography>
    );
  }

  // Stack provider + model full-width under 500px of *chat* width (container
  // query); sit them on one row once the chat is wider. Viewport breakpoints
  // would be wrong inside a narrow drawer on a wide screen.
  const pickerFieldSx = {
    width: '100%',
    minWidth: 0,
    flex: '1 1 100%',
    '@container chat-composer (min-width: 500px)': {
      flex: '1 1 0',
    },
  } as const;

  return (
    <Stack spacing={0.5} sx={{ width: '100%', containerType: 'inline-size', containerName: 'chat-composer' }}>
      <Stack
        spacing={1}
        sx={{
          width: '100%',
          minWidth: 0,
          flexDirection: 'column',
          alignItems: 'stretch',
          '@container chat-composer (min-width: 500px)': {
            flexDirection: 'row',
            alignItems: 'flex-start',
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
          disabled={loadingModels || providerUnhealthy}
          error={modelUnhealthy}
          sx={pickerFieldSx}
        >
          <InputLabel id="chat-model-label">Model</InputLabel>
          <Select
            labelId="chat-model-label"
            label="Model"
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
          <CircularProgress
            size={18}
            sx={{
              alignSelf: 'center',
              flexShrink: 0,
              '@container chat-composer (min-width: 500px)': { mt: 1 },
            }}
          />
        ) : null}
      </Stack>
    </Stack>
  );
}
