'use client';

import { useState, useEffect, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SettingsIcon from '@mui/icons-material/Settings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoIcon from '@mui/icons-material/Info';
import Checkbox from '@mui/material/Checkbox';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { listTemplates, getTemplate } from '@/domain/tenant/template-catalog';
import { useUpdateTenantMutation, useDeployTenantMutation } from '@/store/apis/tenant-api';

// ── Types ─────────────────────────────────────────────────────────────────

interface TenantEditorProps {
  open: boolean;
  onClose: () => void;
  tenant: {
    id: string;
    slug: string;
    displayName: string;
    template: string;
    status: string;
    primaryColor: string;
    secondaryColor: string;
    apiKey?: string | null;
    metadata?: Record<string, unknown>;
  };
}

interface PinEntry {
  role: string;
  pin: string;
}

interface EnvVarEntry {
  key: string;
  value: string;
  sensitive: boolean;
}

interface FormData {
  displayName: string;
  template: string;
  status: string;
  primaryColor: string;
  secondaryColor: string;
  apiKey: string;
  subscriptionTier: string;
  licenseExpiresAt: string;
  googleClientId: string;
  googleClientSecret: string;
  googleProjectId: string;
  postgresUrl: string;
  databaseUrl: string;
  pgUser: string;
  pgPassword: string;
  pins: PinEntry[];
  envVars: EnvVarEntry[];
  templateMode: 'single' | 'suite';
  templates: string[];
  packMode: 'predefined' | 'custom';
  category: string | null;
  prompt: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['draft', 'deploying', 'live', 'error'] as const;

const SUBSCRIPTION_TIERS = ['early', 'basic', 'premium', 'enterprise'] as const;

const DEFAULT_PINS: PinEntry[] = [
  { role: 'DEFAULT_ADMIN_PIN', pin: '' },
  { role: 'DEFAULT_PIN_james', pin: '' },
  { role: 'DEFAULT_PIN_lucas', pin: '' },
];

// ── Metadata helpers ───────────────────────────────────────────────────────

function parseConfigFromMetadata(metadata?: Record<string, unknown> | null) {
  const config = (metadata?.config ?? {}) as Record<string, unknown>;
  const googleAuth = (config.googleAuth ?? {}) as Record<string, string>;
  const database = (config.database ?? {}) as Record<string, string>;
  const pins = (config.pins ?? []) as PinEntry[];
  const envVars = (config.envVars ?? []) as EnvVarEntry[];

  return {
    subscriptionTier: (config.subscriptionTier as string) || 'basic',
    licenseExpiresAt: (config.licenseExpiresAt as string) || '',
    googleClientId: googleAuth.clientId ?? '',
    googleClientSecret: googleAuth.clientSecret ?? '',
    googleProjectId: googleAuth.projectId ?? '',
    postgresUrl: database.postgresUrl ?? '',
    databaseUrl: database.databaseUrl ?? '',
    pgUser: database.pgUser ?? '',
    pgPassword: database.pgPassword ?? '',
    pins: pins.length > 0 ? pins : DEFAULT_PINS.map((p) => ({ ...p })),
    envVars: envVars.length > 0 ? envVars : [],
    templateMode: (config.templateMode as 'single' | 'suite') ?? 'single',
    templates: (config.templates as string[]) ?? [],
    packMode: (config.packMode as 'predefined' | 'custom') ?? 'custom',
    category: (config.category as string) ?? null,
    prompt: (config.prompt as string) ?? '',
  };
}

function buildMetadataFromForm(formData: FormData): Record<string, unknown> {
  return {
    config: {
      subscriptionTier: formData.subscriptionTier,
      licenseExpiresAt: formData.licenseExpiresAt,
      googleAuth: {
        clientId: formData.googleClientId,
        clientSecret: formData.googleClientSecret,
        projectId: formData.googleProjectId,
      },
      database: {
        postgresUrl: formData.postgresUrl,
        databaseUrl: formData.databaseUrl,
        pgUser: formData.pgUser,
        pgPassword: formData.pgPassword,
      },
      pins: formData.pins.filter((p) => p.role.trim() || p.pin.trim()),
      envVars: formData.envVars.filter((e) => e.key.trim()),
      templateMode: formData.templateMode,
      templates: formData.templates,
      packMode: formData.packMode,
      category: formData.category,
      prompt: formData.prompt,
    },
  };
}

function getInitialFormState(tenant: TenantEditorProps['tenant']): FormData {
  const parsed = parseConfigFromMetadata(tenant.metadata);
  return {
    displayName: tenant.displayName,
    template: tenant.template,
    status: tenant.status,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    apiKey: tenant.apiKey ?? '',
    subscriptionTier: parsed.subscriptionTier,
    licenseExpiresAt: parsed.licenseExpiresAt,
    googleClientId: parsed.googleClientId,
    googleClientSecret: parsed.googleClientSecret,
    googleProjectId: parsed.googleProjectId,
    postgresUrl: parsed.postgresUrl,
    databaseUrl: parsed.databaseUrl,
    pgUser: parsed.pgUser,
    pgPassword: parsed.pgPassword,
    pins: parsed.pins,
    envVars: parsed.envVars,
    templateMode: parsed.templateMode,
    templates: parsed.templates,
    packMode: parsed.packMode,
    category: parsed.category,
    prompt: parsed.prompt,
  };
}

// ── Main Component ────────────────────────────────────────────────────────

export function TenantEditor({ open, onClose, tenant }: TenantEditorProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>(() => getInitialFormState(tenant));
  const [showSensitive, setShowSensitive] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [updateTenant, { isLoading, isError, error }] = useUpdateTenantMutation();

  const templates = listTemplates();
  const selectedTemplate = getTemplate(formData.template);

  // Re-initialize form state whenever the dialog opens for a different tenant
  useEffect(() => {
    if (open) {
      setFormData(getInitialFormState(tenant));
      setTabIndex(0);
      setShowSensitive(false);
      setSuccessMessage(null);
      setDeployError(null);
    }
  }, [open, tenant]);

  // Auto-dismiss success alert after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ── String field updater ─────────────────────────

  function setStringField(
    field:
      | 'displayName'
      | 'template'
      | 'status'
      | 'primaryColor'
      | 'secondaryColor'
      | 'apiKey'
      | 'subscriptionTier'
      | 'licenseExpiresAt'
      | 'googleClientId'
      | 'googleClientSecret'
      | 'googleProjectId'
      | 'postgresUrl'
      | 'databaseUrl'
      | 'pgUser'
      | 'pgPassword'
      | 'templateMode',
    value: string,
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function setTemplateMode(value: 'single' | 'suite') {
    setFormData((prev) => ({ ...prev, templateMode: value }));
  }

  function toggleTemplate(templateId: string) {
    setFormData((prev) => {
      const current = prev.templates || [];
      const updated = current.includes(templateId)
        ? current.filter((id: string) => id !== templateId)
        : [...current, templateId];
      return { ...prev, templates: updated };
    });
  }

  // ── PIN handlers ────────────────────────────────

  const updatePin = useCallback(
    (index: number, field: 'role' | 'pin', value: string) => {
      setFormData((prev) => {
        const pins = [...prev.pins];
        pins[index] = { ...pins[index], [field]: value };
        return { ...prev, pins };
      });
    },
    [],
  );

  const addPin = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      pins: [...prev.pins, { role: '', pin: '' }],
    }));
  }, []);

  const removePin = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      pins: prev.pins.filter((_, i) => i !== index),
    }));
  }, []);

  // ── Env var handlers ────────────────────────────

  const updateEnvVar = useCallback(
    (index: number, field: 'key' | 'value' | 'sensitive', value: string | boolean) => {
      setFormData((prev) => {
        const envVars = [...prev.envVars];
        envVars[index] = { ...envVars[index], [field]: value };
        return { ...prev, envVars };
      });
    },
    [],
  );

  const addEnvVar = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      envVars: [...prev.envVars, { key: '', value: '', sensitive: false }],
    }));
  }, []);

  const removeEnvVar = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      envVars: prev.envVars.filter((_, i) => i !== index),
    }));
  }, []);

  // ── API key operations ──────────────────────────

  const generateApiKey = useCallback(() => {
    const key = `tn_${tenant.slug}_${crypto.randomUUID().slice(0, 8)}`;
    setFormData((prev) => ({ ...prev, apiKey: key }));
  }, [tenant.slug]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Clipboard write failure is non-critical
    });
  }, []);

  // ── Deploy to Vercel ──────────────────────────

  const [deployTenant, { isLoading: isDeploying }] = useDeployTenantMutation();

  const handleDeploy = useCallback(async () => {
    try {
      const metadata = buildMetadataFromForm(formData);
      // Save first, then deploy
      await handleSaveInternal();
      // Deploy will push all config env vars to Vercel
      const result = await deployTenant({ slug: tenant.slug }).unwrap();
      if (result.success) {
        setSuccessMessage(`Deployed to Vercel — ${result.data.envCount} env vars synced`);
      }
    } catch {
      setDeployError('Failed to deploy to Vercel');
    }
  }, [formData, tenant.slug, deployTenant]);

  // ── Save ────────────────────────────────────────

  const handleSaveInternal = useCallback(async () => {
    try {
      const metadata = buildMetadataFromForm(formData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: Record<string, any> = {
        slug: tenant.slug,
        displayName: formData.displayName,
        template: formData.template,
        status: formData.status,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        metadata,
      };
      if (formData.apiKey) {
        payload.apiKey = formData.apiKey;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (updateTenant as any)(payload).unwrap();
      setSuccessMessage('Tenant updated successfully.');
    } catch {
      // Error surfaces via isError / error from the mutation hook
    }
  }, [formData, tenant.slug, updateTenant]);

  const handleSave = handleSaveInternal;

  const handleClose = useCallback(() => {
    if (!isLoading && !isDeploying) onClose();
  }, [isLoading, isDeploying, onClose]);

  // ── Error message extraction ────────────────────

  const errorMessage: string | null =
    isError && error && 'data' in error
      ? ((error.data as { error?: string })?.error ?? 'An error occurred while saving.')
      : null;

  // ── Sensitive field renderer ────────────────────

  const renderSensitiveField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    extraProps?: { size?: 'small' | 'medium'; sx?: object },
  ) => (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={showSensitive ? 'text' : 'password'}
      fullWidth
      size={extraProps?.size}
      sx={extraProps?.sx}
      autoComplete="off"
      slotProps={{ inputLabel: { shrink: true } }}
    />
  );

  // ── Render ──────────────────────────────────────

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Edit Tenant: {tenant.displayName}
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={tabIndex}
          onChange={(_e, v: number) => setTabIndex(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab icon={<StorefrontIcon />} label="General" />
          <Tab icon={<VpnKeyIcon />} label="License &amp; API Key" />
          <Tab icon={<SettingsIcon />} label="Configuration" />
        </Tabs>

        {/* ── Tab 0: General ─────────────────── */}
        {tabIndex === 0 && (
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Display Name"
              value={formData.displayName}
              onChange={(e) => setStringField('displayName', e.target.value)}
              required
              fullWidth
              helperText="Human-readable name shown in the header and page titles"
            />

            <FormControl fullWidth>
              <InputLabel>Template</InputLabel>
              <Select
                value={formData.template}
                label="Template"
                onChange={(e) => setStringField('template', e.target.value)}
              >
                {templates.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedTemplate.description}
              </Typography>
            </FormControl>

            {/* ── Suite Mode Toggle ─────────────────── */}
            <FormControl fullWidth>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.templateMode === 'suite'}
                      onChange={(e) => setTemplateMode(e.target.checked ? 'suite' : 'single')}
                      color="primary"
                      size="medium"
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Multi-App Suite Mode
                      </Typography>
                      <Tooltip title="Enable to select multiple templates for a unified multi-app experience">
                        <InfoIcon fontSize="small" color="action" />
                      </Tooltip>
                    </Stack>
                  }
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                When enabled, select multiple templates to create a unified multi-app suite with shared navigation and authentication.
              </Typography>
            </FormControl>

            {/* ── Template Selection Grid (Suite Mode) ─────────────────── */}
            {formData.templateMode === 'suite' && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Select Templates for Suite
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                  Choose one or more templates to include in the suite
                </Typography>
                <Grid container spacing={2}>
                  {templates.filter((t) => t.id !== 'default').map((t) => {
                    const selected = formData.templates?.includes(t.id) ?? false;
                    return (
                      <Grid key={t.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: '100%',
                            borderColor: selected ? 'primary.main' : 'divider',
                            borderWidth: selected ? 2 : 1,
                            bgcolor: selected ? 'rgba(235,61,40,0.06)' : undefined,
                            transition: 'all 0.15s',
                          }}
                        >
                          <CardActionArea onClick={() => toggleTemplate(t.id)} sx={{ height: '100%' }}>
                            <CardContent>
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Checkbox
                                  checked={selected}
                                  tabIndex={-1}
                                  disableRipple
                                  color="primary"
                                  size="small"
                                  sx={{ p: 0, pointerEvents: 'none' }}
                                />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                                  {t.label}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {t.description}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setStringField('status', e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Box
                component="label"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: formData.primaryColor,
                  border: '2px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  flexShrink: 0,
                  mt: 0.5,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setStringField('primaryColor', e.target.value)}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    padding: 0,
                    border: 'none',
                    cursor: 'pointer',
                    opacity: 0,
                  }}
                />
              </Box>
              <TextField
                label="Primary Color"
                value={formData.primaryColor}
                onChange={(e) => setStringField('primaryColor', e.target.value)}
                fullWidth
                size="small"
                helperText="Used for buttons, links, and highlights"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Box
                component="label"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: formData.secondaryColor,
                  border: '2px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  flexShrink: 0,
                  mt: 0.5,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setStringField('secondaryColor', e.target.value)}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    padding: 0,
                    border: 'none',
                    cursor: 'pointer',
                    opacity: 0,
                  }}
                />
              </Box>
              <TextField
                label="Secondary Color"
                value={formData.secondaryColor}
                onChange={(e) => setStringField('secondaryColor', e.target.value)}
                fullWidth
                size="small"
                helperText="Used for accents and secondary elements"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </Stack>
        )}

        {/* ── Tab 1: License & API Key ───────── */}
        {tabIndex === 1 && (
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  API Key
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
                  <TextField
                    label="API Key"
                    value={formData.apiKey}
                    onChange={(e) => setStringField('apiKey', e.target.value)}
                    fullWidth
                    size="small"
                    slotProps={{
                      input: {
                        readOnly: true,
                        sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
                      },
                    }}
                  />
                  <Button variant="outlined" size="small" onClick={generateApiKey}>
                    Generate
                  </Button>
                  <Tooltip title="Copy API key">
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(formData.apiKey)}
                      disabled={!formData.apiKey}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>

            <FormControl fullWidth>
              <InputLabel>Subscription Tier</InputLabel>
              <Select
                value={formData.subscriptionTier}
                label="Subscription Tier"
                onChange={(e) => setStringField('subscriptionTier', e.target.value)}
              >
                {SUBSCRIPTION_TIERS.map((tier) => (
                  <MenuItem key={tier} value={tier}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="License Expiry"
              type="date"
              value={formData.licenseExpiresAt}
              onChange={(e) => setStringField('licenseExpiresAt', e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Current Status:
                </Typography>
                <Chip
                  label={formData.status}
                  size="small"
                  color={
                    formData.status === 'live'
                      ? 'success'
                      : formData.status === 'error'
                        ? 'error'
                        : formData.status === 'deploying'
                          ? 'warning'
                          : 'default'
                  }
                />
              </Stack>
            </Paper>
          </Stack>
        )}

        {/* ── Tab 2: Configuration ───────────── */}
        {tabIndex === 2 && (
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showSensitive}
                  onChange={(_e, v) => setShowSensitive(v)}
                />
              }
              label="Show sensitive values"
            />

            {/* Google OAuth */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Google OAuth
              </Typography>
              <Stack spacing={2}>
                {renderSensitiveField('Client ID', formData.googleClientId, (v) =>
                  setStringField('googleClientId', v),
                )}
                {renderSensitiveField('Client Secret', formData.googleClientSecret, (v) =>
                  setStringField('googleClientSecret', v),
                )}
                <TextField
                  label="Project ID"
                  value={formData.googleProjectId}
                  onChange={(e) => setStringField('googleProjectId', e.target.value)}
                  fullWidth
                />
              </Stack>
            </Box>

            <Divider />

            {/* Database */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Database
              </Typography>
              <Stack spacing={2}>
                {renderSensitiveField('POSTGRES_URL', formData.postgresUrl, (v) =>
                  setStringField('postgresUrl', v),
                )}
                {renderSensitiveField('DATABASE_URL', formData.databaseUrl, (v) =>
                  setStringField('databaseUrl', v),
                )}
                <TextField
                  label="PGUSER"
                  value={formData.pgUser}
                  onChange={(e) => setStringField('pgUser', e.target.value)}
                  fullWidth
                />
                {renderSensitiveField('PGPASSWORD', formData.pgPassword, (v) =>
                  setStringField('pgPassword', v),
                )}
              </Stack>
            </Box>

            <Divider />

            {/* PIN Codes */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                PIN Codes
              </Typography>
              <Stack spacing={1.5}>
                {formData.pins.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No PIN codes configured. Add one below.
                  </Typography>
                )}
                {formData.pins.map((pin, idx) => (
                  <Stack key={idx} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <TextField
                      label="Role"
                      value={pin.role}
                      onChange={(e) => updatePin(idx, 'role', e.target.value)}
                      size="small"
                      placeholder="DEFAULT_ADMIN_PIN"
                      sx={{ flex: 1 }}
                    />
                    {renderSensitiveField('PIN', pin.pin, (v) => updatePin(idx, 'pin', v), {
                      size: 'small',
                      sx: { flex: 1 },
                    })}
                    <IconButton
                      onClick={() => removePin(idx)}
                      color="error"
                      size="small"
                      sx={{ flexShrink: 0 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  size="small"
                  onClick={addPin}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add PIN
                </Button>
              </Stack>
            </Box>

            <Divider />

            {/* Custom Env Vars */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Custom Env Vars
              </Typography>
              <Stack spacing={1.5}>
                {formData.envVars.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No custom environment variables configured. Add one below.
                  </Typography>
                )}
                {formData.envVars.map((ev, idx) => (
                  <Stack key={idx} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <TextField
                      label="Key"
                      value={ev.key}
                      onChange={(e) => updateEnvVar(idx, 'key', e.target.value)}
                      size="small"
                      placeholder="ENV_VAR_NAME"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Value"
                      value={ev.value}
                      onChange={(e) => updateEnvVar(idx, 'value', e.target.value)}
                      size="small"
                      type={ev.sensitive && !showSensitive ? 'password' : 'text'}
                      sx={{ flex: 1 }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={ev.sensitive}
                          onChange={(e) => updateEnvVar(idx, 'sensitive', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Sensitive"
                      sx={{ flexShrink: 0, mr: 0 }}
                    />
                    <IconButton
                      onClick={() => removeEnvVar(idx)}
                      color="error"
                      size="small"
                      sx={{ flexShrink: 0 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  size="small"
                  onClick={addEnvVar}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Env Var
                </Button>
              </Stack>
            </Box>
          </Stack>
        )}

        {/* Feedback alerts */}
        {successMessage ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            {successMessage}
          </Alert>
        ) : null}
        {errorMessage ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        ) : null}
        {deployError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {deployError}
          </Alert>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading || isDeploying}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={handleDeploy}
          disabled={isLoading || isDeploying}
          startIcon={
            isDeploying ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />
          }
          sx={{ mr: 'auto' }}
        >
          {isDeploying ? 'Deploying...' : 'Deploy to Vercel'}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading || isDeploying}
          startIcon={
            isLoading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />
          }
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
