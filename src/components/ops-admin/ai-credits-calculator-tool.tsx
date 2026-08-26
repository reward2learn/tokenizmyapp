'use client';

/**
 * Platform Admin — AI Credits Calculator tool.
 *
 * Goal-fork Stepper:
 *   A Price organization · B Prefill Create Tenant · C Catalog & Stripe
 * Paths A/B share Scope → Enrich → Inputs → Review → Commit.
 * Path C is isolated (faces → edit → confirm). Catalog never appears on A/B.
 * Assistant rail from Inputs onward on A/B. Charge authority via secured rate-card PUT.
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
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import Snackbar from '@mui/material/Snackbar';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
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
import {
  useListOrganizationsQuery,
  useAnalyzeAiCreditsCalculatorMutation,
  useUpsertOrgRateCardMutation,
  useListCalculatorThreadsQuery,
  useCreateCalculatorThreadMutation,
  useGetCalculatorThreadQuery,
  useSendCalculatorChatMessageMutation,
  useGetBillingCatalogQuery,
  useUpdateCatalogPricesMutation,
  useSyncStripeCatalogPricesMutation,
  useSeedTenantAiCreditsMutation,
  usePushTenantSecUserAgentMutation,
} from '@/store/apis/organization-api';
import { useListTenantsQuery } from '@/store/apis/tenant-api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setWizardRateCardPrefill,
  setAdminCalculatorContext,
} from '@/store/ui-slice';
import { buildSecUserAgent } from '@/lib/billing/sec-user-agent';

type FeedbackSnack = { message: string; severity: 'success' | 'info' | 'warning' | 'error' };

/** Operator job — chosen on step 0; drives step labels and commit CTAs. */
export type CalculatorGoal = 'price-org' | 'prefill-tenant' | 'catalog-stripe';

const ORG_PATH_STEPS = [
  'Choose goal',
  'Scope',
  'Enrich',
  'Rate-card inputs',
  'Review',
  'Commit',
] as const;

const CATALOG_PATH_STEPS = [
  'Choose goal',
  'Review faces',
  'Edit prices',
  'Confirm & sync',
] as const;

const GOAL_CARDS: Array<{
  id: CalculatorGoal;
  title: string;
  blurb: string;
  blast: string;
}> = [
  {
    id: 'price-org',
    title: 'A · Price organization',
    blurb: 'Tune rate-card inputs, review credits, Apply to an org — optional Seed for all suite apps.',
    blast: 'Org-scoped',
  },
  {
    id: 'prefill-tenant',
    title: 'B · Prefill Create Tenant',
    blurb: 'Same economics draft, then push into Create Tenant → AI Rate Card. No DB write here.',
    blast: 'Draft only',
  },
  {
    id: 'catalog-stripe',
    title: 'C · Catalog & Stripe',
    blurb: 'Edit platform list prices (plans/packs), Apply catalog, then Sync Stripe. Isolated from org Apply.',
    blast: 'Platform-wide',
  },
];

