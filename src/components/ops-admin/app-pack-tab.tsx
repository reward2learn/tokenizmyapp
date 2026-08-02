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
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
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
    zmodel: string;
  };
}

const EXAMPLE_PROMPT =
  'Build an app pack for restaurant operations: HR (employees, schedules, attendance), ' +
  'Sales Reporting (daily sales, hourly trends, payment methods), Finance (P&L, cash flow, ' +
  'costs tracking), plus a CEO Overview with cross-department KPIs and realtime actionable items.';

export function AppPackTab() {
  const [prompt, setPrompt] = useState('');
  const [mock, setMock] = useState(true);
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chunks, setChunks] = useState<ProgressChunk[]>([]);
  const [result, setResult] = useState<RunStatus['result'] | null>(null);
  const [starting, setStarting] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  // RTK Query hooks
  const [generateAppPack, { isLoading: isGenerating }] = useGenerateAppPackMutation();
  const { data: statusData } = useGetAppPackStatusQuery(
    runId ?? '',
    { skip: !runId, pollingInterval: 2000 }
  );

  const latestPct = chunks.length ? chunks[chunks.length - 1].pct : 0;
  const lastChunk = chunks.length ? chunks[chunks.length - 1] : null;
  const running = !!runId && status !== 'completed' && status !== 'failed' && status !== 'not_found';

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
        tenantSlug: 'tokenizmyapp',
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
  }, [prompt, mock, generateAppPack]);

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
            aggregates cross-department KPIs.
          </Typography>
        </Box>

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
