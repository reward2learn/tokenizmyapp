'use client';

/**
 * CreateAppWizard — 15-step wizard for adding a NEW app to an existing suite
 * tenant, mirroring the EditTenantModal stepper (Template → Preview → Slug →
 * License → Features → OpenAI API-Keys → Google OAuth → Database → Custom Env
 * → Deploy Hooks → Functional Roles → Custom Domain → Admin & Auth → Flight
 * Check → Summary).
 *
 * Everything is PREPOPULATED from the tenant's saved configuration
 * (tenants.metadata.config — the shared tenant-level defaults per
 * docs/TENANT-APP-CONFIG-SEPARATION-ROADMAP.md). The only real outputs are:
 *   • a new app_id (slugified from the app name)
 *   • a new Vercel project name ({tenantSlug}__{appId})
 * The new app shares the tenant's existing database via the synthetic
 * `${tenantSlug}__${appId}` scope key (docs/TENANT-EDIT-WIZARD-DATA-MAP.md §6),
 * and gets its own Vercel project on deploy.
 *
 * Two creation modes:
 *   1. Blank — a fresh app from a template (same as "+ Add App").
 *   2. Duplicate — clone an existing app already in the tenant's list
 *      (identity + app-scoped content rows — see the duplicate API route).
 */
import { useState, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DnsIcon from '@mui/icons-material/Dns';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/Error';
import KeyIcon from '@mui/icons-material/Key';
import LanguageIcon from '@mui/icons-material/Language';
import LockIcon from '@mui/icons-material/Lock';
import PaletteIcon from '@mui/icons-material/Palette';
import PeopleIcon from '@mui/icons-material/People';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import VerifiedIcon from '@mui/icons-material/Verified';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningIcon from '@mui/icons-material/Warning';

import { getTemplate, listTemplates } from '@/domain/tenant/template-catalog';
import { DEFAULT_PLATFORM_ADMIN_EMAIL } from '@/domain/security/persons';
import {
  useListTenantsQuery,
  useAddAppToSuiteMutation,
  useDuplicateAppMutation,
  useSeedAppMutation,
  useDeployAppMutation,
  type SuiteAppInstance,
} from '@/store/apis/tenant-api';
import { useListRoleConfigsQuery } from '@/store/apis/admin-api';

// ── Types ──────────────────────────────────────────────────────

interface EnvPair {
  key: string;
  value: string;
}

interface CheckItem {
  _key: string;
  label: string;
  status: 'pass' | 'fail' | 'warn';
  detail: string;
}

// ── Constants ──────────────────────────────────────────────────

const CREATE_STEPS: Array<{ label: string; icon: React.ReactNode; key: string }> = [
  { label: 'Template', icon: <SettingsIcon fontSize="small" />, key: 'template' },
  { label: 'Preview', icon: <PaletteIcon fontSize="small" />, key: 'preview' },
  { label: 'Slug', icon: <EditIcon fontSize="small" />, key: 'slug' },
  { label: 'License', icon: <KeyIcon fontSize="small" />, key: 'license' },
  { label: 'Features', icon: <AutoFixHighIcon fontSize="small" />, key: 'features' },
  { label: 'OpenAI API-Keys', icon: <KeyIcon fontSize="small" />, key: 'openai' },
  { label: 'Google OAuth', icon: <VerifiedUserIcon fontSize="small" />, key: 'oauth' },
  { label: 'Database', icon: <DnsIcon fontSize="small" />, key: 'database' },
  { label: 'Custom Env', icon: <CloudIcon fontSize="small" />, key: 'env' },
  { label: 'Deploy Hooks', icon: <RocketLaunchIcon fontSize="small" />, key: 'hooks' },
  { label: 'Functional Roles', icon: <PeopleIcon fontSize="small" />, key: 'roles' },
  { label: 'Custom Domain', icon: <LanguageIcon fontSize="small" />, key: 'domain' },
  { label: 'Admin & Auth', icon: <VerifiedUserIcon fontSize="small" />, key: 'auth' },
  { label: 'Flight Check', icon: <VerifiedIcon fontSize="small" />, key: 'flightcheck' },
  { label: 'Summary', icon: <RocketLaunchIcon fontSize="small" />, key: 'summary' },
];

const CREATE_PROGRESS_STEPS = [
  { key: 'create', label: 'Create app in suite', description: 'Registering the new app (or duplicate) in the tenant app pack' },
  { key: 'seed', label: 'Seed app content', description: 'Seeding pages, navigation and template content for the new app' },
  { key: 'deploy', label: 'Deploy to Vercel', description: 'Creating the Vercel project and triggering the build' },
  { key: 'done', label: 'Done', description: 'New app is live' },
];

/** Extracts the API envelope's `error` string off an RTK Query error, without `any`. */
function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { error?: string } }).data;
    if (data?.error) return data.error;
  }
  return fallback;
}

