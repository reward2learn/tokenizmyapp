/**
 * AI App Pack tab — platform admin derives a complete application pack
 * (W3 schema → ZenStack → pages → nav → UX workflow → knowledge snippets)
 * from a single requirement prompt, via the Vercel Workflow SDK.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useGenerateAppPackMutation, useGetAppPackStatusQuery } from '@/store/apis/admin-api';
import { useListTenantsQuery } from '@/store/apis/tenant-api';

interface ProgressChunk {
  step: string;
  message: string;
  pct: number;
  detail?: Record<string, unknown>;
}

interface RunStatus {
  status: string;
  runId: string;
  error?: string;
  result?: {
    packId: string;
    name: string;
    mock: boolean;
    ceoPurpose: string;
    ceoKpis: string[];
    apps: Array<{
      appId: string;
      appName: string;
      department: string;
      w3cStandard: string;
      models: number;
      useCases: number;
      pages: number;
      knowledgeSnippets: number;
      uxStages: number;
    }>;
    counts: { apps: number; pages: number; sections: number; nav: number; snippets: number; groups: number };
    schemaApplied: boolean;
    migrationMs: number;
    zmodel: string;
  };
}

interface BusinessCategoryPrompt {
  category: string;
  prompt: string;
}

/**
 * Prepopulated business-need prompts per business category. Selecting a
 * category from the dropdown fills the requirement field with a prompt that
 * describes the per-department apps (plus CEO Overview) for that business.
 * Prompts are used in real AI mode; Mock mode always returns the fixed demo pack.
 */
