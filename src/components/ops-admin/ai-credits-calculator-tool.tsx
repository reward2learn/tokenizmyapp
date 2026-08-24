'use client';

/**
 * Platform Admin — AI Credits Calculator tool.
 *
 * Instant client preview + analyze (website/filings) + multi-turn assistant +
 * catalog/Stripe apply. Charge authority always goes through secured rate-card PUT.
 * Assistant replies stream via SSE (`Accept: text/event-stream`).
 */
import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import {
  buildAiCreditsCalculatorReport,
  staticCatalogFaceAmounts,
  type AiCreditsCalculatorReport,
} from '@/lib/billing/ai-credits-calculator';
import {
  defaultRateCardInputs,
  formatMarkupPercent,
  DEFAULT_MAC_STUDIO_ULTRA_256_USD,
  type TenantRateCardInputs,
} from '@/lib/billing/tenant-rate-card';
import { yearlyMonthlyPrice } from '@/lib/billing/plans';
import { consumeSseStream } from '@/lib/chat/sse-parser';
import {
  useListOrganizationsQuery,
  useAnalyzeAiCreditsCalculatorMutation,
  useUpsertOrgRateCardMutation,
  useListCalculatorThreadsQuery,
  useCreateCalculatorThreadMutation,
  useGetCalculatorThreadQuery,
  useGetBillingCatalogQuery,
  useUpdateCatalogPricesMutation,
  useSyncStripeCatalogPricesMutation,
  useSeedTenantAiCreditsMutation,
} from '@/store/apis/organization-api';
import { useListTenantsQuery } from '@/store/apis/tenant-api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setWizardRateCardPrefill,
  setAdminCalculatorContext,
} from '@/store/ui-slice';

