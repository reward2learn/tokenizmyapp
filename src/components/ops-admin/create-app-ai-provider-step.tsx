'use client';

import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AI_PROVIDERS, getAiProvider, type AiProviderId } from '@/lib/ai-providers-catalog';
import type { AiModelOption } from '@/store/apis/config-api';
import { usePreviewAiModelsMutation } from '@/store/apis/tenant-api';

export interface CreateAppAiProviderStepProps {
  providerId: AiProviderId;
  onProviderIdChange: (id: AiProviderId) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  model: string;
  onModelChange: (model: string) => void;
}

/**
 * AI Provider selection for the Create App Wizard — collects the choice as
 * local wizard state only (providerId/apiKey/model props, lifted to the
 * wizard's own state). Nothing is saved until the wizard actually creates
 * the app, at which point the caller pushes this via saveTenantAiProvider
 * with the newly-assigned appId — there's no tenant/app database to write
 * into yet while this step is on screen.
 *
 * Model listing uses the "preview" endpoint (an explicit key in the
 * request, not one resolved from any database) for the same reason.
 */
export function CreateAppAiProviderStep({
  providerId, onProviderIdChange, apiKey, onApiKeyChange, model, onModelChange,
}: CreateAppAiProviderStepProps) {
  const [previewModels, { isLoading: isLoadingModels }] = usePreviewAiModelsMutation();
  const [models, setModels] = useState<AiModelOption[]>([]);
  const [modelsError, setModelsError] = useState<string | null>(null);

  const provider = getAiProvider(providerId);
  const selectedModel = useMemo(
    () => models.find((m) => m.id === model) ?? (model ? { id: model, label: model } : null),
    [models, model],
  );

  const handleLoadModels = async () => {
    setModelsError(null);
    try {
      const result = await previewModels({ providerId, apiKey: apiKey || undefined }).unwrap();
      setModels(result.data?.models ?? []);
    } catch (err) {
      setModelsError(err instanceof Error ? err.message : 'Could not load models.');
      setModels([]);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>AI Provider</Typography>
        <Typography variant="body2" color="text.secondary">
          Powers AI Content Generation and the chat assistant on this app once it&apos;s created. Choose a
          provider, add its API key, load its current model catalog, then pick a model.
        </Typography>
      </Box>

      <FormControl size="small" fullWidth>
        <InputLabel id="create-app-ai-provider-label">Provider</InputLabel>
        <Select
          labelId="create-app-ai-provider-label"
          label="Provider"
          value={providerId}
          onChange={(e) => {
            onProviderIdChange(e.target.value as AiProviderId);
            setModels([]);
            onModelChange('');
          }}
        >
          {AI_PROVIDERS.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {provider && (
        <>
          <Typography variant="caption" color="text.secondary">
            <Link href={provider.docsUrl} target="_blank" rel="noopener noreferrer">{provider.docsUrl}</Link>
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <TextField
              label={`${provider.label} API key`}
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder={provider.keyPlaceholder}
              fullWidth
              size="small"
              autoComplete="off"
              sx={{ flex: 1 }}
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => void handleLoadModels()}
              disabled={isLoadingModels}
              sx={{ mt: 0.5, minWidth: 130 }}
            >
              {isLoadingModels ? 'Loading…' : 'Load models'}
            </Button>
          </Stack>

          {modelsError ? <Alert severity="error">{modelsError}</Alert> : null}

          <Autocomplete
            options={models}
            loading={isLoadingModels}
            value={selectedModel}
            onChange={(_, value) => onModelChange(value?.id ?? '')}
            getOptionLabel={(m) => m.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
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
                  models.length === 0
                    ? 'Click "Load models" to fetch this provider\'s current catalog.'
                    : `${models.length} model(s) currently available from ${provider.label}.`
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
        </>
      )}
    </Stack>
  );
}
