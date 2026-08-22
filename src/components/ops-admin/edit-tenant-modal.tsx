'use client';

/**
 * EditTenantModal — Stepper wizard for editing tenant applications.
 *
 * Steps: Template → Preview → License → Organization & Billing → Features
 *        → OpenAI API-Keys → Google OAuth → Database → Custom Env
 *        → Deploy Hooks → Functional Roles → Custom Domain → Admin & Auth
 *        → Flight Check → Summary
 *
 * Footer: [Back] [Save Changes] [Continue / Deploy to Vercel]
 */
import { useState, useCallback, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
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
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DeleteIcon from '@mui/icons-material/Delete';
import DnsIcon from '@mui/icons-material/Dns';
import EditIcon from '@mui/icons-material/Edit';
import KeyIcon from '@mui/icons-material/Key';
import LanguageIcon from '@mui/icons-material/Language';
import LockIcon from '@mui/icons-material/Lock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PaletteIcon from '@mui/icons-material/Palette';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import VerifiedIcon from '@mui/icons-material/Verified';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

import { getTemplate, listTemplates } from '@/domain/tenant/template-catalog';
import { DEFAULT_PLATFORM_ADMIN_EMAIL } from '@/domain/security/persons';
import { TemplateSelector } from '@/components/ops-admin/tenant-wizard';
import { TenantAiProviderForm } from '@/components/ops-admin/tenant-ai-provider-form';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';
import { useAppDispatch } from '@/store/hooks';
import { setThemeColors } from '@/store/ui-slice';
import { 
  useUpdateTenantMutation, 
  useUploadTenantFaviconMutation, 
  useRemoveTenantFaviconMutation,
  useProvisionGoogleOAuthMutation,
  useProvisionNeonMutation,
  useTestNeonConnectionMutation,
  useCheckRedirectsMutation,
  useRenameTenantMutation,
  useDeployTenantMutation,
  useSetTenantDomainMutation,
  useTriggerDeployHookMutation,
  useTestVercelWebhookMutation,
  useTestStripeWebhookMutation,
  useLazyGetTenantQuery,
  useLazyGetDeployStatusQuery,
  useLazyGetTenantDomainsQuery,
  useLazyGetAiFindingsQuery,
  useAddAppToSuiteMutation,
  useRemoveAppFromSuiteMutation,
  usePushStripeEnvVarsMutation,
  type TenantEntry
} from '@/store/apis/tenant-api';
import {
  useListRoleConfigsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useSetRolePinMutation,
} from '@/store/apis/admin-api';
import {
  useListOrganizationsQuery,
  useGetTenantOrganizationQuery,
  useGetOrganizationCreditsQuery,
  useAssignTenantOrganizationMutation,
  useCreateOrganizationMutation,
} from '@/store/apis/organization-api';

// ── Types ──────────────────────────────────────────────────────

export interface EditTenantModalProps {
  open: boolean;
  tenant: TenantEntry | null;
  onClose: () => void;
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
}

interface EnvPair {
  key: string;
  value: string;
}

interface LicenseConfig {
  licenseKey: string;
  licenseTier: string;
  validUntil: string;
  features: string[];
  setupToken: string;
  adminPin: string;
  openaiApiKey: string;
}

interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  projectId: string;
  authUri: string;
  tokenUri: string;
  redirectUris: string[];
  supportEmail: string;
  gcpAccountEmail: string;
}

interface DatabaseConfig {
  dbUrl: string;
  pooledUrl: string;
  directUrl: string;
}

// ── Constants ──────────────────────────────────────────────────

