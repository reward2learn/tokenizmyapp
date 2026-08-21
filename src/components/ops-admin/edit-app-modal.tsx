'use client';

/**
 * EditAppModal — 15-step wizard for editing a SINGLE suite app, mirroring the
 * EditTenantModal / CreateAppWizard stepper but scoped to one existing app.
 *
 * Replaces the tiny 6-field AppEditDialog (in app-actions-menu.tsx) with a
 * full wizard so a platform admin can amend any app's configuration after
 * initial creation — template, branding colors, identity, and this app's own
 * deploy hook URL — while reviewing the inherited tenant config (license,
 * features, OpenAI key, Google OAuth, database, env, roles, admin/auth) and
 * running an app-scoped Flight Check before saving.
 *
 * Only the app-scoped fields are editable; everything else is read-only,
 * inherited from the tenant's saved configuration (tenants.metadata.config).
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import DnsIcon from '@mui/icons-material/Dns';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/Error';
import KeyIcon from '@mui/icons-material/Key';
import LanguageIcon from '@mui/icons-material/Language';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PaletteIcon from '@mui/icons-material/Palette';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import VerifiedIcon from '@mui/icons-material/Verified';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningIcon from '@mui/icons-material/Warning';

import { getTemplate, listTemplates } from '@/domain/tenant/template-catalog';
import { useListAllTemplatesQuery } from '@/store/apis/template-api';
import { DEFAULT_PLATFORM_ADMIN_EMAIL } from '@/domain/security/persons';
import {
  useListTenantsQuery,
  useEditAppMutation,
  useProvisionGoogleOAuthMutation,
  useLazyFetchGoogleOAuthClientInfoQuery,
  useSyncGoogleOAuthClientMutation,
  usePushAppEnvVarsMutation,
  usePushStripeEnvVarsMutation,
  useProvisionAppDeployHookMutation,
  type SuiteAppInstance,
  type GoogleOAuthConfigPatch,
  type AppScopedConfig,
} from '@/store/apis/tenant-api';
import { useListRoleConfigsQuery } from '@/store/apis/admin-api';
import { TenantAiProviderForm } from './tenant-ai-provider-form';
import {
  EMPTY_STRIPE_WIZARD,
  StripeIntegrationStep,
  type StripeWizardValues,
} from './stripe-integration-step';

// ── Types ──────────────────────────────────────────────────────

interface CheckItem {
  _key: string;
  label: string;
  status: 'pass' | 'fail' | 'warn';
  detail: string;
}

interface EnvPair {
  key: string;
  value: string;
}

interface ChangeItem {
  label: string;
  from: string;
  to: string;
}

// ── Constants ──────────────────────────────────────────────────

const EDIT_STEPS: Array<{ label: string; icon: React.ReactNode; key: string }> = [
  { label: 'Template', icon: <SettingsIcon fontSize="small" />, key: 'template' },
  { label: 'Preview', icon: <PaletteIcon fontSize="small" />, key: 'preview' },
  { label: 'App Identity', icon: <EditIcon fontSize="small" />, key: 'identity' },
  { label: 'License', icon: <KeyIcon fontSize="small" />, key: 'license' },
  { label: 'Features', icon: <AutoFixHighIcon fontSize="small" />, key: 'features' },
  { label: 'OpenAI API-Keys', icon: <KeyIcon fontSize="small" />, key: 'openai' },
  { label: 'Google OAuth', icon: <VerifiedUserIcon fontSize="small" />, key: 'oauth' },
  { label: 'Database', icon: <DnsIcon fontSize="small" />, key: 'database' },
  { label: 'Custom Env', icon: <CloudIcon fontSize="small" />, key: 'env' },
  { label: 'Deploy Hooks', icon: <RocketLaunchIcon fontSize="small" />, key: 'hooks' },
  { label: 'Stripe (Vercel)', icon: <PaymentIcon fontSize="small" />, key: 'stripe' },
  { label: 'Functional Roles', icon: <PeopleIcon fontSize="small" />, key: 'roles' },
  { label: 'Custom Domain', icon: <LanguageIcon fontSize="small" />, key: 'domain' },
  { label: 'Admin & Auth', icon: <VerifiedUserIcon fontSize="small" />, key: 'auth' },
  { label: 'Flight Check', icon: <VerifiedIcon fontSize="small" />, key: 'flightcheck' },
  { label: 'Summary', icon: <RocketLaunchIcon fontSize="small" />, key: 'summary' },
];

/** Helper component for summary display rows (mirrors EditTenantModal / CreateAppWizard). */
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

export interface EditAppModalProps {
  open: boolean;
  onClose: () => void;
  tenantSlug: string;
  app: SuiteAppInstance;
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
}