const BUSINESS_CATEGORY_PROMPTS: BusinessCategoryPrompt[] = [
  {
    category: 'Restaurant',
    prompt:
      'Build an app pack for restaurant operations: HR (employees, schedules, attendance), ' +
      'Menu & Inventory (recipes, stock levels, supplier orders), Sales Reporting (daily sales, ' +
      'hourly trends, payment methods), Finance (P&L, cash flow, costs tracking), plus a CEO ' +
      'Overview with cross-department KPIs and realtime actionable items.',
  },
  {
    category: 'Nightclub',
    prompt:
      'Build an app pack for nightclub operations: Guest List & Entry (guest lists, VIP tables, ' +
      'entry passes, cover charges), Events & DJ Booking (lineups, event schedules, DJ contracts), ' +
      'Sales & Bar Reporting (ticket sales, bar revenue, payment methods), Finance (cash flow, ' +
      'P&L, costs tracking), plus a CEO Overview with cross-department KPIs and realtime ' +
      'actionable items.',
  },
  {
    category: 'Flower Shop',
    prompt:
      'Build an app pack for flower shop operations: Orders & Deliveries (online orders, delivery ' +
      'scheduling, delivery routes), Inventory (flower stock, suppliers, spoilage tracking), ' +
      'Customers & Occasions (customer records, occasions, campaigns), Finance (sales, costs, ' +
      'cash flow), plus a CEO Overview with cross-department KPIs and realtime actionable items.',
  },
  {
    category: 'Massage Service',
    prompt:
      'Build an app pack for massage service operations: Appointments & Booking (sessions, ' +
      'therapists, rooms, availability), Client Records (health notes, preferences, visit history), ' +
      'Therapist Management (schedules, commissions, certifications), Finance (revenue, costs, ' +
      'cash flow), plus a CEO Overview with cross-department KPIs and realtime actionable items.',
  },
  {
    category: 'Hotel',
    prompt:
      'Build an app pack for hotel operations: Bookings & Rooms (reservations, availability, ' +
      'check-in/check-out), Housekeeping (room status, cleaning tasks, inspections), Guest Services ' +
      '(requests, feedback, loyalty), Finance (revenue, occupancy, P&L), plus a CEO Overview with ' +
      'cross-department KPIs and realtime actionable items.',
  },
  {
    category: 'E-commerce / Retail',
    prompt:
      'Build an app pack for e-commerce and retail operations: Catalog & Inventory (products, ' +
      'SKUs, stock levels), Orders & Fulfillment (orders, shipments, returns), Customers & Loyalty ' +
      '(profiles, loyalty points, campaigns), Finance (sales, refunds, cash flow), plus a CEO ' +
      'Overview with cross-department KPIs and realtime actionable items.',
  },
  {
    category: 'Café / Coffee Shop',
    prompt:
      'Build an app pack for café operations: Sales & POS (daily sales, payment methods, hourly ' +
      'trends), Inventory (beans, milk, supplies, supplier orders), Staff & Shifts (schedules, ' +
      'attendance, tips), Finance (P&L, cash flow, costs tracking), plus a CEO Overview with ' +
      'cross-department KPIs and realtime actionable items.',
  },
  {
    category: 'Spa & Wellness',
    prompt:
      'Build an app pack for spa and wellness operations: Appointments & Booking (treatments, ' +
      'therapists, rooms), Packages & Memberships (treatment packages, membership plans, upsells), ' +
      'Client Records (preferences, health notes, history), Finance (revenue, costs, cash flow), ' +
      'plus a CEO Overview with cross-department KPIs and realtime actionable items.',
  },
  {
    category: 'Fitness / Gym',
    prompt:
      'Build an app pack for fitness center operations: Memberships (plans, renewals, check-ins), ' +
      'Classes & Schedule (class schedule, capacity, bookings), Trainer Management (trainers, ' +
      'sessions, commissions), Finance (revenue, costs, cash flow), plus a CEO Overview with ' +
      'cross-department KPIs and realtime actionable items.',
  },
  {
    category: 'Salon & Barber',
    prompt:
      'Build an app pack for salon and barber operations: Appointments (bookings, services, ' +
      'stylists), Services & Pricing (service catalog, pricing, upselling), Stylists (schedules, ' +
      'commissions, performance), Finance (revenue, product sales, costs), plus a CEO Overview ' +
      'with cross-department KPIs and realtime actionable items.',
  },
  {
    category: 'Coworking Space',
    prompt:
      'Build an app pack for coworking space operations: Memberships (plans, renewals, access), ' +
      'Desk & Room Bookings (desks, meeting rooms, availability), Billing & Invoices (invoicing, ' +
      'payments, overdue tracking), Finance (revenue, occupancy, costs), plus a CEO Overview with ' +
      'cross-department KPIs and realtime actionable items.',
  },
  {
    category: 'Professional Services Firm',
    prompt:
      'Build an app pack for a professional services firm: Clients & Projects (client records, ' +
      'project tracking), Time & Billing (timesheets, billable hours, invoicing), HR (employees, ' +
      'schedules, attendance), Finance (P&L, cash flow, costs tracking), plus a CEO Overview with ' +
      'cross-department KPIs and realtime actionable items.',
  },
  {
    category: 'Healthcare Clinic',
    prompt:
      'Build an app pack for healthcare clinic operations: Appointments & Patients (scheduling, ' +
      'patient records), Consultations & Treatments (visit records, treatment plans, follow-ups), ' +
      'Staff & Practitioners (doctors, nurses, schedules), Finance (billing, insurance, costs), ' +
      'plus a CEO Overview with cross-department KPIs and realtime actionable items.',
  },
  {
    category: 'Manufacturing',
    prompt:
      'Build an app pack for manufacturing operations: Production (work orders, batches, output), ' +
      'Inventory & Materials (raw materials, stock levels, suppliers), Quality (inspections, defects, ' +
      'non-conformances), Finance (costs, P&L, cash flow), plus a CEO Overview with cross-department ' +
      'KPIs and realtime actionable items.',
  },
];

const EXAMPLE_PROMPT =
  'Build an app pack for restaurant operations: HR (employees, schedules, attendance), ' +
  'Sales Reporting (daily sales, hourly trends, payment methods), Finance (P&L, cash flow, ' +
  'costs tracking), plus a CEO Overview with cross-department KPIs and realtime actionable items.';

interface AppPackTabProps {
  /** Pre-selected tenant slug (when used in tenant admin context) */
  tenantSlug?: string;
  /** Display name of the pre-selected tenant */
  tenantName?: string;
  /** Callback when app pack generation completes */
  onGenerated?: () => void;
}