const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Helper component for summary display rows (mirrors EditTenantModal). */
function SummaryRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 140, fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: 'text.secondary' }}>
        {label}
      </Typography>
      {color && (
        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: color, border: '1px solid', borderColor: 'divider', flexShrink: 0 }} />
      )}
      <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, wordBreak: 'break-all', color: value.startsWith('✅') ? 'success.main' : value.startsWith('⚠️') ? 'warning.main' : 'text.primary' }}>
        {value}
      </Typography>
    </Stack>
  );
}

export interface CreateAppWizardProps {
  open: boolean;
  onClose: () => void;
  tenantSlug: string;
  /** When set, the wizard opens in "duplicate" mode with this app as source. */
  sourceApp?: SuiteAppInstance | null;
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
}

export function CreateAppWizard({ open, onClose, tenantSlug, sourceApp, onSnackbar }: CreateAppWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [mode, setMode] = useState<'blank' | 'duplicate'>(sourceApp ? 'duplicate' : 'blank');
  const [sourceAppId, setSourceAppId] = useState(sourceApp?.appId ?? '');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [templateId, setTemplateId] = useState('default');
  const [seedAfter, setSeedAfter] = useState(true);
  const [deployAfter, setDeployAfter] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createProgress, setCreateProgress] = useState(0);
  const [createStepStatuses, setCreateStepStatuses] = useState<Record<string, string>>({});
  const [createDetails, setCreateDetails] = useState<Record<string, string>>({});
  const [flightChecks, setFlightChecks] = useState<CheckItem[]>([]);
  const [flightRunning, setFlightRunning] = useState(false);

  const { data: tenantsData } = useListTenantsQuery();
  const [addApp] = useAddAppToSuiteMutation();
  const [duplicateApp] = useDuplicateAppMutation();
  const [seedApp] = useSeedAppMutation();
  const [deployApp] = useDeployAppMutation();
  const { data: rolesData, isLoading: rolesLoading } = useListRoleConfigsQuery();

  const templates = listTemplates();
  const tenant = tenantsData?.data?.tenants?.find((t) => t.slug === tenantSlug);
  const suiteApps: SuiteAppInstance[] = tenant?.appPack?.apps ?? [];
  const hasApps = suiteApps.length > 0;
  const rolesList = rolesData?.data?.roles || [];

  // ── Tenant config (shared defaults the new app inherits) ──
  const cfg = ((tenant?.metadata as Record<string, unknown>)?.config ?? {}) as Record<string, unknown>;
  const licenseCfg = (cfg.license ?? {}) as Record<string, unknown>;
  const oauthCfg = (cfg.googleAuth ?? {}) as Record<string, unknown>;
  const dbCfg = (cfg.database ?? {}) as Record<string, unknown>;
  const envCfg = (cfg.env ?? {}) as Record<string, string>;
  const hooksCfg = (cfg.hooks ?? {}) as Record<string, unknown>;
  const authCfg = (cfg.auth ?? {}) as Record<string, unknown>;
  const licenseKey = String((licenseCfg.key as string) || '');
  const licenseTier = String((licenseCfg.tier as string) || 'premium');
  const validUntil = String((licenseCfg.validUntil as string) || '');
  const features = (licenseCfg.features as string[]) || [];
  const setupToken = String((cfg.apiKey as string) || '');
  const openaiApiKey = String((cfg.openaiApiKey as string) || '');
  const oauthClientId = String((oauthCfg.clientId as string) || '');
  const oauthProjectId = String((oauthCfg.projectId as string) || '');
  const oauthRedirectUris = (oauthCfg.redirectUris as string[]) || [];
  const oauthGcpEmail = String((oauthCfg.gcpAccountEmail as string) || 'reward2learn@gmail.com');
  const dbUrl = String((dbCfg.databaseUrl as string) || (dbCfg.pooledUrl as string) || tenant?.dbUrl || '');
  const dbDirectUrl = String((dbCfg.directUrl as string) || '');
  const envPairs: EnvPair[] = Object.entries(envCfg).map(([k, v]) => ({ key: k, value: v }));
  const deployHookUrl = String((hooksCfg.deployHookUrl as string) || '');
  const adminEmail = String((authCfg.adminEmail as string) || (cfg.adminEmail as string) || DEFAULT_PLATFORM_ADMIN_EMAIL);
  const pinSignInEnabled = authCfg.pinSignInEnabled !== false;

  // ── Derived identity ────────────────────────────────────────
  const appId = slugify(name);
  const vercelName = `${tenantSlug}__${appId}`;
  const appIdConflict = suiteApps.some((a) => a.appId === appId);
  const valid =
    !!name.trim() &&
    !!appId &&
    !appIdConflict &&
    (mode === 'blank' || !!sourceAppId);

  /** Prefill everything from the tenant (and source app when duplicating). */
  const prefill = (nextMode: 'blank' | 'duplicate', srcAppId: string) => {
    const src = suiteApps.find((a) => a.appId === srcAppId) ?? null;
    const baseName = src ? `${src.name} Copy` : (tenant?.displayName ?? '');
    const baseTemplate = src?.templateId ?? tenant?.template ?? 'default';
    setMode(nextMode);
    setSourceAppId(srcAppId);
    setName(baseName);
    setDepartment(src?.department ?? '');
    setTemplateId(baseTemplate);
  };

  const reset = () => {
    setActiveStep(0);
    prefill(sourceApp ? 'duplicate' : 'blank', sourceApp?.appId ?? '');
    setSeedAfter(true);
    setDeployAfter(true);
    setFlightChecks([]);
    setCreateProgress(0);
    setCreateStepStatuses({});
    setCreateDetails({});
  };

  const handleClose = () => {
    if (creating) return;
    reset();
    onClose();
  };

  // ── Flight Check (app-scoped) ───────────────────────────────
  const runFlightCheck = useCallback(async () => {
    setFlightRunning(true);
    const results: CheckItem[] = [];
    const addResult = (label: string, status: 'pass' | 'fail' | 'warn', detail: string) => {
      results.push({ label, status, detail, _key: label.replace(/\s+/g, '-').toLowerCase() });
    };

    // App identity
    addResult('App Name', name.trim() ? 'pass' : 'fail', name.trim() || 'Missing — enter a name in the Slug step');
    addResult('App ID', appId ? (appIdConflict ? 'fail' : 'pass') : 'fail',
      appId ? (appIdConflict ? `Conflict — "${appId}" is already used by another app in this tenant` : appId) : 'Missing — derived from the app name');
    addResult('Vercel Project Name', appId ? 'pass' : 'fail', appId ? vercelName : 'Missing');

    // Inherited tenant config
    addResult('Database URL', dbUrl ? 'pass' : 'fail', dbUrl ? dbUrl.slice(0, 40) + '...' : 'Missing — provision a Neon database in the tenant');
    addResult('Google OAuth Client ID', oauthClientId ? 'pass' : 'fail', oauthClientId ? oauthClientId.slice(0, 25) + '...' : 'Missing — configure in the tenant');
    addResult('License Key', licenseKey ? 'pass' : 'fail', licenseKey ? licenseKey.slice(0, 25) + '...' : 'Missing');
    addResult('API Key', setupToken ? 'pass' : 'warn', setupToken ? 'Configured' : 'Not set');
    addResult('Admin Email', adminEmail ? 'pass' : 'fail', adminEmail || 'Not set');
    addResult('PIN Sign-in', 'pass', pinSignInEnabled ? 'Enabled' : 'Disabled (Google-only)');
    addResult('OpenAI API Key', openaiApiKey ? 'pass' : 'warn', openaiApiKey ? 'Configured' : 'Not set — add OPENAI_API_KEY env var');

    setFlightChecks(results);
    setFlightRunning(false);
  }, [name, appId, appIdConflict, vercelName, dbUrl, oauthClientId, licenseKey, setupToken, adminEmail, pinSignInEnabled, openaiApiKey]);

  // ── Create & Deploy ─────────────────────────────────────────
  const handleCreate = async () => {
    if (!valid || creating) return;
    setCreating(true);
    setCreateProgress(0);
    setCreateStepStatuses({});
    setCreateDetails({});
    const mark = (key: string, status: string, detail?: string) => {
      setCreateStepStatuses((prev) => ({ ...prev, [key]: status }));
      if (detail) setCreateDetails((prev) => ({ ...prev, [key]: detail }));
    };
    try {
      mark('create', 'inprogress');
      if (mode === 'duplicate') {
        await duplicateApp({
          slug: tenantSlug,
          sourceAppId,
          appId,
          name: name.trim(),
          department: department.trim() || undefined,
          templateId,
          copyContent: true,
        }).unwrap();
      } else {
        await addApp({
          slug: tenantSlug,
          appId,
          name: name.trim(),
          department: department.trim() || undefined,
          templateId,
        }).unwrap();
      }
      mark('create', 'success', `${mode === 'duplicate' ? 'Duplicated' : 'Created'} "${name.trim()}" (${appId})`);
      setCreateProgress(1);

      if (seedAfter) {
        mark('seed', 'inprogress');
        const seedRes = await seedApp({ slug: tenantSlug, appId }).unwrap();
        mark('seed', 'success', seedRes.data?.seeded ? `Seeded — ${seedRes.data.pages ?? 0} pages, ${seedRes.data.navItems ?? 0} nav items` : 'Seed returned');
        setCreateProgress(2);
      } else {
        mark('seed', 'skipped', 'Skipped');
        setCreateProgress(2);
      }

      if (deployAfter) {
        mark('deploy', 'inprogress');
        const deployRes = await deployApp({ slug: tenantSlug, appId }).unwrap();
        mark('deploy', 'success', deployRes.data?.appUrl ? `URL: ${deployRes.data.appUrl}` : 'Deployed');
        setCreateProgress(3);
      } else {
        mark('deploy', 'skipped', 'Skipped');
        setCreateProgress(3);
      }

      mark('done', 'success', `${mode === 'duplicate' ? 'Duplicated' : 'Created'} "${name.trim()}" — ${seedAfter && deployAfter ? 'seeded + deployed' : seedAfter ? 'seeded' : deployAfter ? 'deployed' : 'added to suite'}`);
      setCreateProgress(4);
      onSnackbar({
        message: `✅ Created "${name.trim()}"${mode === 'duplicate' ? ' (duplicate of ' + sourceAppId + ')' : ''} — ${seedAfter && deployAfter ? 'seeded + deployed' : seedAfter ? 'seeded' : deployAfter ? 'deployed' : 'added to suite'}`,
        severity: 'success',
      });
      handleClose();
    } catch (err) {
      const msg = apiErrorMessage(err, 'Failed to create app');
      const currentKey = createProgress === 0 ? 'create' : createProgress === 1 ? 'seed' : createProgress === 2 ? 'deploy' : 'done';
      mark(currentKey, 'error', msg);
      onSnackbar({ message: `❌ ${msg}`, severity: 'error' });
    } finally {
      setCreating(false);
    }
  };

  // ── Step renderers ──────────────────────────────────────────

  // Step 0: Template — prefilled from tenant / source app
  const renderStepTemplate = () => (
    <Stack spacing={2}>
      <Alert severity="info" icon={<AutoFixHighIcon />} sx={{ fontSize: '0.8rem' }}>
        Prefilled from {mode === 'duplicate' ? `the source app (${sourceAppId})` : `the tenant (${tenant?.template ?? 'default'})`} — change only if this app needs a different sector schema.
      </Alert>
      <Grid container spacing={2}>
        {templates.filter((tpl) => tpl.id !== 'default').map((tpl) => {
          const selected = templateId === tpl.id;
          return (
            <Grid key={tpl.id} size={{ xs: 12, sm: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: selected ? 'primary.main' : 'divider',
                  borderWidth: selected ? 2 : 1,
                  bgcolor: selected ? 'rgba(235,61,40,0.06)' : undefined,
                  transition: 'all 0.15s',
                }}
              >
                <CardActionArea onClick={() => setTemplateId(tpl.id)}>
                  <CardContent>
                    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                      {selected ? <CheckCircleIcon color="primary" fontSize="small" /> : null}
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{tpl.label}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {tpl.description}
                    </Typography>
                    <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      <Chip label={tpl.schemaOrgType} size="small" variant="outlined" color="info" />
                      <Chip label={tpl.xsdStandard} size="small" variant="outlined" />
                    </Stack>
                    <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {tpl.defaultPages.slice(0, 4).map((p) => (
                        <Chip key={p.slug} label={p.title} size="small" variant="outlined" />
                      ))}
                      {tpl.defaultPages.length > 4 ? (
                        <Chip label={`+${tpl.defaultPages.length - 4} more`} size="small" variant="outlined" />
                      ) : null}
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );

  // Step 1: Preview — branding inherited from tenant
  const renderStepPreview = () => (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        The app inherits the tenant&apos;s brand identity — logo and colors below are shown for reference.
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, borderColor: 'primary.main' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {tenant?.faviconData ? (
            <Avatar src={tenant.faviconData} sx={{ width: 64, height: 64 }} variant="rounded" />
          ) : (
            <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="caption">No logo</Typography>
            </Box>
          )}
          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {tenant?.displayName ?? tenantSlug} — tenant branding
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Chip label={tenant?.primaryColor ?? '#eb3d28'} size="small" sx={{ bgcolor: tenant?.primaryColor ?? '#eb3d28', color: '#fff' }} />
              <Chip label={tenant?.secondaryColor ?? '#0af9fe'} size="small" sx={{ bgcolor: tenant?.secondaryColor ?? '#0af9fe', color: '#000' }} />
            </Stack>
          </Stack>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'background.default' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <PaletteIcon color="primary" fontSize="small" />
          <Typography variant="caption" color="text.secondary">Preview</Typography>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          {tenant?.faviconData ? (
            <Avatar src={tenant.faviconData} sx={{ width: 32, height: 32 }} variant="rounded" />
          ) : null}
          <Box sx={{ px: 2, py: 1, borderRadius: 1, bgcolor: tenant?.primaryColor ?? '#eb3d28', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
            Primary Button
          </Box>
          <Box sx={{ px: 2, py: 1, borderRadius: 1, border: '1px solid', borderColor: tenant?.secondaryColor ?? '#0af9fe', color: tenant?.secondaryColor ?? '#0af9fe', fontSize: '0.8rem', fontWeight: 700 }}>
            Secondary
          </Box>
          <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: tenant?.primaryColor ?? '#eb3d28' }} />
          <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: tenant?.secondaryColor ?? '#0af9fe' }} />
        </Stack>
      </Paper>
    </Stack>
  );

  // Step 2: Slug — THE key step: name → app_id + vercel name
  const renderStepSlug = () => (
    <Stack spacing={2.5}>
      {hasApps && (
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
              {mode === 'duplicate' ? <ContentCopyIcon color="primary" fontSize="small" /> : <AutoFixHighIcon color="primary" fontSize="small" />}
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {mode === 'duplicate' ? 'Duplicating an existing app' : 'Blank app from template'}
              </Typography>
            </Stack>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 280 } }}>
              <InputLabel>Mode</InputLabel>
              <Select
                value={mode}
                label="Mode"
                onChange={(e) => {
                  const next = e.target.value as 'blank' | 'duplicate';
                  prefill(next, next === 'duplicate' ? (suiteApps[0]?.appId ?? '') : '');
                }}
              >
                <MenuItem value="blank">Blank app from template</MenuItem>
                <MenuItem value="duplicate" disabled={!hasApps}>Duplicate an existing app</MenuItem>
              </Select>
            </FormControl>
            {mode === 'duplicate' && (
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 280 } }}>
                <InputLabel>Source App</InputLabel>
                <Select
                  value={sourceAppId}
                  label="Source App"
                  onChange={(e) => prefill('duplicate', e.target.value)}
                >
                  {suiteApps.map((a) => (
                    <MenuItem key={a.appId} value={a.appId}>
                      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                        <span>{a.name}</span>
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ fontFamily: 'monospace' }}>
                          {a.appId}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Paper>
      )}

      <TextField
        label="App Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        size="small"
        autoFocus
        placeholder={tenant?.displayName ? `${tenant.displayName} — e.g. Inventory` : 'e.g. Inventory Management'}
        helperText={name ? `App ID: ${appId}${appIdConflict ? ' — ⚠️ already used by another app in this tenant' : ''}` : 'Used to generate the app ID'}
        error={appIdConflict}
      />

      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Generated deployment identity
        </Typography>
        <Stack spacing={0.75}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>App ID</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
              {appId || '—'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>Vercel name</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
              {vercelName || '—'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>Live URL</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {appId ? `https://${vercelName}.vercel.app` : '—'}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <TextField
        label="Department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        fullWidth
        size="small"
        placeholder="e.g. Operations"
        helperText="Optional — groups this app in the tenant's suite view."
      />
    </Stack>
  );

  // Step 3: License — inherited from tenant
  const renderStepLicense = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <KeyIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>License</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Inherited from the tenant — one license covers every app in the suite.
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={0.5}>
          <SummaryRow label="License Key" value={licenseKey ? licenseKey.slice(0, 25) + '...' : '⚠️ not set'} />
          <SummaryRow label="Tier" value={licenseTier.toUpperCase()} />
          <SummaryRow label="Valid Until" value={validUntil || '⚠️ not set'} />
          <SummaryRow label="Setup Token" value={setupToken ? '✅ configured' : '⚠️ not set'} />
          <SummaryRow label="Admin PIN" value="✅ tenant-level" />
          <SummaryRow label="OpenAI API Key" value={openaiApiKey ? '✅ configured' : '⚠️ not set'} />
        </Stack>
      </Paper>
    </Stack>
  );

  // Step 4: Features — inherited from tenant
  const renderStepFeatures = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <AutoFixHighIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Features</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Inherited from the tenant&apos;s feature flags — the app gets the same capabilities as the rest of the suite.
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
          {features.length > 0 ? features.map((f) => (
            <Chip key={f} label={f} size="small" variant="outlined" color="primary" />
          )) : (
            <Typography variant="body2" color="text.secondary">No features configured.</Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );

  // Step 5: OpenAI API-Keys — inherited from tenant
  const renderStepOpenAi = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <KeyIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>OpenAI API Key</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Inherited from the tenant — one key for every suite app&apos;s AI features.
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <SummaryRow label="OpenAI API Key" value={openaiApiKey ? '✅ configured' : '⚠️ not set'} />
      </Paper>
    </Stack>
  );

  // Step 6: Google OAuth — inherited from tenant
  const renderStepOAuth = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <VerifiedUserIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Google OAuth</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Inherited from the tenant&apos;s GCP project — the app shares the tenant&apos;s OAuth client.
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={0.5}>
          <SummaryRow label="GCP Account Email" value={oauthGcpEmail} />
          <SummaryRow label="Client ID" value={oauthClientId ? '✅ configured' : '⚠️ not set'} />
          <SummaryRow label="Project ID" value={oauthProjectId || '(auto)'} />
          <SummaryRow label="Redirect URIs" value={oauthRedirectUris.length > 0 ? oauthRedirectUris.join(', ') : 'none'} />
        </Stack>
      </Paper>
    </Stack>
  );

  // Step 7: Database — shared tenant DB via synthetic scope key
  const renderStepDatabase = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <DnsIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Database</Typography>
      </Stack>
      <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
        The new app shares the tenant&apos;s existing database, scoped by the synthetic key{' '}
        <strong>{tenantSlug}__{appId || '…'}</strong>. No new database is provisioned.
      </Alert>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={0.5}>
          <SummaryRow label="Pooled URL" value={dbUrl ? (dbUrl.length > 60 ? dbUrl.slice(0, 60) + '...' : dbUrl) : '⚠️ not configured'} />
          <SummaryRow label="Direct URL" value={dbDirectUrl ? (dbDirectUrl.length > 60 ? dbDirectUrl.slice(0, 60) + '...' : dbDirectUrl) : '⚠️ not configured'} />
        </Stack>
      </Paper>
    </Stack>
  );

  // Step 8: Custom Env — inherited from tenant
  const renderStepEnv = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <CloudIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Custom Env Vars</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Inherited from the tenant&apos;s shared env vars — pushed to the app&apos;s Vercel project on deploy.
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        {envPairs.length > 0 ? (
          <Stack spacing={0.5}>
            {envPairs.map((p) => (
              <SummaryRow key={p.key} label={p.key} value={p.value.length > 40 ? p.value.slice(0, 40) + '...' : p.value} />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">No custom env vars configured.</Typography>
        )}
      </Paper>
    </Stack>
  );

  // Step 9: Deploy Hooks — inherited from tenant
  const renderStepHooks = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <RocketLaunchIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Deploy Hooks</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        The tenant&apos;s deploy hook is shown for reference. On deploy, the app gets its own Vercel project
        (and its own deploy hook, managed from the app&apos;s three-dot menu).
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <SummaryRow label="Deploy Hook URL" value={deployHookUrl ? (deployHookUrl.length > 60 ? deployHookUrl.slice(0, 60) + '...' : deployHookUrl) : '⚠️ not set'} />
        <SummaryRow label="Vercel Project ID" value={tenant?.vercelProjectId ? '✅ ' + tenant.vercelProjectId : '⚠️ not set'} />
      </Paper>
    </Stack>
  );

  // Step 10: Functional Roles — inherited from tenant
  const renderStepRoles = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <PeopleIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Functional Roles</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        The tenant&apos;s role catalog is shared across the suite — the new app inherits it.
      </Typography>
      {rolesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
      ) : rolesList.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">No roles configured.</Typography>
        </Paper>
      ) : (
        <Stack spacing={1}>
          {rolesList.map((role) => (
            <Paper key={role.code} variant="outlined" sx={{ p: 1.5, borderLeft: 4, borderLeftColor: role.isPlatformAdmin ? 'primary.main' : 'grey.300' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{role.name}</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>({role.code})</Typography>
                {role.isPlatformAdmin ? <Chip label="Platform Admin" size="small" color="primary" variant="outlined" /> : null}
                <Chip
                  icon={role.pinConfigured ? <CheckCircleIcon /> : <LockIcon />}
                  label={role.pinConfigured ? 'PIN Configured' : 'No PIN'}
                  size="small"
                  color={role.pinConfigured ? 'success' : 'warning'}
                  variant={role.pinConfigured ? 'filled' : 'outlined'}
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );

  // Step 11: Custom Domain — app gets its own project/URL
  const renderStepDomain = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <LanguageIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Custom Domain</Typography>
      </Stack>
      <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
        Each suite app is its own Vercel project with its own auto-generated URL. Custom domains are
        managed per-app from the app&apos;s three-dot menu after creation.
      </Alert>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={0.5}>
          <SummaryRow label="Vercel name" value={vercelName || '—'} />
          <SummaryRow label="Auto-generated URL" value={appId ? `https://${vercelName}.vercel.app` : '—'} />
        </Stack>
      </Paper>
    </Stack>
  );

  // Step 12: Admin & Auth — inherited from tenant
  const renderStepAuth = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <VerifiedUserIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Admin & Authentication</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Inherited from the tenant — one admin email and auth policy for every app in the suite.
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={0.5}>
          <SummaryRow label="Admin Email" value={adminEmail} />
          <SummaryRow label="PIN Sign-in" value={pinSignInEnabled ? '✅ Enabled' : '❌ Disabled'} />
        </Stack>
      </Paper>
    </Stack>
  );

  // Step 13: Flight Check — app-scoped validation
  const renderStepFlightCheck = () => {
    const passCount = flightChecks.filter((c) => c.status === 'pass').length;
    const failCount = flightChecks.filter((c) => c.status === 'fail').length;
    const warnCount = flightChecks.filter((c) => c.status === 'warn').length;
    const hasResults = flightChecks.length > 0;
    const overallStatus = !hasResults ? 'idle' : failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : 'pass';

    return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <VerifiedIcon color={overallStatus === 'pass' ? 'success' : overallStatus === 'fail' ? 'error' : 'warning'} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Flight Check</Typography>
            {hasResults ? (
              <Chip
                label={overallStatus === 'pass' ? `${passCount}/${flightChecks.length} PASS` : `${passCount} pass, ${warnCount} warn, ${failCount} fail`}
                size="small"
                color={overallStatus === 'pass' ? 'success' : overallStatus === 'fail' ? 'error' : 'warning'}
              />
            ) : null}
          </Stack>
          <Button
            variant="contained"
            size="small"
            onClick={() => void runFlightCheck()}
            disabled={flightRunning}
            startIcon={flightRunning ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
          >
            {flightRunning ? 'Running...' : 'Run Flight Check'}
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Validates the new app&apos;s identity (app_id, Vercel name) and the inherited tenant configuration.
        </Typography>

        {!hasResults && !flightRunning ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary">
              No checks run yet. Click "Run Flight Check" to start.
            </Typography>
          </Paper>
        ) : null}
        {flightRunning && !hasResults ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : null}

        {flightChecks.map((check) => (
          <Paper key={check._key} variant="outlined" sx={{
            p: 1.5,
            borderColor: check.status === 'pass' ? 'success.main' : check.status === 'warn' ? 'warning.main' : 'error.main',
            bgcolor: 'background.default',
          }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <Box sx={{ mt: 0.3, flexShrink: 0 }}>
                {check.status === 'pass' ? <CheckCircleIcon color="success" fontSize="small" /> :
                 check.status === 'warn' ? <WarningIcon color="warning" fontSize="small" /> :
                 <ErrorIcon color="error" fontSize="small" />}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{check.label}</Typography>
                <Typography variant="caption" color="text.secondary">{check.detail}</Typography>
              </Box>
            </Stack>
          </Paper>
        ))}

        {hasResults ? (
          <Alert severity={overallStatus === 'pass' ? 'success' : overallStatus === 'fail' ? 'error' : 'warning'}>
            <AlertTitle>{overallStatus === 'pass' ? 'All checks passed' : overallStatus === 'fail' ? 'Failures found' : 'Warnings found'}</AlertTitle>
            {overallStatus === 'pass' ? 'The new app is ready to create and deploy.' :
             `${failCount} item(s) must be fixed. ${warnCount} item(s) should be reviewed.`}
          </Alert>
        ) : null}
      </Stack>
    );
  };

  // Step 14: Summary — review + create & deploy
  const renderStepSummary = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <RocketLaunchIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>App Configuration Summary</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Review the new app&apos;s identity and the tenant configuration it inherits, then create and deploy.
      </Typography>

      {/* App Identity */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>App Identity</Typography>
        <Stack spacing={0.5}>
          <SummaryRow label="Mode" value={mode === 'duplicate' ? `Duplicate of ${sourceAppId}` : 'Blank app from template'} />
          <SummaryRow label="Name" value={name.trim() || '—'} />
          <SummaryRow label="App ID" value={appId || '—'} />
          <SummaryRow label="Vercel name" value={vercelName || '—'} />
          <SummaryRow label="Live URL" value={appId ? `https://${vercelName}.vercel.app` : '—'} />
          {department.trim() ? <SummaryRow label="Department" value={department.trim()} /> : null}
          <SummaryRow label="Template" value={getTemplate(templateId).label} />
        </Stack>
      </Paper>

      {/* Inherited tenant config */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Inherited Tenant Config</Typography>
        <Stack spacing={0.5}>
          <SummaryRow label="License" value={`${licenseTier.toUpperCase()}${licenseKey ? ' ✅' : ' ⚠️'}`} />
          <SummaryRow label="Features" value={features.length > 0 ? features.join(', ') : 'none'} />
          <SummaryRow label="OpenAI API Key" value={openaiApiKey ? '✅ configured' : '⚠️ not set'} />
          <SummaryRow label="Google OAuth" value={oauthClientId ? '✅ configured' : '⚠️ not set'} />
          <SummaryRow label="Database" value={dbUrl ? '✅ shared tenant DB' : '⚠️ not configured'} />
          <SummaryRow label="Custom Env Vars" value={envPairs.length > 0 ? envPairs.map((p) => p.key).join(', ') : 'none'} />
          <SummaryRow label="Deploy Hook" value={deployHookUrl ? '✅ configured' : '⚠️ not set'} />
          <SummaryRow label="Functional Roles" value={rolesList.length > 0 ? rolesList.map((r) => r.name).join(', ') : '(loading)'} />
          <SummaryRow label="Admin Email" value={adminEmail} />
          <SummaryRow label="PIN Sign-in" value={pinSignInEnabled ? '✅ Enabled' : '❌ Disabled'} />
        </Stack>
      </Paper>

      <Divider />

      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Post-create actions</Typography>
      <FormControlLabel
        control={<Checkbox checked={seedAfter} onChange={(e) => setSeedAfter(e.target.checked)} size="small" />}
        label={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <PlayArrowIcon fontSize="small" color="action" />
            <Typography variant="body2">
              Seed app content
              {mode === 'duplicate' && <Box component="span" color="text.secondary"> — content is already cloned; seeding applies template defaults</Box>}
            </Typography>
          </Stack>
        }
      />
      <FormControlLabel
        control={<Checkbox checked={deployAfter} onChange={(e) => setDeployAfter(e.target.checked)} size="small" />}
        label={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <CloudUploadIcon fontSize="small" color="action" />
            <Typography variant="body2">Deploy to Vercel</Typography>
          </Stack>
        }
      />

      {mode === 'duplicate' && (
        <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
          The duplicate gets its own Vercel project and database scope on deploy — the source app&apos;s deployment, users and security groups are not copied.
        </Alert>
      )}

      {/* Create progress */}
      {creating && (
        <Paper variant="outlined" sx={{ p: 3, borderColor: 'primary.main' }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <RocketLaunchIcon color="primary" /> Create Progress
          </Typography>
          <Stepper activeStep={createProgress} orientation="vertical" sx={{ mb: 3 }}>
            {CREATE_PROGRESS_STEPS.map((step) => {
              const status = createStepStatuses[step.key] || 'pending';
              const isActive = status === 'inprogress';
              const detail = createDetails[step.key];
              let icon: React.ReactNode = undefined;
              if (status === 'success') icon = <CheckCircleIcon color="success" />;
              else if (status === 'error') icon = <CloseIcon color="error" />;
              else if (isActive) icon = <CircularProgress size={20} color="primary" />;
              return (
                <Step key={step.key} active={isActive || status === 'success'}>
                  <StepLabel icon={icon} sx={{ '& .MuiStepLabel-label': { fontWeight: isActive || status === 'success' ? 600 : 400 } }}>
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">{step.description}</Typography>
                    {detail ? (
                      <Typography variant="caption" sx={{ mt: 1, display: 'block', p: 1, bgcolor: 'background.default', borderRadius: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {detail}
                      </Typography>
                    ) : null}
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
          <LinearProgress variant="determinate" value={(createProgress / CREATE_PROGRESS_STEPS.length) * 100} sx={{ mt: 2, height: 6, borderRadius: 4 }} />
        </Paper>
      )}
    </Stack>
  );

  const stepContent = (index: number): React.ReactNode => {
    switch (index) {
      case 0: return renderStepTemplate();
      case 1: return renderStepPreview();
      case 2: return renderStepSlug();
      case 3: return renderStepLicense();
      case 4: return renderStepFeatures();
      case 5: return renderStepOpenAi();
      case 6: return renderStepOAuth();
      case 7: return renderStepDatabase();
      case 8: return renderStepEnv();
      case 9: return renderStepHooks();
      case 10: return renderStepRoles();
      case 11: return renderStepDomain();
      case 12: return renderStepAuth();
      case 13: return renderStepFlightCheck();
      case 14: return renderStepSummary();
      default: return null;
    }
  };

  const isSummaryStep = activeStep === CREATE_STEPS.length - 1;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={false} fullWidth aria-labelledby="create-app-wizard-title">
      <DialogTitle id="create-app-wizard-title" sx={{ p: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2, pb: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <AutoFixHighIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>New App — {tenant?.displayName ?? tenantSlug}</Typography>
            <Chip label={tenant?.templateMode === 'suite' ? 'Suite' : 'Single'} size="small" color="primary" variant="outlined" />
          </Stack>
          <IconButton onClick={handleClose} size="small" aria-label="close"><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 0, md: 0 }, minHeight: 400 }}>
        <Stepper activeStep={activeStep} sx={{
          zIndex: 1000,
          backgroundColor: 'background.default',
          padding: '19px 0px',
          position: 'sticky',
          top: 0,
          mb: 4,
          overflowX: 'auto',
          flexWrap: 'wrap',
          '& .MuiStepLabel-root': { cursor: 'pointer' },
        }} nonLinear>
          {CREATE_STEPS.map((s, idx) => (
            <Step key={s.key} onClick={() => setActiveStep(idx)}>
              <StepLabel sx={{
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  fontWeight: activeStep === CREATE_STEPS.indexOf(s) ? 700 : 400,
                },
              }}>
                {s.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2, padding: '24px' }}>{stepContent(activeStep)}</Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 2, position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 1, backgroundColor: 'background.default' }}>
        {activeStep > 0 ? (
          <Button onClick={() => setActiveStep((s) => s - 1)} disabled={creating}>Back</Button>
        ) : (
          <Button onClick={handleClose} disabled={creating}>Cancel</Button>
        )}

        <Box sx={{ flex: 1 }} />
        {isSummaryStep ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => void handleCreate()}
            disabled={!valid || creating}
            startIcon={creating ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            sx={{ fontWeight: 700, minWidth: { xs: '100%', sm: 220 } }}
          >
            {creating ? 'CREATING...' : mode === 'duplicate' ? 'Duplicate & Deploy' : 'Create & Deploy'}
          </Button>
        ) : (
          <Button variant="contained" onClick={() => setActiveStep((s) => s + 1)} disabled={creating} sx={{ fontWeight: 600 }}>
            Continue
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
