'use client';

import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  useGetTenantAiProviderStatusQuery,
  useSaveTenantAiProviderMutation,
  useClearTenantAiProviderKeyMutation,
  useLazyGetTenantAiModelsQuery,
} from '@/store/apis/tenant-api';
import type { AiProviderId, AiModelOption } from '@/store/apis/config-api';
import { DEFAULT_OLLAMA_TUNNEL_HOST } from '@/lib/ollama-tunnel-host';
import { OllamaStudioTunnelPanel } from '@/components/ops-admin/ollama-studio-tunnel-panel';

function sourceLabel(source: 'db' | 'env' | null | undefined): string {
  if (source === 'db') return 'Stored in database';
  if (source === 'env') return 'Using server environment variable';
  return 'Not configured';
}

export interface TenantAiProviderFormProps {
  tenantSlug: string;
  /** Suite app id — omitted for a non-suite tenant's own single app/DB. */
  appId?: string;
}

/**
 * AI Provider config for one tenant/app, set from the admin console (Create
 * App Wizard / Edit App Modal) — same provider → key → model flow as the
 * self-service Config > AI Chat page, but writing directly to that
 * tenant/app's own dedicated database (via admin/tenants/[slug]/ai-provider)
 * so it powers AI Content Generation and the chat assistant on that
 * tenant's live app immediately, without a redeploy.
 */