export function AppPackTab({ tenantSlug: propTenantSlug, tenantName, onGenerated }: AppPackTabProps = {}) {
  const [prompt, setPrompt] = useState('');
  const [mock, setMock] = useState(true);
  const [tenantSlug, setTenantSlug] = useState(propTenantSlug || 'tokenizmyapp');
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chunks, setChunks] = useState<ProgressChunk[]>([]);
  const [result, setResult] = useState<RunStatus['result'] | null>(null);
  const [starting, setStarting] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  // RTK Query hooks
  const [generateAppPack, { isLoading: isGenerating }] = useGenerateAppPackMutation();
  // Tenant registry — the pack is materialized into the selected tenant's DB.
  const { data: tenantsData, isLoading: tenantsLoading } = useListTenantsQuery();
  const tenants = tenantsData?.data?.tenants ?? [];
  // Poll only while the run is active — stop once it reaches a terminal state
  // (completed/failed) so /generate/status is not hit forever.
  const { data: statusData } = useGetAppPackStatusQuery(
    runId ?? '',
    {
      skip: !runId || status === 'completed' || status === 'failed',
      pollingInterval: 2000,
    }
  );

  const latestPct = chunks.length ? chunks[chunks.length - 1].pct : 0;
  const lastChunk = chunks.length ? chunks[chunks.length - 1] : null;
  const running = !!runId && status !== 'completed' && status !== 'failed' && status !== 'not_found';

  // Reflect the currently selected category only while the prompt still matches
  // its preset; manual edits reset the dropdown to the placeholder.
  const selectedCategory =
    BUSINESS_CATEGORY_PROMPTS.find((c) => c.prompt === prompt)?.category ?? '';

  // Sync status from RTK Query
  useEffect(() => {
    if (statusData?.data) {
      const data = statusData.data;
      setStatus(data.status);
      if (data.status === 'completed' && data.result) {
        setResult(data.result);
        esRef.current?.close();
      }
      if (data.status === 'failed') {
        setError(data.error ?? 'Run failed');
        esRef.current?.close();
      }
    }
  }, [statusData]);

  const startRun = useCallback(async () => {
    if (!prompt.trim()) return;
    setError(null);
    setResult(null);
    setChunks([]);
    setStatus(null);
    setStarting(true);
    try {
      const response = await generateAppPack({
        prompt: prompt.trim(),
        mock,
        tenantSlug,
      }).unwrap();
      if (response.data?.runId) {
        setRunId(response.data.runId);
        setStatus('queued');
      } else {
        setError('Failed to start generation');
      }
      setStarting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStarting(false);
    }
  }, [prompt, mock, tenantSlug, generateAppPack]);

  // Open SSE stream once runId is known.
  useEffect(() => {
    if (!runId) return;
    const es = new EventSource(`/api/admin/app-pack/generate/stream?runId=${encodeURIComponent(runId)}`);
    esRef.current = es;
    es.onmessage = (ev) => {
      try {
        const chunk = JSON.parse(ev.data) as ProgressChunk;
        setChunks((prev) => [...prev, chunk]);
      } catch {
        // ignore malformed frames
      }
    };
    es.onerror = () => {
      // EventSource auto-reconnects; the status poller decides completion.
    };
    return () => {
      es.close();
      esRef.current = null;
    };
  }, [runId]);

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoFixHighIcon /> AI App Pack Generator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Describe a business need — the workflow derives per-department apps (W3 schema → ZenStack →
            dynamic pages → navigation → UX workflow → knowledge snippets) with a CEO Overview that
            aggregates cross-department KPIs. Choose the tenant below that the pack is created for.
          </Typography>
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel id="business-category-label">Business category</InputLabel>
          <Select
            labelId="business-category-label"
            label="Business category"
            value={selectedCategory}
            onChange={(e) => {
              const preset = BUSINESS_CATEGORY_PROMPTS.find((c) => c.category === e.target.value);
              if (preset) setPrompt(preset.prompt);
            }}
          >
            <MenuItem value="">
              <em>Select a category to prefill…</em>
            </MenuItem>
            {BUSINESS_CATEGORY_PROMPTS.map((c) => (
              <MenuItem key={c.category} value={c.category}>
                {c.category}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Prefills the business requirement below with per-department apps + CEO Overview for that
            category. Used in real AI mode; Mock mode always produces the fixed demo pack.
          </FormHelperText>
        </FormControl>

        <TextField
          label="Business requirement"
          placeholder={EXAMPLE_PROMPT}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          multiline
          minRows={4}
          maxRows={10}
          fullWidth
        />

        <FormControl fullWidth size="small">
          <InputLabel id="target-tenant-label">Target tenant</InputLabel>
          <Select
            labelId="target-tenant-label"
            label="Target tenant"
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
            disabled={running || starting || !!propTenantSlug}
          >
            {propTenantSlug ? (
              <MenuItem value={propTenantSlug}>{tenantName || propTenantSlug} (selected)</MenuItem>
            ) : (
              <MenuItem value="tokenizmyapp">Platform root (tokenizmyapp)</MenuItem>
            )}
            {!propTenantSlug && tenants
              .filter((t) => t.slug !== 'tokenizmyapp')
              .map((t) => (
                <MenuItem key={t.slug} value={t.slug}>
                  {t.displayName} ({t.slug})
                </MenuItem>
              ))}
          </Select>
          <FormHelperText>
            {tenantsLoading
              ? 'Loading tenants…'
              : 'The generated app pack (pages, nav, knowledge snippets, security groups) is materialized into this tenant\u2019s database.'}
          </FormHelperText>
        </FormControl>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
          <FormControlLabel
            control={<Switch checked={mock} onChange={(e) => setMock(e.target.checked)} />}
            label="Mock mode (deterministic, no AI key)"
          />
          <Button
            variant="contained"
            startIcon={starting || isGenerating ? <CircularProgress size={16} /> : <RocketLaunchIcon />}
            disabled={!prompt.trim() || running || starting || isGenerating}
            onClick={startRun}
          >
            {running ? 'Generating…' : 'Generate App Pack'}
          </Button>
          {runId && (
            <Chip
              size="small"
              label={`run ${runId} — ${status ?? 'queued'}`}
              color={status === 'failed' ? 'error' : status === 'completed' ? 'success' : 'info'}
            />
          )}
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        {running && (
          <Box>
            <LinearProgress variant="determinate" value={latestPct} />
            {lastChunk && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                [{lastChunk.step}] {lastChunk.message}
              </Typography>
            )}
          </Box>
        )}

        {chunks.length > 0 && !running && (
          <Paper variant="outlined" sx={{ p: 2, maxHeight: 220, overflow: 'auto' }}>
            {chunks.map((c, i) => (
              <Typography key={i} variant="caption" sx={{ display: 'block' }} color="text.secondary">
                {String(c.pct).padStart(3, ' ')}% [{c.step}] {c.message}
              </Typography>
            ))}
          </Paper>
        )}

        {result && (
          <>
            <Divider />
            <Stack spacing={2}>
              <Typography variant="h6">Pack: {result.name} ({result.packId})</Typography>
              <Alert severity="info" icon={false}>
                <strong>CEO Overview:</strong> {result.ceoPurpose}
                <br />
                <strong>Cross-department KPIs:</strong> {result.ceoKpis.join(', ')}
              </Alert>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>App</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>W3 Standard</TableCell>
                    <TableCell align="right">Models</TableCell>
                    <TableCell align="right">Use Cases</TableCell>
                    <TableCell align="right">Pages</TableCell>
                    <TableCell align="right">Snippets</TableCell>
                    <TableCell align="right">UX Stages</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.apps.map((a) => (
                    <TableRow key={a.appId}>
                      <TableCell>{a.appName}</TableCell>
                      <TableCell>{a.department}</TableCell>
                      <TableCell>{a.w3cStandard}</TableCell>
                      <TableCell align="right">{a.models}</TableCell>
                      <TableCell align="right">{a.useCases}</TableCell>
                      <TableCell align="right">{a.pages}</TableCell>
                      <TableCell align="right">{a.knowledgeSnippets}</TableCell>
                      <TableCell align="right">{a.uxStages}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Typography variant="caption" color="text.secondary">
                Materialized: {result.counts.apps} app(s) · {result.counts.pages} pages · {result.counts.sections} sections ·
                {result.counts.nav} nav items · {result.counts.snippets} snippets · {result.counts.groups} security groups
              </Typography>
              <Alert severity={result.schemaApplied ? 'success' : 'warning'} icon={false}>
                {result.schemaApplied
                  ? `Pack schema applied to tenant DB in ${result.migrationMs}ms — the generated models are live tables.`
                  : 'Pack schema was not applied to the tenant DB — the generated models are preview-only and CRUD surfaces may be empty.'}
              </Alert>
              <Box>
                <Typography variant="subtitle2">Generated ZenStack .zmodel (audit preview)</Typography>
                <Box
                  component="pre"
                  sx={{
                    maxHeight: 300,
                    overflow: 'auto',
                    p: 2,
                    bgcolor: 'background.default',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    fontSize: 12,
                  }}
                >
                  {result.zmodel.slice(0, 12000)}
                </Box>
              </Box>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}
