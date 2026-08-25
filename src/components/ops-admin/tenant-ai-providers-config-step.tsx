'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { AI_PROVIDERS, type AiProviderDef } from '@/lib/ai-providers-catalog';
import type { AiModelOption } from '@/store/apis/config-api';
import {
  useGetTenantAiProviderStatusQuery,
  useSaveTenantAiProviderMutation,
  usePreviewAiModelsMutation,
  useLazyGetTenantAiModelsQuery,
} from '@/store/apis/tenant-api';

export interface AiProviderWizardValue {
  catalog: AiProviderDef[];
  /** Plaintext keys keyed by keySecretName (never round-tripped from GET). */
  apiKeysBySecretName: Record<string, string>;
  activeProviderId: string;
  activeModel: string;
}

export function emptyAiProviderWizardValue(): AiProviderWizardValue {
  return {
    catalog: AI_PROVIDERS.map((p) => ({ ...p })),
    apiKeysBySecretName: {},
    activeProviderId: 'openai',
    activeModel: AI_PROVIDERS.find((p) => p.id === 'openai')?.defaultModel ?? 'gpt-4o',
  };
}

function blankCustomProvider(index: number): AiProviderDef {
  return {
    id: `custom-provider-${index}`,
    label: 'Custom OpenAI-compatible',
    keySecretName: `CUSTOM_PROVIDER_${index}_API_KEY`,
    keyEnvVar: `CUSTOM_PROVIDER_${index}_API_KEY`,
    keyPlaceholder: 'API key',
    chatCompletionsUrl: 'https://api.example.com/v1/chat/completions',
    modelsUrl: 'https://api.example.com/v1/models',
    modelsRequireAuth: true,
    docsUrl: 'https://example.com/docs',
  };
}

export interface TenantAiProvidersConfigStepProps {
  /**
   * Lifted state mode (Create Tenant / Create App) — parent owns value.
   * When omitted with tenantSlug, loads/saves via admin API (Edit Tenant).
   */
  value?: AiProviderWizardValue;
  onChange?: (next: AiProviderWizardValue) => void;
  /** Edit mode — load/save against tenant (or suite app) DB. */
  tenantSlug?: string;
  appId?: string;
}

/**
 * Full AI provider catalog editor: per-provider metadata + API key + model
 * list + active selection. Prefills from builtin AI_PROVIDERS; supports add/
 * remove for custom OpenAI-compatible backends.
 */
