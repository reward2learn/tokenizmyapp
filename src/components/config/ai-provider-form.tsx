'use client';

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
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { isPending } from '@reduxjs/toolkit';
import {
  useGetAiProviderStatusQuery,
  useGetAiModelsQuery,
  type AiModelOption,
} from '@/store/apis/config-api';
import {
  activateAiProviderSelection,
  clearAiProviderKeyDraft,
  saveAiProviderKeyDraft,
  setAiProviderApiKeyDraft,
  setAiProviderId,
  setAiProviderModel,
} from '@/store/ai-provider-config-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

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
 *
 * UI state lives in aiProviderConfig slice; side effects in ai-provider-listener-middleware.
 */
export function AiProviderForm() {
  const dispatch = useAppDispatch();
  const {
    selectedProviderId,
    selectedModel,
    apiKeyDraft,
    message,
    error,
  } = useAppSelector((state) => state.aiProviderConfig);

  const { data, isLoading, isError } = useGetAiProviderStatusQuery();
  const status = data?.data;
  const providers = status?.providers ?? [];

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);
  const isActiveProvider = status?.activeProviderId === selectedProviderId;
  const isCurrentSelection =
    isActiveProvider
    && selectedModel?.id != null
    && selectedModel.id === status?.activeModel;
  const keylessProvider = selectedProvider?.requiresApiKey === false;

  const { data: modelsData, isFetching: isLoadingModels } = useGetAiModelsQuery(
    selectedProviderId,
    { skip: !selectedProvider?.configured },
  );
  const models = modelsData?.data?.models ?? [];

  const isSaving = useAppSelector((state) =>
    isPending(saveAiProviderKeyDraft, activateAiProviderSelection)(state),
  );
  const isClearing = useAppSelector((state) => isPending(clearAiProviderKeyDraft)(state));

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
                onClick={() => dispatch(setAiProviderId(p.id))}
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
            onChange={(e) => dispatch(setAiProviderId(e.target.value))}
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
                {selectedProviderId === 'ollama-studio' ? (
                  <>
                    TokenizMyApp-Studio-AI uses the factory Ollama proxy (
                    <code>/api/ollama/v1</code>
                    ) — no API key is required. Models are loaded from the Mac Studio tunnel automatically.
                  </>
                ) : selectedProviderId === 'deepseek-studio' ? (
                  <>
                    StarWorld DeepSeek uses the Mac Studio MLX tunnel at{' '}
                    <code>deepseek.tokenizin.com</code>
                    {' '}— no API key is required. Load models to pick a variant
                    (e.g. <code>:no-think</code>, <code>:think</code>).
                  </>
                ) : (
                  'This provider does not require an API key.'
                )}
              </Alert>
            ) : (
              <>
                <TextField
                  label={`${selectedProvider.label} API key`}
                  type="password"
                  value={apiKeyDraft}
                  onChange={(e) => dispatch(setAiProviderApiKeyDraft(e.target.value))}
                  placeholder={selectedProvider.keyPlaceholder}
                  fullWidth
                  autoComplete="off"
                  helperText="Paste a new key to replace the stored value. The key is never shown after saving."
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    variant="contained"
                    onClick={() => void dispatch(saveAiProviderKeyDraft())}
                    disabled={isSaving || !apiKeyDraft.trim()}
                  >
                    {isSaving ? 'Saving…' : 'Save API key'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => void dispatch(clearAiProviderKeyDraft())}
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
              onChange={(_, value: AiModelOption | null) => dispatch(setAiProviderModel(value))}
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
              onClick={() => void dispatch(activateAiProviderSelection())}
              disabled={isSaving || !selectedProvider.configured || !selectedModel || isCurrentSelection}
            >
              {isCurrentSelection
                ? 'Currently active'
                : isActiveProvider
                  ? 'Update active model'
                  : 'Use this provider + model'}
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
}
