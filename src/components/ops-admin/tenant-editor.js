'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { listTemplates, getTemplate } from '@/domain/tenant/template-catalog';
import { useUpdateTenantMutation, useDeployTenantMutation } from '@/store/apis/tenant-api';
// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['draft', 'deploying', 'live', 'error'];
const SUBSCRIPTION_TIERS = ['early', 'basic', 'premium', 'enterprise'];
const DEFAULT_PINS = [
    { role: 'DEFAULT_ADMIN_PIN', pin: '' },
    { role: 'DEFAULT_PIN_james', pin: '' },
    { role: 'DEFAULT_PIN_lucas', pin: '' },
];
// ── Metadata helpers ───────────────────────────────────────────────────────
function parseConfigFromMetadata(metadata) {
    const config = (metadata?.config ?? {});
    const googleAuth = (config.googleAuth ?? {});
    const database = (config.database ?? {});
    const pins = (config.pins ?? []);
    const envVars = (config.envVars ?? []);
    return {
        subscriptionTier: config.subscriptionTier || 'basic',
        licenseExpiresAt: config.licenseExpiresAt || '',
        googleClientId: googleAuth.clientId ?? '',
        googleClientSecret: googleAuth.clientSecret ?? '',
        googleProjectId: googleAuth.projectId ?? '',
        postgresUrl: database.postgresUrl ?? '',
        databaseUrl: database.databaseUrl ?? '',
        pgUser: database.pgUser ?? '',
        pgPassword: database.pgPassword ?? '',
        pins: pins.length > 0 ? pins : DEFAULT_PINS.map((p) => ({ ...p })),
        envVars: envVars.length > 0 ? envVars : [],
    };
}
function buildMetadataFromForm(formData) {
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
        },
    };
}
function getInitialFormState(tenant) {
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
    };
}
// ── Main Component ────────────────────────────────────────────────────────
export function TenantEditor({ open, onClose, tenant }) {
    const [tabIndex, setTabIndex] = useState(0);
    const [formData, setFormData] = useState(() => getInitialFormState(tenant));
    const [showSensitive, setShowSensitive] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [deployError, setDeployError] = useState(null);
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
    function setStringField(field, value) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }
    // ── PIN handlers ────────────────────────────────
    const updatePin = useCallback((index, field, value) => {
        setFormData((prev) => {
            const pins = [...prev.pins];
            pins[index] = { ...pins[index], [field]: value };
            return { ...prev, pins };
        });
    }, []);
    const addPin = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            pins: [...prev.pins, { role: '', pin: '' }],
        }));
    }, []);
    const removePin = useCallback((index) => {
        setFormData((prev) => ({
            ...prev,
            pins: prev.pins.filter((_, i) => i !== index),
        }));
    }, []);
    // ── Env var handlers ────────────────────────────
    const updateEnvVar = useCallback((index, field, value) => {
        setFormData((prev) => {
            const envVars = [...prev.envVars];
            envVars[index] = { ...envVars[index], [field]: value };
            return { ...prev, envVars };
        });
    }, []);
    const addEnvVar = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            envVars: [...prev.envVars, { key: '', value: '', sensitive: false }],
        }));
    }, []);
    const removeEnvVar = useCallback((index) => {
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
    const copyToClipboard = useCallback((text) => {
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
            const result = await deployTenant(tenant.slug).unwrap();
            if (result.success) {
                setSuccessMessage(`Deployed to Vercel — ${result.data.envCount} env vars synced`);
            }
        }
        catch {
            setDeployError('Failed to deploy to Vercel');
        }
    }, [formData, tenant.slug, deployTenant]);
    // ── Save ────────────────────────────────────────
    const handleSaveInternal = useCallback(async () => {
        try {
            const metadata = buildMetadataFromForm(formData);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payload = {
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
            await updateTenant(payload).unwrap();
            setSuccessMessage('Tenant updated successfully.');
        }
        catch {
            // Error surfaces via isError / error from the mutation hook
        }
    }, [formData, tenant.slug, updateTenant]);
    const handleSave = handleSaveInternal;
    const handleClose = useCallback(() => {
        if (!isLoading && !isDeploying)
            onClose();
    }, [isLoading, isDeploying, onClose]);
    // ── Error message extraction ────────────────────
    const errorMessage = isError && error && 'data' in error
        ? (error.data?.error ?? 'An error occurred while saving.')
        : null;
    // ── Sensitive field renderer ────────────────────
    const renderSensitiveField = (label, value, onChange, extraProps) => (_jsx(TextField, { label: label, value: value, onChange: (e) => onChange(e.target.value), type: showSensitive ? 'text' : 'password', fullWidth: true, size: extraProps?.size, sx: extraProps?.sx, autoComplete: "off", slotProps: { inputLabel: { shrink: true } } }));
    // ── Render ──────────────────────────────────────
    return (_jsxs(Dialog, { open: open, onClose: handleClose, maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { sx: { fontWeight: 700 }, children: ["Edit Tenant: ", tenant.displayName] }), _jsxs(DialogContent, { children: [_jsxs(Tabs, { value: tabIndex, onChange: (_e, v) => setTabIndex(v), sx: { borderBottom: 1, borderColor: 'divider', mb: 2 }, children: [_jsx(Tab, { icon: _jsx(StorefrontIcon, {}), label: "General" }), _jsx(Tab, { icon: _jsx(VpnKeyIcon, {}), label: "License & API Key" }), _jsx(Tab, { icon: _jsx(SettingsIcon, {}), label: "Configuration" })] }), tabIndex === 0 && (_jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [_jsx(TextField, { label: "Display Name", value: formData.displayName, onChange: (e) => setStringField('displayName', e.target.value), required: true, fullWidth: true, helperText: "Human-readable name shown in the header and page titles" }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Template" }), _jsx(Select, { value: formData.template, label: "Template", onChange: (e) => setStringField('template', e.target.value), children: templates.map((t) => (_jsx(MenuItem, { value: t.id, children: t.label }, t.id))) }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 0.5 }, children: selectedTemplate.description })] }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Status" }), _jsx(Select, { value: formData.status, label: "Status", onChange: (e) => setStringField('status', e.target.value), children: STATUS_OPTIONS.map((s) => (_jsx(MenuItem, { value: s, children: s.charAt(0).toUpperCase() + s.slice(1) }, s))) })] }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'flex-start' }, children: [_jsx(Box, { component: "label", sx: {
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
                                        }, children: _jsx("input", { type: "color", value: formData.primaryColor, onChange: (e) => setStringField('primaryColor', e.target.value), style: {
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                padding: 0,
                                                border: 'none',
                                                cursor: 'pointer',
                                                opacity: 0,
                                            } }) }), _jsx(TextField, { label: "Primary Color", value: formData.primaryColor, onChange: (e) => setStringField('primaryColor', e.target.value), fullWidth: true, size: "small", helperText: "Used for buttons, links, and highlights", slotProps: { inputLabel: { shrink: true } } })] }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'flex-start' }, children: [_jsx(Box, { component: "label", sx: {
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
                                        }, children: _jsx("input", { type: "color", value: formData.secondaryColor, onChange: (e) => setStringField('secondaryColor', e.target.value), style: {
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                padding: 0,
                                                border: 'none',
                                                cursor: 'pointer',
                                                opacity: 0,
                                            } }) }), _jsx(TextField, { label: "Secondary Color", value: formData.secondaryColor, onChange: (e) => setStringField('secondaryColor', e.target.value), fullWidth: true, size: "small", helperText: "Used for accents and secondary elements", slotProps: { inputLabel: { shrink: true } } })] })] })), tabIndex === 1 && (_jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [_jsx(Paper, { variant: "outlined", sx: { p: 2.5 }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700 }, children: "API Key" }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'flex-end' }, children: [_jsx(TextField, { label: "API Key", value: formData.apiKey, onChange: (e) => setStringField('apiKey', e.target.value), fullWidth: true, size: "small", slotProps: {
                                                        input: {
                                                            readOnly: true,
                                                            sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
                                                        },
                                                    } }), _jsx(Button, { variant: "outlined", size: "small", onClick: generateApiKey, children: "Generate" }), _jsx(Tooltip, { title: "Copy API key", children: _jsx(IconButton, { size: "small", onClick: () => copyToClipboard(formData.apiKey), disabled: !formData.apiKey, children: _jsx(ContentCopyIcon, { fontSize: "small" }) }) })] })] }) }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Subscription Tier" }), _jsx(Select, { value: formData.subscriptionTier, label: "Subscription Tier", onChange: (e) => setStringField('subscriptionTier', e.target.value), children: SUBSCRIPTION_TIERS.map((tier) => (_jsx(MenuItem, { value: tier, children: tier.charAt(0).toUpperCase() + tier.slice(1) }, tier))) })] }), _jsx(TextField, { label: "License Expiry", type: "date", value: formData.licenseExpiresAt, onChange: (e) => setStringField('licenseExpiresAt', e.target.value), fullWidth: true, slotProps: { inputLabel: { shrink: true } } }), _jsx(Paper, { variant: "outlined", sx: { p: 2 }, children: _jsxs(Stack, { direction: "row", spacing: 2, sx: { alignItems: 'center' }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Current Status:" }), _jsx(Chip, { label: formData.status, size: "small", color: formData.status === 'live'
                                                ? 'success'
                                                : formData.status === 'error'
                                                    ? 'error'
                                                    : formData.status === 'deploying'
                                                        ? 'warning'
                                                        : 'default' })] }) })] })), tabIndex === 2 && (_jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: showSensitive, onChange: (_e, v) => setShowSensitive(v) }), label: "Show sensitive values" }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, mb: 1.5 }, children: "Google OAuth" }), _jsxs(Stack, { spacing: 2, children: [renderSensitiveField('Client ID', formData.googleClientId, (v) => setStringField('googleClientId', v)), renderSensitiveField('Client Secret', formData.googleClientSecret, (v) => setStringField('googleClientSecret', v)), _jsx(TextField, { label: "Project ID", value: formData.googleProjectId, onChange: (e) => setStringField('googleProjectId', e.target.value), fullWidth: true })] })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, mb: 1.5 }, children: "Database" }), _jsxs(Stack, { spacing: 2, children: [renderSensitiveField('POSTGRES_URL', formData.postgresUrl, (v) => setStringField('postgresUrl', v)), renderSensitiveField('DATABASE_URL', formData.databaseUrl, (v) => setStringField('databaseUrl', v)), _jsx(TextField, { label: "PGUSER", value: formData.pgUser, onChange: (e) => setStringField('pgUser', e.target.value), fullWidth: true }), renderSensitiveField('PGPASSWORD', formData.pgPassword, (v) => setStringField('pgPassword', v))] })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, mb: 1.5 }, children: "PIN Codes" }), _jsxs(Stack, { spacing: 1.5, children: [formData.pins.length === 0 && (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontStyle: 'italic' }, children: "No PIN codes configured. Add one below." })), formData.pins.map((pin, idx) => (_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(TextField, { label: "Role", value: pin.role, onChange: (e) => updatePin(idx, 'role', e.target.value), size: "small", placeholder: "DEFAULT_ADMIN_PIN", sx: { flex: 1 } }), renderSensitiveField('PIN', pin.pin, (v) => updatePin(idx, 'pin', v), {
                                                        size: 'small',
                                                        sx: { flex: 1 },
                                                    }), _jsx(IconButton, { onClick: () => removePin(idx), color: "error", size: "small", sx: { flexShrink: 0 }, children: _jsx(DeleteIcon, { fontSize: "small" }) })] }, idx))), _jsx(Button, { startIcon: _jsx(AddIcon, {}), variant: "outlined", size: "small", onClick: addPin, sx: { alignSelf: 'flex-start' }, children: "Add PIN" })] })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 700, mb: 1.5 }, children: "Custom Env Vars" }), _jsxs(Stack, { spacing: 1.5, children: [formData.envVars.length === 0 && (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontStyle: 'italic' }, children: "No custom environment variables configured. Add one below." })), formData.envVars.map((ev, idx) => (_jsxs(Stack, { direction: "row", spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(TextField, { label: "Key", value: ev.key, onChange: (e) => updateEnvVar(idx, 'key', e.target.value), size: "small", placeholder: "ENV_VAR_NAME", sx: { flex: 1 } }), _jsx(TextField, { label: "Value", value: ev.value, onChange: (e) => updateEnvVar(idx, 'value', e.target.value), size: "small", type: ev.sensitive && !showSensitive ? 'password' : 'text', sx: { flex: 1 } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: ev.sensitive, onChange: (e) => updateEnvVar(idx, 'sensitive', e.target.checked), size: "small" }), label: "Sensitive", sx: { flexShrink: 0, mr: 0 } }), _jsx(IconButton, { onClick: () => removeEnvVar(idx), color: "error", size: "small", sx: { flexShrink: 0 }, children: _jsx(DeleteIcon, { fontSize: "small" }) })] }, idx))), _jsx(Button, { startIcon: _jsx(AddIcon, {}), variant: "outlined", size: "small", onClick: addEnvVar, sx: { alignSelf: 'flex-start' }, children: "Add Env Var" })] })] })] })), successMessage ? (_jsx(Alert, { severity: "success", sx: { mt: 2 }, children: successMessage })) : null, errorMessage ? (_jsx(Alert, { severity: "error", sx: { mt: 2 }, children: errorMessage })) : null, deployError ? (_jsx(Alert, { severity: "error", sx: { mt: 2 }, children: deployError })) : null] }), _jsxs(DialogActions, { sx: { px: 3, pb: 2 }, children: [_jsx(Button, { onClick: handleClose, disabled: isLoading || isDeploying, children: "Cancel" }), _jsx(Button, { variant: "outlined", onClick: handleDeploy, disabled: isLoading || isDeploying, startIcon: isDeploying ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : _jsx(CloudUploadIcon, {}), sx: { mr: 'auto' }, children: isDeploying ? 'Deploying...' : 'Deploy to Vercel' }), _jsx(Button, { variant: "contained", onClick: handleSave, disabled: isLoading || isDeploying, startIcon: isLoading ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : _jsx(SaveIcon, {}), children: isLoading ? 'Saving...' : 'Save Changes' })] })] }));
}
