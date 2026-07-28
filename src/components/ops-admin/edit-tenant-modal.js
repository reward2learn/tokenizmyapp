'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * EditTenantModal — Stepper wizard for editing tenant applications.
 *
 * Steps: Template → Preview → License → Features → OpenAI API-Keys
 *        → Google OAuth → Database → Custom Env → Functional Roles
 *
 * Footer: [Back] [Save Changes] [Continue / Deploy to Vercel]
 */
import { useState, useCallback, useEffect, useRef } from 'react';
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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import CloudIcon from '@mui/icons-material/Cloud';
import DeleteIcon from '@mui/icons-material/Delete';
import DnsIcon from '@mui/icons-material/Dns';
import EditIcon from '@mui/icons-material/Edit';
import KeyIcon from '@mui/icons-material/Key';
import LockIcon from '@mui/icons-material/Lock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PaletteIcon from '@mui/icons-material/Palette';
import PeopleIcon from '@mui/icons-material/People';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { getTemplate } from '@/domain/tenant/template-catalog';
import { TemplateSelector } from '@/components/ops-admin/tenant-wizard';
import { useAppDispatch } from '@/store/hooks';
import { setThemeColors } from '@/store/ui-slice';
// ── Constants ──────────────────────────────────────────────────
const EDIT_STEPS = [
    { label: 'Template', icon: _jsx(SettingsIcon, { fontSize: "small" }), key: 'template' },
    { label: 'Preview', icon: _jsx(PaletteIcon, { fontSize: "small" }), key: 'preview' },
    { label: 'License', icon: _jsx(KeyIcon, { fontSize: "small" }), key: 'license' },
    { label: 'Features', icon: _jsx(AutoFixHighIcon, { fontSize: "small" }), key: 'features' },
    { label: 'OpenAI API-Keys', icon: _jsx(KeyIcon, { fontSize: "small" }), key: 'openai' },
    { label: 'Google OAuth', icon: _jsx(VerifiedUserIcon, { fontSize: "small" }), key: 'oauth' },
    { label: 'Database', icon: _jsx(DnsIcon, { fontSize: "small" }), key: 'database' },
    { label: 'Custom Env', icon: _jsx(CloudIcon, { fontSize: "small" }), key: 'env' },
    { label: 'Deploy Hooks', icon: _jsx(RocketLaunchIcon, { fontSize: "small" }), key: 'hooks' },
    { label: 'Functional Roles', icon: _jsx(PeopleIcon, { fontSize: "small" }), key: 'roles' },
    { label: 'Summary', icon: _jsx(RocketLaunchIcon, { fontSize: "small" }), key: 'summary' },
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
function SummaryRow({ label, value, color }) {
    return (_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 700, minWidth: 140, fontSize: '0.7rem', color: 'text.secondary' }, children: label }), color && (_jsx(Box, { sx: { width: 14, height: 14, borderRadius: '50%', bgcolor: color, border: '1px solid', borderColor: 'divider', flexShrink: 0 } })), _jsx(Typography, { variant: "caption", sx: { fontSize: '0.7rem', wordBreak: 'break-all', color: value.startsWith('✅') ? 'success.main' : value.startsWith('⚠️') ? 'warning.main' : 'text.primary' }, children: value })] }));
}
export function EditTenantModal({ open, tenant, onClose, onRefetch, onSnackbar }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const dispatch = useAppDispatch();
    // ── Stepper state ──────────────────────────────────────────
    const [activeStep, setActiveStep] = useState(0);
    // ── Template / Colors ──────────────────────────────────────
    const [editTemplate, setEditTemplate] = useState('financial-analytics');
    const [editPrimaryColor, setEditPrimaryColor] = useState('#eb3d28');
    const [editSecondaryColor, setEditSecondaryColor] = useState('#0af9fe');
    const [displayName, setDisplayName] = useState('');
    // ── License & API Key ──────────────────────────────────────
    const [license, setLicense] = useState({
        licenseKey: '',
        licenseTier: 'premium',
        validUntil: '2028-12-31',
        features: DEFAULT_FEATURES,
        setupToken: '',
        adminPin: '',
        openaiApiKey: '',
    });
    // ── Google OAuth ───────────────────────────────────────────
    const [googleOAuth, setGoogleOAuth] = useState({
        clientId: '',
        clientSecret: '',
        projectId: '',
        authUri: 'https://accounts.google.com/o/oauth2/auth',
        tokenUri: 'https://oauth2.googleapis.com/token',
        redirectUris: [],
        supportEmail: '',
        gcpAccountEmail: 'reward2learn@gmail.com',
    });
    const [showSecret, setShowSecret] = useState(false);
    const [newRedirectUri, setNewRedirectUri] = useState('');
    const [provisioningOAuth, setProvisioningOAuth] = useState(false);
    const [provisionOAuthResult, setProvisionOAuthResult] = useState(null);
    const [provisionOAuthError, setProvisionOAuthError] = useState(null);
    // ── Database ───────────────────────────────────────────────
    const [dbConfig, setDbConfig] = useState({
        dbUrl: '',
        pooledUrl: '',
        directUrl: '',
    });
    const [provisioningDb, setProvisioningDb] = useState(false);
    const [provisionDbResult, setProvisionDbResult] = useState(null);
    const [provisionDbError, setProvisionDbError] = useState(null);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionTestResult, setConnectionTestResult] = useState(null);
    // ── Custom Env ─────────────────────────────────────────────
    const [envPairs, setEnvPairs] = useState([]);
    const [newEnvKey, setNewEnvKey] = useState('');
    const [newEnvValue, setNewEnvValue] = useState('');
    // ── Functional Roles ───────────────────────────────────────
    const [rolesList, setRolesList] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [rolesError, setRolesError] = useState(null);
    const [settingPinRole, setSettingPinRole] = useState(null);
    const [settingPinValue, setSettingPinValue] = useState({});
    const [savingPinRole, setSavingPinRole] = useState(null);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [roleDialogMode, setRoleDialogMode] = useState('create');
    const [roleFormCode, setRoleFormCode] = useState('');
    const [roleFormName, setRoleFormName] = useState('');
    const [roleFormIsPlatformAdmin, setRoleFormIsPlatformAdmin] = useState(false);
    const [roleFormEmail, setRoleFormEmail] = useState('');
    const [roleDeleteConfirm, setRoleDeleteConfirm] = useState(null);
    const [roleSaving, setRoleSaving] = useState(false);
    // ── Deploy state ───────────────────────────────────────────
    const [deployingSlug, setDeployingSlug] = useState(null);
    const [deployProgress, setDeployProgress] = useState(0);
    const [deployStepStatuses, setDeployStepStatuses] = useState({});
    const [deployDetails, setDeployDetails] = useState({});
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);
    const [deployHookUrl, setDeployHookUrl] = useState('');
    const importFileRef = useRef(null);
    // ── Initialize from tenant on open ────────────────────────
    useEffect(() => {
        if (tenant) {
            const tpl = getTemplate(tenant.template || 'financial-analytics');
            setEditTemplate(tenant.template || 'financial-analytics');
            setEditPrimaryColor(tenant.primaryColor || tpl.defaultColors.primary);
            setEditSecondaryColor(tenant.secondaryColor || tpl.defaultColors.secondary);
            setDisplayName(tenant.displayName || '');
            // Restore saved config from metadata
            const cfg = (tenant.metadata?.config ?? {});
            const savedLicense = (cfg.license ?? {});
            const savedGoogle = (cfg.googleAuth ?? {});
            const savedDb = (cfg.database ?? {});
            const savedEnv = (cfg.env ?? {});
            // Restore license fields
            setLicense((prev) => ({
                ...prev,
                licenseKey: savedLicense.key || prev.licenseKey,
                licenseTier: savedLicense.tier || prev.licenseTier,
                validUntil: savedLicense.validUntil || prev.validUntil,
                features: savedLicense.features || prev.features,
                setupToken: cfg.apiKey || prev.setupToken,
                openaiApiKey: cfg.openaiApiKey || prev.openaiApiKey,
            }));
            // Restore DB config (metadata.database overrides tenant.dbUrl)
            setDbConfig({
                dbUrl: savedDb.pooledUrl || savedDb.databaseUrl || tenant.dbUrl || '',
                pooledUrl: savedDb.pooledUrl || savedDb.databaseUrl || tenant.dbUrl || '',
                directUrl: savedDb.directUrl || '',
            });
            // Restore Google OAuth
            setGoogleOAuth((g) => ({
                ...g,
                clientId: savedGoogle.clientId || g.clientId,
                clientSecret: savedGoogle.clientSecret || g.clientSecret,
                projectId: savedGoogle.projectId || g.projectId,
                authUri: savedGoogle.authUri || g.authUri,
                redirectUris: (savedGoogle.redirectUris?.length
                    ? savedGoogle.redirectUris
                    : [
                        `https://${tenant.slug}.vercel.app`,
                        `https://${tenant.slug}.vercel.app/api/auth?action=google-callback`,
                    ]),
                supportEmail: savedGoogle.supportEmail || g.supportEmail,
                gcpAccountEmail: savedGoogle.gcpAccountEmail || g.gcpAccountEmail,
            }));
            // Restore custom env vars
            const envPairsFromMeta = Object.entries(savedEnv).map(([key, value]) => ({ key, value }));
            setEnvPairs(envPairsFromMeta);
            // Restore deploy hook URL
            setDeployHookUrl(cfg.hooks?.deployHookUrl || '');
            setActiveStep(0);
            setProvisionOAuthResult(null);
            setProvisionOAuthError(null);
            setProvisionDbResult(null);
            setProvisionDbError(null);
        }
    }, [tenant]);
    // ── Fetch roles when modal opens ───────────────────────────
    const fetchRoles = useCallback(async () => {
        if (!tenant)
            return;
        setRolesLoading(true);
        setRolesError(null);
        try {
            const res = await fetch('/api/admin/roles');
            const data = await res.json();
            if (data.success && data.data?.roles) {
                setRolesList(data.data.roles);
            }
            else {
                setRolesError(data.error || 'Failed to load roles');
            }
        }
        catch {
            setRolesError('Failed to connect to roles API');
        }
        finally {
            setRolesLoading(false);
        }
    }, [tenant]);
    const handleSetRolePin = useCallback(async (code, pin) => {
        setSavingPinRole(code);
        try {
            const res = await fetch('/api/admin/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, pin }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchRoles();
                onSnackbar({ message: 'PIN set for role ' + code, severity: 'success' });
            }
            else {
                onSnackbar({ message: data.error || 'Failed to set PIN', severity: 'error' });
            }
        }
        catch {
            onSnackbar({ message: 'Failed to set PIN', severity: 'error' });
        }
        finally {
            setSavingPinRole(null);
            setSettingPinRole(null);
            setSettingPinValue((prev) => ({ ...prev, [code]: '' }));
        }
    }, [fetchRoles, onSnackbar]);
    // ── Role CRUD handlers ─────────────────────────────────────
    const openCreateRole = useCallback(() => {
        setRoleFormCode('');
        setRoleFormName('');
        setRoleFormIsPlatformAdmin(false);
        setRoleFormEmail('');
        setRoleDialogMode('create');
        setRoleDialogOpen(true);
    }, []);
    const openEditRole = useCallback((role) => {
        setRoleFormCode(role.code);
        setRoleFormName(role.name);
        setRoleFormIsPlatformAdmin(role.isPlatformAdmin);
        setRoleFormEmail(role.email || '');
        setRoleDialogMode('edit');
        setRoleDialogOpen(true);
    }, []);
    const handleRoleSave = useCallback(async () => {
        if (!roleFormName.trim())
            return;
        setRoleSaving(true);
        try {
            const res = await fetch('/api/admin/roles', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: roleFormCode || roleFormName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    name: roleFormName.trim(),
                    isPlatformAdmin: roleFormIsPlatformAdmin,
                }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchRoles();
                setRoleDialogOpen(false);
                onSnackbar({ message: 'Role ' + (roleDialogMode === 'create' ? 'created' : 'updated'), severity: 'success' });
            }
            else {
                onSnackbar({ message: data.error || 'Failed to save role', severity: 'error' });
            }
        }
        catch {
            onSnackbar({ message: 'Failed to save role', severity: 'error' });
        }
        finally {
            setRoleSaving(false);
        }
    }, [roleFormCode, roleFormName, roleFormIsPlatformAdmin, roleDialogMode, fetchRoles, onSnackbar]);
    const handleRoleDelete = useCallback(async (code) => {
        setRoleSaving(true);
        try {
            const res = await fetch('/api/admin/roles?code=' + encodeURIComponent(code), { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                await fetchRoles();
                setRoleDeleteConfirm(null);
                onSnackbar({ message: 'Role deleted: ' + code, severity: 'success' });
            }
            else {
                onSnackbar({ message: data.error || 'Failed to delete role', severity: 'error' });
            }
        }
        catch {
            onSnackbar({ message: 'Failed to delete role', severity: 'error' });
        }
        finally {
            setRoleSaving(false);
        }
    }, [fetchRoles, onSnackbar]);
    useEffect(() => {
        if (tenant) {
            void fetchRoles();
        }
    }, [tenant, fetchRoles]);
    // ── Handlers: Template ─────────────────────────────────────
    const handleTemplateSelect = (id) => {
        setEditTemplate(id);
        const tpl = getTemplate(id);
        setEditPrimaryColor((prev) => prev || tpl.defaultColors.primary);
        setEditSecondaryColor((prev) => prev || tpl.defaultColors.secondary);
    };
    const handleColorsChange = (primary, secondary) => {
        setEditPrimaryColor(primary);
        setEditSecondaryColor(secondary);
    };
    // ── Handlers: License ──────────────────────────────────────
    const handleLicenseChange = (field, value) => {
        setLicense((prev) => ({ ...prev, [field]: value }));
    };
    const toggleLicenseFeature = (feature) => {
        setLicense((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature],
        }));
    };
    // ── Handlers: Google OAuth ─────────────────────────────────
    const handleOAuthChange = (field, value) => {
        setGoogleOAuth((prev) => ({ ...prev, [field]: value }));
    };
    const addRedirectUri = () => {
        if (newRedirectUri && !googleOAuth.redirectUris.includes(newRedirectUri)) {
            setGoogleOAuth((prev) => ({ ...prev, redirectUris: [...prev.redirectUris, newRedirectUri] }));
            setNewRedirectUri('');
        }
    };
    const removeRedirectUri = (uri) => {
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
        for (let i = 0; i < 32; i++)
            token += chars.charAt(Math.floor(Math.random() * chars.length));
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
    const removeEnvPair = (index) => {
        setEnvPairs((prev) => prev.filter((_, i) => i !== index));
    };
    // ── Provision: Google OAuth (create GCP project + OAuth) ──
    const handleProvisionOAuth = useCallback(async () => {
        if (!tenant)
            return;
        setProvisioningOAuth(true);
        setProvisionOAuthError(null);
        setProvisionOAuthResult(null);
        try {
            const res = await fetch(`/api/admin/tenants/${tenant.slug}/provision/google-oauth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: googleOAuth.gcpAccountEmail || undefined,
                    redirectUris: googleOAuth.redirectUris,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setProvisionOAuthResult(data);
                // Auto-fill returned credentials — route wraps in jsonOk so data.data has the fields
                const dd = data.data || {};
                if (dd.clientId)
                    handleOAuthChange('clientId', dd.clientId);
                if (dd.clientSecret)
                    handleOAuthChange('clientSecret', dd.clientSecret);
                if (dd.projectId)
                    handleOAuthChange('projectId', dd.projectId);
                const strategy = dd.strategy || 'unknown';
                if (strategy === 'env-fallback') {
                    onSnackbar({
                        message: `⚠️ Using shared OAuth credentials. Create a dedicated OAuth client via GCP Console for production.`,
                        severity: 'success',
                    });
                }
                else {
                    onSnackbar({ message: `✅ GCP project + OAuth credentials created for ${tenant.slug}`, severity: 'success' });
                }
            }
            else {
                throw new Error(data.error || 'Google OAuth provisioning failed');
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Provisioning error';
            setProvisionOAuthError(msg);
            onSnackbar({ message: `❌ OAuth provisioning failed: ${msg}`, severity: 'error' });
        }
        finally {
            setProvisioningOAuth(false);
        }
    }, [tenant, displayName, googleOAuth.redirectUris, googleOAuth.gcpAccountEmail, onSnackbar]);
    // ── Provision: Neon Database ──────────────────────────────
    const handleProvisionDb = useCallback(async () => {
        if (!tenant)
            return;
        setProvisioningDb(true);
        setProvisionDbError(null);
        setProvisionDbResult(null);
        try {
            const res = await fetch(`/api/admin/tenants/${tenant.slug}/provision/neon`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: tenant.slug }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setProvisionDbResult(data);
                // Auto-fill returned connection strings
                const dd = data.data || {};
                const pooledUrl = dd.pooledUrl || dd.connectionStrings?.DATABASE_URL || dd.connectionStrings?.POSTGRES_URL || '';
                const directUrl = dd.directUrl || dd.connectionStrings?.DATABASE_URL_UNPOOLED || dd.connectionStrings?.POSTGRES_URL_NON_POOLING || '';
                if (pooledUrl) {
                    setDbConfig({
                        dbUrl: pooledUrl,
                        pooledUrl: pooledUrl,
                        directUrl: directUrl || pooledUrl.replace('-pooler', ''),
                    });
                    onSnackbar({ message: `✅ Neon database provisioned for ${tenant.slug} — connection strings auto-populated`, severity: 'success' });
                }
                else {
                    onSnackbar({ message: `✅ Neon database provisioned for ${tenant.slug}`, severity: 'success' });
                }
            }
            else {
                throw new Error(data.error || 'Neon provisioning failed');
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Provisioning error';
            setProvisionDbError(msg);
            onSnackbar({ message: `❌ Database provisioning failed: ${msg}`, severity: 'error' });
        }
        finally {
            setProvisioningDb(false);
        }
    }, [tenant, onSnackbar]);
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
            // Try to resolve hostname and check port availability
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            try {
                const testRes = await fetch(`/api/admin/tenants/${tenant?.slug}/provision/neon/test`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dbUrl: dbConfig.dbUrl }),
                    signal: controller.signal,
                });
                const testData = await testRes.json();
                clearTimeout(timeout);
                if (testData.success) {
                    setConnectionTestResult('✅ Connection successful — database is reachable');
                }
                else {
                    setConnectionTestResult(`❌ Connection failed: ${testData.error || 'Unknown error'}`);
                }
            }
            catch (fetchErr) {
                clearTimeout(timeout);
                // Fallback: basic URL validation
                setConnectionTestResult(`✅ URL format valid: ${url.protocol}//${url.hostname}/${url.pathname.split('/').pop()}
` +
                    `   Type: ${isPooled ? 'Pooled (PgBouncer)' : 'Direct'}
` +
                    `   Note: In-browser connection test unavailable; verify via psql or the Neon Console.`);
            }
        }
        catch {
            setConnectionTestResult('❌ Invalid database URL format');
        }
        finally {
            setTestingConnection(false);
        }
    }, [dbConfig.dbUrl, tenant]);
    // ── Build deploy payload ──────────────────────────────────
    const buildDeployPayload = useCallback(() => {
        if (!tenant)
            return {};
        const envVars = {};
        for (const pair of envPairs) {
            if (pair.key)
                envVars[pair.key] = pair.value;
        }
        return {
            template: editTemplate,
            metadata: {
                displayName,
                previousTemplate: tenant.template || 'financial-analytics',
                amendmentReason: 'stepper-edit-and-deploy',
                primaryColor: editPrimaryColor,
                secondaryColor: editSecondaryColor,
                license: {
                    key: license.licenseKey || `rrb-${tenant.slug}`,
                    tier: license.licenseTier,
                    validUntil: license.validUntil,
                    features: license.features,
                },
                pins: [license.adminPin || process.env.NEXT_PUBLIC_DEFAULT_ADMIN_PIN || '454212'],
                subscriptionTier: license.licenseTier,
                apiKey: license.setupToken || '',
                googleAuth: {
                    enabled: !!googleOAuth.clientId,
                    clientId: googleOAuth.clientId,
                    clientSecret: googleOAuth.clientSecret,
                    projectId: googleOAuth.projectId,
                    authUri: googleOAuth.authUri,
                    redirectUris: googleOAuth.redirectUris,
                },
                database: {
                    databaseUrl: dbConfig.dbUrl || `postgresql://${tenant.slug}:***@pooled.neon.tech/${tenant.slug}`,
                    type: 'neon',
                    provider: 'postgresql',
                },
                env: envVars,
                hooks: { deployHookUrl: deployHookUrl || undefined },
                supportEmail: googleOAuth.supportEmail,
            },
        };
    }, [tenant, editTemplate, displayName, editPrimaryColor, editSecondaryColor, license, googleOAuth, dbConfig, envPairs]);
    // ── Save handler ──────────────────────────────────────────
    const handleSave = useCallback(async () => {
        if (!tenant)
            return;
        setSaving(true);
        try {
            const payload = {
                slug: tenant.slug,
                displayName,
                template: editTemplate,
                primaryColor: editPrimaryColor,
                secondaryColor: editSecondaryColor,
                metadata: {
                    config: {
                        license: {
                            key: license.licenseKey,
                            tier: license.licenseTier,
                            validUntil: license.validUntil,
                            features: license.features,
                        },
                        pins: [license.adminPin],
                        subscriptionTier: license.licenseTier,
                        apiKey: license.setupToken || '',
                        openaiApiKey: license.openaiApiKey || '',
                        googleAuth: {
                            clientId: googleOAuth.clientId,
                            clientSecret: googleOAuth.clientSecret,
                            projectId: googleOAuth.projectId,
                            authUri: googleOAuth.authUri,
                            redirectUris: googleOAuth.redirectUris,
                            gcpAccountEmail: googleOAuth.gcpAccountEmail,
                        },
                        database: {
                            databaseUrl: dbConfig.dbUrl,
                            pooledUrl: dbConfig.pooledUrl,
                            directUrl: dbConfig.directUrl,
                        },
                        env: Object.fromEntries(envPairs.filter((p) => p.key).map((p) => [p.key, p.value])),
                        hooks: { deployHookUrl: deployHookUrl || undefined },
                    },
                },
            };
            const res = await fetch(`/api/admin/tenants/${tenant.slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Save failed');
            }
            onSnackbar({ message: `✅ ${tenant.displayName} saved successfully`, severity: 'success' });
            onRefetch();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Save failed';
            onSnackbar({ message: `❌ Save failed: ${msg}`, severity: 'error' });
        }
        finally {
            setSaving(false);
        }
    }, [tenant, displayName, editTemplate, editPrimaryColor, editSecondaryColor, license, googleOAuth, dbConfig, envPairs, onSnackbar, onRefetch]);
    // ── Export tenant config ────────────────────────────────
    const handleExport = useCallback(() => {
        if (!tenant)
            return;
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
    const handleImport = useCallback(async (file) => {
        if (!tenant)
            return;
        setImporting(true);
        try {
            const text = await file.text();
            const config = JSON.parse(text);
            if (!config.exportVersion) {
                throw new Error('Invalid config file — missing exportVersion');
            }
            // Restore all fields from imported config
            if (config.tenant) {
                if (config.tenant.displayName)
                    setDisplayName(config.tenant.displayName);
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
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Import failed';
            onSnackbar({ message: `❌ Import failed: ${msg}`, severity: 'error' });
        }
        finally {
            setImporting(false);
        }
    }, [tenant, onSnackbar]);
    // ── Deploy handler ────────────────────────────────────────
    const handleDeploy = useCallback(async () => {
        if (!tenant)
            return;
        if (deployingSlug)
            return;
        setDeployingSlug(tenant.slug);
        try {
            const payload = buildDeployPayload();
            const deployRes = await fetch(`/api/admin/tenants/${tenant.slug}/deploy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const deployData = await deployRes.json();
            if (!deployRes.ok || !deployData.success) {
                throw new Error(deployData.error || 'Deploy API failed');
            }
            dispatch(setThemeColors({ primary: editPrimaryColor, secondary: editSecondaryColor }));
            onSnackbar({
                message: `🚀 ${tenant.displayName} deployment started — building in background. Status will update to live when ready.`,
                severity: 'success',
            });
            onRefetch();
            // Close modal immediately — deployment continues in background
            setDeployingSlug(null);
            setActiveStep(0);
            onClose();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Deploy failed';
            onSnackbar({ message: `❌ Deploy failed: ${msg}`, severity: 'error' });
        }
        finally {
            setDeployingSlug(null);
        }
    }, [tenant, buildDeployPayload, editTemplate, editPrimaryColor, editSecondaryColor, dispatch, onSnackbar, onRefetch, onClose, deployingSlug]);
    // ── Deploy with Git handler ──────────────────────────────
    const handleDeployWithGit = useCallback(async () => {
        if (!tenant)
            return;
        if (deployingSlug)
            return;
        setDeployingSlug(tenant.slug);
        try {
            // Save config first so deployHookUrl and other fields persist
            await handleSave();
            const payload = buildDeployPayload();
            const deployRes = await fetch(`/api/admin/tenants/${tenant.slug}/deploy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, gitSource: true }),
            });
            const deployData = await deployRes.json();
            if (!deployRes.ok || !deployData.success) {
                throw new Error(deployData.error || 'Deploy API failed');
            }
            dispatch(setThemeColors({ primary: editPrimaryColor, secondary: editSecondaryColor }));
            onSnackbar({
                message: `🚀 ${tenant.displayName} Git deployment triggered from main branch. Building in background.`,
                severity: 'success',
            });
            onRefetch();
            setDeployingSlug(null);
            setActiveStep(0);
            onClose();
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Deploy failed';
            onSnackbar({ message: `❌ Git deploy failed: ${msg}`, severity: 'error' });
            setDeployingSlug(null);
        }
    }, [tenant, buildDeployPayload, editTemplate, editPrimaryColor, editSecondaryColor, dispatch, onSnackbar, onRefetch, onClose, deployingSlug, handleSave]);
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
    if (!tenant)
        return null;
    const selectedTemplate = getTemplate(editTemplate);
    // ── Step 0: Template ──────────────────────────────────────
    const renderStepTemplate = () => (_jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 2 }, children: "Select Template & Branding" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: "Choose a business template and customize the display name and brand colors. These settings affect the tenant application's header, buttons, and page structure." })] }), _jsx(TextField, { label: "Display Name", value: displayName, onChange: (e) => setDisplayName(e.target.value), fullWidth: true, helperText: "Human-readable name shown in the header and page titles." }), _jsx(TemplateSelector, { selectedId: editTemplate, currentId: tenant.template, onSelect: handleTemplateSelect, primaryColor: editPrimaryColor, secondaryColor: editSecondaryColor, onColorsChange: handleColorsChange, showPreviewDelta: true })] }));
    // ── Step 1: Preview ───────────────────────────────────────
    const renderStepPreview = () => (_jsxs(Stack, { spacing: 3, children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: "Live Preview" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: "Preview how the tenant application will look with the selected template and brand colors." }), _jsxs(Paper, { variant: "outlined", sx: { p: 3, bgcolor: 'background.default' }, children: [_jsxs(Stack, { direction: "row", sx: { alignItems: 'center', justifyContent: 'space-between', mb: 2 }, children: [_jsxs(Typography, { variant: "subtitle2", sx: { fontWeight: 600 }, children: [selectedTemplate.label, " \u2014 ", displayName || tenant.displayName] }), _jsx(Chip, { label: selectedTemplate.schemaOrgType, size: "small", variant: "outlined", color: "info" })] }), _jsx(Paper, { variant: "outlined", sx: { p: 2, mb: 2, bgcolor: editPrimaryColor, color: '#fff' }, children: _jsxs(Stack, { direction: "row", sx: { alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx(Typography, { variant: "body1", sx: { fontWeight: 700 }, children: displayName || tenant.displayName }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Box, { sx: { px: 1.5, py: 0.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }, children: "Dashboard" }), _jsx(Box, { sx: { px: 1.5, py: 0.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }, children: "Reports" })] })] }) }), _jsx(Typography, { variant: "caption", sx: { fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.5 }, children: "THEME COLORS" }), _jsxs(Stack, { direction: "row", sx: { gap: 3, mb: 3 }, children: [_jsxs(Stack, { spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(Typography, { variant: "caption", children: "Primary" }), _jsx(Box, { sx: { width: 56, height: 56, borderRadius: 2, bgcolor: editPrimaryColor, border: '3px solid', borderColor: 'background.paper', boxShadow: 2 } }), _jsx(Typography, { variant: "caption", sx: { fontFamily: 'monospace', fontSize: '0.7rem' }, children: editPrimaryColor })] }), _jsxs(Stack, { spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(Typography, { variant: "caption", children: "Secondary" }), _jsx(Box, { sx: { width: 56, height: 56, borderRadius: 2, bgcolor: editSecondaryColor, border: '3px solid', borderColor: 'background.paper', boxShadow: 2 } }), _jsx(Typography, { variant: "caption", sx: { fontFamily: 'monospace', fontSize: '0.7rem' }, children: editSecondaryColor })] })] }), _jsxs(Typography, { variant: "caption", sx: { fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.5 }, children: ["PAGES (", selectedTemplate.defaultPages.length, ")"] }), _jsx(Stack, { direction: "row", spacing: 0.5, sx: { flexWrap: 'wrap', mb: 2 }, children: selectedTemplate.defaultPages.map((p) => (_jsx(Chip, { label: p.title, size: "small", variant: "outlined" }, p.slug))) }), _jsxs(Stack, { direction: "row", spacing: 1.5, sx: { mt: 2 }, children: [_jsx(Box, { sx: { px: 2.5, py: 1, borderRadius: 1, bgcolor: editPrimaryColor, color: '#fff', fontSize: '0.85rem', fontWeight: 700 }, children: "Primary Button" }), _jsx(Box, { sx: { px: 2.5, py: 1, borderRadius: 1, border: '1px solid', borderColor: editSecondaryColor, color: editSecondaryColor, fontSize: '0.85rem', fontWeight: 700 }, children: "Secondary" })] })] }), tenant.template !== editTemplate && (_jsxs(Alert, { severity: "info", children: [_jsx(AlertTitle, { children: "Template Change Detected" }), "Switching from ", _jsx("strong", { children: getTemplate(tenant.template).label }), " to", ' ', _jsx("strong", { children: selectedTemplate.label }), ". This will update pages, navigation, and schema."] }))] }));
    // ── Step 2: License ───────────────────────────────────────
    const renderStepLicense = () => (_jsxs(Stack, { spacing: 3, children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: "License Configuration" }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'flex-start' }, children: [_jsx(TextField, { label: "License Key", value: license.licenseKey, onChange: (e) => handleLicenseChange('licenseKey', e.target.value), fullWidth: true, placeholder: 'rrb-' + (tenant?.slug || 'unknown'), helperText: "Auto-generated if left empty", sx: { flex: 1 } }), _jsx(Button, { variant: "outlined", size: "small", onClick: generateLicenseKey, sx: { mt: 0.5, minWidth: 100 }, children: "Generate" })] }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "License Tier" }), _jsx(Select, { value: license.licenseTier, label: "License Tier", onChange: (e) => handleLicenseChange('licenseTier', e.target.value), children: LICENSE_TIERS.map((tier) => (_jsx(MenuItem, { value: tier, children: tier.toUpperCase() }, tier))) })] }), _jsx(TextField, { label: "Valid Until", type: "date", value: license.validUntil, onChange: (e) => handleLicenseChange('validUntil', e.target.value), fullWidth: true, slotProps: { inputLabel: { shrink: true } } })] }));
    // ── Step 3: Features ──────────────────────────────────────
    const renderStepFeatures = () => (_jsxs(Stack, { spacing: 3, children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: "Feature Toggles" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Enable or disable features for this tenant application. Each feature controls specific functionality in the deployed app." }), _jsx(FormGroup, { row: true, children: DEFAULT_FEATURES.map((feat) => (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: license.features.includes(feat), onChange: () => toggleLicenseFeature(feat), size: "small" }), label: _jsx(Typography, { variant: "body2", children: feat }) }, feat))) }), _jsxs(Paper, { variant: "outlined", sx: { p: 2.5 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1 }, children: "API Keys & PINs" }), _jsxs(Stack, { spacing: 2, children: [_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'flex-start' }, children: [_jsx(TextField, { label: "Setup Token (SETUP_TOKEN)", value: license.setupToken, onChange: (e) => handleLicenseChange('setupToken', e.target.value), fullWidth: true, type: "password", sx: { flex: 1 } }), _jsx(Button, { variant: "outlined", size: "small", onClick: generateSetupToken, sx: { mt: 0.5, minWidth: 100 }, children: "Generate" })] }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'flex-start' }, children: [_jsx(TextField, { label: "Admin PIN", value: license.adminPin, onChange: (e) => handleLicenseChange('adminPin', e.target.value), fullWidth: true, type: "password", placeholder: "454212", sx: { flex: 1 } }), _jsx(Button, { variant: "outlined", size: "small", onClick: generateAdminPin, sx: { mt: 0.5, minWidth: 100 }, children: "Generate" })] })] })] })] }));
    // ── Step 4: OpenAI API-Key ────────────────────────────────
    const renderStepOpenAi = () => (_jsxs(Stack, { spacing: 3, children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: "OpenAI API Key" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Set the OpenAI API key used by the tenant application for AI features like chat, content generation, and analysis." }), _jsx(Alert, { severity: "info", children: "The API key is stored in the secrets table and injected as an environment variable during deployment. Generate a placeholder or enter a real OpenAI key." }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'flex-start' }, children: [_jsx(TextField, { label: "OpenAI API Key", value: license.openaiApiKey, onChange: (e) => handleLicenseChange('openaiApiKey', e.target.value), fullWidth: true, type: "password", placeholder: "sk-proj-...", sx: { flex: 1 }, slotProps: { input: { sx: { fontFamily: 'monospace' } } } }), _jsx(Button, { variant: "outlined", size: "small", onClick: generateOpenAiKey, sx: { mt: 0.5, minWidth: 100 }, children: "Generate" })] }), _jsx(Paper, { variant: "outlined", sx: { p: 2, bgcolor: 'background.default' }, children: _jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["\uD83D\uDCA1 Get your API key from", ' ', _jsx("a", { href: "https://platform.openai.com/api-keys", target: "_blank", rel: "noopener noreferrer", children: "platform.openai.com" })] }) })] }));
    // ── Step 5: Google OAuth ──────────────────────────────────
    const renderStepOAuth = () => (_jsxs(Stack, { spacing: 3, children: [_jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center' }, children: [_jsx(VerifiedUserIcon, { color: "primary" }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: "Google OAuth 2.0" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Configure Google OAuth credentials for the tenant application. You can auto-provision via the Google Cloud API (creates a new GCP project with the tenant slug as Project ID) or enter existing credentials manually." }), _jsxs(Paper, { variant: "outlined", sx: { p: 2.5, borderColor: 'primary.main' }, children: [_jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center', mb: 1.5 }, children: [_jsx(VerifiedUserIcon, { color: "primary" }), _jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600 }, children: "Step 1: Create a GCP Project" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Create a new project in Google Cloud Console, then paste the Project ID below." }), _jsxs(Stack, { direction: "row", spacing: 1.5, sx: { flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx(Button, { variant: "contained", href: "https://console.cloud.google.com/projectcreate", target: "_blank", startIcon: _jsx(OpenInNewIcon, {}), sx: { whiteSpace: 'nowrap' }, children: "Create New GCP Project" }), _jsx(TextField, { label: "GCP Project ID", value: googleOAuth.projectId, onChange: (e) => handleOAuthChange('projectId', e.target.value), size: "small", placeholder: "my-project-mynew", sx: { minWidth: 280, flex: 1 }, helperText: "Paste the Project ID from GCP Console after creating the project.", slotProps: { input: { sx: { fontFamily: 'monospace', fontSize: '0.85rem' } } } })] })] }), _jsxs(Paper, { variant: "outlined", sx: { p: 2.5, borderColor: 'secondary.main' }, children: [_jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center', mb: 1.5 }, children: [_jsx(KeyIcon, { color: "secondary" }), _jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600 }, children: "Step 2: Create OAuth 2.0 Client" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Open the GCP Console credentials page for your project and create a Web application OAuth client. Add the redirect URIs shown below, then paste the Client ID and Secret here." }), _jsxs(Stack, { direction: "row", spacing: 1.5, sx: { flexWrap: 'wrap', alignItems: 'center', mb: 2 }, children: [_jsx(Button, { variant: "contained", color: "secondary", href: `https://console.cloud.google.com/apis/credentials?project=${googleOAuth.projectId || tenant.slug}`, target: "_blank", startIcon: _jsx(OpenInNewIcon, {}), disabled: !googleOAuth.projectId, children: "Create OAuth 2.0 Client" }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: googleOAuth.projectId ? `Project: ${googleOAuth.projectId}` : 'Enter Project ID above first' })] }), _jsxs(Paper, { variant: "outlined", sx: { p: 1.5, bgcolor: 'background.default', mb: 2 }, children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, display: 'block', mb: 0.5 }, children: "Required Redirect URIs (add these in GCP Console):" }), googleOAuth.redirectUris.map((uri) => (_jsx(Typography, { variant: "caption", sx: { display: 'block', fontFamily: 'monospace', fontSize: '0.7rem', color: 'text.secondary', mb: 0.25 }, children: uri }, uri)))] }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { size: { xs: 12, md: 6 }, children: _jsx(TextField, { label: "Client ID", value: googleOAuth.clientId, onChange: (e) => handleOAuthChange('clientId', e.target.value), fullWidth: true, placeholder: "670560975972-xxxxx.apps.googleusercontent.com", slotProps: { input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } } }) }), _jsx(Grid, { size: { xs: 12, md: 6 }, children: _jsx(TextField, { label: "Client Secret", value: googleOAuth.clientSecret, onChange: (e) => handleOAuthChange('clientSecret', e.target.value), fullWidth: true, type: showSecret ? 'text' : 'password', slotProps: {
                                        input: {
                                            sx: { fontFamily: 'monospace', fontSize: '0.8rem' },
                                            endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: () => setShowSecret(!showSecret), edge: "end", size: "small", children: showSecret ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) }) })),
                                        },
                                    } }) })] })] }), _jsxs(Paper, { variant: "outlined", sx: { p: 1.5, bgcolor: 'action.hover' }, children: [_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(AutoFixHighIcon, { fontSize: "small", color: "disabled" }), _jsx(Typography, { variant: "caption", sx: { color: 'text.secondary' }, children: "Auto-provision via service account (may fall back to shared credentials):" }), _jsx(TextField, { label: "GCP Email", type: "email", value: googleOAuth.gcpAccountEmail, onChange: (e) => handleOAuthChange('gcpAccountEmail', e.target.value), size: "small", placeholder: "reward2learn@gmail.com", sx: { minWidth: 200 }, slotProps: { input: { sx: { fontSize: '0.75rem' } } } }), _jsx(Button, { variant: "text", size: "small", onClick: handleProvisionOAuth, disabled: provisioningOAuth || !googleOAuth.gcpAccountEmail.trim(), startIcon: provisioningOAuth ? _jsx(CircularProgress, { size: 12, color: "inherit" }) : _jsx(AutoFixHighIcon, {}), children: provisioningOAuth ? '...' : 'Auto' })] }), provisionOAuthError && (_jsx(Typography, { variant: "caption", color: "error", sx: { display: 'block', mt: 0.5 }, children: provisionOAuthError }))] }), provisionOAuthResult && (_jsxs(Alert, { severity: "success", children: [_jsx(AlertTitle, { children: "\u2705 OAuth Provisioning Complete" }), _jsx(Typography, { variant: "body2", sx: { fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }, children: JSON.stringify(provisionOAuthResult, null, 2) })] })), provisionOAuthError && (_jsxs(Alert, { severity: "error", children: [_jsx(AlertTitle, { children: "\u274C OAuth Provisioning Failed" }), provisionOAuthError] })), _jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600 }, children: "Redirect URIs" }), _jsx(Stack, { spacing: 1, children: googleOAuth.redirectUris.map((uri) => (_jsx(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: _jsx(Chip, { label: uri, variant: "outlined", onDelete: () => removeRedirectUri(uri), sx: { flex: 1, justifyContent: 'flex-start', py: 0.5 } }) }, uri))) }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(TextField, { size: "small", fullWidth: true, placeholder: "https://app.tenant.com/auth/callback", value: newRedirectUri, onChange: (e) => setNewRedirectUri(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter') {
                            e.preventDefault();
                            addRedirectUri();
                        } } }), _jsx(Button, { variant: "outlined", size: "small", onClick: addRedirectUri, startIcon: _jsx(AddIcon, {}), children: "Add" })] })] }));
    // ── Step 6: Database ──────────────────────────────────────
    const renderStepDatabase = () => (_jsxs(Stack, { spacing: 3, children: [_jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center' }, children: [_jsx(DnsIcon, { color: "primary" }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: "Database Connection" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Configure the database connection for the tenant application. Auto-provision a Neon PostgreSQL database or enter an existing connection string." }), _jsxs(Paper, { variant: "outlined", sx: { p: 2.5, borderColor: 'secondary.main' }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1.5 }, children: "\uD83D\uDE80 Auto-Provision Neon Database" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Creates an isolated Neon branch + database for this tenant. Connection strings will be auto-filled below." }), _jsxs(Stack, { direction: "row", spacing: 1.5, children: [_jsx(Button, { variant: "contained", color: "secondary", onClick: handleProvisionDb, disabled: provisioningDb, startIcon: provisioningDb ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : _jsx(DnsIcon, {}), children: provisioningDb ? 'Provisioning...' : 'Provision Neon Database' }), _jsx(Button, { variant: "outlined", href: "https://console.neon.tech", target: "_blank", endIcon: _jsx(OpenInNewIcon, {}), children: "Open Neon Console" })] }), provisionDbResult && (_jsxs(Alert, { severity: "success", sx: { mt: 1 }, children: [_jsx(AlertTitle, { children: "\u2705 Database Provisioned" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: "Connection strings have been auto-populated below. Review and continue to the next step." }), (() => {
                                const dd = provisionDbResult?.data;
                                const conns = dd?.connectionStrings;
                                if (!conns)
                                    return null;
                                const entries = Object.entries(conns).slice(0, 6);
                                return (_jsxs(Paper, { variant: "outlined", sx: { p: 1.5, bgcolor: 'background.default' }, children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, display: 'block', mb: 0.5 }, children: "Provisioned Keys:" }), entries.map(([key, val]) => (_jsxs(Stack, { direction: "row", spacing: 1, sx: { mb: 0.25 }, children: [_jsxs(Typography, { variant: "caption", sx: { fontFamily: 'monospace', fontWeight: 700, minWidth: 200, fontSize: '0.65rem' }, children: [key, "="] }), _jsx(Typography, { variant: "caption", sx: { fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.65rem', wordBreak: 'break-all' }, children: val.length > 60 ? val.substring(0, 60) + '...' : val })] }, key)))] }));
                            })()] })), provisionDbError && (_jsxs(Alert, { severity: "error", sx: { mt: 1 }, children: [_jsx(AlertTitle, { children: "\u274C Database Provisioning Failed" }), provisionDbError] }))] }), _jsx(Divider, { children: _jsx(Typography, { variant: "caption", color: "text.secondary", children: "or enter manually" }) }), _jsx(TextField, { label: "Database URL (Pooled)", value: dbConfig.dbUrl, onChange: (e) => {
                    const url = e.target.value;
                    setDbConfig({ dbUrl: url, pooledUrl: url, directUrl: url.replace('-pooler', '') });
                }, fullWidth: true, multiline: true, rows: 2, placeholder: "postgresql://user:pass@ep-xxx-pooler.neon.tech/db?sslmode=require", slotProps: { input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } } }), _jsx(TextField, { label: "Direct URL (Unpooled)", value: dbConfig.directUrl, onChange: (e) => setDbConfig((prev) => ({ ...prev, directUrl: e.target.value })), fullWidth: true, multiline: true, rows: 2, slotProps: { input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } } }), _jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center' }, children: [_jsx(Button, { variant: "outlined", size: "small", onClick: handleTestConnection, disabled: testingConnection || !dbConfig.dbUrl, startIcon: testingConnection ? _jsx(CircularProgress, { size: 16, color: "inherit" }) : _jsx(DnsIcon, {}), children: testingConnection ? 'Testing...' : 'Test Connection' }), connectionTestResult && (_jsx(Typography, { variant: "caption", sx: {
                            fontFamily: 'monospace', fontSize: '0.7rem', whiteSpace: 'pre-wrap',
                            color: connectionTestResult.startsWith('✅') ? 'success.main' : connectionTestResult.startsWith('⚠️') ? 'warning.main' : 'error.main',
                        }, children: connectionTestResult }))] })] }));
    // ── Step 7: Custom Env ────────────────────────────────────
    const renderStepEnv = () => (_jsxs(Stack, { spacing: 3, children: [_jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center' }, children: [_jsx(CloudIcon, { color: "primary" }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: "Custom Environment Variables" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Add custom environment variables for the tenant application. These are injected into the Vercel project during deployment." }), envPairs.map((pair, index) => (_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(TextField, { size: "small", label: "Key", value: pair.key, onChange: (e) => { const u = [...envPairs]; u[index].key = e.target.value; setEnvPairs(u); }, sx: { flex: 1 }, slotProps: { input: { sx: { fontFamily: 'monospace' } } } }), _jsx(TextField, { size: "small", label: "Value", value: pair.value, onChange: (e) => { const u = [...envPairs]; u[index].value = e.target.value; setEnvPairs(u); }, sx: { flex: 2 }, slotProps: { input: { sx: { fontFamily: 'monospace' } } } }), _jsx(IconButton, { color: "error", size: "small", onClick: () => removeEnvPair(index), children: _jsx(DeleteIcon, {}) })] }, index))), _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(TextField, { size: "small", label: "Key", value: newEnvKey, onChange: (e) => setNewEnvKey(e.target.value), sx: { flex: 1 }, placeholder: "MY_VARIABLE", slotProps: { input: { sx: { fontFamily: 'monospace' } } }, onKeyDown: (e) => { if (e.key === 'Enter') {
                            e.preventDefault();
                            addEnvPair();
                        } } }), _jsx(TextField, { size: "small", label: "Value", value: newEnvValue, onChange: (e) => setNewEnvValue(e.target.value), sx: { flex: 2 }, slotProps: { input: { sx: { fontFamily: 'monospace' } } }, onKeyDown: (e) => { if (e.key === 'Enter') {
                            e.preventDefault();
                            addEnvPair();
                        } } }), _jsx(Button, { variant: "outlined", size: "small", onClick: addEnvPair, startIcon: _jsx(AddIcon, {}), disabled: !newEnvKey || !newEnvValue, children: "Add" })] }), envPairs.length === 0 && (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontStyle: 'italic' }, children: "No custom env vars yet. Add key-value pairs above." }))] }));
    // ── Step 8: Deploy Hooks ──────────────────────────────────
    const renderStepHooks = () => (_jsxs(Stack, { spacing: 3, children: [_jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center' }, children: [_jsx(RocketLaunchIcon, { color: "primary" }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: "Vercel Deploy Hooks" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Configure a Vercel Deploy Hook to trigger Git-based redeployments from the tenant dashboard. Create a hook in the Vercel Dashboard under Settings \u2192 Git \u2192 Deploy Hooks, then paste the URL below." }), _jsxs(Paper, { variant: "outlined", sx: { p: 2.5, borderColor: 'primary.main' }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1.5 }, children: "Deploy Hook URL" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Create a Deploy Hook in the Vercel Dashboard for this tenant's project and paste the URL here. This allows you to trigger redeployments from the tenant dashboard without API authentication." }), _jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'flex-start' }, children: [_jsx(TextField, { label: "Vercel Deploy Hook URL", value: deployHookUrl, onChange: (e) => setDeployHookUrl(e.target.value), fullWidth: true, size: "small", placeholder: "https://api.vercel.com/v1/integrations/deploy/prj_xxx/hook_xxx", helperText: "Create in Vercel Dashboard > Settings > Git > Deploy Hooks", slotProps: { input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } } }), _jsx(Button, { variant: "outlined", size: "small", href: "https://vercel.com/ilishaps-projects", target: "_blank", endIcon: _jsx(OpenInNewIcon, {}), sx: { mt: 0.5, whiteSpace: 'nowrap', flexShrink: 0 }, children: "Open Vercel Dashboard" })] }), deployHookUrl && (_jsxs(Paper, { variant: "outlined", sx: { p: 1.5, mt: 2, bgcolor: 'background.default' }, children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, display: 'block', mb: 0.5 }, children: "\u2705 Deploy Hook configured" }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all' }, children: deployHookUrl })] }))] })] }));
    // ── Step 9: Functional Roles ──────────────────────────────
    const renderStepRoles = () => (_jsxs(Stack, { spacing: 3, children: [_jsxs(Stack, { direction: "row", spacing: 2, sx: { alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs(Box, { children: [_jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center', mb: 0.5 }, children: [_jsx(PeopleIcon, { color: "primary" }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: "Functional Role Catalog" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Create, edit, and manage functional roles. Set PIN codes for role-based authentication." })] }), _jsx(Button, { variant: "contained", size: "small", onClick: openCreateRole, startIcon: _jsx(AddIcon, {}), sx: { flexShrink: 0 }, children: "Create Role" })] }), rolesLoading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 4 }, children: _jsx(CircularProgress, {}) })) : rolesError ? (_jsx(Alert, { severity: "error", children: rolesError })) : rolesList.length === 0 ? (_jsxs(Box, { sx: { textAlign: 'center', py: 4 }, children: [_jsx(Typography, { color: "text.secondary", sx: { mb: 2 }, children: "No roles configured." }), _jsx(Button, { variant: "outlined", onClick: openCreateRole, startIcon: _jsx(AddIcon, {}), children: "Create Role" })] })) : (_jsx(Stack, { spacing: 1.5, children: rolesList.map((role) => (_jsx(Paper, { variant: "outlined", sx: { p: 2, borderLeft: 4, borderLeftColor: role.isPlatformAdmin ? 'primary.main' : 'grey.300' }, children: _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 2, sx: { alignItems: 'flex-start', justifyContent: 'space-between' }, children: [_jsxs(Box, { sx: { flex: 1 }, children: [_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600 }, children: role.name }), _jsxs(Typography, { variant: "caption", sx: { fontFamily: 'monospace', color: 'text.secondary' }, children: ["(", role.code, ")"] }), role.isPlatformAdmin && _jsx(Chip, { label: "Platform Admin", size: "small", color: "primary", variant: "outlined" })] }), role.email && _jsx(Typography, { variant: "caption", color: "text.secondary", children: role.email }), _jsx(Chip, { icon: role.pinConfigured ? _jsx(CheckCircleIcon, {}) : _jsx(LockIcon, {}), label: role.pinConfigured ? 'PIN Configured' : 'No PIN', size: "small", color: role.pinConfigured ? 'success' : 'warning', variant: role.pinConfigured ? 'filled' : 'outlined' })] }), _jsx(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center', flexShrink: 0 }, children: settingPinRole === role.code ? (_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(TextField, { size: "small", type: "password", placeholder: "Enter PIN (3+ chars)", value: settingPinValue[role.code] || '', onChange: (e) => setSettingPinValue((prev) => ({ ...prev, [role.code]: e.target.value })), sx: { width: 160 }, autoFocus: true, onKeyDown: (e) => { if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const v = settingPinValue[role.code] || '';
                                                if (v.length >= 3)
                                                    void handleSetRolePin(role.code, v);
                                            } } }), _jsx(IconButton, { size: "small", color: "primary", onClick: () => { const v = settingPinValue[role.code] || ''; if (v.length >= 3)
                                                void handleSetRolePin(role.code, v); }, disabled: savingPinRole === role.code || (settingPinValue[role.code] || '').length < 3, children: savingPinRole === role.code ? _jsx(CircularProgress, { size: 18 }) : _jsx(CheckCircleIcon, {}) }), _jsx(IconButton, { size: "small", onClick: () => { setSettingPinRole(null); setSettingPinValue((prev) => ({ ...prev, [role.code]: '' })); }, children: _jsx(CloseIcon, {}) })] })) : (_jsxs(_Fragment, { children: [_jsx(Tooltip, { title: "Set PIN", children: _jsx(IconButton, { size: "small", onClick: () => setSettingPinRole(role.code), color: "default", children: _jsx(LockIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "Edit role", children: _jsx(IconButton, { size: "small", onClick: () => openEditRole(role), color: "primary", children: _jsx(EditIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "Delete role", children: _jsx(IconButton, { size: "small", onClick: () => setRoleDeleteConfirm(role.code), color: "error", children: _jsx(DeleteIcon, { fontSize: "small" }) }) })] })) })] }) }, role.code))) })), _jsxs(Dialog, { open: roleDialogOpen, onClose: () => !roleSaving && setRoleDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { sx: { fontWeight: 700 }, children: roleDialogMode === 'create' ? 'Create Functional Role' : 'Edit Role: ' + roleFormCode }), _jsx(DialogContent, { children: _jsxs(Stack, { spacing: 2.5, sx: { mt: 1 }, children: [roleDialogMode === 'create' && (_jsx(TextField, { label: "Role Code", value: roleFormCode, onChange: (e) => setRoleFormCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')), fullWidth: true, size: "small", helperText: "Unique identifier (lowercase, hyphens)." })), _jsx(TextField, { label: "Role Name", value: roleFormName, onChange: (e) => { setRoleFormName(e.target.value); if (roleDialogMode === 'create' && !roleFormCode)
                                        setRoleFormCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }, fullWidth: true, size: "small", placeholder: "e.g. Finance Manager", autoFocus: roleDialogMode === 'create' }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: roleFormIsPlatformAdmin, onChange: (e) => setRoleFormIsPlatformAdmin(e.target.checked) }), label: "Platform Admin (full access)" })] }) }), _jsxs(DialogActions, { sx: { px: 3, pb: 2 }, children: [_jsx(Button, { onClick: () => setRoleDialogOpen(false), disabled: roleSaving, children: "Cancel" }), _jsx(Button, { variant: "contained", onClick: handleRoleSave, disabled: roleSaving || !roleFormName.trim(), startIcon: roleSaving ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : undefined, children: roleSaving ? 'Saving...' : roleDialogMode === 'create' ? 'Create Role' : 'Save Changes' })] })] }), _jsxs(Dialog, { open: Boolean(roleDeleteConfirm), onClose: () => !roleSaving && setRoleDeleteConfirm(null), children: [_jsx(DialogTitle, { children: "Delete Role?" }), _jsx(DialogContent, { children: _jsxs(DialogContentText, { children: ["Are you sure you want to delete role ", _jsx("strong", { children: roleDeleteConfirm }), "?"] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setRoleDeleteConfirm(null), disabled: roleSaving, children: "Cancel" }), _jsx(Button, { onClick: () => roleDeleteConfirm && handleRoleDelete(roleDeleteConfirm), color: "error", variant: "contained", disabled: roleSaving, children: roleSaving ? 'Deleting...' : 'Delete' })] })] }), _jsx(Divider, {}), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "Roles control access and task assignment. PINs are stored encrypted in the secrets table." })] }));
    // ── Step 9: Summary ──────────────────────────────────────
    const renderStepSummary = () => (_jsxs(Stack, { spacing: 3, children: [_jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center' }, children: [_jsx(RocketLaunchIcon, { color: "primary" }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: "Tenant Configuration Summary" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Review all tenant application parameters below. You can export this configuration as a JSON file or import a previously exported file to restore these settings." }), _jsxs(Paper, { variant: "outlined", sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1 }, children: "Tenant Info" }), _jsxs(Stack, { spacing: 0.5, children: [_jsx(SummaryRow, { label: "Slug", value: tenant?.slug || '' }), _jsx(SummaryRow, { label: "Display Name", value: displayName || tenant?.displayName || '' }), _jsx(SummaryRow, { label: "Template", value: getTemplate(editTemplate).label }), _jsx(SummaryRow, { label: "Status", value: tenant?.status || 'draft' }), _jsx(SummaryRow, { label: "Primary Color", value: editPrimaryColor, color: editPrimaryColor }), _jsx(SummaryRow, { label: "Secondary Color", value: editSecondaryColor, color: editSecondaryColor })] })] }), _jsxs(Paper, { variant: "outlined", sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1 }, children: "License" }), _jsxs(Stack, { spacing: 0.5, children: [_jsx(SummaryRow, { label: "License Key", value: license.licenseKey || '(auto-generated)' }), _jsx(SummaryRow, { label: "Tier", value: license.licenseTier.toUpperCase() }), _jsx(SummaryRow, { label: "Valid Until", value: license.validUntil }), _jsx(SummaryRow, { label: "Features", value: license.features.join(', ') }), _jsx(SummaryRow, { label: "Setup Token", value: license.setupToken ? '✅ configured' : '⚠️ not set' }), _jsx(SummaryRow, { label: "Admin PIN", value: license.adminPin ? '✅ configured' : '⚠️ not set' }), _jsx(SummaryRow, { label: "OpenAI API Key", value: license.openaiApiKey ? '✅ configured' : '⚠️ not set' })] })] }), _jsxs(Paper, { variant: "outlined", sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1 }, children: "Google OAuth" }), _jsxs(Stack, { spacing: 0.5, children: [_jsx(SummaryRow, { label: "GCP Account Email", value: googleOAuth.gcpAccountEmail }), _jsx(SummaryRow, { label: "Client ID", value: googleOAuth.clientId ? '✅ configured' : '⚠️ not set' }), _jsx(SummaryRow, { label: "Project ID", value: googleOAuth.projectId || '(auto)' }), _jsx(SummaryRow, { label: "Redirect URIs", value: googleOAuth.redirectUris.length > 0 ? googleOAuth.redirectUris.join(', ') : 'none' })] })] }), _jsxs(Paper, { variant: "outlined", sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1 }, children: "Database" }), _jsxs(Stack, { spacing: 0.5, children: [_jsx(SummaryRow, { label: "Pooled URL", value: dbConfig.pooledUrl ? (dbConfig.pooledUrl.length > 60 ? dbConfig.pooledUrl.substring(0, 60) + '...' : dbConfig.pooledUrl) : '⚠️ not configured' }), _jsx(SummaryRow, { label: "Direct URL", value: dbConfig.directUrl ? (dbConfig.directUrl.length > 60 ? dbConfig.directUrl.substring(0, 60) + '...' : dbConfig.directUrl) : '⚠️ not configured' })] })] }), _jsxs(Paper, { variant: "outlined", sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1 }, children: "Custom Env Vars & Roles" }), _jsxs(Stack, { spacing: 0.5, children: [_jsx(SummaryRow, { label: "Custom Env Vars", value: envPairs.length > 0 ? envPairs.map(p => p.key).join(', ') : 'none' }), _jsx(SummaryRow, { label: "Functional Roles", value: rolesList.length > 0 ? rolesList.map(r => r.name).join(', ') : '(loading)' })] })] }), _jsxs(Stack, { direction: "row", spacing: 1.5, sx: { justifyContent: 'flex-end' }, children: [_jsx(Button, { variant: "outlined", size: "small", onClick: handleExport, startIcon: _jsx(SaveIcon, {}), children: "Export Config" }), _jsx(Button, { variant: "outlined", size: "small", onClick: () => importFileRef.current?.click(), disabled: importing, startIcon: importing ? _jsx(CircularProgress, { size: 16, color: "inherit" }) : _jsx(CloudUploadIcon, {}), children: importing ? 'Importing...' : 'Import Config' }), _jsx("input", { ref: importFileRef, type: "file", accept: ".json", style: { display: 'none' }, onChange: (e) => {
                            const file = e.target.files?.[0];
                            if (file)
                                void handleImport(file);
                            e.target.value = '';
                        } })] })] }));
    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════
    const stepContent = (index) => {
        switch (index) {
            case 0: return renderStepTemplate();
            case 1: return renderStepPreview();
            case 2: return renderStepLicense();
            case 3: return renderStepFeatures();
            case 4: return renderStepOpenAi();
            case 5: return renderStepOAuth();
            case 6: return renderStepDatabase();
            case 7: return renderStepEnv();
            case 8: return renderStepHooks();
            case 9: return renderStepRoles();
            case 10: return renderStepSummary();
            default: return null;
        }
    };
    return (_jsxs(Dialog, { open: open, onClose: handleClose, maxWidth: "lg", fullWidth: true, "aria-labelledby": "edit-tenant-modal-title", children: [_jsx(DialogTitle, { id: "edit-tenant-modal-title", sx: { p: 0 }, children: _jsxs(Stack, { direction: "row", sx: { alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2, pb: 1 }, children: [_jsxs(Stack, { direction: "row", spacing: 1.5, sx: { alignItems: 'center' }, children: [_jsx(EditIcon, { color: "primary" }), _jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: tenant.displayName || tenant.slug }), _jsx(Chip, { label: tenant.status, size: "small", color: tenant.status === 'live' ? 'success' : tenant.status === 'deploying' ? 'warning' : 'default' })] }), _jsx(IconButton, { onClick: handleClose, size: "small", "aria-label": "close", children: _jsx(CloseIcon, {}) })] }) }), _jsxs(DialogContent, { dividers: true, sx: { p: { xs: 1.5, md: 3 }, minHeight: 400 }, children: [_jsx(Stepper, { activeStep: activeStep, sx: { mb: 4, overflowX: 'auto', flexWrap: 'wrap', '& .MuiStepLabel-root': { cursor: 'pointer' } }, nonLinear: true, children: EDIT_STEPS.map((s, idx) => (_jsx(Step, { onClick: () => setActiveStep(idx), children: _jsx(StepLabel, { sx: {
                                    '& .MuiStepLabel-label': {
                                        fontSize: { xs: '0.7rem', md: '0.8rem' },
                                        fontWeight: activeStep === EDIT_STEPS.indexOf(s) ? 700 : 400,
                                    },
                                }, children: isMobile ? s.label.substring(0, 8) + '\u2026' : s.label }) }, s.key))) }), _jsx(Box, { sx: { mt: 2 }, children: stepContent(activeStep) }), deployingSlug && (_jsxs(Paper, { variant: "outlined", sx: { mt: 4, p: 3, borderColor: 'primary.main' }, children: [_jsxs(Typography, { variant: "h6", sx: { mb: 2, display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(RocketLaunchIcon, { color: "primary" }), " Deploy Progress"] }), _jsx(Stepper, { activeStep: deployProgress, orientation: "vertical", sx: { mb: 3 }, children: DEPLOY_STEPS.map((step) => {
                                    const status = deployStepStatuses[step.key] || 'pending';
                                    const isActive = status === 'inprogress';
                                    const detail = deployDetails[step.key];
                                    let icon = undefined;
                                    if (status === 'success')
                                        icon = _jsx(CheckCircleIcon, { color: "success" });
                                    else if (status === 'error')
                                        icon = _jsx(CloseIcon, { color: "error" });
                                    else if (isActive)
                                        icon = _jsx(CircularProgress, { size: 20, color: "primary" });
                                    return (_jsxs(Step, { active: isActive || status === 'success', children: [_jsx(StepLabel, { icon: icon, sx: { '& .MuiStepLabel-label': { fontWeight: isActive || status === 'success' ? 600 : 400 } }, children: step.label }), _jsxs(StepContent, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: step.description }), detail && (_jsx(Typography, { variant: "caption", sx: { mt: 1, display: 'block', p: 1, bgcolor: 'background.default', borderRadius: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }, children: detail }))] })] }, step.key));
                                }) }), _jsx(LinearProgress, { variant: "determinate", value: (deployProgress / DEPLOY_STEPS.length) * 100, sx: { mt: 2, height: 6, borderRadius: 4 } })] }))] }), _jsxs(DialogActions, { sx: { px: 3, py: 2.5, gap: 2 }, children: [activeStep > 0 ? (_jsx(Button, { onClick: handleBack, disabled: !!deployingSlug || saving, children: "Back" })) : (_jsx(Button, { onClick: handleClose, disabled: !!deployingSlug || saving, children: "Cancel" })), _jsx(Button, { variant: "outlined", onClick: handleSave, disabled: !!deployingSlug || saving, startIcon: saving ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : _jsx(SaveIcon, {}), sx: { fontWeight: 600 }, children: saving ? 'Saving...' : 'Save Changes' }), _jsx(Box, { sx: { flex: 1 } }), isSummaryStep ? (_jsxs(Stack, { direction: "row", spacing: 1.5, children: [_jsx(Button, { variant: "outlined", size: "small", onClick: handleDeploy, disabled: !!deployingSlug || saving, startIcon: deployingSlug ? _jsx(CircularProgress, { size: 16, color: "inherit" }) : _jsx(RocketLaunchIcon, {}), sx: { fontWeight: 600, whiteSpace: 'nowrap' }, children: deployingSlug ? 'DEPLOYING...' : 'Deploy to Vercel' }), _jsx(Button, { variant: "contained", color: "primary", size: "large", onClick: handleDeployWithGit, disabled: !!deployingSlug || saving, startIcon: deployingSlug ? _jsx(CircularProgress, { size: 20, color: "inherit" }) : _jsx(CloudUploadIcon, {}), sx: { fontWeight: 700, minWidth: 220 }, children: deployingSlug ? 'DEPLOYING...' : 'Vercel Deploy with Git' })] })) : (_jsx(Button, { variant: "contained", onClick: handleNext, disabled: !!deployingSlug || saving, sx: { fontWeight: 600 }, children: "Continue" }))] })] }));
}