export function TenantAiProviderForm({ tenantSlug, appId }: TenantAiProviderFormProps) {
  const { data, isLoading, isError, refetch } = useGetTenantAiProviderStatusQuery({ slug: tenantSlug, appId });
  const [saveProvider, { isLoading: isSaving }] = useSaveTenantAiProviderMutation();
  const [clearKey, { isLoading: isClearing }] = useClearTenantAiProviderKeyMutation();
  const [fetchModels, { data: modelsData, isFetching: isLoadingModels }] = useLazyGetTenantAiModelsQuery();

  const status = data?.data;
  const providers = status?.providers ?? [];

  const [selectedProviderId, setSelectedProviderId] = useState<AiProviderId>('openai');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<AiModelOption | null>(null);
  const [ollamaTunnelHost, setOllamaTunnelHost] = useState(DEFAULT_OLLAMA_TUNNEL_HOST);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status?.activeProviderId) setSelectedProviderId(status.activeProviderId);
  }, [status?.activeProviderId]);

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);
  const isActiveProvider = status?.activeProviderId === selectedProviderId;
  const keylessProvider = selectedProvider?.requiresApiKey === false;

  useEffect(() => {
    if (selectedProvider?.configured) {
      void fetchModels({ slug: tenantSlug, appId, providerId: selectedProviderId });
    }
  }, [selectedProviderId, selectedProvider?.configured, fetchModels, tenantSlug, appId]);

  const models = useMemo(() => modelsData?.data?.models ?? [], [modelsData]);

  useEffect(() => {
    if (models.length === 0) return;
    const currentModelId = isActiveProvider ? status?.activeModel : selectedProvider?.defaultModel;
    const match = models.find((m) => m.id === currentModelId);
    setSelectedModel(match ?? null);
  }, [models, isActiveProvider, status?.activeModel, selectedProvider?.defaultModel]);

  const handleSaveKey = async () => {
    setMessage(null);
    setError(null);
    try {
      await saveProvider({ slug: tenantSlug, appId, providerId: selectedProviderId, apiKey }).unwrap();
      setApiKey('');
      setMessage(`${selectedProvider?.label ?? 'Provider'} API key saved.`);
      await refetch();
      void fetchModels({ slug: tenantSlug, appId, providerId: selectedProviderId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save API key.');
    }
  };

  const handleClearKey = async () => {
    setMessage(null);
    setError(null);
    try {
      await clearKey({ slug: tenantSlug, appId, providerId: selectedProviderId }).unwrap();
      setMessage(`${selectedProvider?.label ?? 'Provider'} database key removed.`);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove API key.');
    }
  };

  const handleActivate = async () => {
    setMessage(null);
    setError(null);
    try {
      await saveProvider({
        slug: tenantSlug,
        appId,
        providerId: selectedProviderId,
        model: selectedModel?.id,
        activate: true,
      }).unwrap();
      setMessage(`${selectedProvider?.label ?? 'Provider'} is now active for this ${appId ? 'app' : 'tenant'}${selectedModel ? ` (model: ${selectedModel.id})` : ''}.`);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not activate provider.');
    }
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>AI Provider</Typography>
        <Typography variant="body2" color="text.secondary">
          Powers AI Content Generation and the chat assistant on this {appId ? 'app' : 'tenant'}&apos;s live
          deployment. Takes effect immediately — no redeploy needed. Choose a provider, add its API key,
          then pick a model from that provider&apos;s current catalog.
        </Typography>
      </Box>

      {isLoading ? (
        <BrandedLoadingIndicator size={24} />
      ) : (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {providers.map((p) => (
            <Chip
              key={p.id}
              label={`${p.label}${p.id === status?.activeProviderId ? ' (active)' : ''}`}
              color={p.id === status?.activeProviderId ? 'primary' : p.configured ? 'success' : 'default'}
              variant={p.id === status?.activeProviderId ? 'filled' : 'outlined'}
              size="small"
              onClick={() => setSelectedProviderId(p.id)}
            />
          ))}
        </Stack>
      )}

      {isError ? <Alert severity="error">Could not load AI provider status.</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {message ? <Alert severity="success">{message}</Alert> : null}

      <FormControl size="small" fullWidth>
        <InputLabel id={`ai-provider-select-label-${tenantSlug}-${appId ?? ''}`}>Provider</InputLabel>
        <Select
          labelId={`ai-provider-select-label-${tenantSlug}-${appId ?? ''}`}
          label="Provider"
          value={selectedProviderId}
          onChange={(e) => setSelectedProviderId(e.target.value as AiProviderId)}
        >
          {providers.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedProvider && (
        <>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={
                keylessProvider
                  ? 'No API key required'
                  : selectedProvider.configured
                    ? 'Key configured'
                    : 'No key'
              }
              color={selectedProvider.configured ? 'success' : 'warning'}
              size="small"
            />
            {!keylessProvider && (
              <Typography variant="caption" color="text.secondary">
                {sourceLabel(selectedProvider.source)}
              </Typography>
            )}
            <Link href={selectedProvider.docsUrl} target="_blank" rel="noopener noreferrer" variant="caption">
              {selectedProvider.docsUrl}
            </Link>
          </Stack>

          {keylessProvider ? (
            selectedProviderId === 'ollama-studio' ? (
              <OllamaStudioTunnelPanel
                tenantSlug={tenantSlug}
                tunnelHost={ollamaTunnelHost}
                onTunnelHostChange={setOllamaTunnelHost}
              />
            ) : selectedProviderId === 'deepseek-studio' ? (
              <Alert severity="info">
                StarWorld DeepSeek uses the Mac Studio MLX tunnel at{' '}
                <code>deepseek.tokenizin.com</code>
                {' '}— no API key is required. Load models to pick a variant
                (e.g. <code>:no-think</code>, <code>:think</code>).
              </Alert>
            ) : (
              <Alert severity="info">
                This provider uses a keyless backend — no API key is required.
              </Alert>
            )
          ) : (
            <>
              <TextField
                label={`${selectedProvider.label} API key`}
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={selectedProvider.keyPlaceholder}
                fullWidth
                autoComplete="off"
                helperText="Paste a new key to replace the stored value. The key is never shown after saving."
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="contained" onClick={() => void handleSaveKey()} disabled={isSaving || !apiKey.trim()}>
                  {isSaving ? 'Saving…' : 'Save API key'}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => void handleClearKey()}
                  disabled={isClearing || selectedProvider.source !== 'db'}
                >
                  {isClearing ? 'Removing…' : 'Remove database key'}
                </Button>
              </Stack>
            </>
          )}

          <Autocomplete
            options={models}
            loading={isLoadingModels}
            value={selectedModel}
            onChange={(_, value) => setSelectedModel(value)}
            getOptionLabel={(m) => m.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            disabled={!selectedProvider.configured}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Stack>
                  <Typography variant="body2">{option.label}</Typography>
                  {option.description && (
                    <Typography variant="caption" color="text.secondary">{option.description}</Typography>
                  )}
                </Stack>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Model"
                helperText={
                  !selectedProvider.configured
                    ? keylessProvider
                      ? 'Loading models from the factory Ollama proxy…'
                      : 'Save an API key first to load available models.'
                    : `${models.length} model(s) currently available from ${selectedProvider.label}.`
                }
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps.input,
                    endAdornment: (
                      <>
                        {isLoadingModels ? <CircularProgress size={16} /> : null}
                        {params.slotProps.input.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />

          <Button
            variant="contained"
            color="secondary"
            onClick={() => void handleActivate()}
            disabled={isSaving || !selectedProvider.configured || !selectedModel || isActiveProvider}
          >
            {isActiveProvider ? 'Currently active' : `Use this provider + model for this ${appId ? 'app' : 'tenant'}`}
          </Button>
        </>
      )}
    </Stack>
  );
}
