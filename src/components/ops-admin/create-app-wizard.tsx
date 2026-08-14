'use client';

/**
 * CreateAppWizard — multi-step wizard to add a new app to a suite tenant.
 *
 * Two creation modes:
 *   1. Blank — a fresh app from a template (same as "+ Add App").
 *   2. Duplicate — clone an existing app already in the tenant's list
 *      (identity + brand + app-scoped content rows: pages, nav, snippets,
 *      tasks, financial data — see the duplicate API route).
 *
 * Optional post-create steps (Review step): seed content and/or deploy the
 * new app to Vercel, so the wizard can take an app all the way from idea to
 * live without hunting through the per-app menu afterwards.
 */
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { listTemplates } from '@/domain/tenant/template-catalog';
import {
  useListTenantsQuery,
  useAddAppToSuiteMutation,
  useDuplicateAppMutation,
  useSeedAppMutation,
  useDeployAppMutation,
  type SuiteAppInstance,
} from '@/store/apis/tenant-api';

/** Extracts the API envelope's `error` string off an RTK Query error, without `any`. */
function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { error?: string } }).data;
    if (data?.error) return data.error;
  }
  return fallback;
}

const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export interface CreateAppWizardProps {
  open: boolean;
  onClose: () => void;
  tenantSlug: string;
  /** When set, the wizard opens in "duplicate" mode with this app as source. */
  sourceApp?: SuiteAppInstance | null;
  onSnackbar: (msg: { message: string; severity: 'success' | 'error' }) => void;
}