export function TenantAiProvidersConfigStep({
  value: controlledValue,
  onChange,
  tenantSlug,
  appId,
}: TenantAiProvidersConfigStepProps) {
  const isControlled = Boolean(controlledValue && onChange);
  const [localValue, setLocalValue] = useState<AiProviderWizardValue>(emptyAiProviderWizardValue);
  const value = controlledValue ?? localValue;

  const setValue = useCallback((next: AiProviderWizardValue) => {
    if (isControlled && onChange) onChange(next);
    else setLocalValue(next);
  }, [isControlled, onChange]);

  const patch = useCallback((partial: Partial<AiProviderWizardValue>) => {
    setValue({ ...value, ...partial });
  }, [setValue, value]);

  const { data, isLoading, isError, refetch } = useGetTenantAiProviderStatusQuery(
    { slug: tenantSlug ?? '', appId },
    { skip: !tenantSlug || isControlled },
  );
  const [saveProvider, { isLoading: isSaving }] = useSaveTenantAiProviderMutation();
  const [previewModels, { isLoading: isPreviewLoading }] = usePreviewAiModelsMutation();
  const [fetchModels, { isFetching: isFetchLoading }] = useLazyGetTenantAiModelsQuery();

  const [selectedId, setSelectedId] = useState(value.activeProviderId);
  const [models, setModels] = useState<AiModelOption[]>([]);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from GET in edit mode
  useEffect(() => {
    if (isControlled || !data?.data || hydrated) return;
    const status = data.data;
    const catalog = status.catalog?.length
      ? status.catalog.map((p) => ({ ...p }))
      : AI_PROVIDERS.map((p) => ({ ...p }));
    setLocalValue({
      catalog,
      apiKeysBySecretName: {},
      activeProviderId: status.activeProviderId,
      activeModel: status.activeModel ?? '',
    });
    setSelectedId(status.activeProviderId);
    setHydrated(true);
  }, [data, isControlled, hydrated]);

  useEffect(() => {
    if (!value.catalog.some((p) => p.id === selectedId) && value.catalog[0]) {
      setSelectedId(value.catalog[0].id);
    }
  }, [value.catalog, selectedId]);

  const selected = useMemo(
    () => value.catalog.find((p) => p.id === selectedId) ?? value.catalog[0] ?? null,
    [value.catalog, selectedId],
  );

  const selectedModelOption = useMemo(() => {
    const id = value.activeProviderId === selectedId ? value.activeModel : selected?.defaultModel;
    if (!id) return null;
    return models.find((m) => m.id === id) ?? { id, label: id };
  }, [models, value.activeModel, value.activeProviderId, selectedId, selected?.defaultModel]);

  const updateProvider = (id: string, patchDef: Partial<AiProviderDef>) => {
    const catalog = value.catalog.map((p) => (p.id === id ? { ...p, ...patchDef } : p));
    // If id itself changed, migrate selection + key map
    let apiKeysBySecretName = value.apiKeysBySecretName;
    let activeProviderId = value.activeProviderId;
    let nextSelected = selectedId;
    if (patchDef.id && patchDef.id !== id) {
      nextSelected = patchDef.id;
      if (activeProviderId === id) activeProviderId = patchDef.id;
    }
    if (patchDef.keySecretName && selected) {
      const oldKey = value.apiKeysBySecretName[selected.keySecretName];
      if (oldKey) {
        apiKeysBySecretName = { ...apiKeysBySecretName };
        delete apiKeysBySecretName[selected.keySecretName];
        apiKeysBySecretName[patchDef.keySecretName] = oldKey;
      }
    }
    setValue({ ...value, catalog, apiKeysBySecretName, activeProviderId });
    if (nextSelected !== selectedId) setSelectedId(nextSelected);
  };

  const handleAddProvider = () => {
    const custom = blankCustomProvider(value.catalog.length + 1);
    setValue({ ...value, catalog: [...value.catalog, custom] });
    setSelectedId(custom.id);
    setModels([]);
  };

  const handleRemoveProvider = (id: string) => {
    if (value.catalog.length <= 1) return;
    const catalog = value.catalog.filter((p) => p.id !== id);
    const removed = value.catalog.find((p) => p.id === id);
    const apiKeysBySecretName = { ...value.apiKeysBySecretName };
    if (removed) delete apiKeysBySecretName[removed.keySecretName];
    const activeProviderId = value.activeProviderId === id ? catalog[0].id : value.activeProviderId;
    setValue({
      ...value,
      catalog,
      apiKeysBySecretName,
      activeProviderId,
      activeModel: activeProviderId === value.activeProviderId ? value.activeModel : (catalog[0].defaultModel ?? ''),
    });
    setSelectedId(activeProviderId === id ? catalog[0].id : selectedId === id ? catalog[0].id : selectedId);
    setModels([]);
  };

  const handleLoadModels = async () => {
    if (!selected) return;
    setModelsError(null);
    try {
      if (tenantSlug && !isControlled) {
        const result = await fetchModels({
          slug: tenantSlug,
          appId,
          providerId: selected.id,
        }).unwrap();
        setModels(result.data?.models ?? []);
      } else {
        const apiKey = value.apiKeysBySecretName[selected.keySecretName];
        const result = await previewModels({
          providerId: selected.id,
          apiKey: apiKey || undefined,
          provider: selected,
        }).unwrap();
        setModels(result.data?.models ?? []);
      }
    } catch (err) {
      setModelsError(err instanceof Error ? err.message : 'Could not load models.');
      setModels([]);
    }
  };

  const handleSave = async () => {
    if (!tenantSlug || isControlled) return;
    setMessage(null);
    setError(null);
    try {
      await saveProvider({
        slug: tenantSlug,
        appId,
        catalog: value.catalog,
        apiKeysBySecretName: Object.fromEntries(
          Object.entries(value.apiKeysBySecretName).filter(([, v]) => v.trim()),
        ),
        providerId: value.activeProviderId,
        model: value.activeModel || undefined,
        activate: Boolean(value.activeProviderId && value.activeModel),
      }).unwrap();
      setMessage('AI provider catalog saved.');
      setHydrated(false);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save AI provider config.');
    }
  };

  const configuredChip = (p: AiProviderDef) => {
    const hasLocalKey = Boolean(value.apiKeysBySecretName[p.keySecretName]?.trim());
    const remote = data?.data?.providers.find((x) => x.id === p.id);
    if (hasLocalKey || remote?.configured) return 'success' as const;
    return 'default' as const;
  };

  if (tenantSlug && !isControlled && isLoading && !hydrated) {
    return <CircularProgress size={24} />;
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>AI Providers</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure OpenAI-compatible providers for this {appId ? 'app' : 'tenant'}. Built-in entries
          are the seed template — add custom backends as needed. Listing models requires an API key
          ({`modelsRequireAuth`}).
        </Typography>
      </Box>

      {isError && !isControlled ? <Alert severity="error">Could not load AI provider status.</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {message ? <Alert severity="success">{message}</Alert> : null}
      {modelsError ? <Alert severity="error">{modelsError}</Alert> : null}

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        {value.catalog.map((p) => (
          <Chip
            key={p.id}
            label={`${p.label}${p.id === value.activeProviderId ? ' (active)' : ''}`}
            color={p.id === value.activeProviderId ? 'primary' : configuredChip(p)}
            variant={p.id === value.activeProviderId ? 'filled' : 'outlined'}
            size="small"
            onClick={() => {
              setSelectedId(p.id);
              setModels([]);
            }}
          />
        ))}
        <Button size="small" startIcon={<AddIcon />} onClick={handleAddProvider}>
          Add provider
        </Button>
      </Stack>

      {selected && (
        <Stack spacing={2} component="section">
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Provider details
            </Typography>
            <IconButton
              aria-label="Remove provider"
              size="small"
              disabled={value.catalog.length <= 1}
              onClick={() => handleRemoveProvider(selected.id)}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label="Id"
              size="small"
              fullWidth
              value={selected.id}
              onChange={(e) => updateProvider(selected.id, { id: e.target.value.trim() })}
              helperText="Lowercase slug"
            />
            <TextField
              label="Label"
              size="small"
              fullWidth
              value={selected.label}
              onChange={(e) => updateProvider(selected.id, { label: e.target.value })}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label="Key secret name"
              size="small"
              fullWidth
              value={selected.keySecretName}
              onChange={(e) => updateProvider(selected.id, { keySecretName: e.target.value.trim() })}
            />
            <TextField
              label="Key env var"
              size="small"
              fullWidth
              value={selected.keyEnvVar}
              onChange={(e) => updateProvider(selected.id, { keyEnvVar: e.target.value.trim() })}
            />
          </Stack>

          <TextField
            label="Key placeholder"
            size="small"
            fullWidth
            value={selected.keyPlaceholder}
            onChange={(e) => updateProvider(selected.id, { keyPlaceholder: e.target.value })}
          />

          <TextField
            label="Chat completions URL"
            size="small"
            fullWidth
            value={selected.chatCompletionsUrl}
            onChange={(e) => updateProvider(selected.id, { chatCompletionsUrl: e.target.value.trim() })}
          />
          <TextField
            label="Models URL"
            size="small"
            fullWidth
            value={selected.modelsUrl}
            onChange={(e) => updateProvider(selected.id, { modelsUrl: e.target.value.trim() })}
          />
          <TextField
            label="Docs URL"
            size="small"
            fullWidth
            value={selected.docsUrl}
            onChange={(e) => updateProvider(selected.id, { docsUrl: e.target.value.trim() })}
          />
          <TextField
            label="Default model"
            size="small"
            fullWidth
            value={selected.defaultModel ?? ''}
            onChange={(e) => updateProvider(selected.id, {
              defaultModel: e.target.value.trim() || undefined,
            })}
          />

          <FormControlLabel
            control={(
              <Switch
                checked={selected.modelsRequireAuth}
                onChange={(e) => updateProvider(selected.id, { modelsRequireAuth: e.target.checked })}
              />
            )}
            label="Require API key to list models"
          />

          <Divider />

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <TextField
              label={`${selected.label} API key`}
              type="password"
              size="small"
              fullWidth
              value={value.apiKeysBySecretName[selected.keySecretName] ?? ''}
              onChange={(e) => patch({
                apiKeysBySecretName: {
                  ...value.apiKeysBySecretName,
                  [selected.keySecretName]: e.target.value,
                },
              })}
              placeholder={selected.keyPlaceholder}
              autoComplete="off"
              helperText="Paste a key to store (encrypted). Never shown after save in edit mode."
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => void handleLoadModels()}
              disabled={isPreviewLoading || isFetchLoading}
              sx={{ mt: 0.5, minWidth: 130 }}
            >
              {(isPreviewLoading || isFetchLoading) ? 'Loading…' : 'Load models'}
            </Button>
          </Stack>

          <Autocomplete
            options={models}
            loading={isPreviewLoading || isFetchLoading}
            value={selectedModelOption}
            onChange={(_, opt) => {
              if (!opt) return;
              patch({
                activeProviderId: selected.id,
                activeModel: opt.id,
              });
            }}
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
                label="Active model"
                size="small"
                helperText={
                  models.length === 0
                    ? 'Click "Load models" (requires API key when modelsRequireAuth is on).'
                    : `${models.length} model(s) available.`
                }
              />
            )}
          />

          <TextField
            select
            label="Active provider"
            size="small"
            fullWidth
            value={value.activeProviderId}
            onChange={(e) => {
              const id = e.target.value;
              const def = value.catalog.find((p) => p.id === id);
              patch({
                activeProviderId: id,
                activeModel: def?.defaultModel ?? value.activeModel,
              });
              setSelectedId(id);
            }}
          >
            {value.catalog.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>
            ))}
          </TextField>

          {tenantSlug && !isControlled ? (
            <Button
              variant="contained"
              onClick={() => void handleSave()}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save AI providers'}
            </Button>
          ) : null}
        </Stack>
      )}
    </Stack>
  );
}