export function EditAppModal({ open, onClose, tenantSlug, app, onSnackbar }: EditAppModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState(app.name);
  const [department, setDepartment] = useState(app.department);
  const [templateId, setTemplateId] = useState(app.templateId);
  const [primaryColor, setPrimaryColor] = useState(app.primaryColor || getTemplate(app.templateId).defaultColors.primary);
  const [secondaryColor, setSecondaryColor] = useState(app.secondaryColor || getTemplate(app.templateId).defaultColors.secondary);
  const [deployHookUrl, setDeployHookUrl] = useState(app.deployHookUrl || '');
  const [stripeWizard, setStripeWizard] = useState<StripeWizardValues>(EMPTY_STRIPE_WIZARD);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [provisioningOAuth, setProvisioningOAuth] = useState(false);
  const [provisionOAuthResult, setProvisionOAuthResult] = useState<Record<string, unknown> | null>(null);
  const [provisionOAuthError, setProvisionOAuthError] = useState<string | null>(null);
  const [gcpClientInfo, setGcpClientInfo] = useState<Record<string, unknown> | null>(null);
  const [fetchingGcpInfo, setFetchingGcpInfo] = useState(false);
  const [syncingGcp, setSyncingGcp] = useState(false);
  // Editable GCP credentials (Google OAuth step) — persisted to the tenant
  // config via editApp.googleAuth and pushed to this app's Vercel project by
  // "Vercel Save & Push".
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthClientSecret, setOauthClientSecret] = useState('');
  const [oauthProjectId, setOauthProjectId] = useState('');
  const [oauthGcpEmail, setOauthGcpEmail] = useState('reward2learn@gmail.com');
  const [oauthSupportEmail, setOauthSupportEmail] = useState('');
  const [oauthAuthUri, setOauthAuthUri] = useState('https://accounts.google.com/o/oauth2/auth');
  const [oauthTokenUri, setOauthTokenUri] = useState('https://oauth2.googleapis.com/token');
  const [pushingEnv, setPushingEnv] = useState(false);
  // ── Editable per-app config state (steps 3-12) — prepopulated from
  //    app.config overrides ?? tenant config; saved per app_id. ──
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseTier, setLicenseTier] = useState('premium');
  const [validUntil, setValidUntil] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [dbUrl, setDbUrl] = useState('');
  const [dbDirectUrl, setDbDirectUrl] = useState('');
  const [envPairs, setEnvPairs] = useState<EnvPair[]>([]);
  const [adminEmail, setAdminEmail] = useState(DEFAULT_PLATFORM_ADMIN_EMAIL);
  const [pinSignInEnabled, setPinSignInEnabled] = useState(true);
  const [pins, setPins] = useState<string[]>([]);
  const [rolesEnabled, setRolesEnabled] = useState<string[]>([]);
  // Row editors
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newPin, setNewPin] = useState('');
  const [flightChecks, setFlightChecks] = useState<CheckItem[]>([]);
  const [flightRunning, setFlightRunning] = useState(false);

  const { data: tenantsData } = useListTenantsQuery();
  const [editApp] = useEditAppMutation();
  const [provisionGoogleOAuth] = useProvisionGoogleOAuthMutation();
  const [fetchGoogleOAuthClientInfo] = useLazyFetchGoogleOAuthClientInfoQuery();
  const [syncGoogleOAuthClient] = useSyncGoogleOAuthClientMutation();
  const [pushAppEnvVars] = usePushAppEnvVarsMutation();
  const [pushStripeEnv] = usePushStripeEnvVarsMutation();
  const [provisionDeployHook, { isLoading: generatingHook }] = useProvisionAppDeployHookMutation();
  const { data: rolesData, isLoading: rolesLoading } = useListRoleConfigsQuery();

  // Built-ins come from the compiled catalog; custom (AI-generated) templates
  // only exist in the platform DB, so the merged list has to be fetched. Falls
  // back to the built-ins if the request has not resolved or fails, which keeps
  // template selection working even when the endpoint is unavailable.
  const { data: templateData } = useListAllTemplatesQuery();
  const templates = templateData?.data?.templates ?? listTemplates();
  const tenant = tenantsData?.data?.tenants?.find((t) => t.slug === tenantSlug);
  const tenantCfg = ((tenant?.metadata as Record<string, unknown> | undefined)?.config ?? {}) as Record<string, unknown>;
  const rolesList = useMemo(() => rolesData?.data?.roles || [], [rolesData]);

  // ── Tenant config (shared defaults this app inherits) — memoized so the
  //    summary diff memo gets stable references. ──
  const cfg = useMemo(
    () => ((tenant?.metadata as Record<string, unknown>)?.config ?? {}) as Record<string, unknown>,
    [tenant],
  );
  const licenseCfg = useMemo(() => (cfg.license ?? {}) as Record<string, unknown>, [cfg]);
  const oauthCfg = useMemo(() => (cfg.googleAuth ?? {}) as Record<string, unknown>, [cfg]);
  const dbCfg = useMemo(() => (cfg.database ?? {}) as Record<string, unknown>, [cfg]);
  const envCfg = useMemo(() => (cfg.env ?? {}) as Record<string, string>, [cfg]);
  const authCfg = useMemo(() => (cfg.auth ?? {}) as Record<string, unknown>, [cfg]);
  // Tenant-level originals — the defaults this app inherits (used to
  // prepopulate the editable state and to compute the summary diff).
  const origLicenseKey = String((licenseCfg.key as string) || '');
  const origLicenseTier = String((licenseCfg.tier as string) || 'premium');
  const origValidUntil = String((licenseCfg.validUntil as string) || '');
  const origFeatures = useMemo(() => (licenseCfg.features as string[]) || [], [licenseCfg]);
  const origSetupToken = String((cfg.apiKey as string) || '');
  const origOpenaiApiKey = String((cfg.openaiApiKey as string) || '');
  const oauthRedirectUris = useMemo(
    () => (oauthCfg.redirectUris as string[]) || [],
    [oauthCfg.redirectUris],
  );
  const origDbUrl = String((dbCfg.databaseUrl as string) || (dbCfg.pooledUrl as string) || tenant?.dbUrl || '');
  const origDbDirectUrl = String((dbCfg.directUrl as string) || '');
  const origAdminEmail = String((authCfg.adminEmail as string) || (cfg.adminEmail as string) || DEFAULT_PLATFORM_ADMIN_EMAIL);
  const origPinSignInEnabled = authCfg.pinSignInEnabled !== false;
  const origPins = ((cfg.pins as string[]) || []).filter((p): p is string => !!p);
  // This app's own saved overrides (app.config) — wins over tenant defaults.
  const appCfg = useMemo(() => (app.config ?? {}) as AppScopedConfig, [app.config]);

  // ── Derived identity (stable — app already exists) ───────
  const vercelName = `${tenantSlug}-${app.appId}`;
  // Deployment URLs (team-scoped, e.g. "...-5h46xywpz-ilishaps-projects.vercel.app")
  // are transient — always display the stable alias for this app.
  const appUrl = app.appUrl && !app.appUrl.includes('-ilishaps-projects.vercel.app')
    ? app.appUrl
    : `https://${vercelName}.vercel.app`;
  const valid = !!name.trim();

  // This app's redirect URIs — must be registered in the tenant's GCP OAuth
  // client for Google sign-in to work on this app.
  const newAppRedirectUris = useMemo(() => [
    `https://${vercelName}.vercel.app`,
    `https://${vercelName}.vercel.app/api/auth?action=google-callback`,
    `https://${vercelName}.vercel.app/api/auth/callback/google`,
  ], [vercelName]);

  // ── Re-sync editable state when (re)opening or switching apps ──
  useEffect(() => {
    if (!open) return;
    setName(app.name);
    setDepartment(app.department);
    setTemplateId(app.templateId);
    setPrimaryColor(app.primaryColor || getTemplate(app.templateId).defaultColors.primary);
    setSecondaryColor(app.secondaryColor || getTemplate(app.templateId).defaultColors.secondary);
    setDeployHookUrl(app.deployHookUrl || '');
    setActiveStep(0);
    setShowSecret(false);
    setFlightChecks([]);
    setProvisionOAuthResult(null);
    setProvisionOAuthError(null);
    setGcpClientInfo(null);
    setOauthClientId(String((oauthCfg.clientId as string) || ''));
    setOauthClientSecret(String((oauthCfg.clientSecret as string) || ''));
    setOauthProjectId(String((oauthCfg.projectId as string) || ''));
    setOauthGcpEmail(String((oauthCfg.gcpAccountEmail as string) || 'reward2learn@gmail.com'));
    setOauthSupportEmail(String((oauthCfg.supportEmail as string) || ''));
    setOauthAuthUri(String((oauthCfg.authUri as string) || 'https://accounts.google.com/o/oauth2/auth'));
    setOauthTokenUri(String((oauthCfg.tokenUri as string) || 'https://oauth2.googleapis.com/token'));
    // Editable per-app config — app.config overrides ?? tenant defaults
    setLicenseKey(String(appCfg.license?.key || origLicenseKey));
    setLicenseTier(String(appCfg.license?.tier || origLicenseTier));
    setValidUntil(String(appCfg.license?.validUntil || origValidUntil));
    setFeatures((appCfg.license?.features as string[]) || origFeatures);
    setSetupToken(String(appCfg.apiKey || origSetupToken));
    setOpenaiApiKey(String(appCfg.openaiApiKey || origOpenaiApiKey));
    setDbUrl(String(appCfg.database?.databaseUrl || appCfg.database?.pooledUrl || origDbUrl));
    setDbDirectUrl(String(appCfg.database?.directUrl || origDbDirectUrl));
    setEnvPairs(Object.entries(appCfg.env ?? envCfg).map(([k, v]) => ({ key: k, value: v })));
    setAdminEmail(String(appCfg.auth?.adminEmail || origAdminEmail));
    setPinSignInEnabled(appCfg.auth?.pinSignInEnabled ?? origPinSignInEnabled);
    setPins(appCfg.pins || origPins);
    setRolesEnabled(appCfg.roles?.enabled ?? rolesList.map((r) => r.code));
    setNewEnvKey('');
    setNewEnvValue('');
    setNewFeature('');
    setNewPin('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, app.appId]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  /** Auto-provision this app's Vercel Deploy Hook via the Vercel API rather
   *  than making the operator create one by hand and paste the URL. Writes
   *  straight through to the app record, so it survives without also needing
   *  "Save All Changes". */
  const handleGenerateDeployHook = useCallback(async () => {
    try {
      const res = await provisionDeployHook({ slug: tenantSlug, appId: app.appId }).unwrap();
      const url = res.data?.deployHookUrl;
      if (url) {
        setDeployHookUrl(url);
        const projectLabel = res.data?.vercelProjectName || vercelName;
        onSnackbar({
          message: res.data?.created
            ? `✅ Deploy hook created on Vercel (${projectLabel})`
            : `✅ Reused existing Vercel deploy hook (${projectLabel})`,
          severity: 'success',
        });
      }
    } catch (err) {
      const message = err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { error?: string } }).data?.error ?? 'Failed to generate deploy hook')
        : 'Failed to generate deploy hook';
      onSnackbar({ message: `❌ ${message}`, severity: 'error' });
    }
  }, [provisionDeployHook, tenantSlug, app.appId, onSnackbar, vercelName]);

  // ── Google OAuth provisioning (interactive) ────────────────
  const handleProvisionOAuth = useCallback(async () => {
    setProvisioningOAuth(true);
    setProvisionOAuthError(null);
    setProvisionOAuthResult(null);
    try {
      const allRedirectUris = [...new Set([...oauthRedirectUris, ...newAppRedirectUris])];
      const result = await provisionGoogleOAuth({
        slug: tenantSlug,
        email: oauthGcpEmail.trim() || 'reward2learn@gmail.com',
        redirectUris: allRedirectUris,
      }).unwrap();
      if (result.data) {
        setProvisionOAuthResult(result.data as unknown as Record<string, unknown>);
        onSnackbar({ message: `✅ OAuth redirect URIs updated for ${vercelName}`, severity: 'success' });
      }
    } catch (err) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { error?: string } }).data?.error || 'OAuth provisioning failed')
        : 'OAuth provisioning failed';
      setProvisionOAuthError(msg);
      onSnackbar({ message: `❌ ${msg}`, severity: 'error' });
    } finally {
      setProvisioningOAuth(false);
    }
  }, [vercelName, oauthRedirectUris, newAppRedirectUris, oauthGcpEmail, tenantSlug, provisionGoogleOAuth, onSnackbar]);

  // ── Fetch current OAuth client data from Google (SDK/REST) ──
  const handleFetchGcpClientInfo = useCallback(async () => {
    setFetchingGcpInfo(true);
    setGcpClientInfo(null);
    try {
      const result = await fetchGoogleOAuthClientInfo({ slug: tenantSlug }).unwrap();
      if (result.data) {
        setGcpClientInfo(result.data as unknown as Record<string, unknown>);
        onSnackbar({ message: '🌐 Fetched current GCP OAuth client data', severity: 'success' });
      }
    } catch (err) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { error?: string } }).data?.error || 'Failed to fetch GCP client info')
        : 'Failed to fetch GCP client info';
      onSnackbar({ message: `❌ ${msg}`, severity: 'error' });
    } finally {
      setFetchingGcpInfo(false);
    }
  }, [tenantSlug, fetchGoogleOAuthClientInfo, onSnackbar]);

  // ── Sync from GCP: fetch live data + write back to config ──
  const handleSyncGcp = useCallback(async () => {
    setSyncingGcp(true);
    setGcpClientInfo(null);
    try {
      const result = await syncGoogleOAuthClient({ slug: tenantSlug, patch: true }).unwrap();
      if (result.data) {
        setGcpClientInfo(result.data as unknown as Record<string, unknown>);
        const d = result.data as unknown as { apiUnavailable?: boolean; patched?: boolean; mergedUris?: string[] };
        if (d.apiUnavailable) {
          onSnackbar({ message: '⚠️ GCP API unavailable — using saved config (see guidance)', severity: 'success' });
        } else {
          onSnackbar({
            message: `✅ Synced from GCP — ${(d.mergedUris || []).length} redirect URIs${d.patched ? ' (client patched)' : ''}`,
            severity: 'success',
          });
        }
      }
    } catch (err) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { error?: string } }).data?.error || 'Failed to sync GCP client')
        : 'Failed to sync GCP client';
      onSnackbar({ message: `❌ ${msg}`, severity: 'error' });
    } finally {
      setSyncingGcp(false);
    }
  }, [tenantSlug, syncGoogleOAuthClient, onSnackbar]);

  // ── Flight Check (app-scoped) ───────────────────────────────
  const runFlightCheck = useCallback(async () => {
    setFlightRunning(true);
    const results: CheckItem[] = [];
    const addResult = (label: string, status: 'pass' | 'fail' | 'warn', detail: string) => {
      results.push({ label, status, detail, _key: label.replace(/\s+/g, '-').toLowerCase() });
    };

    // App identity
    addResult('App Name', name.trim() ? 'pass' : 'fail', name.trim() || 'Missing — enter a name in the App Identity step');
    addResult('App ID', 'pass', app.appId);
    addResult('Vercel Project Name', app.vercelProjectId ? 'pass' : 'warn',
      app.vercelProjectId ? vercelName : `${vercelName} — Vercel project not created yet (deploy the app)`);

    // Deploy status
    const deployDetail = app.status === 'live' ? `Live — ${appUrl}` :
      app.status === 'error' ? 'Deploy error — check Vercel project' : `Status: ${app.status}`;
    addResult('Deploy Status',
      app.status === 'live' ? 'pass' : app.status === 'error' ? 'fail' : 'warn',
      deployDetail);
    addResult('App URL', appUrl ? 'pass' : 'warn', appUrl || 'Not set — deploy the app to get a URL');

    // Inherited tenant config
    addResult('Database URL', dbUrl ? 'pass' : 'fail', dbUrl ? dbUrl.slice(0, 40) + '...' : 'Missing — provision a Neon database in the tenant');
    addResult('Google OAuth Client ID', oauthClientId ? 'pass' : 'fail', oauthClientId ? oauthClientId.slice(0, 25) + '...' : 'Missing — configure in the tenant');
    const allRegistered = newAppRedirectUris.every((u) => oauthRedirectUris.includes(u));
    addResult('New App Redirect URIs', allRegistered ? 'pass' : 'warn',
      allRegistered ? 'All registered' : `${newAppRedirectUris.filter((u) => !oauthRedirectUris.includes(u)).length} of ${newAppRedirectUris.length} URIs not registered — add them in the Google OAuth step`);
    addResult('License Key', licenseKey ? 'pass' : 'fail', licenseKey ? licenseKey.slice(0, 25) + '...' : 'Missing');
    addResult('Admin Email', adminEmail ? 'pass' : 'fail', adminEmail || 'Not set');
    addResult('OpenAI API Key', openaiApiKey ? 'pass' : 'warn', openaiApiKey ? 'Configured' : 'Not set — add OPENAI_API_KEY env var');

    // Stripe payment keys (inherited from the tenant's Organization & Billing step)
    const stripeCfg = (cfg.stripe ?? {}) as Record<string, unknown>;
    const stripeSecret = String(stripeCfg.secretKey ?? '');
    const stripeWebhook = String(stripeCfg.webhookSecret ?? '');
    const stripePublishable = String(stripeCfg.publishableKey ?? '');
    const stripeComplete = !!(stripeSecret && stripeWebhook && stripePublishable);
    if (stripeComplete) {
      const mode = stripeSecret.startsWith('sk_test_') ? 'test' : 'live';
      addResult('Stripe Payment Keys', 'pass', `Configured (${mode} mode) — Payment Methods available`);
    } else {
      addResult('Stripe Payment Keys', 'warn',
        'Not set up — Payment Methods will NOT be available for this app until the Stripe keys are set in the tenant\'s Organization & Billing step');
    }

    setFlightChecks(results);
    setFlightRunning(false);
  }, [name, app, appUrl, vercelName, dbUrl, oauthClientId, oauthRedirectUris, newAppRedirectUris, licenseKey, adminEmail, openaiApiKey, cfg]);

  // ── Save (PATCH app-scoped fields + editable GCP credentials + the full
  //    per-app config snapshot — stored per app_id in the appPack AND
  //    mirrored into the tenant DB's app_settings row "{slug}__{appId}"). ──
  const persistApp = useCallback(async () => {
    // Empty strings are dropped (JSON.stringify omits undefined) so cleared
    // fields never blank out previously saved tenant/app values; an empty
    // clientSecret keeps the existing secret.
    const googleAuth: GoogleOAuthConfigPatch = {
      enabled: !!oauthClientId.trim() || !!oauthClientSecret.trim(),
      clientId: oauthClientId.trim() || undefined,
      clientSecret: oauthClientSecret.trim() || undefined,
      projectId: oauthProjectId.trim() || undefined,
      authUri: oauthAuthUri.trim() || undefined,
      tokenUri: oauthTokenUri.trim() || undefined,
      gcpAccountEmail: oauthGcpEmail.trim() || undefined,
      supportEmail: oauthSupportEmail.trim() || undefined,
    };
    const appConfig: AppScopedConfig = {
      license: {
        key: licenseKey.trim(),
        tier: licenseTier.trim() || 'premium',
        validUntil: validUntil.trim(),
        features,
      },
      apiKey: setupToken.trim(),
      openaiApiKey: openaiApiKey.trim(),
      googleAuth,
      database: {
        databaseUrl: dbUrl.trim(),
        pooledUrl: dbUrl.trim(),
        directUrl: dbDirectUrl.trim(),
      },
      env: Object.fromEntries(
        envPairs.filter((p) => p.key.trim()).map((p) => [p.key.trim(), p.value]),
      ),
      auth: {
        adminEmail: adminEmail.trim() || DEFAULT_PLATFORM_ADMIN_EMAIL,
        pinSignInEnabled,
      },
      pins: pins.filter((p) => p.trim()),
      roles: { enabled: rolesEnabled },
    };
    await editApp({
      slug: tenantSlug,
      appId: app.appId,
      name: name.trim() || app.name,
      department: department.trim() || app.department,
      templateId,
      primaryColor,
      secondaryColor,
      deployHookUrl: deployHookUrl.trim() || null,
      googleAuth,
      config: appConfig,
    }).unwrap();
  }, [editApp, tenantSlug, app, name, department, templateId, primaryColor, secondaryColor, deployHookUrl, oauthClientId, oauthClientSecret, oauthProjectId, oauthAuthUri, oauthTokenUri, oauthGcpEmail, oauthSupportEmail, licenseKey, licenseTier, validUntil, features, setupToken, openaiApiKey, dbUrl, dbDirectUrl, envPairs, adminEmail, pinSignInEnabled, pins, rolesEnabled]);

  const handleSave = async (stayOpen = false) => {
    if (!valid || saving || pushingEnv) return;
    setSaving(true);
    try {
      await persistApp();
      onSnackbar({ message: `✅ ${app.name} updated`, severity: 'success' });
      if (!stayOpen) onClose();
    } catch (err) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { error?: string } }).data?.error || 'Failed to save')
        : 'Failed to save';
      onSnackbar({ message: `❌ ${msg}`, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── Save + Push (Summary step): persist config, then push ALL required
  //    env vars (GOOGLE_CLIENT_ID/SECRET/PROJECT_ID, DB URL, PINs, custom
  //    env, NEXT_PUBLIC_*) to this app's own Vercel project. ─────────────
  const handleSaveAndPush = async () => {
    if (!valid || saving || pushingEnv) return;
    setSaving(true);
    try {
      await persistApp();
      onSnackbar({ message: `✅ ${app.name} saved`, severity: 'success' });
      setPushingEnv(true);
      try {
        const envRes = await pushAppEnvVars({ slug: tenantSlug, appId: app.appId }).unwrap();
        const envCount = envRes.data?.envCount ?? 0;
        let stripeNote = '';
        if (stripeWizard.enabled) {
          try {
            const stripeRes = await pushStripeEnv({ slug: tenantSlug }).unwrap();
            stripeNote = ` · Stripe env → ${stripeRes.data?.envCount ?? 0} vars`;
          } catch {
            stripeNote = ' · Stripe env push failed (check tenant Organization & Billing keys)';
          }
        }
        onSnackbar({ message: `✅ ${envCount} env vars pushed to Vercel (${vercelName})${stripeNote}`, severity: 'success' });
        onClose();
      } catch (envErr) {
        const msg = envErr && typeof envErr === 'object' && 'data' in envErr
          ? String((envErr as { data?: { error?: string } }).data?.error || 'Env push failed')
          : 'Env push failed';
        onSnackbar({ message: `❌ Config saved, but env push failed: ${msg}`, severity: 'error' });
      }
    } catch (err) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { error?: string } }).data?.error || 'Failed to save')
        : 'Failed to save';
      onSnackbar({ message: `❌ ${msg}`, severity: 'error' });
    } finally {
      setSaving(false);
      setPushingEnv(false);
    }
  };

  // ── Detected changes (Summary step) ─────────────────────────
  const changes = useMemo<ChangeItem[]>(() => {
    const origPrimary = app.primaryColor || getTemplate(app.templateId).defaultColors.primary;
    const origSecondary = app.secondaryColor || getTemplate(app.templateId).defaultColors.secondary;
    const origHook = app.deployHookUrl || '';
    // Effective originals = app.config overrides ?? tenant defaults
    const effKey = String(appCfg.license?.key || origLicenseKey);
    const effTier = String(appCfg.license?.tier || origLicenseTier);
    const effValid = String(appCfg.license?.validUntil || origValidUntil);
    const effFeatures = (appCfg.license?.features as string[]) || origFeatures;
    const effOpenai = String(appCfg.openaiApiKey || origOpenaiApiKey);
    const effOauthId = String(appCfg.googleAuth?.clientId || oauthCfg.clientId || '');
    const effDb = String(appCfg.database?.databaseUrl || appCfg.database?.pooledUrl || origDbUrl);
    const effEnv = appCfg.env ?? envCfg;
    const effAdmin = String(appCfg.auth?.adminEmail || origAdminEmail);
    const effPin = appCfg.auth?.pinSignInEnabled ?? origPinSignInEnabled;
    const effRoles = appCfg.roles?.enabled ?? rolesList.map((r) => r.code);
    const out: ChangeItem[] = [];
    if ((name.trim() || app.name) !== app.name) out.push({ label: 'Name', from: app.name, to: name.trim() });
    if ((department.trim() || app.department) !== app.department) out.push({ label: 'Department', from: app.department || '(none)', to: department.trim() || '(none)' });
    if (templateId !== app.templateId) out.push({ label: 'Template', from: getTemplate(app.templateId).label, to: getTemplate(templateId).label });
    if (primaryColor !== origPrimary) out.push({ label: 'Primary Color', from: origPrimary, to: primaryColor });
    if (secondaryColor !== origSecondary) out.push({ label: 'Secondary Color', from: origSecondary, to: secondaryColor });
    if (deployHookUrl.trim() !== origHook) out.push({ label: 'Deploy Hook URL', from: origHook || '(none)', to: deployHookUrl.trim() || '(none)' });
    if ((licenseKey.trim() || effKey) !== effKey) out.push({ label: 'License Key', from: effKey || '(none)', to: licenseKey.trim() || '(none)' });
    if ((licenseTier.trim() || effTier) !== effTier) out.push({ label: 'License Tier', from: effTier, to: licenseTier.trim() || effTier });
    if ((validUntil.trim() || effValid) !== effValid) out.push({ label: 'Valid Until', from: effValid || '(none)', to: validUntil.trim() || '(none)' });
    if (JSON.stringify(features) !== JSON.stringify(effFeatures)) out.push({ label: 'Features', from: effFeatures.join(', ') || '(none)', to: features.join(', ') || '(none)' });
    if ((openaiApiKey.trim() || effOpenai) !== effOpenai) out.push({ label: 'OpenAI Key', from: effOpenai ? '✅ configured' : '(none)', to: openaiApiKey.trim() ? '✅ configured' : '(none)' });
    if ((oauthClientId.trim() || effOauthId) !== effOauthId) out.push({ label: 'OAuth Client ID', from: effOauthId ? effOauthId.slice(0, 30) + '...' : '(none)', to: oauthClientId.trim() ? oauthClientId.trim().slice(0, 30) + '...' : '(none)' });
    if ((dbUrl.trim() || effDb) !== effDb) out.push({ label: 'Database URL', from: effDb ? '✅ configured' : '(none)', to: dbUrl.trim() ? '✅ configured' : '(none)' });
    const envKeys = Object.keys(Object.fromEntries(envPairs.filter((p) => p.key.trim()).map((p) => [p.key.trim(), p.value])));
    const effEnvKeys = Object.keys(effEnv);
    if (JSON.stringify(envKeys) !== JSON.stringify(effEnvKeys)) out.push({ label: 'Env Vars', from: effEnvKeys.join(', ') || '(none)', to: envKeys.join(', ') || '(none)' });
    if ((adminEmail.trim() || effAdmin) !== effAdmin) out.push({ label: 'Admin Email', from: effAdmin, to: adminEmail.trim() || effAdmin });
    if (pinSignInEnabled !== effPin) out.push({ label: 'PIN Sign-in', from: effPin ? 'Enabled' : 'Disabled', to: pinSignInEnabled ? 'Enabled' : 'Disabled' });
    if (JSON.stringify(rolesEnabled) !== JSON.stringify(effRoles)) out.push({ label: 'Roles', from: `${effRoles.length} enabled`, to: `${rolesEnabled.length} enabled` });
    return out;
  }, [app, name, department, templateId, primaryColor, secondaryColor, deployHookUrl, appCfg, origLicenseKey, origLicenseTier, origValidUntil, origFeatures, origOpenaiApiKey, oauthCfg, origDbUrl, envCfg, origAdminEmail, origPinSignInEnabled, rolesList, licenseKey, licenseTier, validUntil, features, openaiApiKey, oauthClientId, dbUrl, envPairs, adminEmail, pinSignInEnabled, rolesEnabled]);

  // ── Step renderers ──────────────────────────────────────────

  // Step 0: Template — editable, prefilled from app.templateId
  const renderStepTemplate = () => (
    <Stack spacing={2}>
      <Alert severity="info" icon={<AutoFixHighIcon />} sx={{ fontSize: '0.8rem' }}>
        Prefilled from this app&apos;s current template — change only if this app needs a different sector schema.
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

  // Step 1: Preview — app's branding colors (editable, live preview)
  const renderStepPreview = () => (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        This app&apos;s brand colors override the tenant defaults when set. Edit them below and preview the result.
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
              {name || app.name}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Chip label={primaryColor} size="small" sx={{ bgcolor: primaryColor, color: '#fff' }} />
              <Chip label={secondaryColor} size="small" sx={{ bgcolor: secondaryColor, color: '#000' }} />
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <TextField
            label="Primary Color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: primaryColor, border: '1px solid', borderColor: 'divider' }} /></InputAdornment> } }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <TextField
            label="Secondary Color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: secondaryColor, border: '1px solid', borderColor: 'divider' }} /></InputAdornment> } }}
          />
        </Box>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'background.default' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <PaletteIcon color="primary" fontSize="small" />
          <Typography variant="caption" color="text.secondary">Live Preview</Typography>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {tenant?.faviconData ? (
            <Avatar src={tenant.faviconData} sx={{ width: 32, height: 32 }} variant="rounded" />
          ) : null}
          <Box sx={{ px: 2, py: 1, borderRadius: 1, bgcolor: primaryColor, color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
            Primary Button
          </Box>
          <Box sx={{ px: 2, py: 1, borderRadius: 1, border: '1px solid', borderColor: secondaryColor, color: secondaryColor, fontSize: '0.8rem', fontWeight: 700 }}>
            Secondary
          </Box>
          <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: primaryColor }} />
          <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: secondaryColor }} />
        </Stack>
      </Paper>
    </Stack>
  );

  // Step 2: App Identity — editable name/department, read-only appId/vercel
  const renderStepIdentity = () => (
    <Stack spacing={2.5}>
      <TextField
        label="App Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        size="small"
        autoFocus
        error={!name.trim()}
        helperText={name.trim() ? '' : 'Name is required to save'}
      />
      <TextField
        label="Department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        fullWidth
        size="small"
        placeholder="e.g. Operations"
        helperText="Optional — groups this app in the tenant's suite view."
      />
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Deployment identity (read-only — the app ID cannot change after creation)
        </Typography>
        <Stack spacing={0.75}>
          <SummaryRow label="App ID" value={app.appId} />
          <SummaryRow label="Vercel name" value={vercelName} />
          <SummaryRow label="App URL" value={appUrl} />
          <SummaryRow label="Status" value={app.status} />
          <SummaryRow label="Vercel Project ID" value={app.vercelProjectId ? app.vercelProjectId : '⚠️ not deployed yet'} />
        </Stack>
      </Paper>
    </Stack>
  );

  // Step 3: License — editable (prefilled from app.config ?? tenant config)
  const renderStepLicense = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <KeyIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>License</Typography>
      </Stack>
      <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
        Prefilled from the tenant&apos;s license — change values here to override them for this app only.
        Saved per app_id and pushed to this app&apos;s Vercel project.
      </Alert>
      <Stack spacing={1.5}>
        <TextField
          label="License Key"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          fullWidth
          size="small"
          placeholder="rrb-{tenant-slug}"
          slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            label="Tier"
            value={licenseTier}
            onChange={(e) => setLicenseTier(e.target.value)}
            fullWidth
            size="small"
            placeholder="premium"
          />
          <TextField
            label="Valid Until"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            fullWidth
            size="small"
            placeholder="2027-12-31"
          />
        </Stack>
        <TextField
          label="Setup Token"
          value={setupToken}
          onChange={(e) => setSetupToken(e.target.value)}
          fullWidth
          size="small"
          slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
        />
      </Stack>
    </Stack>
  );

  // Step 4: Features — editable (prefilled from app.config ?? tenant config)
  const renderStepFeatures = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <AutoFixHighIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Features</Typography>
      </Stack>
      <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
        Prefilled from the tenant&apos;s feature flags — add/remove features to override them for this app only.
      </Alert>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
          {features.length > 0 ? features.map((f) => (
            <Chip
              key={f}
              label={f}
              size="small"
              variant="outlined"
              color="primary"
              onDelete={() => setFeatures((prev) => prev.filter((x) => x !== f))}
            />
          )) : (
            <Typography variant="body2" color="text.secondary">No features configured.</Typography>
          )}
        </Stack>
      </Paper>
      <Stack direction="row" spacing={1}>
        <TextField
          label="Add feature"
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          size="small"
          fullWidth
          placeholder="e.g. ai-chat"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newFeature.trim()) {
              setFeatures((prev) => [...prev, newFeature.trim()]);
              setNewFeature('');
            }
          }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            if (newFeature.trim()) {
              setFeatures((prev) => [...prev, newFeature.trim()]);
              setNewFeature('');
            }
          }}
          disabled={!newFeature.trim()}
        >
          Add
        </Button>
      </Stack>
    </Stack>
  );

  // Step 5: AI Provider — TenantAiProviderForm saves immediately to this
  // app's own dedicated database (no dependency on this modal's Save All
  // Changes / diff-tracking flow below). The legacy OpenAI-only field stays
  // for backward compatibility with existing saved values.
  const renderStepOpenAi = () => (
    <Stack spacing={3}>
      <TenantAiProviderForm tenantSlug={tenantSlug} appId={app.appId} />

      <Divider />

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <KeyIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Legacy OpenAI API Key</Typography>
      </Stack>
      <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>
        Superseded by the AI Provider section above, which takes effect immediately. This field is only
        saved into the app&apos;s config JSON — it is not currently pushed as an env var to this app&apos;s
        Vercel project.
      </Alert>
      <TextField
        label="OpenAI API Key"
        value={openaiApiKey}
        onChange={(e) => setOpenaiApiKey(e.target.value)}
        fullWidth
        size="small"
        type={showSecret ? 'text' : 'password'}
        placeholder="sk-..."
        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
      />
      <FormControlLabel
        control={<Checkbox checked={showSecret} onChange={(e) => setShowSecret(e.target.checked)} size="small" />}
        label={<Typography variant="caption">Reveal API key</Typography>}
      />
    </Stack>
  );

  // Step 6: Google OAuth — interactive: register this app's redirect URIs
  const renderStepOAuth = () => {
    const registeredUris = new Set(oauthRedirectUris);
    const missingUris = newAppRedirectUris.filter((u) => !registeredUris.has(u));
    const allUrisRegistered = missingUris.length === 0;

    return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <VerifiedUserIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Google OAuth 2.0</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          This app shares the tenant&apos;s Google OAuth client. The app&apos;s redirect URIs must be
          registered in the existing GCP OAuth client for Google sign-in to work.
        </Typography>

        {/* Tenant's Google OAuth config — EDITABLE GCP credentials */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>GCP Credentials (editable)</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Saved to the tenant config and pushed to this app&apos;s Vercel project as{' '}
            <strong>GOOGLE_CLIENT_ID</strong> / <strong>GOOGLE_CLIENT_SECRET</strong> /{' '}
            <strong>GOOGLE_PROJECT_ID</strong> by the &quot;Vercel Save &amp; Push&quot; button on the
            Summary step. Leave the secret blank to keep the existing value.
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              label="GCP Project ID"
              value={oauthProjectId}
              onChange={(e) => setOauthProjectId(e.target.value)}
              fullWidth
              size="small"
              placeholder="redruby-fpa"
            />
            <TextField
              label="Client ID"
              value={oauthClientId}
              onChange={(e) => setOauthClientId(e.target.value)}
              fullWidth
              size="small"
              placeholder="1234-abc.apps.googleusercontent.com"
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
            />
            <TextField
              label="Client Secret"
              value={oauthClientSecret}
              onChange={(e) => setOauthClientSecret(e.target.value)}
              fullWidth
              size="small"
              type={showSecret ? 'text' : 'password'}
              placeholder={oauthClientSecret ? '•••••••• (keep existing)' : 'Paste client secret'}
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
            />
            <FormControlLabel
              control={<Checkbox checked={showSecret} onChange={(e) => setShowSecret(e.target.checked)} size="small" />}
              label={<Typography variant="caption">Reveal client secret</Typography>}
            />
            <TextField
              label="GCP Account Email"
              value={oauthGcpEmail}
              onChange={(e) => setOauthGcpEmail(e.target.value)}
              fullWidth
              size="small"
              placeholder="reward2learn@gmail.com"
            />
            <TextField
              label="Support Email"
              value={oauthSupportEmail}
              onChange={(e) => setOauthSupportEmail(e.target.value)}
              fullWidth
              size="small"
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                label="Auth URI"
                value={oauthAuthUri}
                onChange={(e) => setOauthAuthUri(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Token URI"
                value={oauthTokenUri}
                onChange={(e) => setOauthTokenUri(e.target.value)}
                fullWidth
                size="small"
              />
            </Stack>
          </Stack>
        </Paper>

        {/* This app's redirect URIs */}
        <Paper variant="outlined" sx={{ p: 2.5, borderColor: 'primary.main' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
            <VerifiedUserIcon color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              This App&apos;s Redirect URIs
            </Typography>
            <Chip
              label={allUrisRegistered ? '✅ All registered' : `${missingUris.length} missing`}
              size="small"
              color={allUrisRegistered ? 'success' : 'warning'}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These redirect URIs are for this app&apos;s Vercel project (<strong>{vercelName}</strong>).
            Add them to the GCP Console&apos;s OAuth client to enable Google sign-in.
          </Typography>

          <Stack spacing={0.5}>
            {newAppRedirectUris.map((uri) => {
              const isRegistered = registeredUris.has(uri);
              return (
                <Stack key={uri} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  {isRegistered ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <WarningIcon color="warning" fontSize="small" />
                  )}
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'text.secondary', flex: 1 }}>
                    {uri}
                  </Typography>
                  {isRegistered && (
                    <Chip label="Registered" size="small" color="success" variant="outlined" />
                  )}
                </Stack>
              );
            })}
          </Stack>

          {/* Action buttons */}
          {missingUris.length > 0 && (
            <Stack direction="row" spacing={1.5} sx={{ mt: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                href={`https://console.cloud.google.com/apis/credentials?project=${oauthProjectId || tenantSlug}`}
                target="_blank"
                startIcon={<OpenInNewIcon />}
              >
                Open GCP Console
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => void handleProvisionOAuth()}
                disabled={provisioningOAuth || !oauthGcpEmail.trim()}
                startIcon={provisioningOAuth ? <CircularProgress size={16} color="inherit" /> : <AutoFixHighIcon />}
              >
                {provisioningOAuth ? 'Adding...' : 'Auto-add Redirect URIs'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => void handleFetchGcpClientInfo()}
                disabled={fetchingGcpInfo}
                startIcon={fetchingGcpInfo ? <CircularProgress size={16} color="inherit" /> : <CloudDownloadIcon />}
              >
                {fetchingGcpInfo ? 'Fetching...' : 'Fetch from GCP'}
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => void handleSyncGcp()}
                disabled={syncingGcp}
                startIcon={syncingGcp ? <CircularProgress size={16} color="inherit" /> : <CloudSyncIcon />}
              >
                {syncingGcp ? 'Syncing...' : 'Sync from GCP'}
              </Button>
            </Stack>
          )}
        </Paper>

        {/* Existing tenant redirect URIs (reference) */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Existing Tenant Redirect URIs</Typography>
          {oauthRedirectUris.length > 0 ? (
            <Stack spacing={0.5}>
              {oauthRedirectUris.map((uri) => (
                <Typography key={uri} variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'text.secondary' }}>
                  {uri}
                </Typography>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">No redirect URIs configured.</Typography>
          )}
        </Paper>

        {/* Auto-provision result/error */}
        {provisionOAuthResult && (
          <Alert severity="success">
            <AlertTitle>✅ OAuth Redirect URIs Updated</AlertTitle>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(provisionOAuthResult, null, 2)}
            </Typography>
          </Alert>
        )}
        {provisionOAuthError && (
          <Alert severity="error">
            <AlertTitle>❌ OAuth Provisioning Failed</AlertTitle>
            {provisionOAuthError}
          </Alert>
        )}
        {gcpClientInfo && (
          <Alert severity={gcpClientInfo.apiUnavailable ? 'warning' : 'info'}>
            <AlertTitle>🌐 GCP OAuth Client Data</AlertTitle>
            {!!gcpClientInfo.apiUnavailable && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                Google removed the OAuth client management API — redirect URIs can only be managed
                in the{' '}
                <a
                  href={`https://console.cloud.google.com/auth/clients?project=${String((gcpClientInfo as Record<string, unknown>).projectId ?? oauthProjectId) || tenantSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0af9fe' }}
                >
                  GCP Console
                </a>
                . Showing the saved config as best-known state — verify these URIs are registered.
              </Typography>
            )}
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(gcpClientInfo, null, 2)}
            </Typography>
          </Alert>
        )}
      </Stack>
    );
  };

  // Step 7: Database — editable (prefilled from app.config ?? tenant config)
  const renderStepDatabase = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <DnsIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Database</Typography>
      </Stack>
      <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
        This app shares the tenant&apos;s existing database, scoped by the synthetic key{' '}
        <strong>{vercelName}</strong>. Prefilled from the tenant — change the URLs to point this app
        at a different database (pushed as <strong>POSTGRES_URL</strong> /{' '}
        <strong>POSTGRES_URL_NON_POOLING</strong>).
      </Alert>
      <Stack spacing={1.5}>
        <TextField
          label="Pooled URL"
          value={dbUrl}
          onChange={(e) => setDbUrl(e.target.value)}
          fullWidth
          size="small"
          placeholder="postgresql://user:***@pooled.neon.tech/db"
          slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.75rem' } } }}
        />
        <TextField
          label="Direct URL"
          value={dbDirectUrl}
          onChange={(e) => setDbDirectUrl(e.target.value)}
          fullWidth
          size="small"
          placeholder="postgresql://user:***@ep-xxx.aws.neon.tech/db"
          slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.75rem' } } }}
        />
      </Stack>
    </Stack>
  );

  // Step 8: Custom Env — editable rows (prefilled from app.config ?? tenant config)
  const renderStepEnv = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <CloudIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Custom Env Vars</Typography>
      </Stack>
      <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
        Prefilled from the tenant&apos;s shared env vars — add/remove/edit to override them for this app
        only. Pushed to this app&apos;s Vercel project by &quot;Vercel Save &amp; Push&quot;.
      </Alert>
      <Paper variant="outlined" sx={{ p: 2 }}>
        {envPairs.length > 0 ? (
          <Stack spacing={1}>
            {envPairs.map((pair, index) => (
              <Stack key={index} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <TextField
                  label="Key"
                  value={pair.key}
                  onChange={(e) => {
                    const u = [...envPairs];
                    u[index].key = e.target.value;
                    setEnvPairs(u);
                  }}
                  size="small"
                  sx={{ flex: 1 }}
                  slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.75rem' } } }}
                />
                <TextField
                  label="Value"
                  value={pair.value}
                  onChange={(e) => {
                    const u = [...envPairs];
                    u[index].value = e.target.value;
                    setEnvPairs(u);
                  }}
                  size="small"
                  sx={{ flex: 2 }}
                  slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.75rem' } } }}
                />
                <IconButton size="small" onClick={() => setEnvPairs((prev) => prev.filter((_, i) => i !== index))} aria-label="remove env var">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">No custom env vars configured.</Typography>
        )}
      </Paper>
      <Stack direction="row" spacing={1}>
        <TextField
          label="New key"
          value={newEnvKey}
          onChange={(e) => setNewEnvKey(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.75rem' } } }}
        />
        <TextField
          label="New value"
          value={newEnvValue}
          onChange={(e) => setNewEnvValue(e.target.value)}
          size="small"
          sx={{ flex: 2 }}
          slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.75rem' } } }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            if (newEnvKey.trim()) {
              setEnvPairs((prev) => [...prev, { key: newEnvKey.trim(), value: newEnvValue }]);
              setNewEnvKey('');
              setNewEnvValue('');
            }
          }}
          disabled={!newEnvKey.trim()}
        >
          Add
        </Button>
      </Stack>
    </Stack>
  );

  // Step 9: Deploy Hooks — editable: this app's own deploy hook URL
  const renderStepHooks = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <RocketLaunchIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Deploy Hooks</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        This app&apos;s own Vercel Deploy Hook (git repo <code>reward2learn/tokenizmyapp</code>, branch <code>main</code>).
        Click Generate to create one on the Vercel project below — or reuse an existing hook if one already
        exists. Used by &quot;Trigger Deploy Hook&quot; in the app&apos;s three-dot menu.
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <SummaryRow label="Vercel Project" value={app.vercelProjectId ? app.vercelProjectId : '⚠️ not deployed yet'} />
        <SummaryRow label="Vercel name" value={vercelName} />
        <SummaryRow label="Deploy Hook" value={deployHookUrl.trim() ? '✅ configured' : '⚠️ not set — click Generate'} />
      </Paper>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <TextField
          label="Deploy Hook URL"
          value={deployHookUrl}
          onChange={(e) => setDeployHookUrl(e.target.value)}
          fullWidth
          size="small"
          placeholder="https://api.vercel.com/v1/integrations/deploy/prj_…/…"
          helperText="Auto-filled by Generate from this app's vercelProjectId. You can still paste a manual hook URL."
          sx={{ flex: 1 }}
          slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={() => void handleGenerateDeployHook()}
          disabled={generatingHook || !app.vercelProjectId}
          startIcon={generatingHook ? <CircularProgress size={16} color="inherit" /> : <RocketLaunchIcon />}
          sx={{ mt: 0.5, minWidth: 150, flexShrink: 0 }}
        >
          {generatingHook ? 'Generating…' : 'Generate'}
        </Button>
      </Stack>
      {!app.vercelProjectId ? (
        <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
          Deploy this app first — Generate uses <code>appPack.apps[].vercelProjectId</code> from the tenant
          registry. New deploys also provision a hook automatically.
        </Alert>
      ) : null}
    </Stack>
  );

  // Step 10: Functional Roles — editable selection (subset of tenant catalog)
  const renderStepRoles = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <PeopleIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Functional Roles</Typography>
      </Stack>
      <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
        The tenant&apos;s role catalog is shared across the suite. Check the roles this app should
        enable — unchecked roles are disabled for this app only (saved per app_id).
      </Alert>
      {rolesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
      ) : rolesList.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">No roles configured.</Typography>
        </Paper>
      ) : (
        <Stack spacing={1}>
          {rolesList.map((role) => {
            const enabled = rolesEnabled.includes(role.code);
            return (
              <Paper key={role.code} variant="outlined" sx={{ p: 1.5, borderLeft: 4, borderLeftColor: role.isPlatformAdmin ? 'primary.main' : 'grey.300' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enabled}
                        onChange={(e) => {
                          setRolesEnabled((prev) => e.target.checked
                            ? [...prev, role.code]
                            : prev.filter((c) => c !== role.code));
                        }}
                        size="small"
                      />
                    }
                    label={
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{role.name}</Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>({role.code})</Typography>
                      </Stack>
                    }
                  />
                  {role.isPlatformAdmin ? <Chip label="Platform Admin" size="small" color="primary" variant="outlined" /> : null}
                  <Chip
                    icon={role.pinConfigured ? <CheckCircleIcon /> : <KeyIcon />}
                    label={role.pinConfigured ? 'PIN Configured' : 'No PIN'}
                    size="small"
                    color={role.pinConfigured ? 'success' : 'warning'}
                    variant={role.pinConfigured ? 'filled' : 'outlined'}
                  />
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Stack>
  );

  // Step 11: Custom Domain — this app's Vercel project info
  const renderStepDomain = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <LanguageIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Custom Domain</Typography>
      </Stack>
      <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
        Each suite app is its own Vercel project with its own auto-generated URL. Custom domains are
        managed per-app from the app&apos;s three-dot menu (&quot;Refresh Domain&quot;).
      </Alert>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={0.5}>
          <SummaryRow label="Vercel name" value={vercelName} />
          <SummaryRow label="Auto URL" value={appUrl} />
          <SummaryRow label="Vercel Project ID" value={app.vercelProjectId ? app.vercelProjectId : '⚠️ not deployed yet'} />
          <SummaryRow label="App URL" value={app.appUrl ? app.appUrl : '⚠️ not set'} />
        </Stack>
      </Paper>
    </Stack>
  );

  // Step 12: Admin & Auth — editable (prefilled from app.config ?? tenant config)
  const renderStepAuth = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <VerifiedUserIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Admin & Authentication</Typography>
      </Stack>
      <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
        Prefilled from the tenant — change values to override them for this app only. Pushed to this
        app&apos;s Vercel project as <strong>PLATFORM_ADMIN_EMAIL</strong> /{' '}
        <strong>PIN_SIGN_IN_ENABLED</strong>.
      </Alert>
      <Stack spacing={1.5}>
        <TextField
          label="Admin Email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          fullWidth
          size="small"
          placeholder={DEFAULT_PLATFORM_ADMIN_EMAIL}
        />
        <FormControlLabel
          control={<Checkbox checked={pinSignInEnabled} onChange={(e) => setPinSignInEnabled(e.target.checked)} size="small" />}
          label={<Typography variant="body2">PIN Sign-in enabled</Typography>}
        />
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Admin PINs</Typography>
          {pins.length > 0 ? (
            <Stack spacing={1}>
              {pins.map((pin, index) => (
                <Stack key={index} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <TextField
                    label={`PIN ${index + 1}`}
                    value={pin}
                    onChange={(e) => {
                      const u = [...pins];
                      u[index] = e.target.value;
                      setPins(u);
                    }}
                    size="small"
                    fullWidth
                    slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
                  />
                  <IconButton size="small" onClick={() => setPins((prev) => prev.filter((_, i) => i !== index))} aria-label="remove pin">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">No PINs configured.</Typography>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <TextField
              label="New PIN"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              size="small"
              fullWidth
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                if (newPin.trim()) {
                  setPins((prev) => [...prev, newPin.trim()]);
                  setNewPin('');
                }
              }}
              disabled={!newPin.trim()}
            >
              Add
            </Button>
          </Stack>
        </Paper>
      </Stack>
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
          Validates this app&apos;s identity (app ID, Vercel project, deploy status) and the inherited tenant configuration.
        </Typography>

        {!hasResults && !flightRunning ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary">
              No checks run yet. Click &quot;Run Flight Check&quot; to start.
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
            {overallStatus === 'pass' ? 'This app is ready to save.' :
              `${failCount} item(s) must be fixed. ${warnCount} item(s) should be reviewed.`}
          </Alert>
        ) : null}
      </Stack>
    );
  };

  // Step 14: Summary — review changes + save
  const renderStepSummary = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <RocketLaunchIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Edit Summary</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Review the changes to this app and the tenant configuration it inherits, then save.
      </Typography>

      <Alert severity="info" icon={<RocketLaunchIcon />} sx={{ fontSize: '0.8rem' }}>
        <AlertTitle sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Vercel Save &amp; Push</AlertTitle>
        Use <strong>Vercel Save &amp; Push</strong> (bottom-right) to persist the config and push all
        required environment variables — <strong>GOOGLE_CLIENT_ID</strong>,{' '}
        <strong>GOOGLE_CLIENT_SECRET</strong>, <strong>GOOGLE_PROJECT_ID</strong>, database URL, PINs,
        custom env and NEXT_PUBLIC_* — to this app&apos;s Vercel project (
        <strong>{vercelName}</strong>). The app must already be deployed on Vercel.
      </Alert>

      {/* App Identity */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>App Identity</Typography>
        <Stack spacing={0.5}>
          <SummaryRow label="Name" value={name.trim() || '—'} />
          <SummaryRow label="App ID" value={app.appId} />
          <SummaryRow label="Vercel name" value={vercelName} />
          <SummaryRow label="App URL" value={appUrl} />
          {department.trim() ? <SummaryRow label="Department" value={department.trim()} /> : null}
          <SummaryRow label="Template" value={getTemplate(templateId).label} />
          <SummaryRow label="Primary Color" value={primaryColor} color={primaryColor} />
          <SummaryRow label="Secondary Color" value={secondaryColor} color={secondaryColor} />
          <SummaryRow label="Deploy Hook" value={deployHookUrl.trim() ? '✅ configured' : '⚠️ not set'} />
        </Stack>
      </Paper>

      {/* Detected changes */}
      {changes.length > 0 ? (
        <Paper variant="outlined" sx={{ p: 2, borderColor: 'primary.main' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
            <EditIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Pending Changes ({changes.length})</Typography>
          </Stack>
          <Stack spacing={0.5}>
            {changes.map((c) => (
              <Stack key={c.label} direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 140, fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: 'text.secondary' }}>
                  {c.label}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: 'text.disabled', textDecoration: 'line-through', wordBreak: 'break-all' }}>
                  {c.from}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: 'text.secondary' }}>→</Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: 'primary.main', fontWeight: 700, wordBreak: 'break-all' }}>
                  {c.to}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
          No changes detected — the current values match the saved app. You can still click Save to confirm.
        </Alert>
      )}

      <Divider />

      {/* Effective config */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Effective Config (app overrides tenant)</Typography>
        <Stack spacing={0.5}>
          <SummaryRow label="License" value={`${licenseTier.toUpperCase()}${licenseKey ? ' ✅' : ' ⚠️'}`} />
          <SummaryRow label="Features" value={features.length > 0 ? features.join(', ') : 'none'} />
          <SummaryRow label="OpenAI API Key" value={openaiApiKey ? '✅ configured' : '⚠️ not set'} />
          <SummaryRow label="Google OAuth" value={oauthClientId ? '✅ configured' : '⚠️ not set'} />
          <SummaryRow label="OAuth Client ID" value={oauthClientId ? oauthClientId.slice(0, 40) + '...' : '⚠️ not set'} />
          <SummaryRow label="Redirect URIs" value={`${newAppRedirectUris.length} URIs (${newAppRedirectUris.filter((u) => oauthRedirectUris.includes(u)).length} registered)`} />
          <SummaryRow label="Database" value={dbUrl ? '✅ shared tenant DB' : '⚠️ not configured'} />
          <SummaryRow label="Custom Env Vars" value={envPairs.length > 0 ? envPairs.map((p) => p.key).join(', ') : 'none'} />
          <SummaryRow label="Functional Roles" value={rolesList.length > 0 ? rolesList.map((r) => r.name).join(', ') : '(loading)'} />
          <SummaryRow label="Admin Email" value={adminEmail} />
          <SummaryRow label="PIN Sign-in" value={pinSignInEnabled ? '✅ Enabled' : '❌ Disabled'} />
        </Stack>
      </Paper>

      {saving ? (
        <Box>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            Saving changes to {app.name}…
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );

  const stepContent = (index: number): React.ReactNode => {
    switch (index) {
      case 0: return renderStepTemplate();
      case 1: return renderStepPreview();
      case 2: return renderStepIdentity();
      case 3: return renderStepLicense();
      case 4: return renderStepFeatures();
      case 5: return renderStepOpenAi();
      case 6: return renderStepOAuth();
      case 7: return renderStepDatabase();
      case 8: return renderStepEnv();
      case 9: return renderStepHooks();
      case 10: return (
        <StripeIntegrationStep
          value={stripeWizard}
          onChange={setStripeWizard}
          tenantSlug={tenantSlug}
          appId={app.appId}
          tenantHasKeys={Boolean(
            ((tenantCfg as { stripe?: { secretKey?: string } }).stripe)?.secretKey,
          )}
        />
      );
      case 11: return renderStepRoles();
      case 12: return renderStepDomain();
      case 13: return renderStepAuth();
      case 14: return renderStepFlightCheck();
      case 15: return renderStepSummary();
      default: return null;
    }
  };

  const isSummaryStep = activeStep === EDIT_STEPS.length - 1;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={false} fullWidth aria-labelledby="edit-app-modal-title">
      <DialogTitle id="edit-app-modal-title" sx={{ p: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2, pb: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <EditIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit App — {app.name}</Typography>
            <Chip label={app.status} size="small" color={app.status === 'live' ? 'success' : 'default'} variant="outlined" />
          </Stack>
          <IconButton onClick={handleClose} size="small" aria-label="close" disabled={saving}><CloseIcon /></IconButton>
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
          {EDIT_STEPS.map((s, idx) => (
            <Step key={s.key} onClick={() => setActiveStep(idx)}>
              <StepLabel sx={{
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  fontWeight: activeStep === EDIT_STEPS.indexOf(s) ? 700 : 400,
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
          <Button onClick={() => setActiveStep((s) => s - 1)} disabled={saving}>Back</Button>
        ) : (
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
        )}

        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => void handleSave(!isSummaryStep)}
          disabled={!valid || saving || pushingEnv}
          startIcon={saving && !pushingEnv ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
          sx={{ fontWeight: 700, minWidth: { xs: '100%', sm: 180 } }}
        >
          {saving && !pushingEnv ? 'SAVING...' : 'Save Changes'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => void handleSaveAndPush()}
          disabled={!valid || saving || pushingEnv}
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <RocketLaunchIcon />}
          sx={{ fontWeight: 700, minWidth: { xs: '100%', sm: 240 } }}
        >
          {saving ? (pushingEnv ? 'PUSHING ENV...' : 'SAVING...') : 'Vercel Save & Push'}
        </Button>
        {!isSummaryStep ? (
          <Button variant="text" color="primary" size="large" onClick={() => setActiveStep((s) => s + 1)} disabled={saving} sx={{ fontWeight: 600 }}>
            Continue
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