export function CreateAppWizard({ open, onClose, tenantSlug, sourceApp, onSnackbar }: CreateAppWizardProps) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'blank' | 'duplicate'>(sourceApp ? 'duplicate' : 'blank');
  const [sourceAppId, setSourceAppId] = useState(sourceApp?.appId ?? '');
  const [name, setName] = useState(sourceApp ? `${sourceApp.name} Copy` : '');
  const [department, setDepartment] = useState(sourceApp?.department ?? '');
  const [templateId, setTemplateId] = useState(sourceApp?.templateId ?? 'default');
  const [seedAfter, setSeedAfter] = useState(false);
  const [deployAfter, setDeployAfter] = useState(false);
  const [creating, setCreating] = useState(false);

  const { data: tenantsData } = useListTenantsQuery();
  const [addApp] = useAddAppToSuiteMutation();
  const [duplicateApp] = useDuplicateAppMutation();
  const [seedApp] = useSeedAppMutation();
  const [deployApp] = useDeployAppMutation();

  const templates = listTemplates();
  const tenant = tenantsData?.data?.tenants?.find((t) => t.slug === tenantSlug);
  const suiteApps: SuiteAppInstance[] = tenant?.appPack?.apps ?? [];
  // No apps yet → duplicate mode is unavailable until the first app exists.
  const hasApps = suiteApps.length > 0;

  const appId = slugify(name);
  const appIdConflict = suiteApps.some((a) => a.appId === appId);
  const valid =
    !!name.trim() &&
    !!appId &&
    !appIdConflict &&
    (mode === 'blank' || !!sourceAppId);

  const reset = () => {
    setStep(0);
    setMode(sourceApp ? 'duplicate' : 'blank');
    setSourceAppId(sourceApp?.appId ?? '');
    setName(sourceApp ? `${sourceApp.name} Copy` : '');
    setDepartment(sourceApp?.department ?? '');
    setTemplateId(sourceApp?.templateId ?? 'default');
    setSeedAfter(false);
    setDeployAfter(false);
  };

  const handleClose = () => {
    if (creating) return;
    reset();
    onClose();
  };

  const handleModeChange = (next: 'blank' | 'duplicate') => {
    setMode(next);
    if (next === 'blank') {
      setSourceAppId('');
    }
  };

  const handleCreate = async () => {
    if (!valid || creating) return;
    setCreating(true);
    try {
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

      if (seedAfter) {
        await seedApp({ slug: tenantSlug, appId }).unwrap();
      }
      if (deployAfter) {
        await deployApp({ slug: tenantSlug, appId }).unwrap();
      }

      const extras = [
        seedAfter ? 'seeded' : '',
        deployAfter ? 'deployed' : '',
      ].filter(Boolean).join(' + ');
      onSnackbar({
        message: `✅ Created "${name.trim()}"${mode === 'duplicate' ? ' (duplicate of ' + sourceAppId + ')' : ''}${extras ? ` — ${extras}` : ''}`,
        severity: 'success',
      });
      handleClose();
    } catch (err) {
      onSnackbar({ message: apiErrorMessage(err, '❌ Failed to create app'), severity: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const STEPS = ['Creation Mode', 'App Identity', 'Review & Create'];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Create New App — {tenantSlug}</DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {step === 0 && (
          <Stack spacing={2}>
            <RadioGroup value={mode} onChange={(e) => handleModeChange(e.target.value as 'blank' | 'duplicate')}>
              <Paper
                variant="outlined"
                sx={{ p: 1.5, mb: 1.5, cursor: 'pointer', borderColor: mode === 'blank' ? 'primary.main' : 'divider' }}
                onClick={() => handleModeChange('blank')}
              >
                <FormControlLabel
                  value="blank"
                  control={<Radio />}
                  label={
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <ListItemIcon><AddBoxIcon color="primary" /></ListItemIcon>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Blank app from template</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Start fresh — pick a template, seed and deploy after creation.
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{ m: 0 }}
                />
              </Paper>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  cursor: hasApps ? 'pointer' : 'not-allowed',
                  opacity: hasApps ? 1 : 0.55,
                  borderColor: mode === 'duplicate' ? 'primary.main' : 'divider',
                }}
                onClick={() => { if (hasApps) handleModeChange('duplicate'); }}
              >
                <FormControlLabel
                  value="duplicate"
                  control={<Radio disabled={!hasApps} />}
                  label={
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <ListItemIcon><ContentCopyIcon color={hasApps ? 'primary' : 'disabled'} /></ListItemIcon>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Duplicate an existing app</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {hasApps
                            ? 'Clone an app already in this tenant — pages, nav, knowledge base and data.'
                            : 'No apps yet — create the first app above, then you can duplicate it here.'}
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{ m: 0 }}
                />
              </Paper>
            </RadioGroup>

            {mode === 'duplicate' && (
              <FormControl fullWidth size="small">
                <InputLabel>Source App</InputLabel>
                <Select
                  value={sourceAppId}
                  label="Source App"
                  onChange={(e) => {
                    setSourceAppId(e.target.value);
                    const src = suiteApps.find((a) => a.appId === e.target.value);
                    if (src) {
                      setName(`${src.name} Copy`);
                      setDepartment(src.department);
                      setTemplateId(src.templateId);
                    }
                  }}
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
                <FormHelperText>Everything in the source app&apos;s scope (except users and deployment) is cloned.</FormHelperText>
              </FormControl>
            )}
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={2.5}>
            <TextField
              label="App Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
              placeholder="e.g. Inventory Management"
              helperText={name ? `App ID: ${appId}${appIdConflict ? ' — ⚠️ already used by another app in this tenant' : ''}` : 'Used to generate the app ID'}
              error={appIdConflict}
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
            <FormControl fullWidth size="small">
              <InputLabel>Template</InputLabel>
              <Select value={templateId} label="Template" onChange={(e) => setTemplateId(e.target.value)}>
                {templates.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {mode === 'duplicate' ? 'Prefilled from the source app — change only if this app needs a different sector schema.' : 'The business-sector schema this app is generated from.'}
              </FormHelperText>
            </FormControl>
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Summary</Typography>
              <Stack spacing={0.75}>
                <Typography variant="body2">
                  <strong>Mode:</strong> {mode === 'duplicate' ? `Duplicate of ${sourceAppId}` : 'Blank app from template'}
                </Typography>
                <Typography variant="body2"><strong>Name:</strong> {name.trim()}</Typography>
                <Typography variant="body2"><strong>App ID:</strong> <Box component="span" sx={{ fontFamily: 'monospace' }}>{appId}</Box></Typography>
                {department.trim() && <Typography variant="body2"><strong>Department:</strong> {department.trim()}</Typography>}
                <Typography variant="body2">
                  <strong>Template:</strong> {templates.find((t) => t.id === templateId)?.label ?? templateId}
                </Typography>
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
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => (step === 0 ? handleClose() : setStep((s) => s - 1))} disabled={creating}>
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step < 2 ? (
          <Button variant="contained" onClick={() => setStep((s) => s + 1)} disabled={step === 0 ? false : !valid}>
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => void handleCreate()}
            disabled={!valid || creating}
            startIcon={creating ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {creating ? 'Creating…' : mode === 'duplicate' ? 'Duplicate App' : 'Create App'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}