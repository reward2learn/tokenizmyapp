'use client';

import { useEffect, useMemo, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedModel, setSelectedProviderId } from '@/store/chat-stream-slice';
import type { AiProviderId } from '@/store/apis/config-api';

const STORAGE_PROVIDER = 'chat.selectedProviderId';
const STORAGE_MODEL = 'chat.selectedModel';

type HealthStatus = 'healthy' | 'unhealthy' | 'unconfigured';

interface ProviderHealth {
  status: HealthStatus;
  message?: string;
}

interface ChatAiProviderOption {
  id: AiProviderId;
  label: string;
  configured: boolean;
  defaultModel: string | null;
  health?: ProviderHealth;
}

interface ChatAiOptionsData {
  providers: ChatAiProviderOption[];
  activeProviderId: AiProviderId;
  activeModel: string | null;
  providerId: AiProviderId;
  models: { id: string; label: string; description?: string }[];
  providerHealth?: ProviderHealth;
  modelHealth?: { status: 'healthy' | 'unhealthy'; message?: string };
}

function healthIcon(status: HealthStatus | 'healthy' | 'unhealthy' | undefined) {
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

  const [providers, setProviders] = useState<ChatAiProviderOption[]>([]);
  const [activeProviderId, setActiveProviderId] = useState<AiProviderId | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [models, setModels] = useState<{ id: string; label: string }[]>([]);
  const [providerHealth, setProviderHealth] = useState<ProviderHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const effectiveProviderId = selectedProviderId ?? activeProviderId;
  const effectiveModel = selectedModel ?? activeModel;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/chat/ai-options', { credentials: 'include' });
        const json = (await res.json()) as { success?: boolean; data?: ChatAiOptionsData; error?: string };
        if (!res.ok || !json.data) {
          throw new Error(json.error ?? `Failed to load AI options (${res.status})`);
        }
        if (cancelled) return;
        setProviders(json.data.providers);
        setActiveProviderId(json.data.activeProviderId);
        setActiveModel(json.data.activeModel);
        setModels(json.data.models);
        setProviderHealth(json.data.providerHealth ?? null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load AI options');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!effectiveProviderId) return;
    let cancelled = false;
    (async () => {
      setLoadingModels(true);
      try {
        const res = await fetch(
          `/api/chat/ai-options?providerId=${encodeURIComponent(effectiveProviderId)}`,
          { credentials: 'include' },
        );
        const json = (await res.json()) as { success?: boolean; data?: ChatAiOptionsData; error?: string };
        if (!res.ok || !json.data) {
          throw new Error(json.error ?? 'Failed to load models');
        }
        if (cancelled) return;
        setProviders(json.data.providers);
        setModels(json.data.models);
        setProviderHealth(json.data.providerHealth ?? null);
        if (!selectedModel) {
          const fallback =
            (effectiveProviderId === json.data.activeProviderId ? json.data.activeModel : null)
            ?? json.data.providers.find((p) => p.id === effectiveProviderId)?.defaultModel
            ?? json.data.models[0]?.id
            ?? null;
          if (fallback) dispatch(setSelectedModel(fallback));
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load models');
      } finally {
        if (!cancelled) setLoadingModels(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, effectiveProviderId]);

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

  if (loading) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 180 }}>
        <CircularProgress size={16} />
        <Typography variant="caption" color="text.secondary">
          Checking AI providers…
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Typography variant="caption" color="error" sx={{ maxWidth: 260 }}>
        {error}
      </Typography>
    );
  }

  if (configuredProviders.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 280 }}>
        No AI provider configured. An admin must add a key in Config → AI Provider.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.5} sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { sm: 'flex-start' }, flexWrap: 'wrap', minWidth: 0 }}
      >
        <FormControl
          size="small"
          sx={{ minWidth: 160 }}
          error={providerUnhealthy}
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
          sx={{ minWidth: 180, maxWidth: 320 }}
          disabled={loadingModels || providerUnhealthy}
          error={modelUnhealthy}
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

        {loadingModels ? <CircularProgress size={18} sx={{ alignSelf: 'center' }} /> : null}

        {!providerUnhealthy && !modelUnhealthy && currentProviderHealth?.status === 'healthy' ? (
          <Tooltip title="Provider and API key verified">
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'success.main', pt: { sm: 1 } }}>
              {healthIcon('healthy')}
              <Typography variant="caption" color="success.main">
                Ready
              </Typography>
            </Stack>
          </Tooltip>
        ) : null}
      </Stack>
    </Stack>
  );
}
