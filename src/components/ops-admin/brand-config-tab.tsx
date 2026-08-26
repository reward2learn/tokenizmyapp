'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGetAdminBrandConfigQuery, useUpdateAdminBrandConfigMutation } from '@/store/apis/admin-api';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { LoadingGraphicUpload } from '@/components/branding/loading-graphic-upload';
import SaveIcon from '@mui/icons-material/Save';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { ThemeMode } from '@/theme/design-tokens';

interface BrandConfig {
  tenantSlug: string;
  tenantDisplayName: string;
  tenantTemplate: string;
  brandLogoText: string;
  brandLogoUrl: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  brandLoadingGraphicUrl?: string;
  tenantLoadingGraphicUrl?: string | null;
  loadingGraphicUrl?: string | null;
  themeMode: ThemeMode;
  updatedAt?: string;
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

function isValidHex(c: string): boolean {
  return HEX_REGEX.test(c);
}

interface BrandConfigTabProps {
  /** When provided, fetches/writes brand config for this tenant slug instead of the deployment's own row */
  tenantSlug?: string;
  /** Suite-mode app id — row becomes "{tenantSlug}__{appId}" instead of "{tenantSlug}" */
  appId?: string | null;
}

export function BrandConfigTab({ tenantSlug, appId }: BrandConfigTabProps = {}) {
  const scope = tenantSlug ? { tenantSlug, appId: appId ?? undefined } : undefined;
  const { data: brandData, isLoading } = useGetAdminBrandConfigQuery(scope);
  const [updateBrandConfig, { isLoading: isSaving }] = useUpdateAdminBrandConfigMutation();

  const [config, setConfig] = useState<BrandConfig>({
    tenantSlug: '',
    tenantDisplayName: '',
    tenantTemplate: 'default',
    brandLogoText: '',
    brandLogoUrl: '',
    brandPrimaryColor: '#eb3d28',
    brandSecondaryColor: '#0af9fe',
    themeMode: 'system',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loadingGraphicPreview, setLoadingGraphicPreview] = useState<string | null>(null);
  const [tenantLoadingGraphicPreview, setTenantLoadingGraphicPreview] = useState<string | null>(null);

  // ── Map RTK Query response into local config state ────
  useEffect(() => {
    if (brandData?.success && brandData.data) {
      const c = brandData.data as BrandConfig;
      setConfig({
        ...c,
        themeMode: isThemeMode(c.themeMode) ? c.themeMode : 'system',
      });
      setLogoPreview(c.brandLogoUrl || null);
      setLoadingGraphicPreview(c.brandLoadingGraphicUrl?.trim() ? c.brandLoadingGraphicUrl : null);
      setTenantLoadingGraphicPreview(c.tenantLoadingGraphicUrl ?? null);
    } else if (brandData?.success === false) {
      setError(brandData.error ?? 'Failed to load brand config');
    }
  }, [brandData]);

  const handleSave = useCallback(async () => {
    setError(null);
    setSuccess(false);

    // Validate hex colors
    if (!isValidHex(config.brandPrimaryColor)) {
      setError('Primary color must be a valid hex color (e.g. #eb3d28)');
      return;
    }
    if (!isValidHex(config.brandSecondaryColor)) {
      setError('Secondary color must be a valid hex color (e.g. #0af9fe)');
      return;
    }

    try {
      const formData = new FormData();
      if (config.tenantSlug) formData.append('tenantSlug', config.tenantSlug);
      if (config.tenantDisplayName) formData.append('tenantDisplayName', config.tenantDisplayName);
      if (config.tenantTemplate) formData.append('tenantTemplate', config.tenantTemplate);
      formData.append('brandLogoText', config.brandLogoText);
      formData.append('brandPrimaryColor', config.brandPrimaryColor);
      formData.append('brandSecondaryColor', config.brandSecondaryColor);
      formData.append('themeMode', config.themeMode);

      // Include the logo URL if we have one (either existing or newly uploaded)
      if (logoPreview && logoPreview.startsWith('data:')) {
        formData.append('brandLogoUrl', logoPreview);
      } else if (config.brandLogoUrl && config.brandLogoUrl.startsWith('data:')) {
        formData.append('brandLogoUrl', config.brandLogoUrl);
      }

      if (appId) {
        formData.append('brandLoadingGraphicUrl', loadingGraphicPreview ?? '');
      } else {
        formData.append('tenantLoadingGraphicUrl', tenantLoadingGraphicPreview ?? '');
      }

      const payload = await updateBrandConfig({ data: formData, tenantSlug, appId: appId ?? undefined }).unwrap();
      if (payload.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(payload.error ?? 'Save failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [config.tenantSlug, config.tenantDisplayName, config.tenantTemplate, config.brandLogoText, config.brandLogoUrl, config.brandPrimaryColor, config.brandSecondaryColor, config.themeMode, logoPreview, loadingGraphicPreview, tenantLoadingGraphicPreview, updateBrandConfig, tenantSlug, appId]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Logo image must be under 2 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const handleRemoveLogo = useCallback(() => {
    setLogoPreview(null);
    setConfig((prev) => ({ ...prev, brandLogoUrl: '' }));
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <BrandedLoadingIndicator  />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Brand Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure the tenant identity, logo, colors, and branding displayed across the application.
          Changes take effect immediately.
        </Typography>

        <Stack spacing={3}>
          {/* ── Tenant Identity ────────────────────────── */}
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Tenant Identity
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These settings define the tenant&apos;s identity. The slug is used for subdomain URL derivation
              (e.g. &quot;redrubybali&quot; → redrubybali.vercel.app).
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Tenant Slug"
                placeholder="e.g. redrubybali"
                value={config.tenantSlug}
                onChange={(e) => setConfig((prev) => ({ ...prev, tenantSlug: e.target.value }))}
                fullWidth
                helperText="Subdomain identifier — lowercase, no spaces (e.g. 'mybusiness'). Leave empty to use env var default."
              />
              <TextField
                label="Display Name"
                placeholder="e.g. Red Ruby Bali"
                value={config.tenantDisplayName}
                onChange={(e) => setConfig((prev) => ({ ...prev, tenantDisplayName: e.target.value }))}
                fullWidth
                helperText="Human-readable business name shown in the header, chat labels, and page titles."
              />
              <TextField
                label="Template"
                placeholder="e.g. nightclub-bar"
                value={config.tenantTemplate}
                onChange={(e) => setConfig((prev) => ({ ...prev, tenantTemplate: e.target.value }))}
                fullWidth
                helperText="Template category for default pages and navigation (e.g. 'nightclub-bar', 'restaurant', 'hotel')."
              />
            </Stack>
          </Paper>

          {/* ── Logo text ─────────────────────────────── */}
          <TextField
            label="Logo Text"
            placeholder="e.g. Red Ruby Bali"
            value={config.brandLogoText}
            onChange={(e) => setConfig((prev) => ({ ...prev, brandLogoText: e.target.value }))}
            fullWidth
            helperText="This text appears in the top-left header when no logo image is set."
          />

          {/* ── Logo image upload ─────────────────────── */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Logo Image
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              Upload a logo image (PNG, JPG, SVG, WebP — max 2 MB). Replaces the text logo in the header.
            </Typography>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Avatar
                src={logoPreview ?? undefined}
                variant="rounded"
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  '& img': { objectFit: 'contain' },
                }}
              >
                <ImageIcon color="disabled" />
              </Avatar>

              <Button variant="outlined" component="label" startIcon={<ImageIcon />}>
                {logoPreview ? 'Replace Image' : 'Upload Logo'}
                <input
                  hidden
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
              </Button>

              {logoPreview ? (
                <Button variant="text" color="error" startIcon={<DeleteIcon />} onClick={handleRemoveLogo}>
                  Remove
                </Button>
              ) : null}
            </Stack>

            {/* Live preview */}
            {config.brandLogoText || logoPreview ? (
              <Paper
                variant="outlined"
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'background.default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                  Preview:
                </Typography>
                {logoPreview ? (
                  <Box
                    component="img"
                    src={logoPreview}
                    alt="Logo preview"
                    sx={{ height: 28, width: 'auto', maxWidth: 160, objectFit: 'contain' }}
                  />
                ) : (
                  <Typography variant="subtitle1" sx={{ pl: 1, fontWeight: 800, color: config.brandPrimaryColor }}>
                    {config.brandLogoText || '(no logo text set)'}
                  </Typography>
                )}
              </Paper>
            ) : null}
          </Box>

          {/* ── Loading graphic ───────────────────────── */}
          <LoadingGraphicUpload
            value={appId ? loadingGraphicPreview : tenantLoadingGraphicPreview}
            inheritedValue={appId ? tenantLoadingGraphicPreview : null}
            showInheritance={Boolean(appId)}
            onChange={async (next) => {
              if (appId) setLoadingGraphicPreview(next);
              else setTenantLoadingGraphicPreview(next);
            }}
            onClear={async () => {
              if (appId) setLoadingGraphicPreview(null);
              else setTenantLoadingGraphicPreview(null);
            }}
            helperText={
              appId
                ? 'Override the tenant loading graphic for this app only. Leave empty to inherit the tenant default.'
                : 'Default loading graphic for this tenant and all inner apps unless an app overrides it.'
            }
          />

          {/* ── Brand colors ──────────────────────────── */}
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <PaletteIcon color="primary" />
              <Typography variant="subtitle2">Brand Colors</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              These colors are used as the application&apos;s primary and secondary theme colors
              (buttons, links, highlights, accents). Enter hex values (e.g. <code>#eb3d28</code>).
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {/* Primary color */}
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Primary Color"
                  placeholder="#eb3d28"
                  value={config.brandPrimaryColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, brandPrimaryColor: e.target.value }))}
                  error={config.brandPrimaryColor.length > 0 && !isValidHex(config.brandPrimaryColor)}
                  helperText={
                    config.brandPrimaryColor.length > 0 && !isValidHex(config.brandPrimaryColor)
                      ? 'Invalid hex color'
                      : 'Used for buttons, links, and highlights'
                  }
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              bgcolor: isValidHex(config.brandPrimaryColor) ? config.brandPrimaryColor : '#eb3d28',
                              border: '1px solid',
                              borderColor: 'divider',
                              flexShrink: 0,
                            }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                {/* Native color picker */}
                <input
                  type="color"
                  value={isValidHex(config.brandPrimaryColor) ? config.brandPrimaryColor : '#eb3d28'}
                  onChange={(e) => setConfig((prev) => ({ ...prev, brandPrimaryColor: e.target.value }))}
                  style={{
                    width: '100%',
                    height: 32,
                    marginTop: 4,
                    padding: 0,
                    border: '1px solid', borderColor: 'divider',
                    borderRadius: 6,
                    background: 'none',
                    cursor: 'pointer',
                  }}
                />
              </Box>

              {/* Secondary color */}
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Secondary Color"
                  placeholder="#0af9fe"
                  value={config.brandSecondaryColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, brandSecondaryColor: e.target.value }))}
                  error={config.brandSecondaryColor.length > 0 && !isValidHex(config.brandSecondaryColor)}
                  helperText={
                    config.brandSecondaryColor.length > 0 && !isValidHex(config.brandSecondaryColor)
                      ? 'Invalid hex color'
                      : 'Used for accents and secondary elements'
                  }
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              bgcolor: isValidHex(config.brandSecondaryColor) ? config.brandSecondaryColor : '#0af9fe',
                              border: '1px solid',
                              borderColor: 'divider',
                              flexShrink: 0,
                            }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <input
                  type="color"
                  value={isValidHex(config.brandSecondaryColor) ? config.brandSecondaryColor : '#0af9fe'}
                  onChange={(e) => setConfig((prev) => ({ ...prev, brandSecondaryColor: e.target.value }))}
                  style={{
                    width: '100%',
                    height: 32,
                    marginTop: 4,
                    padding: 0,
                    border: '1px solid', borderColor: 'divider',
                    borderRadius: 6,
                    background: 'none',
                    cursor: 'pointer',
                  }}
                />
              </Box>
            </Stack>

            {/* Color preview bar */}
            <Paper
              variant="outlined"
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Preview:
              </Typography>
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: isValidHex(config.brandPrimaryColor) ? config.brandPrimaryColor : '#eb3d28',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                Primary Button
              </Box>
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: isValidHex(config.brandSecondaryColor) ? config.brandSecondaryColor : '#0af9fe',
                  color: isValidHex(config.brandSecondaryColor) ? config.brandSecondaryColor : '#0af9fe',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                Secondary Accent
              </Box>
            </Paper>
          </Box>

          {/* ── Default theme ─────────────────────────── */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Default theme
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              Initial appearance for this tenant. Visitors can still switch in the header.
            </Typography>
            <RadioGroup
              row
              value={config.themeMode}
              onChange={(e) => {
                const value = e.target.value;
                if (!isThemeMode(value)) return;
                setConfig((prev) => ({ ...prev, themeMode: value }));
              }}
            >
              <FormControlLabel value="light" control={<Radio size="small" />} label="Light" />
              <FormControlLabel value="dark" control={<Radio size="small" />} label="Dark" />
              <FormControlLabel value="system" control={<Radio size="small" />} label="System" />
            </RadioGroup>
          </Box>

          {/* ── Status alerts ─────────────────────────── */}
          {error ? (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          ) : null}

          {success ? (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              Brand configuration saved. Refresh any page to see the changes.
            </Alert>
          ) : null}

          {/* ── Save button ───────────────────────────── */}
          <Box>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              sx={{ py: 1.25 }}
            >
              {isSaving ? 'Saving...' : 'Save Brand Configuration'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