export function AiCreditsCalculatorTool() {
  const dispatch = useAppDispatch();
  const calcContext = useAppSelector((s) => s.ui.adminCalculatorContext);
  const adminOrgId = useAppSelector((s) => s.ui.adminSelectedOrgId);
  const adminTenantSlug = useAppSelector((s) => s.ui.adminSelectedTenantSlug);
  const adminAppId = useAppSelector((s) => s.ui.adminSelectedAppId);

  const { data: orgsData } = useListOrganizationsQuery();
  const { data: tenantsData } = useListTenantsQuery();
  const orgs = orgsData?.data?.organizations ?? [];
  const tenants = tenantsData?.data?.tenants ?? [];

  const [orgId, setOrgId] = useState(calcContext?.orgId ?? adminOrgId ?? '');
  const [tenantSlug, setTenantSlug] = useState(
    calcContext?.tenantSlug ?? adminTenantSlug ?? '',
  );
  const [appId, setAppId] = useState(calcContext?.appId ?? adminAppId ?? '');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [secCikOrTicker, setSecCikOrTicker] = useState('');
  const [companiesHouseNumber, setCompaniesHouseNumber] = useState('');
  const [adminRevenue, setAdminRevenue] = useState<number | ''>('');
  const [inputs, setInputs] = useState<TenantRateCardInputs>(
    defaultRateCardInputs({ macStudioCostUsd: DEFAULT_MAC_STUDIO_ULTRA_256_USD }),
  );
  const [analyzeResult, setAnalyzeResult] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chatText, setChatText] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [pendingUserText, setPendingUserText] = useState<string | null>(null);
  const [chatBusy, setChatBusy] = useState(false);
  const [toolHints, setToolHints] = useState<string[]>([]);
  const [catalogConfirmOpen, setCatalogConfirmOpen] = useState(false);
  const [stripeConfirmOpen, setStripeConfirmOpen] = useState(false);
  const [seedConfirmOpen, setSeedConfirmOpen] = useState(false);
  const [editProMonthly, setEditProMonthly] = useState(9900);
  const [editBusinessMonthly, setEditBusinessMonthly] = useState(19900);
  const [editPack25, setEditPack25] = useState(2500);
  const [editPack50, setEditPack50] = useState(5000);
  const [editPack100, setEditPack100] = useState(10000);

  const { data: catalogData } = useGetBillingCatalogQuery();
  const catalog = catalogData?.data?.catalog ?? staticCatalogFaceAmounts();

  useEffect(() => {
    if (!catalogData?.data?.catalog) return;
    const c = catalogData.data.catalog;
    setEditProMonthly(c.plans.pro.monthlyCents);
    setEditBusinessMonthly(c.plans.business.monthlyCents);
    setEditPack25(c.packs['pack-25']);
    setEditPack50(c.packs['pack-50']);
    setEditPack100(c.packs['pack-100']);
  }, [catalogData]);

  useEffect(() => {
    if (calcContext?.orgId) setOrgId(calcContext.orgId);
    if (calcContext?.tenantSlug) setTenantSlug(calcContext.tenantSlug);
    if (calcContext?.appId !== undefined) setAppId(calcContext.appId ?? '');
  }, [calcContext]);

  const selectedTenant = useMemo(
    () => tenants.find((t) => t.slug === tenantSlug) ?? null,
    [tenants, tenantSlug],
  );

  const suiteApps = useMemo(() => {
    if (!selectedTenant) return [] as Array<{ appId: string; name: string }>;
    const pack = selectedTenant.appPack;
    if (pack?.apps && pack.apps.length > 0) {
      return pack.apps.map((a) => ({ appId: a.appId, name: a.name || a.appId }));
    }
    return [{ appId: selectedTenant.slug, name: selectedTenant.displayName || selectedTenant.slug }];
  }, [selectedTenant]);

  useEffect(() => {
    if (!tenantSlug) {
      setAppId('');
      return;
    }
    if (!appId) return;
    if (suiteApps.some((a) => a.appId === appId)) return;
    setAppId('');
  }, [tenantSlug, suiteApps, appId]);

  const liveReport: AiCreditsCalculatorReport = useMemo(
    () =>
      buildAiCreditsCalculatorReport({
        inputs: {
          ...inputs,
          annualRevenueUsd:
            adminRevenue === '' ? inputs.annualRevenueUsd : Number(adminRevenue),
        },
        catalog: {
          plans: {
            free: catalog.plans.free,
            pro: catalog.plans.pro,
            business: catalog.plans.business,
          },
          packs: {
            'pack-25': catalog.packs['pack-25'],
            'pack-50': catalog.packs['pack-50'],
            'pack-100': catalog.packs['pack-100'],
          },
        },
      }),
    [inputs, adminRevenue, catalog],
  );

  const [analyze, analyzeState] = useAnalyzeAiCreditsCalculatorMutation();
  const [upsertRateCard, upsertState] = useUpsertOrgRateCardMutation();
  const [createThread] = useCreateCalculatorThreadMutation();
  const { data: threadsData, refetch: refetchThreads } = useListCalculatorThreadsQuery();
  const { data: threadData, refetch: refetchThread } = useGetCalculatorThreadQuery(threadId ?? '', {
    skip: !threadId,
  });
  const [updateCatalog, catalogUpdateState] = useUpdateCatalogPricesMutation();
  const [syncStripe, syncState] = useSyncStripeCatalogPricesMutation();
  const [seedTenantCredits, seedState] = useSeedTenantAiCreditsMutation();

  const patchInput = (patch: Partial<TenantRateCardInputs>) => {
    setInputs((prev) => defaultRateCardInputs({ ...prev, ...patch }));
  };

  const onAnalyze = async () => {
    setStatus(null);
    try {
      const res = await analyze({
        websiteUrl: websiteUrl || null,
        secCikOrTicker: secCikOrTicker || null,
        companiesHouseNumber: companiesHouseNumber || null,
        orgId: orgId || null,
        tenantSlug: tenantSlug || null,
        adminAnnualRevenueUsd: adminRevenue === '' ? null : Number(adminRevenue),
        inputsOverride: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, Number(v)])),
      }).unwrap();
      const data = res.data as {
        recommendedInputs?: TenantRateCardInputs;
        report?: AiCreditsCalculatorReport;
        warnings?: string[];
      };
      setAnalyzeResult(data as unknown as Record<string, unknown>);
      if (data.recommendedInputs) {
        setInputs(defaultRateCardInputs(data.recommendedInputs));
        if (adminRevenue === '' && data.recommendedInputs.annualRevenueUsd) {
          setAdminRevenue(data.recommendedInputs.annualRevenueUsd);
        }
      }
      setStatus(data.warnings?.[0] ?? 'Analysis complete — confirm revenue before Apply.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Analyze failed');
    }
  };

  const onApplyOrg = async () => {
    if (!orgId) {
      setStatus('Select an organization before Apply.');
      return;
    }
    try {
      await upsertRateCard({
        orgId,
        inputs: {
          ...inputs,
          annualRevenueUsd:
            adminRevenue === '' ? inputs.annualRevenueUsd : Number(adminRevenue),
        },
        recalculate: true,
      }).unwrap();
      setStatus(`Rate card applied to org ${orgId}.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Apply failed');
    }
  };

  const onUseInWizard = () => {
    dispatch(
      setWizardRateCardPrefill({
        ...inputs,
        annualRevenueUsd:
          adminRevenue === '' ? inputs.annualRevenueUsd : Number(adminRevenue),
      }),
    );
    setStatus('Prefill saved — open Create Tenant wizard to use these rate-card inputs.');
  };

  const onEnsureThread = async () => {
    if (threadId) return threadId;
    const res = await createThread({
      title: tenantSlug ? `Calc · ${tenantSlug}` : 'Calculator chat',
      orgId: orgId || null,
      tenantSlug: tenantSlug || null,
    }).unwrap();
    const id = res.data?.thread?.id;
    if (id) {
      setThreadId(id);
      void refetchThreads();
      return id;
    }
    return null;
  };

  const onSendChat = async () => {
    if (!chatText.trim() || chatBusy) return;
    const id = await onEnsureThread();
    if (!id) return;
    const outgoing = chatText.trim();
    setChatText('');
    setStreamingText('');
    setPendingUserText(outgoing);
    setToolHints([]);
    setChatBusy(true);
    setStatus(null);
    try {
      const response = await fetch(
        `/api/admin/ai-credits-calculator/threads/${id}/messages`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            message: outgoing,
            draftInputs: {
              ...inputs,
              annualRevenueUsd:
                adminRevenue === '' ? inputs.annualRevenueUsd : Number(adminRevenue),
            },
            websiteUrl: websiteUrl || null,
            secCikOrTicker: secCikOrTicker || null,
            companiesHouseNumber: companiesHouseNumber || null,
          }),
        },
      );

      if (!response.ok) {
        const errJson = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(errJson?.error ?? `Chat failed (${response.status})`);
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const payload = (await response.json()) as {
          data?: { assistantMessage?: { content?: string } };
          error?: string;
        };
        if (payload.error) throw new Error(payload.error);
        setStreamingText(payload.data?.assistantMessage?.content ?? '');
      } else if (response.body) {
        let streamError: string | null = null;
        await consumeSseStream(response.body, (event) => {
          if (event.type === 'token') {
            setStreamingText((prev) => prev + event.token);
            return;
          }
          if (event.type === 'tool_result') {
            setToolHints((prev) => [...prev, event.tool]);
            return;
          }
          if (event.type === 'error') {
            streamError = event.error;
          }
        });
        if (streamError) throw new Error(streamError);
      }

      setStreamingText('');
      setToolHints([]);
      setPendingUserText(null);
      void refetchThread();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Chat failed');
      setStreamingText('');
      setPendingUserText(null);
    } finally {
      setChatBusy(false);
    }
  };

  const onApplyCatalog = async () => {
    try {
      await updateCatalog({
        confirm: true,
        plans: {
          pro: {
            monthlyCents: editProMonthly,
            yearlyCents: yearlyMonthlyPrice(editProMonthly),
          },
          business: {
            monthlyCents: editBusinessMonthly,
            yearlyCents: yearlyMonthlyPrice(editBusinessMonthly),
          },
        },
        packs: {
          'pack-25': editPack25,
          'pack-50': editPack50,
          'pack-100': editPack100,
        },
        notes: 'Updated from AI Credits Calculator',
      }).unwrap();
      setCatalogConfirmOpen(false);
      setStatus('Catalog USD faces updated. Sync Stripe before selling if drift is shown.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Catalog update failed');
    }
  };

  const onSyncStripe = async () => {
    try {
      const res = await syncStripe({ confirm: true }).unwrap();
      setStripeConfirmOpen(false);
      setStatus(res.data?.message ?? 'Stripe sync complete');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Stripe sync failed');
    }
  };

  const onSeedAiCredits = async () => {
    if (!tenantSlug) {
      setStatus('Select a tenant before seeding AI credits.');
      return;
    }
    try {
      const res = await seedTenantCredits({
        slug: tenantSlug,
        confirm: true,
        appId: appId || null,
      }).unwrap();
      setSeedConfirmOpen(false);
      const d = res.data;
      if (d?.orgId) {
        setOrgId(d.orgId);
        dispatch(
          setAdminCalculatorContext({
            orgId: d.orgId,
            tenantSlug,
            appId: appId || null,
          }),
        );
      }
      setStatus(
        d?.message ??
          `AI credits seeded for ${d?.apps?.length ?? 0} app(s) on org ${d?.orgId ?? ''}.`,
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Seed AI credits failed');
    }
  };

  const copyJson = async () => {
    const payload = {
      inputs: liveReport.inputs,
      computed: liveReport.computed,
      unitEconomics: liveReport.unitEconomics,
      analyze: analyzeResult,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setStatus('Report JSON copied.');
  };

  const analysis = analyzeResult as {
    analysis?: { businessSummary?: string; confidence?: number; industry?: string };
    filings?: { merged?: { confidence?: number; sourceRefs?: Array<{ source: string; label: string }> } };
    scrape?: { businessName?: string | null };
    warnings?: string[];
  } | null;

  const messages = threadData?.data?.messages ?? [];
  const threads = threadsData?.data?.threads ?? [];
  const drift = catalogData?.data?.stripeDrift ?? [];
  const filingDegradeHints = (analysis?.warnings ?? []).filter(
    (w) =>
      /SEC_USER_AGENT/i.test(w)
      || /COMPANIES_HOUSE_API_KEY/i.test(w)
      || /EDGAR scrape skipped/i.test(w)
      || /UK filings skipped/i.test(w),
  );

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          AI Credits Calculator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Estimate credits per $1 from the secured rate-card model. Website + SEC /
          Companies House filings improve estimates — always confirm annual revenue
          before Apply. Catalog/Stripe changes need an explicit confirm.
        </Typography>
      </Box>

      {status ? <Alert severity="info">{status}</Alert> : null}
      {filingDegradeHints.length > 0 ? (
        <Alert severity="warning">
          Filings degraded: {filingDegradeHints[0]}
          {filingDegradeHints.length > 1
            ? ` (+${filingDegradeHints.length - 1} more). Set SEC_USER_AGENT / COMPANIES_HOUSE_API_KEY on the factory env when needed.`
            : ' Set SEC_USER_AGENT / COMPANIES_HOUSE_API_KEY on the factory env when needed.'}
        </Alert>
      ) : null}

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ alignItems: 'stretch' }}>
        {/* Main column */}
        <Stack spacing={2} sx={{ flex: 1.6, minWidth: 0 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Tenant / org context
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  label="Organization"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                >
                  <MenuItem value="">— none —</MenuItem>
                  {orgs.map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.displayName || o.slug}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  fullWidth
                  label="Tenant"
                  value={tenantSlug}
                  onChange={(e) => {
                    setTenantSlug(e.target.value);
                    setAppId('');
                  }}
                >
                  <MenuItem value="">— none —</MenuItem>
                  {tenants.map((t) => (
                    <MenuItem key={t.slug} value={t.slug}>
                      {t.displayName || t.slug}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  fullWidth
                  label="App (suite slug)"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  disabled={!tenantSlug || suiteApps.length === 0}
                  helperText="Optional scope — seed still updates all apps under the tenant org"
                >
                  <MenuItem value="">— all apps —</MenuItem>
                  {suiteApps.map((a) => (
                    <MenuItem key={a.appId} value={a.appId}>
                      {a.name} ({a.appId})
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  fullWidth
                  label="Website URL"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="SEC CIK / ticker"
                  value={secCikOrTicker}
                  onChange={(e) => setSecCikOrTicker(e.target.value)}
                  helperText="Needs SEC_USER_AGENT on server"
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Companies House #"
                  value={companiesHouseNumber}
                  onChange={(e) => setCompaniesHouseNumber(e.target.value)}
                  helperText="Optional COMPANIES_HOUSE_API_KEY"
                />
              </Stack>
              <Button
                variant="contained"
                onClick={() => void onAnalyze()}
                disabled={analyzeState.isLoading}
              >
                {analyzeState.isLoading ? <CircularProgress size={18} /> : 'Analyze'}
              </Button>
              {analysis?.analysis?.businessSummary ? (
                <Alert severity="success">
                  {analysis.analysis.businessSummary}
                  {analysis.analysis.industry ? ` · ${analysis.analysis.industry}` : ''}
                </Alert>
              ) : null}
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
                {(analysis?.filings?.merged?.sourceRefs ?? []).map((ref, i) => (
                  <Chip key={`${ref.source}-${i}`} size="small" label={`${ref.source}: ${ref.label}`} />
                ))}
                {analysis?.scrape?.businessName ? (
                  <Chip size="small" label={`website: ${analysis.scrape.businessName}`} />
                ) : null}
                {analysis?.filings?.merged?.confidence != null ? (
                  <Chip
                    size="small"
                    color="primary"
                    label={`confidence ${(analysis.filings.merged.confidence * 100).toFixed(0)}%`}
                  />
                ) : null}
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Rate-card inputs
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  type="number"
                  label="Apps"
                  value={inputs.appCount}
                  onChange={(e) => patchInput({ appCount: Number(e.target.value) || 1 })}
                  fullWidth
                />
                <TextField
                  size="small"
                  type="number"
                  label="Users"
                  value={inputs.userCount}
                  onChange={(e) => patchInput({ userCount: Number(e.target.value) || 1 })}
                  fullWidth
                />
                <TextField
                  size="small"
                  type="number"
                  label="Admin annual revenue (USD)"
                  value={adminRevenue}
                  onChange={(e) =>
                    setAdminRevenue(e.target.value === '' ? '' : Math.max(0, Number(e.target.value) || 0))
                  }
                  helperText="Overrides scrape/AI on Apply"
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  type="number"
                  label="Mac Studio Ultra 256 (USD)"
                  value={inputs.macStudioCostUsd}
                  onChange={(e) =>
                    patchInput({ macStudioCostUsd: Math.max(0, Number(e.target.value) || 0) })
                  }
                  fullWidth
                />
                <TextField
                  size="small"
                  type="number"
                  label="Monthly 3rd-party (USD)"
                  value={inputs.monthlyThirdPartyUsd}
                  onChange={(e) =>
                    patchInput({
                      monthlyThirdPartyUsd: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  fullWidth
                />
              </Stack>

              <Alert severity="info">
                Preview markup <strong>{formatMarkupPercent(liveReport.computed.markupPercent)}</strong>
                {' · '}
                ~{liveReport.unitEconomics.creditsPerUsd} credits / $1
                {' · '}
                face ${liveReport.unitEconomics.usdFacePerCredit.toFixed(4)} / credit
              </Alert>

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Plans
              </Typography>
              {liveReport.planTable.map((row) => (
                <Typography key={row.planId} variant="body2">
                  {row.label}: <strong>{row.credits.toLocaleString()}</strong> credits
                  {row.catalogMonthlyCents != null
                    ? ` · catalog $${(row.catalogMonthlyCents / 100).toFixed(0)}/mo`
                    : ''}
                  {row.deltaVsCatalog !== 0
                    ? ` · Δ ${row.deltaVsCatalog > 0 ? '+' : ''}${row.deltaVsCatalog}`
                    : ''}
                </Typography>
              ))}
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Top-ups
              </Typography>
              {liveReport.packTable.map((row) => (
                <Typography key={row.packId} variant="body2">
                  {row.label}: <strong>{row.credits.toLocaleString()}</strong> credits
                </Typography>
              ))}

              <Typography variant="caption" color="text.secondary">
                Illustrative gpt-4o 1M input: COGS $
                {liveReport.unitEconomics.gpt4oCogsUsdPer1MInput.toFixed(2)} vs charged $
                {liveReport.unitEconomics.gpt4oChargedUsdPer1MInput.toFixed(2)} (
                {(liveReport.unitEconomics.illustrativeMarginPercent * 100).toFixed(0)}% margin)
              </Typography>

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
                <Button
                  variant="contained"
                  onClick={() => void onApplyOrg()}
                  disabled={!orgId || upsertState.isLoading}
                >
                  Apply to organization
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setSeedConfirmOpen(true)}
                  disabled={!tenantSlug || seedState.isLoading}
                >
                  Seed / sync AI credits for all apps
                </Button>
                <Button variant="outlined" onClick={onUseInWizard}>
                  Use in tenant wizard
                </Button>
                <Button variant="text" onClick={() => void copyJson()}>
                  Copy JSON
                </Button>
                <Button
                  variant="text"
                  onClick={() =>
                    dispatch(
                      setAdminCalculatorContext({
                        orgId: orgId || null,
                        tenantSlug: tenantSlug || null,
                        appId: appId || null,
                      }),
                    )
                  }
                >
                  Remember context
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Apply persists rate-card inputs server-side; markup / credits / charge
                authority are computed on the server (client markupPercent is never trusted).
                Seed recalculates the org rate card from catalog faces, syncs the plan
                grant, and pushes billing identity to every suite app.
              </Typography>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Catalog & Stripe prices
              </Typography>
              {drift.length > 0 ? (
                <Alert severity="warning">
                  Stripe drift: {drift[0]}
                  {drift.length > 1 ? ` (+${drift.length - 1} more)` : ''}
                </Alert>
              ) : (
                <Alert severity="success">No Stripe catalog drift detected (or Stripe not configured).</Alert>
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  type="number"
                  label="Pro monthly (cents)"
                  value={editProMonthly}
                  onChange={(e) => setEditProMonthly(Math.max(0, Number(e.target.value) || 0))}
                  fullWidth
                />
                <TextField
                  size="small"
                  type="number"
                  label="Business monthly (cents)"
                  value={editBusinessMonthly}
                  onChange={(e) =>
                    setEditBusinessMonthly(Math.max(0, Number(e.target.value) || 0))
                  }
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  type="number"
                  label="Pack $25 (cents)"
                  value={editPack25}
                  onChange={(e) => setEditPack25(Math.max(0, Number(e.target.value) || 0))}
                  fullWidth
                />
                <TextField
                  size="small"
                  type="number"
                  label="Pack $50 (cents)"
                  value={editPack50}
                  onChange={(e) => setEditPack50(Math.max(0, Number(e.target.value) || 0))}
                  fullWidth
                />
                <TextField
                  size="small"
                  type="number"
                  label="Pack $100 (cents)"
                  value={editPack100}
                  onChange={(e) => setEditPack100(Math.max(0, Number(e.target.value) || 0))}
                  fullWidth
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Credits at current markup — Pro:{' '}
                {liveReport.computed.planCredits.pro.toLocaleString()} · $25 pack:{' '}
                {liveReport.computed.packCredits['pack-25'].toLocaleString()}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => setCatalogConfirmOpen(true)}>
                  Apply catalog prices
                </Button>
                <Button variant="outlined" color="warning" onClick={() => setStripeConfirmOpen(true)}>
                  Sync Stripe list prices
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Both actions require an explicit confirm dialog. Stripe sync also
                best-effort pushes STRIPE_PRICE_* to factory Vercel; DB catalog remains
                source of truth. Charge amounts always resolve server-side.
              </Typography>
            </Stack>
          </Paper>
        </Stack>

        {/* Assistant rail */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Calculator assistant
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Multi-turn SSE stream, scoped to rate-card / credits / catalog tools only.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
            {threads.slice(0, 4).map((t) => (
              <Chip
                key={t.id}
                size="small"
                label={t.title}
                color={t.id === threadId ? 'primary' : 'default'}
                onClick={() => setThreadId(t.id)}
              />
            ))}
            <Chip
              size="small"
              label="+ New"
              onClick={() => {
                setThreadId(null);
                void onEnsureThread();
              }}
            />
          </Stack>
          <Divider />
          <Box sx={{ flex: 1, minHeight: 220, maxHeight: 420, overflow: 'auto' }}>
            <Stack spacing={1}>
              {messages.map((m) => (
                <Box key={m.id}>
                  <Typography variant="caption" color="text.secondary">
                    {m.role}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {m.content}
                  </Typography>
                </Box>
              ))}
              {pendingUserText ? (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    user
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {pendingUserText}
                  </Typography>
                </Box>
              ) : null}
              {streamingText || chatBusy ? (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    assistant{chatBusy ? ' · streaming' : ''}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {streamingText || '…'}
                  </Typography>
                  {toolHints.length > 0 ? (
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }} useFlexGap>
                      {toolHints.map((t) => (
                        <Chip key={t} size="small" variant="outlined" label={t} />
                      ))}
                    </Stack>
                  ) : null}
                </Box>
              ) : null}
              {messages.length === 0 && !streamingText && !chatBusy && !pendingUserText ? (
                <Typography variant="body2" color="text.secondary">
                  Ask about markup, competitive packs, or catalog positioning.
                </Typography>
              ) : null}
            </Stack>
          </Box>
          <TextField
            size="small"
            multiline
            minRows={2}
            fullWidth
            placeholder="Message the calculator assistant…"
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            disabled={chatBusy}
          />
          <Button
            variant="contained"
            onClick={() => void onSendChat()}
            disabled={chatBusy || !chatText.trim()}
          >
            {chatBusy ? <CircularProgress size={18} /> : 'Send'}
          </Button>
        </Paper>
      </Stack>

      <Dialog open={catalogConfirmOpen} onClose={() => setCatalogConfirmOpen(false)}>
        <DialogTitle>Apply catalog USD faces?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This changes what customers see for plan/pack list prices. Stripe charges are
            unchanged until you sync Stripe list prices. Requires explicit confirm; charge
            authority stays server-side.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCatalogConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void onApplyCatalog()}
            disabled={catalogUpdateState.isLoading}
          >
            Confirm apply
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={stripeConfirmOpen} onClose={() => setStripeConfirmOpen(false)}>
        <DialogTitle>Sync Stripe list prices?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This creates or reuses Stripe Price objects to match the catalog faces,
            updates DB price IDs, and best-effort pushes STRIPE_PRICE_* to factory Vercel.
            Requires explicit confirm — do not run without reviewing amounts.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStripeConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => void onSyncStripe()}
            disabled={syncState.isLoading}
          >
            Confirm sync
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={seedConfirmOpen} onClose={() => setSeedConfirmOpen(false)}>
        <DialogTitle>Seed / sync AI credits for all apps?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Tenant <strong>{tenantSlug || '—'}</strong>
            {appId ? (
              <>
                {' '}
                (scoped app <strong>{appId}</strong> for context only)
              </>
            ) : null}
            . This will:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>Recalculate the org rate card from live app/user/spend counts</li>
            <li>Set plan + top-up pack credits from catalog USD faces × secured markup</li>
            <li>Grant or top up the current period plan allowance (never claw back)</li>
            <li>Push ORGANIZATION_ID to every suite app Vercel project</li>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Credits are org-level — all {suiteApps.length || 1} app(s) share the same
            entitlements after billing identity is propagated. Platform admin only.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeedConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => void onSeedAiCredits()}
            disabled={seedState.isLoading || !tenantSlug}
          >
            {seedState.isLoading ? <CircularProgress size={18} /> : 'Confirm seed'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
