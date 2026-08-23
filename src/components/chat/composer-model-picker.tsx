'use client';

import { useEffect, useMemo, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedModel, setSelectedProviderId } from '@/store/chat-stream-slice';
import type { AiProviderId } from '@/store/apis/config-api';

const STORAGE_PROVIDER = 'chat.selectedProviderId';
const STORAGE_MODEL = 'chat.selectedModel';

interface ChatAiProviderOption {
  id: AiProviderId;
  label: string;
  configured: boolean;
  defaultModel: string | null;
}

interface ChatAiOptionsData {
  providers: ChatAiProviderOption[];
  activeProviderId: AiProviderId;
  activeModel: string | null;
  providerId: AiProviderId;
  models: { id: string; label: string; description?: string }[];
}

/**
 * Provider → model selectors in the chat Tools & Options row.
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
        setModels(json.data.models);
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
  }, [dispatch, effectiveProviderId, selectedModel]);

  const configuredProviders = useMemo(
    () => providers.filter((p) => p.configured),
    [providers],
  );

  const onProviderChange = (providerId: AiProviderId) => {
    dispatch(setSelectedProviderId(providerId));
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
          Loading models…
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
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      sx={{ alignItems: { sm: 'center' }, flexWrap: 'wrap', minWidth: 0 }}
    >
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="chat-provider-label">Provider</InputLabel>
        <Select
          labelId="chat-provider-label"
          label="Provider"
          value={effectiveProviderId ?? ''}
          onChange={(e) => onProviderChange(e.target.value as AiProviderId)}
        >
          {configuredProviders.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.label}
              {p.id === activeProviderId ? ' (default)' : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 180, maxWidth: 280 }} disabled={loadingModels}>
        <InputLabel id="chat-model-label">Model</InputLabel>
        <Select
          labelId="chat-model-label"
          label="Model"
          value={selectedModel ?? activeModel ?? ''}
          onChange={(e) => onModelChange(e.target.value)}
        >
          {models.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
