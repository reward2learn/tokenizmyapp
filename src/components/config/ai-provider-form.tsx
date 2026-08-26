'use client';

import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  useGetAiProviderStatusQuery,
  useSaveAiProviderMutation,
  useClearAiProviderKeyMutation,
  useLazyGetAiModelsQuery,
  type AiProviderId,
  type AiModelOption,
} from '@/store/apis/config-api';

function sourceLabel(source: 'db' | 'env' | null | undefined): string {
  if (source === 'db') return 'Stored in database';
  if (source === 'env') return 'Using server environment variable';
  return 'Not configured';
}

/**
 * AI Provider — lets an operator pick which AI backend powers content
 * generation (Config > AI Content Generation): first choose a provider
 * (OpenAI, Vercel AI Gateway, or OpenCode Zen), enter that provider's own
 * API key, then pick a model from that provider's live catalog rather than
 * a hardcoded/stale list — catalogs change too often to bake in.
 */
export function AiProviderForm() {
  const { data, isLoading, isError, refetch } = useGetAiProviderStatusQuery();
  const [saveProvider, { isLoading: isSaving }] = useSaveAiProviderMutation();
  const [clearKey, { isLoading: isClearing }] = useClearAiProviderKeyMutation();
  const [fetchModels, { data: modelsData, isFetching: isLoadingModels }] = useLazyGetAiModelsQuery();

  const status = data?.data;
  const providers = status?.providers ?? [];

  const [selectedProviderId, setSelectedProviderId] = useState<AiProviderId>('openai');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<AiModelOption | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Once status loads, default the picker to whichever provider is active.
  useEffect(() => {
    if (status?.activeProviderId) setSelectedProviderId(status.activeProviderId);
  }, [status?.activeProviderId]);

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);
  const isActiveProvider = status?.activeProviderId === selectedProviderId;
  const keylessProvider = selectedProvider?.requiresApiKey === false;

  // Load the live model list whenever the selected provider is ready —
  // keyless providers (ollama-studio) need no saved API key.
  useEffect(() => {
    if (selectedProvider?.configured) {
      void fetchModels(selectedProviderId);
    }
  }, [selectedProviderId, selectedProvider?.configured, fetchModels]);

  const models = useMemo(() => modelsData?.data?.models ?? [], [modelsData]);

  // Preselect the currently-active model (or the provider's default) once
  // the model list for this provider has loaded.
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
      await saveProvider({ providerId: selectedProviderId, apiKey }).unwrap();
      setApiKey('');
      setMessage(`${selectedProvider?.label ?? 'Provider'} API key saved.`);
      await refetch();
      void fetchModels(selectedProviderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save API key.');
    }
  };

  const handleClearKey = async () => {
    setMessage(null);
    setError(null);
    try {
      await clearKey({ providerId: selectedProviderId }).unwrap();
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
        providerId: selectedProviderId,
        model: selectedModel?.id,
        activate: true,
      }).unwrap();
      setMessage(`${selectedProvider?.label ?? 'Provider'} is now the active AI provider${selectedModel ? ` (model: ${selectedModel.id})` : ''}.`);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not activate provider.');
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            AI Provider
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Powers the &quot;AI Content Generation&quot; section (a separate tab above). Choose a provider,
            add its API key, then pick a model from that provider&apos;s current catalog. Keys are
            encrypted in the database. The ops chat assistant and voice synthesis still use the OpenAI key
            below — they aren&apos;t on this switch yet.
          </Typography>
        </Box>

        {isLoading ? (
          <CircularProgress size={24} />
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
          <InputLabel id="ai-provider-select-label">Provider</InputLabel>
          <Select
            labelId="ai-provider-select-label"
            label="Provider"
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value as AiProviderId)}
          >
            {providers.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.label}
              </MenuItem>
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
              <Alert severity="info">
                TokenizMyApp-Studio-AI uses the factory Ollama proxy (
                <code>/api/ollama/v1</code>
                ) — no API key is required. Models are loaded from the Mac Studio tunnel automatically.
              </Alert>
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
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
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
              {isActiveProvider ? 'Currently active' : 'Use this provider + model'}
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
}