const EDIT_STEPS: Array<{ label: string; icon: React.ReactNode; key: string }> = [
  { label: 'Template', icon: <SettingsIcon fontSize="small" />, key: 'template' },
  { label: 'Preview', icon: <PaletteIcon fontSize="small" />, key: 'preview' },
  { label: 'Slug', icon: <EditIcon fontSize="small" />, key: 'slug' },
  { label: 'License', icon: <KeyIcon fontSize="small" />, key: 'license' },
  { label: 'Organization & Billing', icon: <CreditCardIcon fontSize="small" />, key: 'org' },
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

const LICENSE_TIERS = ['pro', 'enterprise', 'premium', 'trial'];
const DEFAULT_FEATURES = ['ai-chat', 'mapreduce', 'full-seeding', 'template_switching', 'analytics', 'multi_user'];

const DEPLOY_STEPS = [
  { key: 'fetch', label: 'Fetch tenant', description: 'Loading latest record and metadata from tenants registry' },
  { key: 'delta', label: 'Compute delta', description: 'Template delta analysis (incremental-only from TEMPLATE_CATALOG)' },
  { key: 'neon', label: 'Update Neon DB with full metadata.config', description: 'Upserting databaseUrl, googleAuth, pins, license, subscriptionTier etc.' },
  { key: 'vercel-env', label: 'Sync env vars to Vercel', description: 'Pushing databaseUrl and config to project env vars' },
  { key: 'inngest', label: 'Trigger Inngest pipeline', description: 'Seeding AppPage from TEMPLATE_CATALOG, AI/MapReduce content, blocks' },
  { key: 'vercel-deploy', label: 'Vercel deploy complete', description: 'Redeploy triggered, waiting for build completion' },
  { key: 'verify', label: 'Verify live app', description: 'Health check, template validation, status → live' },
];

// ── Component ──────────────────────────────────────────────────

/** Helper component for summary display rows. */
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

// ── Initialization helpers for useState lazy initializers ──
// These derive the initial form state from the tenant RTK Query cache.
// No useEffect needed — the component remounts on tenant change (key={slug}).

function initLicense(tenant: TenantEntry | null): LicenseConfig {
  if (!tenant) return { licenseKey: '', licenseTier: 'premium', validUntil: '2028-12-31', features: DEFAULT_FEATURES, setupToken: '', adminPin: '', openaiApiKey: '' };
  const cfg = (tenant.metadata?.config ?? {}) as Record<string, unknown>;
  const savedLicense = (cfg.license ?? {}) as Record<string, unknown>;
  return {
    licenseKey: (savedLicense.key as string) || '',
    licenseTier: (savedLicense.tier as string) || 'premium',
    validUntil: (savedLicense.validUntil as string) || '2028-12-31',
    features: (savedLicense.features as string[]) || DEFAULT_FEATURES,
    setupToken: (cfg.apiKey as string) || '',
    adminPin: '',
    openaiApiKey: (cfg.openaiApiKey as string) || '',
  };
}

function initGoogleOAuth(tenant: TenantEntry | null): GoogleOAuthConfig {
  if (!tenant) return { clientId: '', clientSecret: '', projectId: '', authUri: 'https://accounts.google.com/o/oauth2/auth', tokenUri: 'https://oauth2.googleapis.com/token', redirectUris: [], supportEmail: '', gcpAccountEmail: 'reward2learn@gmail.com' };
  const cfg = (tenant.metadata?.config ?? {}) as Record<string, unknown>;
  const savedGoogle = (cfg.googleAuth ?? {}) as Record<string, unknown>;
  const redirectUris = (savedGoogle.redirectUris as string[])?.length
    ? (savedGoogle.redirectUris as string[])
    : [`https://${tenant.slug}.vercel.app`, `https://${tenant.slug}.vercel.app/api/auth?action=google-callback`];
  return {
    clientId: (savedGoogle.clientId as string) || '',
    clientSecret: (savedGoogle.clientSecret as string) || '',
    projectId: (savedGoogle.projectId as string) || '',
    authUri: (savedGoogle.authUri as string) || 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: 'https://oauth2.googleapis.com/token',
    redirectUris,
    supportEmail: (savedGoogle.supportEmail as string) || '',
    gcpAccountEmail: (savedGoogle.gcpAccountEmail as string) || 'reward2learn@gmail.com',
  };
}

function initDbConfig(tenant: TenantEntry | null): DatabaseConfig {
  if (!tenant) return { dbUrl: '', pooledUrl: '', directUrl: '' };
  const cfg = (tenant.metadata?.config ?? {}) as Record<string, unknown>;
  const savedDb = (cfg.database ?? {}) as Record<string, unknown>;
  const dbUrl = (savedDb.pooledUrl as string) || (savedDb.databaseUrl as string) || tenant.dbUrl || '';
  return {
    dbUrl,
    pooledUrl: dbUrl,
    directUrl: (savedDb.directUrl as string) || '',
  };
}

function initEnvPairs(tenant: TenantEntry | null): { key: string; value: string }[] {
  if (!tenant) return [];
  const cfg = (tenant.metadata?.config ?? {}) as Record<string, unknown>;
  const savedEnv = (cfg.env ?? {}) as Record<string, string>;
  return Object.entries(savedEnv).map(([key, value]) => ({ key, value }));
}

/** Extract appPack config from tenant metadata (for suite mode). */
function getAppPack(tenant: TenantEntry | null): AppPackConfig | null {
  if (!tenant) return null;
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const cfg = (meta.config ?? {}) as Record<string, unknown>;
  return (cfg.appPack as AppPackConfig) ?? null;
}

interface ConfigFieldsInput {
  tenant: TenantEntry;
  license: LicenseConfig;
  googleOAuth: GoogleOAuthConfig;
  dbConfig: DatabaseConfig;
  envPairs: EnvPair[];
  deployHookUrl: string;
  vercelProjectId: string;
  adminEmail: string;
  pinSignInEnabled: boolean;
  stripe: { 
  secretKey: string; 
  webhookSecret: string; 
  publishableKey: string; 
  prices: { PRO_MONTHLY?: string; PRO_YEARLY?: string; BUSINESS_MONTHLY?: string; BUSINESS_YEARLY?: string } 
};
}

/**
 * Shared field mapping for the tenant config blob — used by both the Save
 * path (nested under `metadata.config`, see handleSave) and the Deploy path
 * (flattened directly into `metadata`, see buildDeployPayload — the deploy
 * route reads e.g. `body.metadata.hooks.deployHookUrl` off the flat shape).
 * Each caller wraps this the way its own endpoint expects.
 */
function buildConfigFields(input: ConfigFieldsInput) {
  const { tenant, license, googleOAuth, dbConfig, envPairs, deployHookUrl, vercelProjectId, adminEmail, pinSignInEnabled, stripe } = input;
  const env: Record<string, string> = {};
  for (const pair of envPairs) {
    if (pair.key) env[pair.key] = pair.value;
  }
  return {
    license: {
      key: license.licenseKey || `rrb-${tenant.slug}`,
      tier: license.licenseTier,
      validUntil: license.validUntil,
      features: license.features,
    },
    pins: [license.adminPin || process.env.NEXT_PUBLIC_DEFAULT_ADMIN_PIN || '454212'],
    subscriptionTier: license.licenseTier,
    apiKey: license.setupToken || '',
    openaiApiKey: license.openaiApiKey || '',
    googleAuth: {
      enabled: !!googleOAuth.clientId,
      clientId: googleOAuth.clientId,
      clientSecret: googleOAuth.clientSecret,
      projectId: googleOAuth.projectId,
      authUri: googleOAuth.authUri,
      redirectUris: googleOAuth.redirectUris,
      gcpAccountEmail: googleOAuth.gcpAccountEmail,
      supportEmail: googleOAuth.supportEmail,
    },
    database: {
      databaseUrl: dbConfig.dbUrl || `postgresql://${tenant.slug}:***@pooled.neon.tech/${tenant.slug}`,
      pooledUrl: dbConfig.pooledUrl,
      directUrl: dbConfig.directUrl,
    },
    env,
    // Stripe payment keys — pushed to Vercel env by the stripe-env route on
    // Save Changes (see docs/STRIPE-SETUP.md; keys are never committed).
    stripe: {
      secretKey: stripe.secretKey || undefined,
      webhookSecret: stripe.webhookSecret || undefined,
      publishableKey: stripe.publishableKey || undefined,
      prices: {
        PRO_MONTHLY: stripe.prices?.PRO_MONTHLY,
        PRO_YEARLY: stripe.prices?.PRO_YEARLY,
        BUSINESS_MONTHLY: stripe.prices?.BUSINESS_MONTHLY,
        BUSINESS_YEARLY: stripe.prices?.BUSINESS_YEARLY,
      },
    },
    hooks: { deployHookUrl: deployHookUrl || undefined },
    vercelProjectId: vercelProjectId || undefined,
    adminEmail: adminEmail || DEFAULT_PLATFORM_ADMIN_EMAIL,
    auth: {
      adminEmail: adminEmail || DEFAULT_PLATFORM_ADMIN_EMAIL,
      pinSignInEnabled,
    },
    // Preserve the suite app list — buildConfigFields only edits the fields
    // the modal exposes; dropping appPack here would wipe every suite app
    // on the next Save (the PUT route now merges, but keep the payload whole).
    appPack: getAppPack(tenant) ?? undefined,
  };
}

export function EditTenantModal({ open, tenant, onClose, onSnackbar }: EditTenantModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();

  // ── Stepper state ──────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0);

  // ── Template / Colors ──────────────────────────────────────
  const [editTemplate, setEditTemplate] = useState(() => tenant?.template || 'financial-analytics');
  const [editPrimaryColor, setEditPrimaryColor] = useState(() => tenant?.primaryColor || getTemplate(tenant?.template || 'financial-analytics').defaultColors.primary);
  const [editSecondaryColor, setEditSecondaryColor] = useState(() => tenant?.secondaryColor || getTemplate(tenant?.template || 'financial-analytics').defaultColors.secondary);
  const [displayName, setDisplayName] = useState(() => tenant?.displayName || '');

  // ── License & API Key ──────────────────────────────────────
  const [license, setLicense] = useState<LicenseConfig>(() => initLicense(tenant));

  // ── Google OAuth ───────────────────────────────────────────
  const [googleOAuth, setGoogleOAuth] = useState<GoogleOAuthConfig>(() => initGoogleOAuth(tenant));
  const [showSecret, setShowSecret] = useState(false);
  const [newRedirectUri, setNewRedirectUri] = useState('');
  const [provisioningOAuth, setProvisioningOAuth] = useState(false);
  const [provisionOAuthResult, setProvisionOAuthResult] = useState<Record<string, unknown> | null>(null);
  const [provisionOAuthError, setProvisionOAuthError] = useState<string | null>(null);

  // ── Database ───────────────────────────────────────────────
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(() => initDbConfig(tenant));
  const [provisioningDb, setProvisioningDb] = useState(false);
  const [provisionDbResult, setProvisionDbResult] = useState<Record<string, unknown> | null>(null);
  const [provisionDbError, setProvisionDbError] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<string | null>(null);

  // ── Custom Env ─────────────────────────────────────────────
  const [envPairs, setEnvPairs] = useState<EnvPair[]>(() => initEnvPairs(tenant));
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');

  // ── Functional Roles ───────────────────────────────────────
  const [settingPinRole, setSettingPinRole] = useState<string | null>(null);
  const [settingPinValue, setSettingPinValue] = useState<Record<string, string>>({});
  const [savingPinRole, setSavingPinRole] = useState<string | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleDialogMode, setRoleDialogMode] = useState<'create' | 'edit'>('create');
  const [roleFormCode, setRoleFormCode] = useState('');
  const [roleFormName, setRoleFormName] = useState('');
  const [roleFormIsPlatformAdmin, setRoleFormIsPlatformAdmin] = useState(false);
  const [roleDeleteConfirm, setRoleDeleteConfirm] = useState<string | null>(null);
  const [roleSaving, setRoleSaving] = useState(false);

  const [updateTenant] = useUpdateTenantMutation();
  const [uploadFavicon, { isLoading: uploadingFavicon }] = useUploadTenantFaviconMutation();
  const [removeFavicon] = useRemoveTenantFaviconMutation();
  const [addAppToSuite, { isLoading: addingSuiteApp }] = useAddAppToSuiteMutation();
  const [removeAppFromSuite, { isLoading: removingSuiteApp }] = useRemoveAppFromSuiteMutation();

  // ── Suite composition (editable template multi-select) ────────────────
  const [suiteTemplates, setSuiteTemplates] = useState<string[]>(() => {
    const pack = tenant ? getAppPack(tenant) : null;
    return pack ? [...new Set(pack.apps.map((a) => a.templateId))] : [];
  });
  const [suiteApplying, setSuiteApplying] = useState(false);

  // ── Organization & Billing (billing owner of this tenant) ──
  // The Organization pays for the Tenant (Organization → Tenant → Apps). The
  // step stages a new owner in `orgId`; the assignment is persisted by
  // handleSave alongside the rest of the wizard's data.
  const tenantSlug = tenant?.slug ?? '';
  const { data: tenantOrgData } = useGetTenantOrganizationQuery(tenantSlug, { skip: !tenantSlug });
  const { data: orgListData } = useListOrganizationsQuery();
  const organizations = orgListData?.data?.organizations ?? [];
  const currentOrg = tenantOrgData?.data?.organization ?? null;
  const currentPlan = tenantOrgData?.data?.plan ?? null;
  const currentSubscription = tenantOrgData?.data?.subscription ?? null;
  const [orgId, setOrgId] = useState<string | null>(null);
  const effectiveOrgId = orgId ?? currentOrg?.id ?? null;
  const { data: creditsData } = useGetOrganizationCreditsQuery(effectiveOrgId ?? '', {
    skip: !effectiveOrgId,
  });
  const [assignTenantOrg, { isLoading: assigningOrg }] = useAssignTenantOrganizationMutation();
  const [createOrg, { isLoading: creatingOrg }] = useCreateOrganizationMutation();
  const [newOrgName, setNewOrgName] = useState('');

  // ── Stripe payment keys (Organization & Billing step) ──
  // Stored in metadata.config.stripe; pushed to Vercel env on Save Changes.
  const initStripe = (): { 
    secretKey: string; 
    webhookSecret: string; 
    publishableKey: string; 
    prices: { PRO_MONTHLY?: string; PRO_YEARLY?: string; BUSINESS_MONTHLY?: string; BUSINESS_YEARLY?: string } 
  } => {
    const cfg = (tenant?.metadata?.config ?? {}) as Record<string, unknown>;
    const stripe = (cfg.stripe ?? {}) as Record<string, unknown>;
    return {
      secretKey: String(stripe.secretKey ?? ''),
      webhookSecret: String(stripe.webhookSecret ?? ''),
      publishableKey: String(stripe.publishableKey ?? ''),
      prices: {
        PRO_MONTHLY: stripe.PRO_MONTHLY as string | undefined,
        PRO_YEARLY: stripe.PRO_YEARLY as string | undefined,
        BUSINESS_MONTHLY: stripe.BUSINESS_MONTHLY as string | undefined,
        BUSINESS_YEARLY: stripe.BUSINESS_YEARLY as string | undefined,
      },
    };
  };
  const [stripeKeys, setStripeKeys] = useState(initStripe);
  const [showStripeSecrets, setShowStripeSecrets] = useState(false);
  const [pushStripeEnv, { isLoading: pushingStripeEnv }] = usePushStripeEnvVarsMutation();

  const applySuiteChanges = useCallback(async () => {
    if (!tenant) return;
    const pack = getAppPack(tenant);
    if (!pack) return;
    setSuiteApplying(true);
    try {
      const currentTemplateIds = new Set(pack.apps.map((a) => a.templateId));
      const nextTemplateIds = new Set(suiteTemplates);
      for (const tplId of suiteTemplates) {
        if (currentTemplateIds.has(tplId)) continue;
        const tpl = getTemplate(tplId);
        await addAppToSuite({ slug: tenant.slug, appId: tplId, name: tpl.label, department: tpl.label, templateId: tplId }).unwrap();
      }
      for (const app of pack.apps) {
        if (nextTemplateIds.has(app.templateId)) continue;
        if (app.status === 'live') continue; // don't silently orphan a deployed app
        await removeAppFromSuite({ slug: tenant.slug, appId: app.appId }).unwrap();
      }
      onSnackbar?.({ message: 'Suite composition updated', severity: 'success' });
    } catch (err) {
      onSnackbar?.({ message: err instanceof Error ? err.message : 'Failed to update suite composition', severity: 'error' });
    } finally {
      setSuiteApplying(false);
    }
  }, [tenant, suiteTemplates, addAppToSuite, removeAppFromSuite, onSnackbar]);

  // Role management hooks
  const { data: rolesData, isLoading: rolesLoadingFromApi } = useListRoleConfigsQuery();
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const [setRolePin] = useSetRolePinMutation();

  // ── RTK Query hooks (migrations: provisioning, deploy, domain, checks) ──
  const [provisionGoogleOAuth] = useProvisionGoogleOAuthMutation();
  const [provisionNeon] = useProvisionNeonMutation();
  const [testNeonConnection] = useTestNeonConnectionMutation();
  const [checkRedirects] = useCheckRedirectsMutation();
  const [renameTenant] = useRenameTenantMutation();
  const [deployTenant] = useDeployTenantMutation();
  const [setTenantDomain] = useSetTenantDomainMutation();
  const [triggerDeployHook] = useTriggerDeployHookMutation();
  const [testVercelWebhook] = useTestVercelWebhookMutation();
  const [testStripeWebhook] = useTestStripeWebhookMutation();
  const [getTenant] = useLazyGetTenantQuery();
  const [getDeployStatus] = useLazyGetDeployStatusQuery();
  const [getTenantDomains] = useLazyGetTenantDomainsQuery();
  const [getAiFindings] = useLazyGetAiFindingsQuery();

  // ── Deploy state ───────────────────────────────────────────
  const [deployingSlug, setDeployingSlug] = useState<string | null>(null);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployStepStatuses, setDeployStepStatuses] = useState<Record<string, 'pending' | 'inprogress' | 'success' | 'error'>>({});
  const [deployDetails, setDeployDetails] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deployHookUrl, setDeployHookUrl] = useState(() => { const c = (tenant?.metadata?.config ?? {}) as Record<string, unknown>; return ((c.hooks as Record<string, unknown>)?.deployHookUrl as string) || ''; });
  const [vercelProjectId, setVercelProjectId] = useState(() => tenant?.vercelProjectId || '');

  // ── Flight Check state ────────────────────────────────────
  type CheckItem = { label: string; status: 'pass' | 'fail' | 'warn'; detail: string; _key: string; fixAction?: () => Promise<void>; fixLabel?: string };
  const [fixingKey, setFixingKey] = useState<string | null>(null);
  
  // ── Flight Check tests state ──────────────────────────────
  const [testResults, setTestResults] = useState<Record<string, { running: boolean; result?: string; error?: string }>>({});
  
  const runTest = useCallback(async (testKey: string, testFn: () => Promise<string>) => {
    setTestResults(function(prev) { return { ...prev, [testKey]: { running: true } }; });
    try {
      const result = await testFn();
      setTestResults(function(prev) { return { ...prev, [testKey]: { running: false, result } }; });
    } catch (err) {
      setTestResults(function(prev) { return { ...prev, [testKey]: { running: false, error: err instanceof Error ? err.message : String(err) } }; });
    }
  }, []);
  const [flightChecks, setFlightChecks] = useState<CheckItem[]>([]);
  const [flightRunning, setFlightRunning] = useState(false);
  const [flightRunId, setFlightRunId] = useState(0);

  // ── Admin & Auth ─────────────────────────────────────────
  const [adminEmail, setAdminEmail] = useState(() => { const c = (tenant?.metadata?.config ?? {}) as Record<string, unknown>; const a = (c.auth ?? {}) as Record<string, unknown>; return (a.adminEmail as string) || DEFAULT_PLATFORM_ADMIN_EMAIL; });
  const [pinSignInEnabled, setPinSignInEnabled] = useState(() => { const c = (tenant?.metadata?.config ?? {}) as Record<string, unknown>; const a = (c.auth ?? {}) as Record<string, unknown>; return a.pinSignInEnabled !== false; });

  const importFileRef = useRef<HTMLInputElement>(null);

  // ── Custom Domain ───────────────────────────────────────────
  const [customDomain, setCustomDomain] = useState('');
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainSetting, setDomainSetting] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [domainList, setDomainList] = useState<Array<{ name: string; verified: boolean; createdAt: string }>>([]);
  const [domainResult, setDomainResult] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<{ name: string; id: string; updatedAt: string } | null>(null);
  const [vercelUrl, setVercelUrl] = useState<string | null>(null);

  // ── Slug rename ─────────────────────────────────────────────
  const [newSlug, setNewSlug] = useState('');
  const [renamingSlug, setRenamingSlug] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugResult, setSlugResult] = useState<string | null>(null);

  // ── Initialize from tenant on open ────────────────────────


  // Roles are now loaded via RTK Query — no manual fetch needed
  const rolesList = rolesData?.data?.roles || [];
  const rolesError = rolesData?.error || null;

  const handleSetRolePin = useCallback(async (code: string, pin: string) => {
    setSavingPinRole(code);
    try {
      const result = await setRolePin({ code, pin }).unwrap();
      if (result.success) {
        onSnackbar({ message: 'PIN set for role ' + code, severity: 'success' });
      } else {
        onSnackbar({ message: result.error || 'Failed to set PIN', severity: 'error' });
      }
    } catch (err) {
      const msg = err?.data?.error || err?.error || 'Failed to set PIN';
      onSnackbar({ message: msg, severity: 'error' });
    } finally {
      setSavingPinRole(null);
      setSettingPinRole(null);
      setSettingPinValue((prev) => ({ ...prev, [code]: '' }));
    }
  }, [setRolePin, onSnackbar]);

  // ── Role CRUD handlers ─────────────────────────────────────
  const openCreateRole = useCallback(() => {
    setRoleFormCode('');
    setRoleFormName('');
    setRoleFormIsPlatformAdmin(false);
    setRoleDialogMode('create');
    setRoleDialogOpen(true);
  }, []);

  const openEditRole = useCallback((role: { code: string; name: string; isPlatformAdmin: boolean }) => {
    setRoleFormCode(role.code);
    setRoleFormName(role.name);
    setRoleFormIsPlatformAdmin(role.isPlatformAdmin);
    setRoleDialogMode('edit');
    setRoleDialogOpen(true);
  }, []);

  const handleRoleSave = useCallback(async () => {
    if (!roleFormName.trim()) return;
    setRoleSaving(true);
    try {
      const payload = {
        code: roleFormCode || roleFormName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        name: roleFormName.trim(),
        isPlatformAdmin: roleFormIsPlatformAdmin,
      };
      const result = roleDialogMode === 'create' 
        ? await createRole(payload).unwrap()
        : await updateRole(payload).unwrap();
      
      if (result.success) {
        setRoleDialogOpen(false);
        onSnackbar({ message: 'Role ' + (roleDialogMode === 'create' ? 'created' : 'updated'), severity: 'success' });
      } else {
        onSnackbar({ message: result.error || 'Failed to save role', severity: 'error' });
      }
    } catch {
      onSnackbar({ message: 'Failed to save role', severity: 'error' });
    } finally {
      setRoleSaving(false);
    }
  }, [roleFormCode, roleFormName, roleFormIsPlatformAdmin, roleDialogMode, createRole, updateRole, onSnackbar]);

  const handleRoleDelete = useCallback(async (code: string) => {
    setRoleSaving(true);
    try {
      const result = await deleteRole(code).unwrap();
      if (result.success) {
        setRoleDeleteConfirm(null);
        onSnackbar({ message: 'Role deleted: ' + code, severity: 'success' });
      } else {
        onSnackbar({ message: result.error || 'Failed to delete role', severity: 'error' });
      }
    } catch (err) {
      onSnackbar({ message: err?.data?.error || err?.error || 'Failed to delete role', severity: 'error' });
    } finally {
      setRoleSaving(false);
    }
  }, [deleteRole, onSnackbar]);



  // ── Handlers: Template ─────────────────────────────────────
  const handleTemplateSelect = (id: string) => {
    setEditTemplate(id);
    const tpl = getTemplate(id);
    setEditPrimaryColor((prev) => prev || tpl.defaultColors.primary);
    setEditSecondaryColor((prev) => prev || tpl.defaultColors.secondary);
  };

  const handleColorsChange = (primary: string, secondary: string) => {
    setEditPrimaryColor(primary);
    setEditSecondaryColor(secondary);
  };

  // ── Handlers: License ──────────────────────────────────────
  const handleLicenseChange = (field: keyof LicenseConfig, value: string | string[]) => {
    setLicense((prev) => ({ ...prev, [field]: value }));
  };

  const toggleLicenseFeature = (feature: string) => {
    setLicense((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  // ── Handlers: Google OAuth ─────────────────────────────────
  const handleOAuthChange = (field: keyof GoogleOAuthConfig, value: string) => {
    setGoogleOAuth((prev) => ({ ...prev, [field]: value }));
  };

  const addRedirectUri = () => {
    if (newRedirectUri && !googleOAuth.redirectUris.includes(newRedirectUri)) {
      setGoogleOAuth((prev) => ({ ...prev, redirectUris: [...prev.redirectUris, newRedirectUri] }));
      setNewRedirectUri('');
    }
  };

  const removeRedirectUri = (uri: string) => {
    setGoogleOAuth((prev) => ({ ...prev, redirectUris: prev.redirectUris.filter((u) => u !== uri) }));
  };

  // ── Generate value handlers ────────────────────────────────
  const generateLicenseKey = useCallback(() => {
    const key = 'rrb-' + (tenant?.slug || 'unknown') + '-' + Date.now().toString(36);
    handleLicenseChange('licenseKey', key);
    onSnackbar({ message: 'License key generated', severity: 'success' });
  }, [tenant, onSnackbar]);

  const generateSetupToken = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'st_';
    for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
    handleLicenseChange('setupToken', token);
    onSnackbar({ message: 'Setup token generated', severity: 'success' });
  }, [onSnackbar]);

  const generateAdminPin = useCallback(() => {
    const pin = String(100000 + Math.floor(Math.random() * 900000));
    handleLicenseChange('adminPin', pin);
    onSnackbar({ message: 'Admin PIN generated', severity: 'success' });
  }, [onSnackbar]);

  const generateOpenAiKey = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const key = 'sk-proj-' + Array.from({ length: 48 }, () => chars.charAt(Math.floor(Math.random() * 62))).join('');
    handleLicenseChange('openaiApiKey', key);
    onSnackbar({ message: 'API key placeholder generated (replace with real key)', severity: 'success' });
  }, [onSnackbar]);

  // ── Handlers: Custom Env ──────────────────────────────────
  const addEnvPair = () => {
    if (newEnvKey && newEnvValue) {
      setEnvPairs((prev) => [...prev, { key: newEnvKey, value: newEnvValue }]);
      setNewEnvKey('');
      setNewEnvValue('');
    }
  };

  const removeEnvPair = (index: number) => {
    setEnvPairs((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Provision: Google OAuth (create GCP project + OAuth) ──
  const handleProvisionOAuth = useCallback(async () => {
    if (!tenant) return;
    setProvisioningOAuth(true);
    setProvisionOAuthError(null);
    setProvisionOAuthResult(null);
    try {
      const result = await provisionGoogleOAuth({
        slug: tenant.slug,
        email: googleOAuth.gcpAccountEmail || undefined,
        redirectUris: googleOAuth.redirectUris,
      }).unwrap();
      if (result.success) {
        setProvisionOAuthResult(result as unknown as Record<string, unknown>);
        // Auto-fill returned credentials — route wraps in jsonOk so result.data has the fields
        const dd = result.data || {};
        const strategy = dd.strategy || 'unknown';
        if (strategy === 'env-fallback') {
          // Strategy C returned the platform's own shared GOOGLE_CLIENT_*
          // credentials — never auto-fill those into this tenant's config,
          // or the tenant silently inherits the factory's OAuth identity.
          onSnackbar({
            message: `⚠️ Shared OAuth credentials returned (no dedicated client created). Create a dedicated OAuth client via GCP Console for production.`,
            severity: 'success',
          });
        } else {
          if (dd.clientId) handleOAuthChange('clientId', dd.clientId);
          if (dd.clientSecret) handleOAuthChange('clientSecret', dd.clientSecret);
          if (dd.projectId) handleOAuthChange('projectId', dd.projectId);
          onSnackbar({ message: `✅ GCP project + OAuth credentials created for ${tenant.slug}`, severity: 'success' });
        }
      } else {
        throw new Error(result.error || 'Google OAuth provisioning failed');
      }
    } catch (err) {
      const msg = err?.data?.error || (err instanceof Error ? err.message : 'Provisioning error');
      setProvisionOAuthError(msg);
      onSnackbar({ message: `❌ OAuth provisioning failed: ${msg}`, severity: 'error' });
    } finally {
      setProvisioningOAuth(false);
    }
  }, [tenant, displayName, googleOAuth.redirectUris, googleOAuth.gcpAccountEmail, provisionGoogleOAuth, handleOAuthChange, onSnackbar]);

  // ── Provision: Neon Database ──────────────────────────────
  const handleProvisionDb = useCallback(async () => {
    if (!tenant) return;
    setProvisioningDb(true);
    setProvisionDbError(null);
    setProvisionDbResult(null);
    try {
      const result = await provisionNeon({ slug: tenant.slug }).unwrap();
      if (result.success) {
        setProvisionDbResult(result as unknown as Record<string, unknown>);
        // Auto-fill returned connection strings
        const dd = result.data || {};
        const pooledUrl = dd.pooledUrl || dd.connectionStrings?.DATABASE_URL || dd.connectionStrings?.POSTGRES_URL || '';
        const directUrl = dd.directUrl || dd.connectionStrings?.DATABASE_URL_UNPOOLED || dd.connectionStrings?.POSTGRES_URL_NON_POOLING || '';
        if (pooledUrl) {
          setDbConfig({
            dbUrl: pooledUrl,
            pooledUrl: pooledUrl,
            directUrl: directUrl || pooledUrl.replace('-pooler', ''),
          });
          onSnackbar({ message: `✅ Neon database provisioned for ${tenant.slug} — connection strings auto-populated`, severity: 'success' });
        } else {
          onSnackbar({ message: `✅ Neon database provisioned for ${tenant.slug}`, severity: 'success' });
        }
      } else {
        throw new Error(result.error || 'Neon provisioning failed');
      }
    } catch (err) {
      const msg = err?.data?.error || (err instanceof Error ? err.message : 'Provisioning error');
      setProvisionDbError(msg);
      onSnackbar({ message: `❌ Database provisioning failed: ${msg}`, severity: 'error' });
    } finally {
      setProvisioningDb(false);
    }
  }, [tenant, provisionNeon, onSnackbar]);

  // ── Test database connection ────────────────────────────
  const handleTestConnection = useCallback(async () => {
    if (!dbConfig.dbUrl) {
      setConnectionTestResult('⚠️ No database URL configured');
      return;
    }
    setTestingConnection(true);
    setConnectionTestResult(null);
    try {
      // Parse the URL to validate format
      const url = new URL(dbConfig.dbUrl);
      const hostname = url.hostname;
      const isPooled = hostname.includes('-pooler');

      try {
        // 5s timeout so a hanging server never blocks the UI
        const testResult = await Promise.race([
          testNeonConnection({ slug: tenant?.slug ?? '', dbUrl: dbConfig.dbUrl }).unwrap(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000),
          ),
        ]);
        if (testResult.success) {
          setConnectionTestResult('✅ Connection successful — database is reachable');
        } else {
          setConnectionTestResult(`❌ Connection failed: ${testResult.error || 'Unknown error'}`);
        }
      } catch (fetchErr: any) {
        // Fallback: basic URL validation (also on timeout / network error)
        setConnectionTestResult(
          `✅ URL format valid: ${url.protocol}//${url.hostname}/${url.pathname.split('/').pop()}
` +
          `   Type: ${isPooled ? 'Pooled (PgBouncer)' : 'Direct'}
` +
          `   Note: In-browser connection test unavailable; verify via psql or the Neon Console.`
        );
      }
    } catch {
      setConnectionTestResult('❌ Invalid database URL format');
    } finally {
      setTestingConnection(false);
    }
  }, [dbConfig.dbUrl, tenant, testNeonConnection]);

  // ── Build deploy payload ──────────────────────────────────
  const buildDeployPayload = useCallback(() => {
    if (!tenant) return {};

    const fields = buildConfigFields({ tenant, license, googleOAuth, dbConfig, envPairs, deployHookUrl, vercelProjectId, adminEmail, pinSignInEnabled, stripe: stripeKeys });

    return {
      template: editTemplate,
      metadata: {
        displayName,
        previousTemplate: tenant.template || 'financial-analytics',
        amendmentReason: 'stepper-edit-and-deploy',
        primaryColor: editPrimaryColor,
        secondaryColor: editSecondaryColor,
        ...fields,
      },
    };
  }, [tenant, editTemplate, displayName, editPrimaryColor, editSecondaryColor, license, googleOAuth, dbConfig, envPairs, deployHookUrl, vercelProjectId, adminEmail, pinSignInEnabled, stripeKeys]);

  // ── Save handler ──────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!tenant) return;
    setSaving(true);
    try {
      const payload = {
        slug: tenant.slug,
        displayName,
        template: editTemplate,
        primaryColor: editPrimaryColor,
        secondaryColor: editSecondaryColor,
        vercelProjectId: vercelProjectId || undefined,
        metadata: {
          config: buildConfigFields({ tenant, license, googleOAuth, dbConfig, envPairs, deployHookUrl, vercelProjectId, adminEmail, pinSignInEnabled, stripe: stripeKeys }),
        },
      };

      const result = await updateTenant({ ...payload }).unwrap();
      if (!result.success) {
        throw new Error(result.error || 'Save failed');
      }
      let message = `✅ ${tenant.displayName} saved successfully`;
      // Persist the organization assignment (billing owner) when changed.
      if (orgId && orgId !== currentOrg?.id) {
        await assignTenantOrg({ tenantSlug: tenant.slug, orgId }).unwrap();
        const orgName = organizations.find((o) => o.id === orgId)?.displayName ?? orgId;
        message += ` — billing owner: ${orgName}`;
      }
      // Push the Stripe keys to Vercel env (own project + suite apps) when
      // any key is present, so Payment Methods can be enabled for the app.
      if (stripeKeys.secretKey.trim() || stripeKeys.webhookSecret.trim() || stripeKeys.publishableKey.trim()) {
        try {
          const stripeRes = await pushStripeEnv({ slug: tenant.slug }).unwrap();
          const envCount = stripeRes.data?.envCount ?? 0;
          message += ` — Stripe keys pushed to Vercel (${envCount} env var${envCount === 1 ? '' : 's'})`;
          if (stripeRes.data?.redeployTriggered?.length) {
            message += `, redeploy triggered`;
          } else if (stripeRes.data?.note) {
            message += ` — ${stripeRes.data.note}`;
          }
        } catch (stripeErr) {
          const stripeMsg = stripeErr && typeof stripeErr === 'object' && 'data' in stripeErr
            ? String((stripeErr as { data?: { error?: string } }).data?.error || 'Stripe env push failed')
            : 'Stripe env push failed';
          message += ` — ⚠️ config saved, but Stripe env push failed: ${stripeMsg}`;
        }
      }
      onSnackbar({ message, severity: 'success' });
    } catch (err) {
      const msg = err?.data?.error || (err instanceof Error ? err.message : 'Save failed');
      onSnackbar({ message: `❌ Save failed: ${msg}`, severity: 'error' });
    } finally {
      setSaving(false);
    }
  }, [tenant, displayName, editTemplate, editPrimaryColor, editSecondaryColor, license, googleOAuth, dbConfig, envPairs, deployHookUrl, vercelProjectId, adminEmail, pinSignInEnabled, updateTenant, onSnackbar, orgId, currentOrg, organizations, assignTenantOrg, stripeKeys, pushStripeEnv]);

  // ── Flight Check run ───────────────────────────────────────
  const runFlightCheck = useCallback(async () => {
    if (!tenant) return;
    setFlightRunning(true);
    const id = Date.now();
    setFlightRunId(id);
    const results: CheckItem[] = [];

    const addResult = (label: string, status: 'pass' | 'fail' | 'warn', detail: string, fixAction?: () => Promise<void>, fixLabel?: string) => {
      results.push({ label, status, detail, _key: label.replace(/\s+/g, '-').toLowerCase(), fixAction, fixLabel });
    };

    const slug = tenant.slug;

    // Fetch fresh tenant data to pick up any recent fixes
    let freshConfig: Record<string, unknown> = ((tenant.metadata as Record<string, unknown>)?.config ?? {}) as Record<string, unknown>;
    let freshStatus = tenant.status;
    let freshVercelProjectId = tenant.vercelProjectId;
    try {
      const freshResult = await getTenant(slug).unwrap();
      if (freshResult.success && freshResult.data?.tenant) {
        const t = freshResult.data.tenant;
        freshConfig = ((t.metadata as Record<string, unknown>)?.config ?? {}) as Record<string, unknown>;
        freshStatus = t.status;
        freshVercelProjectId = t.vercelProjectId;
      }
    } catch { /* use stale data */ }

    const cfg = freshConfig;
    const license = (cfg?.license ?? {}) as Record<string, unknown>;
    const googleAuthLocal = (cfg?.googleAuth ?? {}) as Record<string, unknown>;
    const database = (cfg?.database ?? {}) as Record<string, unknown>;
    const hooks = (cfg?.hooks ?? {}) as Record<string, unknown>;
    const authConfig = (cfg?.auth ?? {}) as Record<string, unknown>;

    // Build fix actions that auto-correct missing values
    const fixVercelProjectId = async () => {
      const hookUrl = String((hooks.deployHookUrl as string) || '');
      const match = hookUrl.match(/\/deploy\/(prj_[^/]+)\//);
      if (match) {
        await updateTenant({ slug, vercelProjectId: match[1] }).unwrap();
        onSnackbar({ message: 'Vercel Project ID set from deploy hook URL', severity: 'success' });
      } else {
        onSnackbar({ message: 'No deploy hook URL to extract project ID from', severity: 'error' });
      }
    };
    const fixAdminEmail = async () => {
      await updateTenant({ slug, metadata: { config: { ...cfg, adminEmail: DEFAULT_PLATFORM_ADMIN_EMAIL, auth: { ...(cfg.auth as Record<string,unknown> || {}), adminEmail: DEFAULT_PLATFORM_ADMIN_EMAIL } } } }).unwrap();
      onSnackbar({ message: 'Admin email set to ' + DEFAULT_PLATFORM_ADMIN_EMAIL, severity: 'success' });
    };
    const fixPinSignIn = async () => {
      await updateTenant({ slug, metadata: { config: { ...cfg, auth: { ...(cfg.auth as Record<string,unknown> || {}), pinSignInEnabled: true } } } }).unwrap();
      onSnackbar({ message: 'PIN sign-in enabled', severity: 'success' });
    };
    const fixLicenseKey = async () => {
      const newKey = 'rrb-' + slug + '-' + Math.random().toString(36).slice(2, 10);
      const newApiKey = 'st_' + Array.from('abcdefghijklmnopqrstuvwxyz0123456789', function() { return 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]; }).slice(0, 24).join('');
      await updateTenant({ slug, apiKey: newApiKey, metadata: { config: { ...cfg, apiKey: newApiKey, license: { ...(cfg.license as Record<string,unknown> || {}), key: newKey } } } }).unwrap();
      onSnackbar({ message: 'License key and API key generated', severity: 'success' });
    };

    // Google OAuth
    if (googleAuthLocal.clientId && googleAuthLocal.clientSecret) {
      addResult('Google OAuth Client ID', 'pass', 'Configured: ' + String(googleAuthLocal.clientId).slice(0, 25) + '...');
    } else {
      addResult('Google OAuth Client ID', 'fail', 'Missing - configure in Google Cloud Console and add GOOGLE_CLIENT_ID env var');
    }
    addResult('Google OAuth Project ID', googleAuthLocal.projectId ? 'pass' : 'warn', String(googleAuthLocal.projectId || 'Not set'));

    const redirectUris = (googleAuthLocal.redirectUris as string[]) || [];
    const hasCallbackUri = redirectUris.some(function(u) { return u.indexOf('/api/auth/callback/google') !== -1; });
    addResult('Redirect URI (callback/google)', hasCallbackUri ? 'pass' : 'fail',
      hasCallbackUri ? 'Configured in Google Cloud Console' : 'Missing - add /api/auth/callback/google to OAuth client in Google Cloud Console');

    // ── Social Wallet ─────────────────────────────────────────────
    const web3Wallet = (cfg?.web3Wallet ?? {}) as Record<string, unknown>;
    const walletEnabled = web3Wallet.enabled === true;
    const walletConnectMode = String(web3Wallet.connectMode ?? '') as string;
    const walletSocialProviders = (web3Wallet.socialProviders as string[]) || [];
    const hasGoogleProvider = walletSocialProviders.includes('google');
    const isSocialWalletTemplate = walletEnabled && walletConnectMode === 'social' && hasGoogleProvider;

    addResult('Template: Social Wallet', isSocialWalletTemplate ? 'pass' : 'fail',
      isSocialWalletTemplate
        ? 'Template is configured for social wallet auth (Google OAuth + embedded wallet)'
        : 'Template either has web3 wallet disabled, connect mode is not "social", or does not include Google as a social provider',
      undefined, 'Go to Template step');

    // Reown Project ID
    const reownProjectId = process?.env?.NEXT_PUBLIC_PROJECT_ID || (cfg?.reownProjectId as string) || '';
    addResult('Reown Project ID', reownProjectId ? 'pass' : 'warn',
      reownProjectId ? 'Configured: ' + String(reownProjectId).slice(0, 20) + '...' : 'Not set - set NEXT_PUBLIC_PROJECT_ID in Vercel env vars',
      undefined, 'Go to Features step');

    // Google OAuth Socials in Reown Cloud
    const reownGoogleEnabled = (cfg?.reownGoogleEnabled as boolean) || false;
    addResult('Google OAuth Socials (Reown Cloud)', reownGoogleEnabled ? 'pass' : 'warn',
      reownGoogleEnabled ? 'Google enabled under Social & Email in Reown Cloud dashboard' : 'Google not enabled - go to dashboard.reown.com → Your Project → Settings → Social & Email → Social Logins → Google',
      undefined, 'Go to Features step');

    // License
    addResult('License Key', license.key ? 'pass' : 'fail',
      String(license.key || 'Missing').slice(0, 25) + (license.key ? '...' : ''),
      license.key ? undefined : fixLicenseKey, 'Auto-generate');
    addResult('License Tier', license.tier ? 'pass' : 'warn', String(license.tier || 'Not set').toUpperCase());
    if (license.validUntil) {
      const valid = new Date(String(license.validUntil)) > new Date();
      addResult('License Expiry', valid ? 'pass' : 'fail', valid ? 'Valid until ' + String(license.validUntil) : 'EXPIRED: ' + String(license.validUntil));
    }

    // API Key
    const apiKey = (cfg?.apiKey as string) || '';
    addResult('API Key', apiKey ? 'pass' : 'fail', apiKey ? 'Configured' : 'Missing', apiKey ? undefined : fixLicenseKey, 'Auto-generate');

    // Database
    const dbUrl = String((database.databaseUrl as string) || '');
    addResult('Database URL', dbUrl ? 'pass' : 'fail', dbUrl ? dbUrl.slice(0, 40) + '...' : 'Missing - provision a Neon database');

    // Deploy Hook
    const hookUrl = String((hooks.deployHookUrl as string) || '');
    addResult('Deploy Hook URL',
      hookUrl && hookUrl.indexOf('/deploy/prj_') !== -1 ? 'pass' : hookUrl ? 'warn' : 'warn',
      !hookUrl ? 'Not set - create in Vercel Dashboard > Settings > Git' : hookUrl.indexOf('/deploy/prj_') !== -1 ? 'Valid format' : 'Format may be incorrect');

    // Vercel Project ID
    const vpId = tenant.vercelProjectId || (cfg?.vercelProjectId as string) || '';
    addResult('Vercel Project ID', (freshVercelProjectId || vpId) ? 'pass' : 'fail', (freshVercelProjectId || vpId) || 'Missing', (freshVercelProjectId || vpId) ? undefined : fixVercelProjectId, 'Extract from hook URL');

    // Admin email
    const adminEmail = (authConfig.adminEmail as string) || (cfg?.adminEmail as string) || '';
    addResult('Admin Email', adminEmail ? 'pass' : 'fail', adminEmail || 'Not set', adminEmail ? undefined : fixAdminEmail, 'Set to default');

    // PIN sign-in
    const pinEnabled = authConfig.pinSignInEnabled !== false;
    addResult('PIN Sign-in', 'pass', pinEnabled ? 'Enabled' : 'Disabled (Google-only)', pinEnabled ? undefined : fixPinSignIn, 'Enable');

    // OpenAI API Key
    const openaiKey = (cfg?.openaiApiKey as string) || '';
    addResult('OpenAI API Key', openaiKey ? 'pass' : 'warn', openaiKey ? 'Configured' : 'Not set - add OPENAI_API_KEY env var');

    // Stripe payment keys — Payment Methods availability
    const stripeCfg = (cfg?.stripe ?? {}) as Record<string, unknown>;
    const stripeSecret = String(stripeCfg.secretKey ?? '');
    const stripeWebhook = String(stripeCfg.webhookSecret ?? '');
    const stripePublishable = String(stripeCfg.publishableKey ?? '');
    const stripeComplete = !!(stripeSecret && stripeWebhook && stripePublishable);
    const goToOrgStep = async () => {
      setActiveStep(EDIT_STEPS.findIndex((s) => s.key === 'org'));
      onSnackbar({ message: 'Set the Stripe keys in the Organization & Billing step', severity: 'success' });
    };
    if (stripeComplete) {
      const mode = stripeSecret.startsWith('sk_test_') ? 'test' : 'live';
      addResult('Stripe Payment Keys', 'pass', 'Configured (' + mode + ' mode) — Payment Methods available');
    } else {
      const missing = [
        !stripeSecret && 'STRIPE_SECRET_KEY',
        !stripeWebhook && 'STRIPE_WEBHOOK_SECRET',
        !stripePublishable && 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      ].filter(Boolean).join(', ');
      addResult('Stripe Payment Keys', 'warn',
        'Not set up (missing: ' + missing + ') — Payment Methods will NOT be available until the keys are set in the Organization & Billing step',
        goToOrgStep, 'Go to step');
    }
    if (stripeSecret && stripePublishable && stripeSecret.startsWith('sk_test_') !== stripePublishable.startsWith('pk_test_')) {
      addResult('Stripe Key Mode', 'warn', 'Secret and publishable key are in different modes (test vs live) — keep them in the same mode');
    }

    if (freshVercelProjectId || stripeWebhook) {
      try {
        const testRes = await testStripeWebhook({
          slug,
          projectNameHint: slug,
          billingTarget: true,
        }).unwrap();
        const t = testRes.data;
        if (t?.ok) {
          addResult(
            'Stripe Webhook (snapshot)',
            'pass',
            t.message + (t.webhookUrl ? ' · ' + t.webhookUrl : ''),
          );
        } else if (t?.status === 'warn') {
          addResult('Stripe Webhook (snapshot)', 'warn', t.message, goToOrgStep, 'Go to step');
        } else {
          addResult(
            'Stripe Webhook (snapshot)',
            'fail',
            t?.message ?? 'Webhook test failed',
            goToOrgStep,
            'Go to step',
          );
        }
      } catch (err) {
        const msg =
          err && typeof err === 'object' && 'data' in err
            ? String((err as { data?: { error?: string } }).data?.error || 'Webhook test failed')
            : 'Could not run webhook test';
        addResult(
          'Stripe Webhook (snapshot)',
          freshVercelProjectId ? 'fail' : 'warn',
          msg,
          goToOrgStep,
          'Go to step',
        );
      }
    } else {
      addResult(
        'Stripe Webhook (snapshot)',
        'warn',
        'Deploy the tenant to Vercel and set STRIPE_WEBHOOK_SECRET in Organization & Billing before testing',
        goToOrgStep,
        'Go to step',
      );
    }

    // Deployment status - live check via API
    try {
      const statusResult = await getDeployStatus(tenant.slug).unwrap();
      if (statusResult.success) {
        const deployState = statusResult.data?.state || 'unknown';
        addResult('Deployment Status', deployState === 'READY' ? 'pass' : deployState === 'ERROR' ? 'fail' : 'warn', 'State: ' + deployState);
      } else {
        addResult('Deployment Status', 'warn', 'Could not check: ' + (statusResult.error || 'unknown'));
      }
    } catch {
      addResult('Deployment Status', 'warn', 'API call failed');
    }

    if (id === flightRunId || true) {
      setFlightChecks(results);
      setFlightRunning(false);
    }
  }, [tenant, flightRunId, getTenant, getDeployStatus, setActiveStep, testStripeWebhook]);

  // ── Export tenant config ────────────────────────────────
  const handleExport = useCallback(() => {
    if (!tenant) return;
    const config = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      tenant: {
        slug: tenant.slug,
        displayName,
        template: editTemplate,
        primaryColor: editPrimaryColor,
        secondaryColor: editSecondaryColor,
      },
      license: {
        licenseKey: license.licenseKey,
        licenseTier: license.licenseTier,
        validUntil: license.validUntil,
        features: license.features,
      },
      secrets: {
        setupToken: license.setupToken,
        adminPin: license.adminPin,
        openaiApiKey: license.openaiApiKey,
      },
      googleOAuth: {
        clientId: googleOAuth.clientId,
        clientSecret: googleOAuth.clientSecret,
        projectId: googleOAuth.projectId,
        authUri: googleOAuth.authUri,
        redirectUris: googleOAuth.redirectUris,
        supportEmail: googleOAuth.supportEmail,
        gcpAccountEmail: googleOAuth.gcpAccountEmail,
      },
      database: {
        dbUrl: dbConfig.dbUrl,
        pooledUrl: dbConfig.pooledUrl,
        directUrl: dbConfig.directUrl,
      },
      envPairs: envPairs,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenant-${tenant.slug}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
    onSnackbar({ message: `📦 Tenant config exported: tenant-${tenant.slug}-config.json`, severity: 'success' });
  }, [tenant, displayName, editTemplate, editPrimaryColor, editSecondaryColor, license, googleOAuth, dbConfig, envPairs, onSnackbar]);

  // ── Import tenant config ────────────────────────────────
  const handleImport = useCallback(async (file: File) => {
    if (!tenant) return;
    setImporting(true);
    try {
      const text = await file.text();
      const config = JSON.parse(text);
      if (!config.exportVersion) {
        throw new Error('Invalid config file — missing exportVersion');
      }

      // Restore all fields from imported config
      if (config.tenant) {
        if (config.tenant.displayName) setDisplayName(config.tenant.displayName);
        if (config.tenant.template) {
          setEditTemplate(config.tenant.template);
          const tpl = getTemplate(config.tenant.template);
          setEditPrimaryColor(config.tenant.primaryColor || tpl.defaultColors.primary);
          setEditSecondaryColor(config.tenant.secondaryColor || tpl.defaultColors.secondary);
        }
      }
      if (config.license) {
        setLicense((prev) => ({
          ...prev,
          licenseKey: config.license.licenseKey || prev.licenseKey,
          licenseTier: config.license.licenseTier || prev.licenseTier,
          validUntil: config.license.validUntil || prev.validUntil,
          features: config.license.features || prev.features,
        }));
      }
      if (config.secrets) {
        setLicense((prev) => ({
          ...prev,
          setupToken: config.secrets.setupToken || prev.setupToken,
          adminPin: config.secrets.adminPin || prev.adminPin,
          openaiApiKey: config.secrets.openaiApiKey || prev.openaiApiKey,
        }));
      }
      if (config.googleOAuth) {
        setGoogleOAuth((prev) => ({
          ...prev,
          clientId: config.googleOAuth.clientId || prev.clientId,
          clientSecret: config.googleOAuth.clientSecret || prev.clientSecret,
          projectId: config.googleOAuth.projectId || prev.projectId,
          authUri: config.googleOAuth.authUri || prev.authUri,
          redirectUris: config.googleOAuth.redirectUris || prev.redirectUris,
          supportEmail: config.googleOAuth.supportEmail || prev.supportEmail,
          gcpAccountEmail: config.googleOAuth.gcpAccountEmail || prev.gcpAccountEmail,
        }));
      }
      if (config.database) {
        setDbConfig({
          dbUrl: config.database.dbUrl || config.database.pooledUrl || '',
          pooledUrl: config.database.pooledUrl || config.database.dbUrl || '',
          directUrl: config.database.directUrl || '',
        });
      }
      if (config.envPairs) {
        setEnvPairs(config.envPairs);
      }

      onSnackbar({ message: `📂 Tenant config imported from ${file.name}`, severity: 'success' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      onSnackbar({ message: `❌ Import failed: ${msg}`, severity: 'error' });
    } finally {
      setImporting(false);
    }
  }, [tenant, onSnackbar]);

  // ── Deploy handler ────────────────────────────────────────
  const handleDeploy = useCallback(async () => {
    if (!tenant) return;
    if (deployingSlug) return;

    setDeployingSlug(tenant.slug);

    try {
      const payload = buildDeployPayload();
      const deployResult = await deployTenant({ slug: tenant.slug, payload }).unwrap();
      if (!deployResult.success) {
        throw new Error(deployResult.error || 'Deploy API failed');
      }

      dispatch(setThemeColors({ primary: editPrimaryColor, secondary: editSecondaryColor }));
      onSnackbar({
        message: `🚀 ${tenant.displayName} deployment started — building in background. Status will update to live when ready.`,
        severity: 'success',
      });
      // Close modal immediately — deployment continues in background
      setDeployingSlug(null);
      setActiveStep(0);
      onClose();
    } catch (err) {
      const msg = err?.data?.error || (err instanceof Error ? err.message : 'Deploy failed');
      onSnackbar({ message: `❌ Deploy failed: ${msg}`, severity: 'error' });
    } finally {
      setDeployingSlug(null);
    }
  }, [tenant, buildDeployPayload, editTemplate, editPrimaryColor, editSecondaryColor, deployTenant, dispatch, onSnackbar, onClose, deployingSlug]);

  // ── Deploy with Git handler ──────────────────────────────
  const handleDeployWithGit = useCallback(async () => {
    if (!tenant) return;
    if (deployingSlug) return;

    setDeployingSlug(tenant.slug);

    try {
      // Save config first so deployHookUrl and other fields persist
      await handleSave();

      if (deployHookUrl) {
        // Use the deploy hook URL directly — it has its own auth baked in
        const hookResult = await triggerDeployHook(deployHookUrl).unwrap();
        const hookData = hookResult as { job?: { id?: string; state?: string } };
        if (!hookData?.job?.id) {
          throw new Error(hookData && typeof hookData === 'object' && 'error' in hookData
            ? String((hookData as Record<string, unknown>).error)
            : 'Deploy hook did not return a job ID');
        }
        onSnackbar({
          message: `🚀 ${tenant.displayName} deploy hook triggered (job: ${hookData.job.id}). Building in background.`,
          severity: 'success',
        });
      } else {
        // Fallback: call the deploy API route (requires valid VERCEL_TOKEN env var)
        const payload = buildDeployPayload();
        const deployResult = await deployTenant({ slug: tenant.slug, payload: { ...payload, gitSource: true } }).unwrap();
        if (!deployResult.success) {
          throw new Error(deployResult.error || 'Deploy API failed');
        }

        onSnackbar({
          message: `🚀 ${tenant.displayName} Git deployment triggered from main branch. Building in background.`,
          severity: 'success',
        });
      }

      dispatch(setThemeColors({ primary: editPrimaryColor, secondary: editSecondaryColor }));
      setDeployingSlug(null);
      setActiveStep(0);
      onClose();
    } catch (err) {
      const msg = err?.data?.error || (err instanceof Error ? err.message : 'Deploy failed');
      onSnackbar({ message: `❌ Git deploy failed: ${msg}`, severity: 'error' });
      setDeployingSlug(null);
    }
  }, [tenant, buildDeployPayload, deployHookUrl, editTemplate, editPrimaryColor, editSecondaryColor, triggerDeployHook, deployTenant, dispatch, onSnackbar, onClose, deployingSlug, handleSave]);

  // ── Close / Reset ─────────────────────────────────────────
  const handleClose = () => {
    setDeployingSlug(null);
    setDeployProgress(0);
    setDeployStepStatuses({});
    setDeployDetails({});
    setSaving(false);
    setActiveStep(0);
    setProvisionOAuthResult(null);
    setProvisionOAuthError(null);
    setProvisionDbResult(null);
    setProvisionDbError(null);
    onClose();
  };

  // ── Navigation ────────────────────────────────────────────
  const handleNext = () => setActiveStep((s) => Math.min(s + 1, EDIT_STEPS.length - 1));
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));
  const isLastStep = activeStep === EDIT_STEPS.length - 1;
  const isSummaryStep = activeStep === EDIT_STEPS.length - 1;

  // ── Guard: no tenant ──────────────────────────────────────
  if (!tenant) return null;

  const selectedTemplate = getTemplate(editTemplate);

  // ── Step 0: Template ──────────────────────────────────────
  const renderStepTemplate = () => {
    const appPack = getAppPack(tenant);
    const isSuite = !!appPack;

    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            {isSuite ? 'Suite Configuration' : 'Select Template & Branding'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {isSuite 
              ? `This tenant is a multi-app suite with ${appPack.apps.length} applications. Each app has its own template and deployment.`
              : "Choose a business template and customize the display name and brand colors. These settings affect the tenant application's header, buttons, and page structure."

            }
          </Typography>
        </Box>
        <TextField
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth
          helperText="Human-readable name shown in the header and page titles."
        />
        
        {isSuite ? (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Suite Apps ({appPack.apps.length})
            </Typography>
            <Stack spacing={1.5}>
              {appPack.apps.map((app) => {
                const tpl = getTemplate(app.templateId);
                return (
                  <Paper key={app.appId} variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {app.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {app.appId} • {app.department}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip label={tpl.label} size="small" variant="outlined" />
                          <Chip 
                            label={app.status} 
                            size="small" 
                            color={app.status === 'live' ? 'success' : app.status === 'error' ? 'error' : 'default'}
                          />
                        </Stack>
                        {app.appUrl && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'primary.main' }}>
                            {app.appUrl}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Edit Composition
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Toggle templates to add or remove apps from this suite. Unchecking a template removes its
              not-yet-deployed app(s); apps already <strong>live</strong> are left in place — remove those
              from their own three-dot menu on the Apps list instead, to avoid orphaning a deployed Vercel
              project.
            </Typography>
            <Grid container spacing={0.5}>
              {listTemplates().filter((tpl) => tpl.id !== 'default').map((tpl) => {
                const checked = suiteTemplates.includes(tpl.id);
                return (
                  <Grid key={tpl.id} size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checked}
                          size="small"
                          onChange={() =>
                            setSuiteTemplates((prev) =>
                              checked ? prev.filter((t) => t !== tpl.id) : [...prev, tpl.id],
                            )
                          }
                        />
                      }
                      label={tpl.label}
                    />
                  </Grid>
                );
              })}
            </Grid>
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 1 }}
              disabled={suiteApplying || addingSuiteApp || removingSuiteApp}
              startIcon={suiteApplying || addingSuiteApp || removingSuiteApp ? <CircularProgress size={14} color="inherit" /> : undefined}
              onClick={() => void applySuiteChanges()}
            >
              Apply Suite Changes
            </Button>
          </Paper>
        ) : (
          <TemplateSelector
            selectedId={editTemplate}
            currentId={tenant.template}
            onSelect={handleTemplateSelect}
            primaryColor={editPrimaryColor}
            secondaryColor={editSecondaryColor}
            onColorsChange={handleColorsChange}
            showPreviewDelta={true}
          />
        )}
      </Stack>
    );
  };

  // ── Step 1: Preview ───────────────────────────────────────
  const renderStepPreview = () => (
    <Stack spacing={3}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Live Preview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Preview how the tenant application will look with the selected template and brand colors.
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {selectedTemplate.label} — {displayName || tenant.displayName}
          </Typography>
          <Chip label={selectedTemplate.schemaOrgType as string} size="small" variant="outlined" color="info" />
        </Stack>

        {/* Header preview */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: editPrimaryColor, color: '#fff' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {displayName || tenant.displayName}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
                Dashboard
              </Box>
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
                Reports
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* Theme colors */}
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.5 }}>
          THEME COLORS
        </Typography>
        <Stack direction="row" sx={{ gap: 3, mb: 3 }}>
          <Stack spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption">Primary</Typography>
            <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: editPrimaryColor, border: '3px solid', borderColor: 'background.paper', boxShadow: 2 }} />
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{editPrimaryColor}</Typography>
          </Stack>
          <Stack spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption">Secondary</Typography>
            <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: editSecondaryColor, border: '3px solid', borderColor: 'background.paper', boxShadow: 2 }} />
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{editSecondaryColor}</Typography>
          </Stack>
        </Stack>

        {/* Favicon upload — reads from RTK Query cache directly */}
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
          FAVICON
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
          <Box
            component="img"
            src={tenant?.faviconData ? `data:${tenant.faviconMimeType || 'image/x-icon'};base64,${tenant.faviconData}` : '/favicon.ico'}
            alt="Favicon preview"
            sx={{
              width: 32, height: 32,
              border: '1px solid', borderColor: 'divider',
              borderRadius: 0.5,
              objectFit: 'contain',
              bgcolor: 'black',
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <Button
            variant="outlined"
            size="small"
            component="label"
            disabled={uploadingFavicon}
          >
            {uploadingFavicon ? 'Uploading...' : tenant?.faviconData ? 'Replace' : 'Upload .ico'}
            <input
              type="file"
              hidden
              accept=".ico,.png"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 65536) {
                  onSnackbar?.({ message: 'Favicon must be under 64KB', severity: 'error' });
                  return;
                }
                try {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    const mimeType = file.type || (file.name.endsWith('.ico') ? 'image/x-icon' : 'image/png');
                    uploadFavicon({ slug: tenant!.slug, data: base64, mimeType });
                  };
                  reader.readAsDataURL(file);
                } catch {
                  onSnackbar?.({ message: 'Failed to read file', severity: 'error' });
                }
              }}
            />
          </Button>
          {tenant?.faviconData ? (
            <Button
              size="small"
              color="error"
              variant="text"
              onClick={() => removeFavicon(tenant!.slug)}
            >
              Remove
            </Button>
          ) : null}
        </Stack>

        {/* Pages */}
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.5 }}>
          PAGES ({selectedTemplate.defaultPages.length})
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', mb: 2 }}>
          {selectedTemplate.defaultPages.map((p) => (
            <Chip key={p.slug} label={p.title} size="small" variant="outlined" />
          ))}
        </Stack>

        {/* Button previews */}
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Box sx={{ px: 2.5, py: 1, borderRadius: 1, bgcolor: editPrimaryColor, color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>
            Primary Button
          </Box>
          <Box sx={{ px: 2.5, py: 1, borderRadius: 1, border: '1px solid', borderColor: editSecondaryColor, color: editSecondaryColor, fontSize: '0.85rem', fontWeight: 700 }}>
            Secondary
          </Box>
        </Stack>
      </Paper>

      {tenant.template !== editTemplate && (
        <Alert severity="info">
          <AlertTitle>Template Change Detected</AlertTitle>
          Switching from <strong>{getTemplate(tenant.template).label}</strong> to{' '}
          <strong>{selectedTemplate.label}</strong>. This will update pages, navigation, and schema.
        </Alert>
      )}
    </Stack>
  );

  // ── Step 2: Slug ──────────────────────────────────────────
  const renderStepSlug = () => {
    const currentSlug = tenant?.slug || '';
    const hasVercelProject = !!tenant?.vercelProjectId;

    const validateSlug = (slug: string): string | null => {
      if (!slug) return 'Slug is required';
      if (slug.length < 2) return 'Slug must be at least 2 characters';
      if (slug.length > 50) return 'Slug must be at most 50 characters';
      if (!/^[a-z0-9-]+$/.test(slug)) return 'Slug must be lowercase alphanumeric with hyphens (a-z, 0-9, -)';
      if (slug === currentSlug) return 'New slug is the same as the current slug';
      return null;
    };

    const handleRename = async () => {
      const validationError = validateSlug(newSlug);
      if (validationError) { setSlugError(validationError); return; }

      setRenamingSlug(true);
      setSlugError(null);
      setSlugResult(null);
      try {
        const result = await renameTenant({ currentSlug, newSlug }).unwrap();
        if (result.success) {
          setSlugResult(`✅ Slug renamed to "${result.data.tenant.slug}". The page will reload to use the new slug.`);
          // Update tenant reference for downstream steps
          setNewSlug('');
          // Close after a short delay so the user sees the confirmation
          setTimeout(() => {
            handleClose();
          }, 1500);
        } else {
          setSlugError(result.error || 'Failed to rename slug');
        }
      } catch (err) {
        setSlugError(err?.data?.error || 'Failed to connect to rename API');
      } finally {
        setRenamingSlug(false);
      }
    };

    return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <EditIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Tenant Slug
          </Typography>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'warning.dark', color: 'warning.contrastText' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            ⚠️ Warning
          </Typography>
          <Typography variant="body2">
            Changing the tenant slug is a destructive operation. It will:
          </Typography>
          <ul style={{ margin: '4px 0', paddingLeft: '1.25rem' }}>
            <li><Typography variant="caption">Rename the Vercel project (changes the <strong>.vercel.app</strong> URL)</Typography></li>
            <li><Typography variant="caption">Update the <strong>app_url</strong> in the database</Typography></li>
            <li><Typography variant="caption">Set the tenant status to <strong>deploying</strong> — a redeploy is required</Typography></li>
            {hasVercelProject && <li><Typography variant="caption">The old <strong>{currentSlug}.vercel.app</strong> URL will stop working</Typography></li>}
          </ul>
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
            After renaming, the modal will close and you will need to re-open it from the new slug entry in the tenant list.
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack spacing={2}>
            <SummaryRow label="Current Slug" value={currentSlug} />
            <TextField
              label="New Slug"
              value={newSlug}
              onChange={(e) => { setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugError(null); }}
              fullWidth
              size="small"
              placeholder="my-new-slug"
              helperText="Lowercase letters, numbers, and hyphens only (2-50 chars)"
              error={!!slugError}
              slotProps={{ input: { sx: { fontFamily: 'monospace' } } }}
            />
            {slugError && <Typography variant="caption" color="error">{slugError}</Typography>}
            {slugResult && <Typography variant="caption" color="success.main">{slugResult}</Typography>}
            {hasVercelProject && newSlug && newSlug !== currentSlug && (
              <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
                Preview URL after rename: <strong>https://{newSlug}.vercel.app</strong>
              </Alert>
            )}
          </Stack>
        </Paper>

        <Button
          variant="contained"
          color="warning"
          onClick={handleRename}
          disabled={renamingSlug || !newSlug || newSlug === currentSlug}
          startIcon={renamingSlug ? <CircularProgress size={18} color="inherit" /> : <EditIcon />}
          sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
        >
          {renamingSlug ? 'Renaming...' : 'Rename & Redeploy'}
        </Button>
      </Stack>
    );
  };

  // ── Step 3: License ───────────────────────────────────────
  const renderStepLicense = () => (
    <Stack spacing={3}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        License Configuration
      </Typography>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
        <TextField
          label="License Key"
          value={license.licenseKey}
          onChange={(e) => handleLicenseChange('licenseKey', e.target.value)}
          fullWidth
          placeholder={'rrb-' + (tenant?.slug || 'unknown')}
          helperText="Auto-generated if left empty"
          sx={{ flex: 1 }}
        />
        <Button variant="outlined" size="small" onClick={generateLicenseKey} sx={{ mt: 0.5, minWidth: 100 }}>
          Generate
        </Button>
      </Stack>

      <FormControl fullWidth>
        <InputLabel>License Tier</InputLabel>
        <Select
          value={license.licenseTier}
          label="License Tier"
          onChange={(e) => handleLicenseChange('licenseTier', e.target.value)}
        >
          {LICENSE_TIERS.map((tier) => (
            <MenuItem key={tier} value={tier}>{tier.toUpperCase()}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Valid Until"
        type="date"
        value={license.validUntil}
        onChange={(e) => handleLicenseChange('validUntil', e.target.value)}
        fullWidth
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </Stack>
  );

  // ── Step 4: Organization & Billing ────────────────────────
  const renderStepOrgBilling = () => (
    <Stack spacing={3}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Organization & Billing
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Billing is owned by the Organization, not the Tenant (Organization → Tenant → Apps).
        This tenant&apos;s plan, credits and cloud usage are charged to the organization
        selected here. Pick an owner and press Save Changes to persist the assignment.
      </Typography>

      {/* Current owner */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Current Billing Owner
        </Typography>
        {currentOrg ? (
          <Stack spacing={0.5}>
            <SummaryRow label="Organization" value={currentOrg.displayName} />
            <SummaryRow
              label="Plan"
              value={currentPlan
                ? `${currentPlan.id.toUpperCase()}${currentPlan.priceMonthly ? ` — $${(currentPlan.priceMonthly / 100).toFixed(0)}/mo` : ''}`
                : 'free'}
            />
            <SummaryRow label="Subscription" value={currentSubscription ? currentSubscription.status : 'none'} />
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No organization assigned yet — this tenant is not billed to anyone.
          </Typography>
        )}
      </Paper>

      {/* Assignment */}
      <FormControl fullWidth>
        <InputLabel>Billing Organization</InputLabel>
        <Select
          value={effectiveOrgId ?? ''}
          label="Billing Organization"
          onChange={(e) => setOrgId(e.target.value || null)}
        >
          {organizations.map((o) => (
            <MenuItem key={o.id} value={o.id}>{o.displayName}</MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {orgId && orgId !== currentOrg?.id
            ? `Will move this tenant to "${organizations.find((o) => o.id === orgId)?.displayName ?? orgId}" on Save.`
            : 'Select the organization that pays for this tenant, then press Save Changes.'}
        </Typography>
      </FormControl>

      {/* Credits balance of the effective org */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Credits Balance
        </Typography>
        {creditsData?.data?.balance ? (
          <Stack spacing={0.5}>
            <SummaryRow label="Available" value={`${creditsData.data.balance.available} credits`} />
            <SummaryRow label="Expiring ≤ 7d" value={`${creditsData.data.balance.expiringSoon} credits`} />
            <SummaryRow label="Debt" value={`${creditsData.data.balance.debt} credits`} />
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">No balance data for this organization.</Typography>
        )}
      </Paper>

      {/* Create a new organization */}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <TextField
          label="New organization name"
          value={newOrgName}
          onChange={(e) => setNewOrgName(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
        />
        <Button
          variant="outlined"
          size="small"
          disabled={creatingOrg || !newOrgName.trim()}
          onClick={async () => {
            try {
              const res = await createOrg({ displayName: newOrgName.trim() }).unwrap();
              const created = res.data?.organization;
              if (created) {
                setOrgId(created.id);
                setNewOrgName('');
                onSnackbar({
                  message: `✅ Organization "${created.displayName}" created — press Save Changes to assign this tenant`,
                  severity: 'success',
                });
              }
            } catch (err) {
              const msg = err && typeof err === 'object' && 'data' in err
                ? String((err as { data?: { error?: string } }).data?.error || 'Failed to create organization')
                : 'Failed to create organization';
              onSnackbar({ message: `❌ ${msg}`, severity: 'error' });
            }
          }}
        >
          Create
        </Button>
      </Stack>

      {/* Stripe payment keys — pushed to Vercel env on Save Changes */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Stripe Payment Keys
          </Typography>
          <Button
            size="small"
            variant="text"
            onClick={() => setShowStripeSecrets((s) => !s)}
            startIcon={showStripeSecrets ? <VisibilityOff /> : <Visibility />}
          >
            {showStripeSecrets ? 'Hide' : 'Show'}
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These are the Vercel Global Variables that enable Payment Methods for this
          tenant&apos;s application. Create them in your Stripe dashboard (test keys{' '}
          <code>sk_test_</code>/<code>pk_test_</code> locally, live keys for production) and
          register the webhook endpoint at <code>https://&lt;domain&gt;/api/webhooks/stripe</code>{' '}
          — see <strong>docs/STRIPE-SETUP.md</strong>. Secret and publishable key must be in
          the same mode. Saved on <strong>Save Changes</strong> and pushed to Vercel env for
          this app (and every suite app); a redeploy is triggered automatically so the
          publishable key reaches the client bundle.
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="STRIPE_SECRET_KEY"
            type={showStripeSecrets ? 'text' : 'password'}
            value={stripeKeys.secretKey}
            onChange={(e) => setStripeKeys((s) => ({ ...s, secretKey: e.target.value }))}
            fullWidth
            placeholder="sk_test_… / sk_live_…"
            helperText={stripeKeys.secretKey && !stripeKeys.secretKey.startsWith('sk_') ? '⚠️ Expected an "sk_" prefix.' : 'Server-only key — never exposed to the browser.'}
          />
          <TextField
            label="STRIPE_WEBHOOK_SECRET"
            type={showStripeSecrets ? 'text' : 'password'}
            value={stripeKeys.webhookSecret}
            onChange={(e) => setStripeKeys((s) => ({ ...s, webhookSecret: e.target.value }))}
            fullWidth
            placeholder="whsec_…"
            helperText={stripeKeys.webhookSecret && !stripeKeys.webhookSecret.startsWith('whsec_') ? '⚠️ Expected a "whsec_" prefix (the webhook signing secret).' : 'Signing secret for /api/webhooks/stripe — from the dashboard-registered endpoint.'}
          />
          <TextField
            label="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
            type={showStripeSecrets ? 'text' : 'password'}
            value={stripeKeys.publishableKey}
            onChange={(e) => setStripeKeys((s) => ({ ...s, publishableKey: e.target.value }))}
            fullWidth
            placeholder="pk_test_… / pk_live_…"
            helperText={stripeKeys.publishableKey && !stripeKeys.publishableKey.startsWith('pk_') ? '⚠️ Expected a "pk_" prefix.' : 'Public key — inlined into the client bundle at build time.'}
          />
          {stripeKeys.secretKey && stripeKeys.publishableKey &&
            stripeKeys.secretKey.startsWith('sk_test_') !== stripeKeys.publishableKey.startsWith('pk_test_') && (
            <Alert severity="warning">
              Secret and publishable key are in different modes (test vs live). The config
              guard rejects a mix — keep them in the same mode.
            </Alert>
          )}

          {/* Tenant-specific price IDs — override the deployment-level defaults */}
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontSize: '0.7rem' }}>
            Tenant price IDs (override deployment defaults)
          </Typography>
          <TextField
            label="STRIPE_PRICE_PRO_MONTHLY"
            value={stripeKeys.prices?.PRO_MONTHLY}
            onChange={(e) => setStripeKeys((s) => ({ ...s, prices: { ...s.prices, PRO_MONTHLY: e.target.value } }))}
            fullWidth
            placeholder="price_1U..."
            helperText="Pro monthly price ID. Leave blank to use deployment default."
          />
          <TextField
            label="STRIPE_PRICE_PRO_YEARLY"
            value={stripeKeys.prices?.PRO_YEARLY}
            onChange={(e) => setStripeKeys((s) => ({ ...s, prices: { ...s.prices, PRO_YEARLY: e.target.value } }))}
            fullWidth
            placeholder="price_1U..."
            helperText="Pro yearly price ID. Leave blank to use deployment default."
          />
          <TextField
            label="STRIPE_PRICE_BUSINESS_MONTHLY"
            value={stripeKeys.prices?.BUSINESS_MONTHLY}
            onChange={(e) => setStripeKeys((s) => ({ ...s, prices: { ...s.prices, BUSINESS_MONTHLY: e.target.value } }))}
            fullWidth
            placeholder="price_1U..."
            helperText="Business monthly price ID. Leave blank to use deployment default."
          />
          <TextField
            label="STRIPE_PRICE_BUSINESS_YEARLY"
            value={stripeKeys.prices?.BUSINESS_YEARLY}
            onChange={(e) => setStripeKeys((s) => ({ ...s, prices: { ...s.prices, BUSINESS_YEARLY: e.target.value } }))}
            fullWidth
            placeholder="price_1U..."
            helperText="Business yearly price ID. Leave blank to use deployment default."
          />
          {pushingStripeEnv && <LinearProgress />}
        </Stack>
      </Paper>
    </Stack>
  );

  // ── Step 5: Features ──────────────────────────────────────
  const renderStepFeatures = () => (
    <Stack spacing={3}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Feature Toggles
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Enable or disable features for this tenant application. Each feature controls
        specific functionality in the deployed app.
      </Typography>
      <FormGroup row>
        {DEFAULT_FEATURES.map((feat) => (
          <FormControlLabel
            key={feat}
            control={<Checkbox checked={license.features.includes(feat)} onChange={() => toggleLicenseFeature(feat)} size="small" />}
            label={<Typography variant="body2">{feat}</Typography>}
          />
        ))}
      </FormGroup>

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          API Keys &amp; PINs
        </Typography>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <TextField
              label="Setup Token (SETUP_TOKEN)"
              value={license.setupToken}
              onChange={(e) => handleLicenseChange('setupToken', e.target.value)}
              fullWidth type="password" sx={{ flex: 1 }}
            />
            <Button variant="outlined" size="small" onClick={generateSetupToken} sx={{ mt: 0.5, minWidth: 100 }}>
              Generate
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <TextField
              label="Admin PIN"
              value={license.adminPin}
              onChange={(e) => handleLicenseChange('adminPin', e.target.value)}
              fullWidth type="password" placeholder="454212" sx={{ flex: 1 }}
            />
            <Button variant="outlined" size="small" onClick={generateAdminPin} sx={{ mt: 0.5, minWidth: 100 }}>
              Generate
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );

  // ── Step 4: OpenAI API-Key ────────────────────────────────
  const renderStepOpenAi = () => (
    <Stack spacing={3}>
      <TenantAiProviderForm tenantSlug={tenant.slug} />

      <Divider />

      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Legacy OpenAI API Key
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Superseded by the AI Provider section above, which takes effect immediately on the tenant&apos;s
        live app with no redeploy required.
      </Typography>
      <Alert severity="warning">
        This field is only saved into the tenant&apos;s config JSON — it is not currently injected as an
        environment variable during deployment.
      </Alert>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
        <TextField
          label="OpenAI API Key"
          value={license.openaiApiKey}
          onChange={(e) => handleLicenseChange('openaiApiKey', e.target.value)}
          fullWidth type="password"
          placeholder="sk-proj-..."
          sx={{ flex: 1 }}
          slotProps={{ input: { sx: { fontFamily: 'monospace' } } }}
        />
        <Button variant="outlined" size="small" onClick={generateOpenAiKey} sx={{ mt: 0.5, minWidth: 100 }}>
          Generate
        </Button>
      </Stack>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
        <Typography variant="caption" color="text.secondary">
          💡 Get your API key from{' '}
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
            platform.openai.com
          </a>
        </Typography>
      </Paper>
    </Stack>
  );

  // ── Step 5: Google OAuth ──────────────────────────────────
  const renderStepOAuth = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <VerifiedUserIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Google OAuth 2.0
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Configure Google OAuth credentials for the tenant application. You can
        auto-provision via the Google Cloud API (creates a new GCP project with
        the tenant slug as Project ID) or enter existing credentials manually.
      </Typography>

      {/* Step 1: Create GCP Project */}
      <Paper variant="outlined" sx={{ p: 2.5, borderColor: 'primary.main' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
          <VerifiedUserIcon color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Step 1: Create a GCP Project
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create a new project in Google Cloud Console, then paste the Project ID below.
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="contained"
            href="https://console.cloud.google.com/projectcreate"
            target="_blank"
            startIcon={<OpenInNewIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Create New GCP Project
          </Button>
          <TextField
            label="GCP Project ID"
            value={googleOAuth.projectId}
            onChange={(e) => handleOAuthChange('projectId', e.target.value)}
            size="small"
            placeholder="my-project-mynew"
            sx={{ minWidth: { xs: '100%', sm: 280 }, flex: 1 }}
            helperText="Paste the Project ID from GCP Console after creating the project."
            slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.85rem' } } }}
          />
        </Stack>
      </Paper>

      {/* Step 2: Create OAuth Client */}
      <Paper variant="outlined" sx={{ p: 2.5, borderColor: 'secondary.main' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
          <KeyIcon color="secondary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Step 2: Create OAuth 2.0 Client
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Open the GCP Console credentials page for your project and create a Web application OAuth client.
          Add the redirect URIs shown below, then paste the Client ID and Secret here.
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            href={`https://console.cloud.google.com/apis/credentials?project=${googleOAuth.projectId || tenant.slug}`}
            target="_blank"
            startIcon={<OpenInNewIcon />}
            disabled={!googleOAuth.projectId}
          >
            Create OAuth 2.0 Client
          </Button>
          <Typography variant="caption" color="text.secondary">
            {googleOAuth.projectId ? `Project: ${googleOAuth.projectId}` : 'Enter Project ID above first'}
          </Typography>
        </Stack>

        {/* Redirect URIs reference */}
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default', mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            Required Redirect URIs (add these in GCP Console):
          </Typography>
          {googleOAuth.redirectUris.map((uri) => (
            <Typography key={uri} variant="caption" sx={{ display: 'block', fontFamily: 'monospace', fontSize: '0.7rem', color: 'text.secondary', mb: 0.25 }}>
              {uri}
            </Typography>
          ))}
        </Paper>

        {/* OAuth Credentials fields */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Client ID"
              value={googleOAuth.clientId}
              onChange={(e) => handleOAuthChange('clientId', e.target.value)}
              fullWidth
              placeholder="670560975972-xxxxx.apps.googleusercontent.com"
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Client Secret"
              value={googleOAuth.clientSecret}
              onChange={(e) => handleOAuthChange('clientSecret', e.target.value)}
              fullWidth
              type={showSecret ? 'text' : 'password'}
              slotProps={{
                input: {
                  sx: { fontFamily: 'monospace', fontSize: '0.8rem' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowSecret(!showSecret)} edge="end" size="small">
                        {showSecret ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Auto-Provision (optional attempt) */}
      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <AutoFixHighIcon fontSize="small" color="disabled" />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Auto-provision via service account (may fall back to shared credentials):
          </Typography>
          <TextField
            label="GCP Email"
            type="email"
            value={googleOAuth.gcpAccountEmail}
            onChange={(e) => handleOAuthChange('gcpAccountEmail', e.target.value)}
            size="small"
            placeholder="reward2learn@gmail.com"
            sx={{ minWidth: 200 }}
            slotProps={{ input: { sx: { fontSize: '0.75rem' } } }}
          />
          <Button
            variant="text"
            size="small"
            onClick={handleProvisionOAuth}
            disabled={provisioningOAuth || !googleOAuth.gcpAccountEmail.trim()}
            startIcon={provisioningOAuth ? <CircularProgress size={12} color="inherit" /> : <AutoFixHighIcon />}
          >
            {provisioningOAuth ? '...' : 'Auto'}
          </Button>
        </Stack>
        {provisionOAuthError && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
            {provisionOAuthError}
          </Typography>
        )}
      </Paper>

      {provisionOAuthResult && (
        <Alert severity="success">
          <AlertTitle>✅ OAuth Provisioning Complete</AlertTitle>
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

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Redirect URIs</Typography>
      <Stack spacing={1}>
        {googleOAuth.redirectUris.map((uri) => (
          <Stack key={uri} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label={uri} variant="outlined" onDelete={() => removeRedirectUri(uri)} sx={{ flex: 1, justifyContent: 'flex-start', py: 0.5 }} />
          </Stack>
        ))}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <TextField size="small" fullWidth placeholder="https://app.tenant.com/auth/callback" value={newRedirectUri}
          onChange={(e) => setNewRedirectUri(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRedirectUri(); } }} />
        <Button variant="outlined" size="small" onClick={addRedirectUri} startIcon={<AddIcon />}>Add</Button>
      </Stack>
    </Stack>
  );

  // ── Step 6: Database ──────────────────────────────────────
  const renderStepDatabase = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <DnsIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Database Connection
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Configure the database connection for the tenant application. Auto-provision
        a Neon PostgreSQL database or enter an existing connection string.
      </Typography>

      {/* Neon Provisioning */}
      <Paper variant="outlined" sx={{ p: 2.5, borderColor: 'secondary.main' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          🚀 Auto-Provision Neon Database
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Creates an isolated Neon branch + database for this tenant.
          Connection strings will be auto-filled below.
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained" color="secondary"
            onClick={handleProvisionDb}
            disabled={provisioningDb}
            startIcon={provisioningDb ? <CircularProgress size={18} color="inherit" /> : <DnsIcon />}
          >
            {provisioningDb ? 'Provisioning...' : 'Provision Neon Database'}
          </Button>
          <Button variant="outlined" href="https://console.neon.tech" target="_blank" endIcon={<OpenInNewIcon />}>
            Open Neon Console
          </Button>
        </Stack>
        {provisionDbResult && (
          <Alert severity="success" sx={{ mt: 1 }}>
            <AlertTitle>✅ Database Provisioned</AlertTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Connection strings have been auto-populated below. Review and continue to the next step.
            </Typography>
            {/* Summary of key connection strings */}
            {(() => {
              const dd = provisionDbResult?.data as Record<string, unknown> | undefined;
              const conns = dd?.connectionStrings as Record<string, string> | undefined;
              if (!conns) return null;
              const entries = Object.entries(conns).slice(0, 6);
              return (
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>Provisioned Keys:</Typography>
                  {entries.map(([key, val]) => (
                    <Stack key={key} direction="row" spacing={1} sx={{ mb: 0.25 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, minWidth: 200, fontSize: '0.65rem' }}>{key}=</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.65rem', wordBreak: 'break-all' }}>{(val as string).length > 60 ? (val as string).substring(0, 60) + '...' : val}</Typography>
                    </Stack>
                  ))}
                </Paper>
              );
            })()}
          </Alert>
        )}
        {provisionDbError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            <AlertTitle>❌ Database Provisioning Failed</AlertTitle>
            {provisionDbError}
          </Alert>
        )}
      </Paper>

      <Divider><Typography variant="caption" color="text.secondary">or enter manually</Typography></Divider>

      <TextField
        label="Database URL (Pooled)"
        value={dbConfig.dbUrl}
        onChange={(e) => {
          const url = e.target.value;
          setDbConfig({ dbUrl: url, pooledUrl: url, directUrl: url.replace('-pooler', '') });
        }}
        fullWidth multiline rows={2}
        placeholder="postgresql://user:pass@ep-xxx-pooler.neon.tech/db?sslmode=require"
        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
      />
      <TextField
        label="Direct URL (Unpooled)"
        value={dbConfig.directUrl}
        onChange={(e) => setDbConfig((prev) => ({ ...prev, directUrl: e.target.value }))}
        fullWidth multiline rows={2}
        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
      />

      {/* Test Connection + Results */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleTestConnection}
          disabled={testingConnection || !dbConfig.dbUrl}
          startIcon={testingConnection ? <CircularProgress size={16} color="inherit" /> : <DnsIcon />}
        >
          {testingConnection ? 'Testing...' : 'Test Connection'}
        </Button>
        {connectionTestResult && (
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace', fontSize: '0.7rem', whiteSpace: 'pre-wrap',
              color: connectionTestResult.startsWith('✅') ? 'success.main' : connectionTestResult.startsWith('⚠️') ? 'warning.main' : 'error.main',
            }}
          >
            {connectionTestResult}
          </Typography>
        )}
      </Stack>
    </Stack>
  );

  // ── Step 7: Custom Env ────────────────────────────────────
  const renderStepEnv = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <CloudIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Custom Environment Variables
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Add custom environment variables for the tenant application.
        These are injected into the Vercel project during deployment.
      </Typography>

      {envPairs.map((pair, index) => (
        <Stack key={index} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TextField size="small" label="Key" value={pair.key}
            onChange={(e) => { const u = [...envPairs]; u[index].key = e.target.value; setEnvPairs(u); }}
            sx={{ flex: 1 }} slotProps={{ input: { sx: { fontFamily: 'monospace' } } }} />
          <TextField size="small" label="Value" value={pair.value}
            onChange={(e) => { const u = [...envPairs]; u[index].value = e.target.value; setEnvPairs(u); }}
            sx={{ flex: 2 }} slotProps={{ input: { sx: { fontFamily: 'monospace' } } }} />
          <IconButton color="error" size="small" onClick={() => removeEnvPair(index)}><DeleteIcon /></IconButton>
        </Stack>
      ))}

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <TextField size="small" label="Key" value={newEnvKey} onChange={(e) => setNewEnvKey(e.target.value)}
          sx={{ flex: 1 }} placeholder="MY_VARIABLE" slotProps={{ input: { sx: { fontFamily: 'monospace' } } }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEnvPair(); } }} />
        <TextField size="small" label="Value" value={newEnvValue} onChange={(e) => setNewEnvValue(e.target.value)}
          sx={{ flex: 2 }} slotProps={{ input: { sx: { fontFamily: 'monospace' } } }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEnvPair(); } }} />
        <Button variant="outlined" size="small" onClick={addEnvPair} startIcon={<AddIcon />} disabled={!newEnvKey || !newEnvValue}>Add</Button>
      </Stack>

      {envPairs.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No custom env vars yet. Add key-value pairs above.
        </Typography>
      )}
    </Stack>
  );

  // ── Step 8: Deploy Hooks ──────────────────────────────────
  const renderStepHooks = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <RocketLaunchIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Vercel Deploy Hooks
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Configure a Vercel Deploy Hook to trigger Git-based redeployments from the tenant dashboard.
        Create a hook in the Vercel Dashboard under Settings → Git → Deploy Hooks, then paste the URL below.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, borderColor: 'primary.main' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Deploy Hook URL
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create a Deploy Hook in the Vercel Dashboard for this tenant&apos;s project and paste the URL here.
          This allows you to trigger redeployments from the tenant dashboard without API authentication.
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <TextField
            label="Vercel Deploy Hook URL"
            value={deployHookUrl}
            onChange={(e) => setDeployHookUrl(e.target.value)}
            fullWidth
            size="small"
            placeholder="https://api.vercel.com/v1/integrations/deploy/prj_xxx/hook_xxx"
            helperText="Create in Vercel Dashboard > Settings > Git > Deploy Hooks"
            slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
          />
          <Button
            variant="outlined"
            size="small"
            href="https://vercel.com/ilishaps-projects"
            target="_blank"
            endIcon={<OpenInNewIcon />}
            sx={{ mt: 0.5, whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Open Vercel Dashboard
          </Button>
        </Stack>
        {deployHookUrl && (
          <Paper variant="outlined" sx={{ p: 1.5, mt: 2, bgcolor: 'background.default' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              ✅ Deploy Hook configured
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all' }}>
              {deployHookUrl}
            </Typography>
          </Paper>
        )}
      </Paper>
      <Paper variant="outlined" sx={{ p: 2.5, borderColor: 'primary.main', mt: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Vercel Project ID
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The Vercel project ID for this tenant. This is used to find the existing Vercel project
          during deployment. Find it in the Vercel Dashboard under your project settings.
        </Typography>
        <TextField
          label="Vercel Project ID"
          value={vercelProjectId}
          onChange={(e) => setVercelProjectId(e.target.value)}
          fullWidth
          size="small"
          placeholder="prj_xxxxxxxxxxxxxxx"
          helperText="Found in Vercel Dashboard > Project > Settings > General > Project ID"
          slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
        />
        {vercelProjectId && (
          <Paper variant="outlined" sx={{ p: 1.5, mt: 2, bgcolor: 'background.default' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              ✅ Vercel Project ID configured
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all' }}>
              {vercelProjectId}
            </Typography>
          </Paper>
        )}
      </Paper>
    </Stack>
  );

  // ── Step 9: Functional Roles ──────────────────────────────
  const renderStepRoles = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
            <PeopleIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Functional Role Catalog
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Create, edit, and manage functional roles. Set PIN codes for role-based authentication.
          </Typography>
        </Box>
        <Button variant="contained" size="small" onClick={openCreateRole} startIcon={<AddIcon />} sx={{ flexShrink: 0 }}>
          Create Role
        </Button>
      </Stack>

      {rolesLoadingFromApi ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : rolesError ? (
        <Alert severity="error">{rolesError}</Alert>
      ) : rolesList.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>No roles configured.</Typography>
          <Button variant="outlined" onClick={openCreateRole} startIcon={<AddIcon />}>Create Role</Button>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {rolesList.map((role) => (
            <Paper key={role.code} variant="outlined" sx={{ p: 2, borderLeft: 4, borderLeftColor: role.isPlatformAdmin ? 'primary.main' : 'grey.300' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{role.name}</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>({role.code})</Typography>
                    {role.isPlatformAdmin && <Chip label="Platform Admin" size="small" color="primary" variant="outlined" />}
                  </Stack>
                  <Chip icon={role.pinConfigured ? <CheckCircleIcon /> : <LockIcon />}
                    label={role.pinConfigured ? 'PIN Configured' : 'No PIN'} size="small"
                    color={role.pinConfigured ? 'success' : 'warning'}
                    variant={role.pinConfigured ? 'filled' : 'outlined'} />
                </Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
                  {settingPinRole === role.code ? (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TextField size="small" type="password" placeholder="Enter PIN (3+ chars)"
                        value={settingPinValue[role.code] || ''}
                        onChange={(e) => setSettingPinValue((prev) => ({ ...prev, [role.code]: e.target.value }))}
                        sx={{ width: { xs: '100%', sm: 160 } }} autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = settingPinValue[role.code] || ''; if (v.length >= 3) void handleSetRolePin(role.code, v); } }} />
                      <IconButton size="small" color="primary"
                        onClick={() => { const v = settingPinValue[role.code] || ''; if (v.length >= 3) void handleSetRolePin(role.code, v); }}
                        disabled={savingPinRole === role.code || (settingPinValue[role.code] || '').length < 3}>
                        {savingPinRole === role.code ? <CircularProgress size={18} /> : <CheckCircleIcon />}
                      </IconButton>
                      <IconButton size="small" onClick={() => { setSettingPinRole(null); setSettingPinValue((prev) => ({ ...prev, [role.code]: '' })); }}><CloseIcon /></IconButton>
                    </Stack>
                  ) : (
                    <>
                      <Tooltip title="Set PIN"><IconButton size="small" onClick={() => setSettingPinRole(role.code)} color="default"><LockIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Edit role"><IconButton size="small" onClick={() => openEditRole(role)} color="primary"><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete role"><IconButton size="small" onClick={() => setRoleDeleteConfirm(role.code)} color="error"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Role CRUD dialog */}
      <Dialog open={roleDialogOpen} onClose={() => !roleSaving && setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{roleDialogMode === 'create' ? 'Create Functional Role' : 'Edit Role: ' + roleFormCode}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {roleDialogMode === 'create' && (
              <TextField label="Role Code" value={roleFormCode}
                onChange={(e) => setRoleFormCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                fullWidth size="small" helperText="Unique identifier (lowercase, hyphens)." />
            )}
            <TextField label="Role Name" value={roleFormName}
              onChange={(e) => { setRoleFormName(e.target.value); if (roleDialogMode === 'create' && !roleFormCode) setRoleFormCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }}
              fullWidth size="small" placeholder="e.g. Finance Manager" autoFocus={roleDialogMode === 'create'} />
            {/* Email not stored on roles — mapping is via PERSONS registry. */}
            <FormControlLabel control={<Switch checked={roleFormIsPlatformAdmin} onChange={(e) => setRoleFormIsPlatformAdmin(e.target.checked)} />} label="Platform Admin (full access)" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRoleDialogOpen(false)} disabled={roleSaving}>Cancel</Button>
          <Button variant="contained" onClick={handleRoleSave} disabled={roleSaving || !roleFormName.trim()}
            startIcon={roleSaving ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {roleSaving ? 'Saving...' : roleDialogMode === 'create' ? 'Create Role' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={Boolean(roleDeleteConfirm)} onClose={() => !roleSaving && setRoleDeleteConfirm(null)}>
        <DialogTitle>Delete Role?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete role <strong>{roleDeleteConfirm}</strong>?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDeleteConfirm(null)} disabled={roleSaving}>Cancel</Button>
          <Button onClick={() => roleDeleteConfirm && handleRoleDelete(roleDeleteConfirm)} color="error" variant="contained" disabled={roleSaving}>
            {roleSaving ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Divider />
      <Typography variant="caption" color="text.secondary">
        Roles control access and task assignment. PINs are stored encrypted in the secrets table.
      </Typography>
    </Stack>
  );

  // ── Step 10: Custom Domain ──────────────────────────────
  const renderStepCustomDomain = () => {
    const isVercelDomain = customDomain.trim().endsWith('.vercel.app');
    const hasProjectInfo = projectInfo !== null;
    const deployHint = !tenant?.vercelProjectId
      ? 'No Vercel project deployed yet. Deploy the tenant first.'
      : null;

    const fetchDomains = async () => {
      if (!tenant?.vercelProjectId) {
        setDomainError('No Vercel project deployed yet. Deploy the tenant first.');
        return;
      }
      setDomainLoading(true);
      setDomainError(null);
      setProjectInfo(null);
      setVercelUrl(null);
      try {
        const result = await getTenantDomains(tenant.slug).unwrap();
        if (result.success) {
          const dd = result.data || {};
          setDomainList(dd.domains || []);
          setProjectInfo(dd.projectInfo || null);
          setVercelUrl(dd.autoVercelUrl || null);

          const apiWarnings = dd.warnings || [];
          if (!dd.domains?.length && !dd.projectInfo) {
            if (apiWarnings.length > 0) {
              setDomainResult('⚠️ ' + apiWarnings.join('; '));
            } else {
              setDomainResult('No domains configured on Vercel yet.');
            }
          } else {
            const verified = (dd.domains || []).filter((d: { verified: boolean }) => d.verified).length;
            const parts: string[] = [];
            if (dd.domains?.length) {
              parts.push(`${dd.domains.length} domain(s) — ${verified} verified`);
            }
            if (dd.projectInfo) {
              parts.push(`Project: ${dd.projectInfo.name}`);
            }
            if (apiWarnings.length > 0) {
              parts.push(`⚠️ ${apiWarnings.length} warning(s)`);
            }
            setDomainResult(parts.join(' | ') || 'Fetched domain info.');
          }
        } else {
          setDomainError(result.error || 'Failed to fetch domains');
        }
      } catch {
        setDomainError('Failed to connect to domain API');
      } finally {
        setDomainLoading(false);
      }
    };

    const handleSetDomain = async () => {
      if (!customDomain.trim()) return;
      if (!tenant?.vercelProjectId) {
        setDomainError('No Vercel project deployed yet. Deploy the tenant first.');
        return;
      }
      setDomainSetting(true);
      setDomainError(null);
      setDomainResult(null);
      try {
        const result = await setTenantDomain({ slug: tenant.slug, domain: customDomain.trim(), updateAppUrl: true }).unwrap();
        if (result.success) {
          const dd = result.data || {};
          setDomainList(dd.domains || []);
          setProjectInfo(dd.projectInfo || null);
          setVercelUrl(dd.autoVercelUrl || null);

          if (dd.renamed) {
            setDomainResult(
              `✅ Project renamed to "${dd.projectName}". Auto-generated URL: ${dd.autoVercelUrl || 'https://' + customDomain.trim().replace(/\.vercel\.app$/i, '') + '.vercel.app'}`,
            );
          } else {
            setDomainResult(
              `Domain "${customDomain.trim()}" added — ${dd.verified ? '✅ verified' : '⚠️ pending verification'}`,
            );
          }
          setCustomDomain('');
        } else {
          setDomainError(result.error || 'Failed to set domain');
        }
      } catch (err) {
        setDomainError(err?.data?.error || 'Failed to set domain');
      } finally {
        setDomainSetting(false);
      }
    };

    return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <LanguageIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Domain Configuration
          </Typography>
          <Chip
            label={`Template: ${selectedTemplate.label}`}
            size="small"
            variant="outlined"
            color="default"
            icon={<PaletteIcon fontSize="small" />}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Configure the tenant&apos;s domain. For <strong>custom domains</strong> (e.g. app.example.com),
          add the domain and configure DNS. For <strong>.vercel.app subdomains</strong>, rename the
          Vercel project to change the auto-generated URL.
        </Typography>

        {/* Vercel Project Info — current project name and auto-generated URL */}
        <Paper variant="outlined" sx={{ p: 2.5, borderColor: 'info.main', bgcolor: 'action.hover' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
            <RocketLaunchIcon color="info" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Vercel Project
            </Typography>
          </Stack>

          {!tenant?.vercelProjectId ? (
            <Typography variant="body2" color="text.warning">
              ⚠️ No Vercel project deployed yet. Go to the Summary step and deploy the tenant first.
            </Typography>
          ) : hasProjectInfo ? (
            <Stack spacing={1}>
              <SummaryRow label="Project Name" value={projectInfo!.name} />
              <SummaryRow label="Auto-generated URL" value={vercelUrl || `https://${projectInfo!.name}.vercel.app`} />
              <SummaryRow label="Project ID" value={projectInfo!.id} />
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Project deployed — click <strong>Fetch Current Domain</strong> to load project info.
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={() => void fetchDomains()}
                disabled={domainLoading}
                startIcon={domainLoading ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon fontSize="small" />}
              >
                {domainLoading ? 'Loading...' : 'Fetch'}
              </Button>
            </Stack>
          )}
        </Paper>

        {/* Current Domains List */}
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Current Domains on Vercel
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => void fetchDomains()}
              disabled={domainLoading || domainSetting || !tenant?.vercelProjectId}
              startIcon={domainLoading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            >
              {domainLoading ? 'Loading...' : 'Fetch Current Domain'}
            </Button>
          </Stack>

          {domainLoading && !domainList.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : domainList.length > 0 ? (
            <Stack spacing={1}>
              {domainList.map((d) => (
                <Stack
                  key={d.name}
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}
                >
                  <LanguageIcon fontSize="small" color={d.verified ? 'success' : 'warning'} />
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1, fontSize: '0.8rem' }}>
                    {d.name}
                  </Typography>
                  <Chip
                    label={d.verified ? 'Verified' : 'Pending'}
                    size="small"
                    color={d.verified ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {tenant?.vercelProjectId
                ? `${vercelUrl || `https://${tenant.slug}.vercel.app`} (auto-generated)`.length > 0
                  ? `Only the auto-generated .vercel.app URL is active. Add a custom domain below or rename the project to change it.`
                  : 'No domains configured yet.'
                : 'Deploy the tenant to see domain info.'}
            </Typography>
          )}

          {domainResult && (
            <Alert severity={domainResult.includes('⚠️') ? 'warning' : 'success'} sx={{ mt: 1.5 }}>
              {domainResult}
            </Alert>
          )}

          {domainError && (
            <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => setDomainError(null)}>
              {domainError}
            </Alert>
          )}
        </Paper>

        {/* Add / Rename Domain */}
        <Paper variant="outlined" sx={{ p: 2.5, borderColor: isVercelDomain ? 'warning.main' : 'primary.main' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            {isVercelDomain ? (
              <RocketLaunchIcon color="warning" fontSize="small" />
            ) : (
              <LanguageIcon color="primary" fontSize="small" />
            )}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {isVercelDomain ? 'Rename Vercel Project' : 'Add Custom Domain'}
            </Typography>
          </Stack>

          {isVercelDomain && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Changing a .vercel.app URL</AlertTitle>
              <Typography variant="body2">
                Domains ending in <strong>.vercel.app</strong> are auto-generated from the
                Vercel project name. To change it, the entire project is renamed.
                This will affect the auto-generated URL: <code>{customDomain.trim()}</code>
              </Typography>
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'flex-start' } }}>
            <TextField
              label={isVercelDomain ? 'New .vercel.app Domain' : 'Custom Domain'}
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder={isVercelDomain ? 'my-project.vercel.app' : 'app.yourdomain.com'}
              size="small"
              fullWidth
              disabled={domainSetting}
              slotProps={{
                input: { sx: { fontFamily: 'monospace', fontSize: '0.85rem' } },
              }}
              helperText={
                isVercelDomain
                  ? 'Enter the desired full .vercel.app URL (e.g. my-brand.vercel.app)'
                  : 'Enter the fully qualified domain name (e.g. app.example.com)'
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); void handleSetDomain(); }
              }}
            />
            <Button
              variant="contained"
              color={isVercelDomain ? 'warning' : 'primary'}
              size="small"
              onClick={() => void handleSetDomain()}
              disabled={domainSetting || !customDomain.trim() || !tenant?.vercelProjectId}
              startIcon={domainSetting ? <CircularProgress size={16} color="inherit" /> : isVercelDomain ? <RocketLaunchIcon /> : <VerifiedIcon />}
              sx={{ minWidth: 140, mt: { xs: 0, sm: 0.5 }, flexShrink: 0 }}
            >
              {domainSetting
                ? (isVercelDomain ? 'Renaming...' : 'Adding...')
                : (isVercelDomain ? 'Rename Project' : 'Add Domain')}
            </Button>
          </Stack>
        </Paper>

        {/* DNS Configuration Instructions (only for custom domains) */}
        {!isVercelDomain && (
          <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              DNS Configuration Instructions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              To point your domain to the Vercel-hosted application, add the following DNS records
              with your domain provider (e.g. Namecheap, Cloudflare, GoDaddy):
            </Typography>
            <Stack spacing={1} sx={{ pl: 2 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                <strong>CNAME</strong> @ &rarr; <strong>cname.vercel-dns.com</strong>
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                <strong>CNAME</strong> www &rarr; <strong>cname.vercel-dns.com</strong>
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              DNS changes may take up to 48 hours to propagate. After adding the domain in Vercel,
              it will show as &quot;Pending&quot; until DNS is configured correctly.
            </Typography>
          </Paper>
        )}

        {/* Vercel Dashboard Link */}
        <Button
          variant="outlined"
          size="small"
          href={tenant?.vercelProjectId ? `https://vercel.com/ilishaps-projects/${tenant.slug}/settings/domains` : 'https://vercel.com/ilishaps-projects'}
          target="_blank"
          endIcon={<OpenInNewIcon />}
          sx={{ alignSelf: 'flex-start' }}
        >
          Open Vercel Domains Settings
        </Button>
      </Stack>
    );
  };

  // ── Step 12: Admin & Auth ──────────────────────────────
  const renderStepAuth = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <VerifiedUserIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Admin & Authentication
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Configure the default admin email for the tenant app and toggle authentication methods.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, borderColor: 'primary.main' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Default Admin Email
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This email will be seeded as the <strong>platform-admin</strong> in the tenant database.
          Users signing in with this email via Google OAuth will automatically get platform-admin
          access in the tenant app.
        </Typography>
        <TextField
          label="Admin Email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          fullWidth
          size="small"
          placeholder="reward2learn@gmail.com"
          helperText="Default: reward2learn@gmail.com"
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, borderColor: 'primary.main' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Authentication Methods
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={pinSignInEnabled}
              onChange={(e) => setPinSignInEnabled(e.target.checked)}
            />
          }
          label={
            <Stack spacing={0.5}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Enable PIN Sign-in
              </Typography>
              <Typography variant="caption" color="text.secondary">
                When enabled, users can sign in with both PIN codes and Google OAuth.
                When disabled, only Google OAuth sign-in is available.
              </Typography>
            </Stack>
          }
          sx={{ alignItems: 'flex-start', mx: 0 }}
        />
      </Paper>
    </Stack>
  );


  // ── Step 13: Flight Check ─────────────────────────────
  const renderStepFlightCheck = () => {
    if (!tenant) return null;

    const passCount = flightChecks.filter(function(c) { return c.status === 'pass'; }).length;
    const failCount = flightChecks.filter(function(c) { return c.status === 'fail'; }).length;
    const warnCount = flightChecks.filter(function(c) { return c.status === 'warn'; }).length;
    const hasResults = flightChecks.length > 0;
    const overallStatus = !hasResults ? 'idle' : failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : 'pass';

    return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <VerifiedIcon color={overallStatus === 'pass' ? 'success' : overallStatus === 'fail' ? 'error' : 'warning'} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Flight Check
            </Typography>
            {hasResults ? (
              <Chip
                label={overallStatus === 'pass' ? passCount + '/' + flightChecks.length + ' PASS' : passCount + ' pass, ' + warnCount + ' warn, ' + failCount + ' fail'}
                size="small"
                color={overallStatus === 'pass' ? 'success' : overallStatus === 'fail' ? 'error' : 'warning'}
              />
            ) : null}
          </Stack>
          <Button
            variant="contained"
            size="small"
            onClick={runFlightCheck}
            disabled={flightRunning}
            startIcon={flightRunning ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
          >
            {flightRunning ? 'Running...' : 'Run Flight Check'}
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {hasResults
            ? 'Results from last check. Click <strong>Run Flight Check</strong> to re-evaluate all items.'
            : 'Click <strong>Run Flight Check</strong> to validate all tenant configuration items. Failed items include a <strong>Fix</strong> button to jump to the relevant step.'}
        </Typography>

        {!hasResults && !flightRunning ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary">
              No checks run yet. Click "Run Flight Check" to start.
            </Typography>
          </Paper>
        ) : null}
        {flightRunning && !hasResults ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {flightChecks.map(function(check) {
          return (
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
                {(check.status === 'fail' || check.status === 'warn') && check.fixAction ? (
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    disabled={fixingKey === check._key}
                    startIcon={fixingKey === check._key ? <CircularProgress size={14} color="inherit" /> : null}
                    onClick={async function() {
                      setFixingKey(check._key);
                      try {
                        await check.fixAction!();
                        // Re-run flight check to refresh results
                        runFlightCheck();
                      } catch (e) {
                        onSnackbar({ message: 'Fix failed: ' + (e instanceof Error ? e.message : String(e)), severity: 'error' });
                      } finally {
                        setFixingKey(null);
                      }
                    }}
                    sx={{ flexShrink: 0, ml: 1 }}
                  >
                    {fixingKey === check._key ? 'Fixing...' : (check.fixLabel || 'Auto-fix')}
                  </Button>
                ) : null}
              </Stack>
            </Paper>
          );
        })}

        {hasResults ? (
          <Alert severity={overallStatus === 'pass' ? 'success' : overallStatus === 'fail' ? 'error' : 'warning'}>
            <AlertTitle>{overallStatus === 'pass' ? 'All checks passed' : overallStatus === 'fail' ? 'Failures found' : 'Warnings found'}</AlertTitle>
            {overallStatus === 'pass' ? 'Tenant configuration looks good. Proceed to deploy.' :
             failCount + ' item(s) must be fixed. ' + warnCount + ' item(s) should be reviewed. Use Fix buttons to navigate to the relevant step.'}
          </Alert>
        ) : null}

        {/* ── Connection Tests ─────────────────────────────── */}
        <Divider />
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Connection Tests
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Run connectivity tests to verify integrations are working.
        </Typography>

        <Grid container spacing={1.5}>
          {[
            {
              key: 'webhook',
              label: 'Vercel Webhook',
              desc: 'Test webhook endpoint reachability',
              action: async function() {
                const body = await testVercelWebhook().unwrap();
                return 'Webhook responded: ' + (body || '200');
              },
            },
            {
              key: 'deploy-hook',
              label: 'Vercel Deploy Hook',
              desc: 'Trigger a test deployment via deploy hook',
              action: async function() {
                const hookUrl = String((((tenant.metadata as Record<string, unknown>)?.config as Record<string, unknown>)?.hooks as Record<string, unknown>)?.deployHookUrl as string || '');
                if (!hookUrl) throw new Error('No deploy hook URL configured');
                const data = await triggerDeployHook(hookUrl).unwrap() as { job?: { id?: string } };
                return 'Deploy triggered: job=' + (data.job?.id || 'unknown');
              },
            },
            {
              key: 'neon-test',
              label: 'Neon DB Test',
              desc: 'Test Neon database connection',
              action: async function() {
                if (!tenant) return 'No tenant selected';
                const result = await testNeonConnection({ slug: tenant.slug }).unwrap();
                const msg = result.success ? 'Neon connection OK' : result.error || 'unknown';
                return 'Neon test: ' + msg;
              },
            },
            {
              key: 'redirect-uris',
              label: 'Redirect URIs',
              desc: 'Verify callback endpoints are reachable (proxied server-side)',
              action: async function() {
                if (!tenant) return 'No tenant selected';
                try {
                  const result = await checkRedirects({ slug: tenant.slug }).unwrap();
                  if (!result.success || !result.data?.results) return 'Check failed';
                  return result.data.results.map((r: { uri: string; status: number | string }) => r.uri + '=' + r.status).join(', ');
                } catch {
                  return 'Check failed';
                }
              },
            },
            {
              key: 'openai-chat',
              label: 'OpenAI Chat',
              desc: 'Test OpenAI API with a simple prompt',
              action: async function() {
                try {
                  await getAiFindings().unwrap();
                  return 'Chat API responded with 200';
                } catch (err) {
                  throw new Error(err?.data?.error || 'Chat API returned ' + (err?.status ?? 'error'));
                }
              },
            },
          ].map(function(test) {
            const tr = testResults[test.key] || {};
            return (
              <Grid size={{ xs: 12, sm: 6 }} key={test.key}>
                <Paper variant="outlined" sx={{ p: 1.5, height: '100%' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{test.label}</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={function() { runTest(test.key, test.action); }}
                        disabled={tr.running}
                        startIcon={tr.running ? <CircularProgress size={14} color="inherit" /> : null}
                      >
                        {tr.running ? 'Testing...' : 'Test'}
                      </Button>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{test.desc}</Typography>
                    {tr.result ? (
                      <Typography variant="caption" sx={{ color: 'success.main', fontFamily: 'monospace', fontSize: '0.65rem', wordBreak: 'break-all' }}>{tr.result}</Typography>
                    ) : null}
                    {tr.error ? (
                      <Typography variant="caption" sx={{ color: 'error.main', fontFamily: 'monospace', fontSize: '0.65rem', wordBreak: 'break-all' }}>{'Error: ' + tr.error}</Typography>
                    ) : null}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Stack>
    );
  };

  // ── Step 14: Summary ──────────────────────────────────────
  // ── Step 14: Summary ──────────────────────────────────────
  const renderStepSummary = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <RocketLaunchIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Tenant Configuration Summary
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Review all tenant application parameters below. You can export this configuration
        as a JSON file or import a previously exported file to restore these settings.
      </Typography>

      {/* Tenant Info */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Tenant Info
        </Typography>
        <Stack spacing={0.5}>
          <SummaryRow label="Slug" value={tenant?.slug || ''} />
          <SummaryRow label="App URL" value={tenant?.appUrl || 'Not deployed'} />
          <SummaryRow label="Display Name" value={displayName || tenant?.displayName || ''} />
          <SummaryRow label="Template" value={getTemplate(editTemplate).label} />
          <SummaryRow label="Status" value={tenant?.status || 'draft'} />
          <SummaryRow label="Primary Color" value={editPrimaryColor} color={editPrimaryColor} />
          <SummaryRow label="Secondary Color" value={editSecondaryColor} color={editSecondaryColor} />
        </Stack>

      </Paper>

      {/* License */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          License
        </Typography>
        <Stack spacing={0.5}>
          <SummaryRow label="License Key" value={license.licenseKey || '(auto-generated)'} />
          <SummaryRow label="Tier" value={license.licenseTier.toUpperCase()} />
          <SummaryRow label="Valid Until" value={license.validUntil} />
          <SummaryRow label="Features" value={license.features.join(', ')} />
          <SummaryRow label="Setup Token" value={license.setupToken ? '✅ configured' : '⚠️ not set'} />
          <SummaryRow label="Admin PIN" value={license.adminPin ? '✅ configured' : '⚠️ not set'} />
          <SummaryRow label="OpenAI API Key" value={license.openaiApiKey ? '✅ configured' : '⚠️ not set'} />
        </Stack>
      </Paper>

      {/* Organization & Billing */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Organization & Billing
        </Typography>
        <Stack spacing={0.5}>
          <SummaryRow
            label="Billing Owner"
            value={effectiveOrgId
              ? (organizations.find((o) => o.id === effectiveOrgId)?.displayName ?? effectiveOrgId)
              : '⚠️ not assigned'}
          />
          <SummaryRow label="Plan" value={currentPlan ? currentPlan.id.toUpperCase() : 'free'} />
          {orgId && orgId !== currentOrg?.id ? (
            <SummaryRow
              label="Change"
              value={`Will move to ${organizations.find((o) => o.id === orgId)?.displayName ?? orgId} on save`}
            />
          ) : null}
        </Stack>
      </Paper>

      {/* Google OAuth */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Google OAuth
        </Typography>
        <Stack spacing={0.5}>
          <SummaryRow label="GCP Account Email" value={googleOAuth.gcpAccountEmail} />
          <SummaryRow label="Client ID" value={googleOAuth.clientId ? '✅ configured' : '⚠️ not set'} />
          <SummaryRow label="Project ID" value={googleOAuth.projectId || '(auto)'} />
          <SummaryRow label="Redirect URIs" value={googleOAuth.redirectUris.length > 0 ? googleOAuth.redirectUris.join(', ') : 'none'} />
        </Stack>
      </Paper>

      {/* Database */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Database
        </Typography>
        <Stack spacing={0.5}>
          <SummaryRow label="Pooled URL" value={dbConfig.pooledUrl ? (dbConfig.pooledUrl.length > 60 ? dbConfig.pooledUrl.substring(0, 60) + '...' : dbConfig.pooledUrl) : '⚠️ not configured'} />
          <SummaryRow label="Direct URL" value={dbConfig.directUrl ? (dbConfig.directUrl.length > 60 ? dbConfig.directUrl.substring(0, 60) + '...' : dbConfig.directUrl) : '⚠️ not configured'} />
        </Stack>
      </Paper>

      {/* Admin & Auth */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Admin & Auth
        </Typography>
        <Stack spacing={0.5}>
          <SummaryRow label="Admin Email" value={adminEmail || DEFAULT_PLATFORM_ADMIN_EMAIL} />
          <SummaryRow label="PIN Sign-in" value={pinSignInEnabled ? '✅ Enabled' : '❌ Disabled'} />
        </Stack>
      </Paper>

      {/* Custom Env & Roles */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Custom Env Vars & Roles
        </Typography>
        <Stack spacing={0.5}>
          <SummaryRow label="Custom Env Vars" value={envPairs.length > 0 ? envPairs.map(p => p.key).join(', ') : 'none'} />
          <SummaryRow label="Functional Roles" value={rolesList.length > 0 ? rolesList.map(r => r.name).join(', ') : '(loading)'} />
        </Stack>
      </Paper>

      {/* Export / Import buttons */}
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleExport}
          startIcon={<SaveIcon />}
        >
          Export Config
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => importFileRef.current?.click()}
          disabled={importing}
          startIcon={importing ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
        >
          {importing ? 'Importing...' : 'Import Config'}
        </Button>
        <input
          ref={importFileRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImport(file);
            e.target.value = '';
          }}
        />
      </Stack>
    </Stack>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  const stepContent = (index: number): React.ReactNode => {
    switch (index) {
      case 0: return renderStepTemplate();
      case 1: return renderStepPreview();
      case 2: return renderStepSlug();
      case 3: return renderStepLicense();
      case 4: return renderStepOrgBilling();
      case 5: return renderStepFeatures();
      case 6: return renderStepOpenAi();
      case 7: return renderStepOAuth();
      case 8: return renderStepDatabase();
      case 9: return renderStepEnv();
      case 10: return renderStepHooks();
      case 11: return renderStepRoles();
      case 12: return renderStepCustomDomain();
      case 13: return renderStepAuth();
      case 14: return renderStepFlightCheck();
      case 15: return renderStepSummary();
      default: return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={false} fullWidth fullScreen={isMobile} aria-labelledby="edit-tenant-modal-title">
      {/* HEADER */}
      <DialogTitle id="edit-tenant-modal-title" sx={{ p: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2, pb: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <EditIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{tenant.displayName || tenant.slug}</Typography>
            <Chip label={tenant.status} size="small" color={
              tenant.status === 'live' ? 'success' : tenant.status === 'deploying' ? 'warning' : 'default'
            } />
          </Stack>
          <IconButton onClick={handleClose} size="small" aria-label="close"><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>

      {/* BODY WITH STEPPER */}
      <DialogContent dividers sx={{ p: { xs: 0, md: 0 }, minHeight: 400 }}>
        <Stepper activeStep={activeStep} sx={{ zIndex: 1000,
          backgroundColor: 'background.default', 
          padding: '19px 0px',
          position: 'sticky',
          top: 0,
          mb: 4, 
          overflowX: 'auto', 
          flexWrap: 'wrap', '& .MuiStepLabel-root': { cursor: 'pointer' } 
          }} nonLinear>
          {EDIT_STEPS.map((s, idx) => (
            <Step key={s.key} onClick={() => setActiveStep(idx)}>
              <StepLabel sx={{
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  fontWeight: activeStep === EDIT_STEPS.indexOf(s) ? 700 : 400,
                },
              }}>
                {isMobile ? s.label.substring(0, 8) + '\u2026' : s.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2, padding: '24px' }}>{stepContent(activeStep)}</Box>

        {/* Deploy progress */}
        {deployingSlug && (
          <Paper variant="outlined" sx={{ mt: 4, p: 3, borderColor: 'primary.main' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RocketLaunchIcon color="primary" /> Deploy Progress
            </Typography>
            <Stepper activeStep={deployProgress} orientation="vertical" sx={{ mb: 3  }}>
              {DEPLOY_STEPS.map((step) => {
                const status = deployStepStatuses[step.key] || 'pending';
                const isActive = status === 'inprogress';
                const detail = deployDetails[step.key];
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
                      {detail && (
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', p: 1, bgcolor: 'background.default', borderRadius: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          {detail}
                        </Typography>
                      )}
                    </StepContent>
                  </Step>
                );
              })}
            </Stepper>
            <LinearProgress variant="determinate" value={(deployProgress / DEPLOY_STEPS.length) * 100} sx={{ mt: 2, height: 6, borderRadius: 4 }} />
          </Paper>
        )}
      </DialogContent>

      {/* FOOTER */}
      <DialogActions sx={{ px: 3, py: 2.5, gap: 2, position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        backgroundColor: 'background.default' }}>
        {activeStep > 0 ? (
          <Button onClick={handleBack} disabled={!!deployingSlug || saving}>Back</Button>
        ) : (
          <Button onClick={handleClose} disabled={!!deployingSlug || saving}>Cancel</Button>
        )}

        <Button variant="outlined" onClick={handleSave} disabled={!!deployingSlug || saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />} sx={{ fontWeight: 600 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>

        <Box sx={{ flex: 1 }} />
        {isSummaryStep ? (
          <Button variant="contained" color="primary" size="large" onClick={handleDeployWithGit}
            disabled={!!deployingSlug || saving}
            startIcon={deployingSlug ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            sx={{ fontWeight: 700, minWidth: { xs: '100%', sm: 220 } }}>
            {deployingSlug ? 'DEPLOYING...' : 'Deploy with Git'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext} disabled={!!deployingSlug || saving} sx={{ fontWeight: 600 }}>
            Continue
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