export function AiCreditsCalculatorTool() {
  const dispatch = useAppDispatch();
  const calcContext = useAppSelector((s) => s.ui.adminCalculatorContext);
  const adminOrgId = useAppSelector((s) => s.ui.adminSelectedOrgId);
  const adminTenantSlug = useAppSelector((s) => s.ui.adminSelectedTenantSlug);
  const adminAppId = useAppSelector((s) => s.ui.adminSelectedAppId);

  const { data: orgsData } = useListOrganizationsQuery();
  const { data: tenantsData } = useListTenantsQuery();
  const orgs = useMemo(
    () => orgsData?.data?.organizations ?? [],
    [orgsData?.data?.organizations],
  );
  const tenants = useMemo(
    () => tenantsData?.data?.tenants ?? [],
    [tenantsData?.data?.tenants],
  );

  const [goal, setGoal] = useState<CalculatorGoal | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const [orgId, setOrgId] = useState(calcContext?.orgId ?? adminOrgId ?? '');
  const [tenantSlug, setTenantSlug] = useState(
    calcContext?.tenantSlug ?? adminTenantSlug ?? '',
  );
  const [appId, setAppId] = useState(calcContext?.appId ?? adminAppId ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(calcContext?.websiteUrl ?? '');
  const [secCikOrTicker, setSecCikOrTicker] = useState('');
  const [companiesHouseNumber, setCompaniesHouseNumber] = useState('');
  const [adminRevenue, setAdminRevenue] = useState<number | ''>(
    calcContext?.rateCardInputs?.annualRevenueUsd ?? '',
  );
  const [inputs, setInputs] = useState<TenantRateCardInputs>(
    defaultRateCardInputs({
      macStudioCostUsd: DEFAULT_MAC_STUDIO_ULTRA_256_USD,
      ...(calcContext?.rateCardInputs ?? {}),
    }),
  );
  const [analyzeResult, setAnalyzeResult] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<FeedbackSnack | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chatText, setChatText] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [pendingUserText, setPendingUserText] = useState<string | null>(null);
  const [chatBusy, setChatBusy] = useState(false);
  const [toolHints, setToolHints] = useState<string[]>([]);
  const [catalogConfirmOpen, setCatalogConfirmOpen] = useState(false);
  const [stripeConfirmOpen, setStripeConfirmOpen] = useState(false);
  const [seedConfirmOpen, setSeedConfirmOpen] = useState(false);
  const [secUaConfirmOpen, setSecUaConfirmOpen] = useState(false);
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
    if (!calcContext) return;
    if (calcContext.orgId) setOrgId(calcContext.orgId);
    if (calcContext.tenantSlug) setTenantSlug(calcContext.tenantSlug);
    if (calcContext.appId !== undefined) setAppId(calcContext.appId ?? '');
    if (calcContext.websiteUrl) setWebsiteUrl(calcContext.websiteUrl);
    if (calcContext.rateCardInputs) {
      setInputs((prev) =>
        defaultRateCardInputs({
          ...prev,
          ...calcContext.rateCardInputs,
        }),
      );
      if (calcContext.rateCardInputs.annualRevenueUsd != null) {
        setAdminRevenue(calcContext.rateCardInputs.annualRevenueUsd);
      }
    }
  }, [calcContext]);

  const selectedTenant = useMemo(
    () => tenants.find((t) => t.slug === tenantSlug) ?? null,
    [tenants, tenantSlug],
  );

  const selectedOrg = useMemo(
    () => orgs.find((o) => o.id === orgId) ?? null,
    [orgs, orgId],
  );

  const previewSecUserAgent = useMemo(() => {
    if (!tenantSlug) return null;
    return buildSecUserAgent({
      tenantSlug,
      organizationName: selectedOrg?.displayName || selectedOrg?.slug || null,
      tenantDisplayName: selectedTenant?.displayName || null,
    });
  }, [tenantSlug, selectedOrg, selectedTenant]);

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
  const [sendChatMessage] = useSendCalculatorChatMessageMutation();
  const { data: threadsData, refetch: refetchThreads } = useListCalculatorThreadsQuery();
  const { data: threadData, refetch: refetchThread } = useGetCalculatorThreadQuery(threadId ?? '', {
    skip: !threadId,
  });
  const [updateCatalog, catalogUpdateState] = useUpdateCatalogPricesMutation();
  const [syncStripe, syncState] = useSyncStripeCatalogPricesMutation();
  const [seedTenantCredits, seedState] = useSeedTenantAiCreditsMutation();
  const [pushSecUserAgent, secUaState] = usePushTenantSecUserAgentMutation();

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

  const resolvedRateCardInputs = (): TenantRateCardInputs =>
    defaultRateCardInputs({
      ...inputs,
      annualRevenueUsd:
        adminRevenue === '' ? inputs.annualRevenueUsd : Number(adminRevenue),
    });

  const onUseInWizard = () => {
    const prefill = resolvedRateCardInputs();
    dispatch(setWizardRateCardPrefill(prefill));
    setSnackbar({
      message:
        'Prefill saved — open Create Tenant wizard → AI Rate Card step to use these inputs.',
      severity: 'success',
    });
  };

  const onRememberContext = () => {
    const rateCardInputs = resolvedRateCardInputs();
    dispatch(
      setAdminCalculatorContext({
        orgId: orgId || null,
        tenantSlug: tenantSlug || null,
        appId: appId || null,
        websiteUrl: websiteUrl || null,
        rateCardInputs,
      }),
    );
    const label = tenantSlug || selectedOrg?.displayName || selectedOrg?.slug || orgId || 'session';
    setSnackbar({ message: `Context saved for ${label}`, severity: 'success' });
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
      await sendChatMessage({
        threadId: id,
        message: outgoing,
        draftInputs: {
          ...inputs,
          annualRevenueUsd:
            adminRevenue === '' ? inputs.annualRevenueUsd : Number(adminRevenue),
        },
        websiteUrl: websiteUrl || null,
        secCikOrTicker: secCikOrTicker || null,
        companiesHouseNumber: companiesHouseNumber || null,
        onToken: (token) => {
          setStreamingText((prev) => prev + token);
        },
        onToolResult: (tool) => {
          setToolHints((prev) => [...prev, tool]);
        },
      }).unwrap();

      setStreamingText('');
      setToolHints([]);
      setPendingUserText(null);
      void refetchThread();
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { error?: string } }).data?.error
          : undefined;
      setStatus(message ?? (err instanceof Error ? err.message : 'Chat failed'));
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

  const onPushSecUserAgent = async () => {
    if (!tenantSlug) {
      setStatus('Select a tenant before pushing SEC_USER_AGENT.');
      return;
    }
    try {
      const res = await pushSecUserAgent({
        slug: tenantSlug,
        confirm: true,
        organizationName: selectedOrg?.displayName || selectedOrg?.slug || null,
      }).unwrap();
      setSecUaConfirmOpen(false);
      setStatus(res.data?.message ?? `SEC_USER_AGENT pushed for ${tenantSlug}.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'SEC_USER_AGENT push failed');
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

  const stepLabels =
    goal === 'catalog-stripe' ? CATALOG_PATH_STEPS : ORG_PATH_STEPS;
  const lastStepIndex = stepLabels.length - 1;
  const isOrgPath = goal === 'price-org' || goal === 'prefill-tenant';
  const showAssistant =
    isOrgPath && activeStep >= 3; /* Inputs, Review, Commit */

  const selectGoal = (next: CalculatorGoal) => {
    setGoal(next);
    setActiveStep(1);
    setStatus(null);
  };

  const canGoNext = (): boolean => {
    if (activeStep === 0) return goal != null;
    if (goal === 'catalog-stripe') return true;
    // Scope: price-org requires organization
    if (activeStep === 1 && goal === 'price-org') return Boolean(orgId);
    return true;
  };

  const nextBlockedReason = (): string | null => {
    if (activeStep === 0 && !goal) return 'Pick a goal to continue.';
    if (activeStep === 1 && goal === 'price-org' && !orgId) {
      return 'Select an organization before continuing (required for Apply).';
    }
    return null;
  };

  const goNext = () => {
    if (!canGoNext()) return;
    setActiveStep((s) => Math.min(s + 1, lastStepIndex));
  };

  const goBack = () => {
    if (activeStep <= 0) return;
    const prev = activeStep - 1;
    setActiveStep(prev);
    if (prev === 0) {
      // Stay on goal picker; keep selection so operator can switch cards
    }
  };

  const changeGoalFromStepper = (idx: number) => {
    if (idx === 0) {
      setActiveStep(0);
      return;
    }
    if (!goal) return;
    setActiveStep(idx);
  };

  // ── Step bodies ──────────────────────────────────────────────

  const renderGoalStep = () => (
    <Stack spacing={2}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        What do you want to do?
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Catalog & Stripe is a separate path — it never shares steps with org Apply or Seed.
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {GOAL_CARDS.map((card) => {
          const selected = goal === card.id;
          return (
            <Card
              key={card.id}
              variant="outlined"
              sx={{
                flex: 1,
                borderColor: selected ? 'primary.main' : 'divider',
                borderWidth: selected ? 2 : 1,
              }}
            >
              <CardActionArea onClick={() => selectGoal(card.id)} sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.blurb}
                    </Typography>
                    <Chip
                      size="small"
                      label={card.blast}
                      color={card.id === 'catalog-stripe' ? 'warning' : 'default'}
                      variant="outlined"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );

  const renderScopeStep = () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Tenant / org context
      </Typography>
      {goal === 'price-org' ? (
        <Alert severity="info">
          Organization is required — Apply persists the rate card to that org.
        </Alert>
      ) : (
        <Alert severity="info">
          Org/tenant are optional for prefill. Set them if you want Remember context or later Seed.
        </Alert>
      )}
      {calcContext?.orgId || calcContext?.tenantSlug ? (
        <Chip
          size="small"
          color="success"
          variant="outlined"
          label={`Remembered: ${calcContext.tenantSlug || calcContext.orgId}${
            calcContext.appId ? ` · ${calcContext.appId}` : ''
          }`}
        />
      ) : null}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          size="small"
          fullWidth
          label="Organization"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          required={goal === 'price-org'}
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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { sm: 'center' }, flexWrap: 'wrap' }}
        useFlexGap
      >
        <Button
          variant="outlined"
          size="small"
          onClick={() => setSecUaConfirmOpen(true)}
          disabled={!tenantSlug || secUaState.isLoading}
        >
          {secUaState.isLoading ? (
            <BrandedLoadingIndicator size={18} />
          ) : (
            'Push SEC_USER_AGENT to tenant Vercel'
          )}
        </Button>
        {previewSecUserAgent ? (
          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 480 }}>
            Will set: {previewSecUserAgent}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Select a tenant to enable SEC User-Agent push (identification only — not a mailbox).
          </Typography>
        )}
      </Stack>
      <Button variant="text" onClick={onRememberContext} sx={{ alignSelf: 'flex-start' }}>
        Remember context
      </Button>
    </Stack>
  );

  const renderEnrichStep = () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Enrich estimates (optional)
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Website + SEC / Companies House filings improve estimates. Skip if you already know
        annual revenue — you can confirm it on the next step.
      </Typography>
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
        sx={{ alignSelf: 'flex-start' }}
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
  );

  const renderInputsStep = () => (
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
          helperText="Overrides scrape/AI on Apply — confirm before Commit"
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
    </Stack>
  );

  const renderReviewStep = () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Review economics
      </Typography>
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
      <Typography variant="body2" color="text.secondary">
        Numbers look wrong? Go Back to Rate-card inputs. Ready to persist? Continue to Commit.
      </Typography>
    </Stack>
  );

  const renderCommitStep = () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {goal === 'prefill-tenant' ? 'Save prefill for Create Tenant' : 'Apply rate card'}
      </Typography>
      {goal === 'price-org' ? (
        <>
          <Alert severity="warning">
            Apply persists rate-card inputs server-side; markup / credits / charge authority are
            computed on the server (client markupPercent is never trusted).
          </Alert>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
            <Button
              variant="contained"
              onClick={() => void onApplyOrg()}
              disabled={!orgId || upsertState.isLoading}
            >
              {upsertState.isLoading ? <CircularProgress size={18} /> : 'Apply to organization'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setSeedConfirmOpen(true)}
              disabled={!tenantSlug || seedState.isLoading}
            >
              Seed / sync AI credits for all apps
            </Button>
            <Button variant="text" onClick={() => void copyJson()}>
              Copy JSON
            </Button>
            <Button variant="text" onClick={onRememberContext}>
              Remember context
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Seed recalculates the org rate card from catalog faces, syncs the plan grant, and
            pushes billing identity to every suite app.
          </Typography>
        </>
      ) : (
        <>
          <Alert severity="info">
            This writes Redux prefill only — open Create Tenant → AI Rate Card to use these
            inputs. No organization rate card is written yet.
          </Alert>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
            <Button variant="contained" onClick={onUseInWizard}>
              Use in tenant wizard
            </Button>
            <Button variant="text" onClick={() => void copyJson()}>
              Copy JSON
            </Button>
            <Button variant="text" onClick={onRememberContext}>
              Remember context
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );

  const renderCatalogReviewFaces = () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Current catalog faces & Stripe drift
      </Typography>
      {drift.length > 0 ? (
        <Alert severity="warning">
          Stripe drift: {drift[0]}
          {drift.length > 1 ? ` (+${drift.length - 1} more)` : ''}
        </Alert>
      ) : (
        <Alert severity="success">
          No Stripe catalog drift detected (or Stripe not configured).
        </Alert>
      )}
      <Typography variant="body2">
        Pro monthly: <strong>{catalog.plans.pro.monthlyCents}</strong> ¢ · Business:{' '}
        <strong>{catalog.plans.business.monthlyCents}</strong> ¢
      </Typography>
      <Typography variant="body2">
        Packs: $25 = {catalog.packs['pack-25']} ¢ · $50 = {catalog.packs['pack-50']} ¢ · $100 ={' '}
        {catalog.packs['pack-100']} ¢
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Credits at current markup — Pro:{' '}
        {liveReport.computed.planCredits.pro.toLocaleString()} · $25 pack:{' '}
        {liveReport.computed.packCredits['pack-25'].toLocaleString()}
      </Typography>
    </Stack>
  );

  const renderCatalogEditPrices = () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Edit list prices (cents)
      </Typography>
      <Alert severity="warning">
        These faces are platform-wide. Customers see them after Apply catalog; charges follow
        Stripe sync. DB catalog remains source of truth.
      </Alert>
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
          onChange={(e) => setEditBusinessMonthly(Math.max(0, Number(e.target.value) || 0))}
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
    </Stack>
  );

  const renderCatalogConfirm = () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Confirm catalog & Stripe
      </Typography>
      <Typography variant="body2">
        Pro {editProMonthly}¢/mo · Business {editBusinessMonthly}¢/mo · Packs {editPack25}/
        {editPack50}/{editPack100} ¢
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
        <Button variant="outlined" onClick={() => setCatalogConfirmOpen(true)}>
          Apply catalog prices
        </Button>
        <Button variant="outlined" color="warning" onClick={() => setStripeConfirmOpen(true)}>
          Sync Stripe list prices
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Both actions require an explicit confirm dialog. Stripe sync also best-effort pushes
        STRIPE_PRICE_* to factory Vercel; DB catalog remains source of truth.
      </Typography>
    </Stack>
  );

  const renderAssistantRail = () => (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        flex: 1,
        minWidth: 280,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
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
  );

  const renderStepBody = () => {
    if (activeStep === 0 || goal == null) return renderGoalStep();

    if (goal === 'catalog-stripe') {
      switch (activeStep) {
        case 1:
          return renderCatalogReviewFaces();
        case 2:
          return renderCatalogEditPrices();
        case 3:
          return renderCatalogConfirm();
        default:
          return renderGoalStep();
      }
    }

    // price-org | prefill-tenant
    switch (activeStep) {
      case 1:
        return renderScopeStep();
      case 2:
        return renderEnrichStep();
      case 3:
        return renderInputsStep();
      case 4:
        return renderReviewStep();
      case 5:
        return renderCommitStep();
      default:
        return renderGoalStep();
    }
  };

  const blocked = nextBlockedReason();

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          AI Credits Calculator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Step through scope → enrich → inputs → review → commit. Catalog/Stripe is a separate
          goal so platform list prices never sit next to org Apply.
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

      <Stepper
        activeStep={activeStep}
        nonLinear={Boolean(goal)}
        sx={{
          overflowX: 'auto',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          '& .MuiStepLabel-root': { cursor: goal ? 'pointer' : 'default' },
        }}
      >
        {stepLabels.map((label, idx) => (
          <Step key={label} completed={Boolean(goal) && idx < activeStep}>
            <StepLabel
              onClick={() => changeGoalFromStepper(idx)}
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: '0.8rem',
                  fontWeight: activeStep === idx ? 700 : 400,
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {goal ? (
        <Chip
          size="small"
          variant="outlined"
          color={goal === 'catalog-stripe' ? 'warning' : 'primary'}
          label={
            goal === 'price-org'
              ? 'Goal: Price organization'
              : goal === 'prefill-tenant'
                ? 'Goal: Prefill Create Tenant'
                : 'Goal: Catalog & Stripe'
          }
          onDelete={() => {
            setGoal(null);
            setActiveStep(0);
          }}
          sx={{ alignSelf: 'flex-start' }}
        />
      ) : null}

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ alignItems: 'stretch' }}>
        <Paper variant="outlined" sx={{ p: 2, flex: showAssistant ? 1.6 : 1, minWidth: 0 }}>
          {renderStepBody()}
        </Paper>
        {showAssistant ? renderAssistantRail() : null}
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}
        useFlexGap
      >
        {activeStep > 0 ? (
          <Button onClick={goBack}>Back</Button>
        ) : null}
        {blocked && activeStep > 0 ? (
          <Typography variant="caption" color="warning.main" sx={{ alignSelf: 'center', mr: 1 }}>
            {blocked}
          </Typography>
        ) : null}
        {activeStep < lastStepIndex ? (
          <Button variant="contained" onClick={goNext} disabled={!canGoNext()}>
            {activeStep === 2 && isOrgPath ? 'Skip / Next' : 'Next'}
          </Button>
        ) : null}
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
            This creates or reuses Stripe Price objects to match the catalog faces, updates DB
            price IDs, and best-effort pushes STRIPE_PRICE_* to factory Vercel. Requires
            explicit confirm — do not run without reviewing amounts.
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

      <Dialog open={secUaConfirmOpen} onClose={() => setSecUaConfirmOpen(false)}>
        <DialogTitle>Push SEC_USER_AGENT to tenant Vercel?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Upserts <code>SEC_USER_AGENT</code> on the tenant root project and every suite app
            with a linked Vercel project id (production + preview + development).
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Value: <strong>{previewSecUserAgent ?? '—'}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            SEC uses this as identification for EDGAR fair-access —{' '}
            <code>admin@{'{slug}'}.com</code> is not required to be a real mailbox. Factory was
            seeded separately via CLI with alex@tokenizin.com. Redeploy tenant apps after push
            for runtime to pick up the var.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSecUaConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void onPushSecUserAgent()}
            disabled={secUaState.isLoading || !tenantSlug}
          >
            {secUaState.isLoading ? <CircularProgress size={18} /> : 'Confirm push'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={5000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar ? (
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar(null)}
            sx={{ maxWidth: 520 }}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Stack>
  );
}
