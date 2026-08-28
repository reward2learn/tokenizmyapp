'use client';

import { useCallback, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import PaletteIcon from '@mui/icons-material/Palette';
import DnsIcon from '@mui/icons-material/Dns';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ApartmentIcon from '@mui/icons-material/Apartment';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import {
  getTemplate,
  listTemplates,
  isSlugAvailable,
} from '@/domain/tenant/template-catalog';
import { useListAllTemplatesQuery } from '@/store/apis/template-api';
import { BUSINESS_CATEGORY_PROMPTS, getBusinessCategory } from '@/domain/app-pack/business-category-prompts';
import {
  useCreateTenantMutation,
  useScrapeTenantMutation,
  usePreviewNeonProvisionMutation,
  useUploadTenantLoadingGraphicMutation,
} from '@/store/apis/tenant-api';
import { LoadingGraphicUpload } from '@/components/branding/loading-graphic-upload';
import { TenantRateCardStep } from '@/components/ops-admin/tenant-rate-card-step';
import { SchemaOrgTypeChips } from '@/components/ops-admin/schema-org-type-chips';
import {
  TenantAiProvidersConfigStep,
  emptyAiProviderWizardValue,
  type AiProviderWizardValue,
} from '@/components/ops-admin/tenant-ai-providers-config-step';
import {
  DEFAULT_MAC_STUDIO_ULTRA_256_USD,
  type TenantRateCardInputs,
} from '@/lib/billing/tenant-rate-card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWizardRateCardPrefill } from '@/store/ui-slice';

/** Create-tenant steps — Database is 5th so Neon exists before AI providers / Review. */
const STEPS = [
  'Business Info',
  'Template',
  'AI Description',
  'Branding',
  'Database',
  'AI Rate Card',
  'AI Providers',
  'Review',
];

const REVIEW_STEP = STEPS.length - 1;
const SUCCESS_STEP = STEPS.length;

interface ScrapedData {
  businessName: string;
  description: string;
  logoBase64: string | null;
  brandColors: { primary: string | null; secondary: string | null; allColors: string[] };
  images: Array<{ url: string; alt: string }>;
  socialLinks: Record<string, string>;
  address: string | null;
  emails: string[];
  phoneNumbers: string[];
  textContent: string;
}

/** App instance preview for suite mode — mirrors SuiteAppInstance in tenant-api.ts. */
interface SuiteAppPreview {
  id: string;
  name: string;
  department: string;
  summary: string;
  templateId: string;
}

interface WizardState {
  slug: string;
  displayName: string;
  templateMode: 'single' | 'suite';
  template: string;
  templates: string[];
  /** 'predefined' — a business-category app kit was chosen (see business-category-prompts.ts).
   *  'custom' — templates were hand-picked; materialization is always one app per template. */
  packMode: 'predefined' | 'custom';
  /** Selected business category label when packMode === 'predefined'. */
  category: string | null;
  prompt: string;
  primaryColor: string;
  secondaryColor: string;
  logoBase64: string | null;
  loadingGraphicUrl: string | null;
  scrapeUrl: string;
  /** Secured billing rate-card inputs — locked in by platform admin at create time. */
  rateCard: TenantRateCardInputs;
  /**
   * Shared tenant Neon DB — provisioned here so suite / add-app wizards can
   * prepopulate connection strings from tenants.db_url + metadata.config.database.
   */
  database: {
    mode: 'auto' | 'manual';
    pooledUrl: string;
    directUrl: string;
  };
  /** AI provider catalog + keys seeded into the new tenant DB after Neon. */
  aiProviders: AiProviderWizardValue;
  /** Social wallet + crypto billing — stamped to Vercel on deploy (default on). */
  web3WalletEnabled: boolean;
}

const INITIAL_STATE: WizardState = {
  slug: '',
  displayName: '',
  templateMode: 'single',
  template: 'default',
  templates: [],
  packMode: 'custom',
  category: null,
  prompt: '',
  primaryColor: '#eb3d28',
  secondaryColor: '#0af9fe',
  logoBase64: null,
  loadingGraphicUrl: null,
  scrapeUrl: '',
  rateCard: {
    appCount: 1,
    userCount: 1,
    annualRevenueUsd: 0,
    macStudioCostUsd: DEFAULT_MAC_STUDIO_ULTRA_256_USD,
    monthlyThirdPartyUsd: 0,
  },
  database: {
    mode: 'auto',
    pooledUrl: '',
    directUrl: '',
  },
  aiProviders: emptyAiProviderWizardValue(),
  web3WalletEnabled: true,
};

export const PIPELINE_STEPS = [
  { label: 'AI Schema Generation', key: 'schema' },
  { label: 'Neon Database Branch', key: 'neon' },
  { label: 'Database Migrations', key: 'migrations' },
  { label: 'Seeding Defaults', key: 'seed' },
  { label: 'Code Generation', key: 'codegen' },
  { label: 'Vercel Deployment', key: 'deploy' },
];

export function TenantWizard({ iconOnly = false }: { iconOnly?: boolean }) {
  const theme = useTheme();
  // Mobile: vertical stepper layout; non-mobile keeps the current horizontal layout.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useAppDispatch();
  const rateCardPrefill = useAppSelector((s) => s.ui.wizardRateCardPrefill);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [scraped, setScraped] = useState<ScrapedData | null>(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [createTenant, { isLoading, isError, error, isSuccess, data }] = useCreateTenantMutation();
  const [uploadTenantLoadingGraphic] = useUploadTenantLoadingGraphicMutation();
  const [scrapeTenant] = useScrapeTenantMutation();
  const [previewNeon, { isLoading: provisioningDb }] = usePreviewNeonProvisionMutation();
  const [dbProvisionError, setDbProvisionError] = useState<string | null>(null);
  const [rateCardPrefillApplied, setRateCardPrefillApplied] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setStep(0);
    const hadPrefill = Boolean(rateCardPrefill);
    setState({
      ...INITIAL_STATE,
      rateCard: {
        ...INITIAL_STATE.rateCard,
        ...(rateCardPrefill ?? {}),
      },
    });
    setScraped(null);
    setScrapeError(null);
    setDbProvisionError(null);
    setRateCardPrefillApplied(hadPrefill);
    if (rateCardPrefill) {
      dispatch(setWizardRateCardPrefill(null));
    }
  };
  const handleClose = () => { if (!isLoading) { setOpen(false); setStep(0); } };

  const update = useCallback((patch: Partial<WizardState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      // Auto-fill colors from selected template (single mode)
      if (patch.template && !patch.primaryColor && next.templateMode === 'single') {
        const tpl = getTemplate(patch.template);
        next.primaryColor = tpl.defaultColors.primary;
        next.secondaryColor = tpl.defaultColors.secondary;
      }
      return next;
    });
  }, []);

  /** Toggle a template in/out of the templates[] array — always switches to Custom App Pack mode. */
  const toggleSuiteTemplate = useCallback((tplId: string) => {
    setState((prev) => {
      const isSelected = prev.templates.includes(tplId);
      const next = isSelected
        ? prev.templates.filter((t) => t !== tplId)
        : [...prev.templates, tplId];
      // Auto-fill colors from first selected template
      const firstTpl = next.length > 0 ? getTemplate(next[0]) : null;
      return {
        ...prev,
        templates: next,
        packMode: 'custom',
        category: null,
        primaryColor: firstTpl?.defaultColors.primary ?? prev.primaryColor,
        secondaryColor: firstTpl?.defaultColors.secondary ?? prev.secondaryColor,
      };
    });
  }, []);

  /** Apply a business-category app kit — populates templates[] + prompt for AI decomposition. */
  const applyCategory = useCallback((categoryName: string) => {
    const preset = getBusinessCategory(categoryName);
    if (!preset) return;
    const firstTpl = getTemplate(preset.templateIds[0]);
    setState((prev) => ({
      ...prev,
      packMode: 'predefined',
      category: categoryName,
      templates: preset.templateIds,
      prompt: preset.prompt,
      primaryColor: firstTpl.defaultColors.primary,
      secondaryColor: firstTpl.defaultColors.secondary,
    }));
  }, []);

  /** Preview of the apps this selection will produce — one per selected template. */
  const getEffectiveSuiteApps = useCallback((): SuiteAppPreview[] => {
    return [...new Set(state.templates)].map((tplId) => {
      const tpl = getTemplate(tplId);
      return {
        id: tplId,
        name: tpl.label,
        department: tpl.label,
        summary: tpl.description,
        templateId: tplId,
      };
    });
  }, [state.templates]);

  const validateSlug = (slug: string): string | null => {
    if (!slug) return 'Business name is required';
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return 'Use lowercase letters, numbers, and hyphens only';
    if (slug.length < 2) return 'Must be at least 2 characters';
    if (!isSlugAvailable(slug)) return 'This name is reserved or unavailable';
    return null;
  };

  // ── AI Scrape Handler ──────────────────────────────────
  const handleScrape = async () => {
    if (!state.scrapeUrl.trim()) return;
    setScraping(true);
    setScrapeError(null);
    try {
      const result = await scrapeTenant({ url: state.scrapeUrl.trim() }).unwrap();
      if (result.success && result.data) {
        const s = result.data.scraped;
        const scrapedData: ScrapedData = {
          businessName: s.businessName || '',
          description: s.description || '',
          logoBase64: s.logoBase64 || null,
          brandColors: s.brandColors || { primary: null, secondary: null, allColors: [] },
          images: s.images || [],
          socialLinks: s.socialLinks || {},
          address: s.address || null,
          emails: s.emails || [],
          phoneNumbers: s.phoneNumbers || [],
          textContent: s.textContent || '',
        };
        setScraped(scrapedData);

        // Auto-fill fields from scraped data
        const updates: Partial<WizardState> = {};

        // Auto-fill display name
        if (scrapedData.businessName && !state.displayName) {
          updates.displayName = scrapedData.businessName;
        }

        // Auto-fill slug from business name
        if (scrapedData.businessName && !state.slug) {
          const autoSlug = scrapedData.businessName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 30);
          if (autoSlug && isSlugAvailable(autoSlug)) {
            updates.slug = autoSlug;
          }
        }

        // Auto-fill logo
        if (scrapedData.logoBase64) {
          updates.logoBase64 = scrapedData.logoBase64;
        }

        // Auto-fill brand colors
        if (scrapedData.brandColors.primary) {
          updates.primaryColor = scrapedData.brandColors.primary;
        }
        if (scrapedData.brandColors.secondary) {
          updates.secondaryColor = scrapedData.brandColors.secondary;
        }

        // Auto-fill prompt
        if (result.data.generatedPrompt) {
          updates.prompt = result.data.generatedPrompt;
        }

        // Auto-select template
        if (result.data.recommendedTemplate) {
          const tpl = getTemplate(result.data.recommendedTemplate);
          updates.template = tpl.id;
          if (!scrapedData.brandColors.primary) {
            updates.primaryColor = tpl.defaultColors.primary;
            updates.secondaryColor = tpl.defaultColors.secondary;
          }
        }

        if (Object.keys(updates).length > 0) {
          setState((prev) => ({ ...prev, ...updates }));
        }
      } else {
        setScrapeError(result.error || 'Scraping failed');
      }
    } catch (err) {
      const envelope = (err as { data?: { error?: string } })?.data;
      setScrapeError(envelope?.error || (err instanceof Error ? err.message : 'Scraping failed'));
    }
    setScraping(false);
  };

  const handleNext = () => {
    if (step === 0) {
      const err = validateSlug(state.slug);
      if (err) { setSlugError(err); return; }
      if (!state.displayName.trim()) { setSlugError('Display name is required'); return; }
      setSlugError(null);
    }
    // Database step (index 4): manual mode requires a pooled URL before continuing.
    if (step === 4 && state.database.mode === 'manual' && !state.database.pooledUrl.trim()) {
      setDbProvisionError('Enter a pooled database URL, or switch to Auto-provision Neon.');
      return;
    }
    setDbProvisionError(null);
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleProvisionNeonNow = async () => {
    const err = validateSlug(state.slug);
    if (err) {
      setDbProvisionError(`Fix the slug on Business Info first: ${err}`);
      return;
    }
    setDbProvisionError(null);
    try {
      const result = await previewNeon({ slug: state.slug }).unwrap();
      const pooled = result.data?.pooledUrl ?? '';
      const direct = result.data?.directUrl ?? '';
      if (!pooled) {
        setDbProvisionError('Provisioning succeeded but no connection string was returned.');
        return;
      }
      setState((s) => ({
        ...s,
        database: {
          mode: 'auto',
          pooledUrl: pooled,
          directUrl: direct || pooled.replace('-pooler', ''),
        },
      }));
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'data' in e
          ? ((e as { data?: { error?: string } }).data?.error ?? 'Neon provisioning failed')
          : e instanceof Error
            ? e.message
            : 'Neon provisioning failed';
      setDbProvisionError(msg);
    }
  };

  const handleCreate = async () => {
    const isSuite = state.templateMode === 'suite';
    const suggestedApps =
      isSuite && state.templates.length > 0 ? state.templates.length : 1;
    const result = await createTenant({
      slug: state.slug,
      displayName: state.displayName.trim(),
      template: isSuite ? (state.templates[0] ?? 'default') : state.template,
      templateMode: state.templateMode,
      templates: isSuite ? state.templates : undefined,
      packMode: isSuite ? state.packMode : undefined,
      primaryColor: state.primaryColor,
      secondaryColor: state.secondaryColor,
      prompt: state.prompt.trim() || undefined,
      rateCardInputs: {
        ...state.rateCard,
        appCount: state.rateCard.appCount || suggestedApps,
      },
      database: {
        mode: state.database.mode,
        pooledUrl: state.database.pooledUrl.trim() || null,
        directUrl: state.database.directUrl.trim() || null,
      },
      aiProviderConfig: {
        catalog: state.aiProviders.catalog,
        apiKeysBySecretName: Object.fromEntries(
          Object.entries(state.aiProviders.apiKeysBySecretName).filter(([, v]) => v.trim()),
        ),
        activeProviderId: state.aiProviders.activeProviderId,
        activeModel: state.aiProviders.activeModel || undefined,
        ollamaTunnelHost: state.aiProviders.ollamaTunnelHost.trim() || undefined,
      },
      metadata: {
        config: {
          web3WalletEnabled: state.web3WalletEnabled,
        },
      },
    }).unwrap();
    if (result.success && state.loadingGraphicUrl) {
      try {
        await uploadTenantLoadingGraphic({
          slug: state.slug,
          loadingGraphicUrl: state.loadingGraphicUrl,
        }).unwrap();
      } catch {
        // Tenant was created — loading graphic upload is best-effort.
      }
    }
    if (result.success) {
      setStep(SUCCESS_STEP);
    }
  };

  // Built-ins come from the compiled catalog; custom (AI-generated) templates —
  // including any built by the chat assistant's Custom Template Build tool —
  // exist only in the platform DB, so the merged list has to be fetched.
  // listTemplates() alone silently hides every custom template from the picker.
  // Falls back to the built-ins while the request is in flight or if it fails.
  const { data: templateData } = useListAllTemplatesQuery();
  const templates = templateData?.data?.templates ?? listTemplates();
  const selectedTemplate = getTemplate(state.template);
  const suiteApps = getEffectiveSuiteApps();

  const generateDefaultPrompt = () => {
    const tpl = selectedTemplate;
    const name = state.displayName || 'my business';
    const prompts: Record<string, string> = {
      'financial-analytics': `I run ${name}, a financial analytics business. We track revenue, costs, EBITDA, and KPIs. We need P&L projections, business review reports, and daily Z-report entry.`,
      'restaurant': `I run ${name}, a restaurant. We have a menu with categories (appetizers, mains, desserts, beverages). We take table reservations, track daily covers, and integrate with GoFood for delivery.`,
      'hotel': `I run ${name}, a hotel with multiple room types. We manage bookings, track occupancy and RevPAR, have event spaces for weddings and conferences, and offer F&B services.`,
      'ecommerce-retail': `I run ${name}, an online store. We sell products across categories, manage inventory with SKUs, process sales orders, and track customer data.`,
      'healthcare': `I run ${name}, a healthcare facility. We manage patient records, clinical documents, insurance claims, and medical device telemetry data.`,
      'supply-chain': `I run ${name}, a logistics company. We track shipments, manage warehouse inventory, coordinate with carriers, and generate freight manifests.`,
      'real-estate': `I run ${name}, a real estate agency. We manage property listings, track leases, manage tenants, and handle maintenance requests.`,
      'education': `I run ${name}, an educational institution. We manage courses, student enrollments, assignments, grades, and track student progress.`,
      'professional-services': `I run ${name}, a professional services firm. We manage projects, track time entries, generate invoices, and track client deliverables.`,
      'manufacturing': `I run ${name}, a manufacturing company. We manage production orders, bill of materials, quality checks, and track inventory lots.`,
      'default': `I run ${name}. We need a business operations dashboard with financial overview, task management, and AI chat.`,
    };
    return prompts[tpl.id] ?? prompts['default'];
  };

  return (
    <>
      <Tooltip title="New Tenant">
        {iconOnly ? (
          <IconButton
            color="primary"
            size="small"
            onClick={handleOpen}
            aria-label="New Tenant"
          >
            <AddIcon fontSize="small" />
          </IconButton>
        ) : (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{ fontWeight: 600 }}
          >
            New Tenant
          </Button>
        )}
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoFixHighIcon color="primary" />
          New Tenant App — AI-Powered Generation
        </DialogTitle>
        <DialogContent dividers>
          {isMobile ? (
            <Stepper activeStep={step} orientation="vertical" sx={{ mb: 2, '& .MuiStepConnector-root': { ml: 1.5 } }}>
              {STEPS.map((label) => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>
          ) : (
            <Stepper activeStep={step} sx={{ mb: 4 }}>
              {STEPS.map((label) => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>
          )}

          {/* Step 0: Business Info + AI Scrape */}
          {step === 0 ? (
            <Stack spacing={3}>
              {/* AI Scrape Section */}
              <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderColor: 'primary.main', borderWidth: 1 }}>
                <Stack spacing={2}>
                  <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
                    <TravelExploreIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      AI Assist — Scrape Existing Business
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Enter your business website URL or Instagram profile. The AI will extract your business name,
                    logo, brand colors, and description automatically.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      placeholder="https://mybusiness.com or instagram.com/mybusiness"
                      value={state.scrapeUrl}
                      onChange={(e) => setState((p) => ({ ...p, scrapeUrl: e.target.value }))}
                      fullWidth
                      size="small"
                      helperText="Website URL or social media link"
                    />
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => void handleScrape()}
                      disabled={scraping || !state.scrapeUrl.trim()}
                      startIcon={scraping ? <CircularProgress size={18} color="inherit" /> : <TravelExploreIcon />}
                      sx={{ whiteSpace: 'nowrap', minWidth: 140 }}
                    >
                      {scraping ? 'Scraping...' : 'AI Scrape'}
                    </Button>
                  </Stack>
                  {scrapeError ? (
                    <Alert severity="warning" onClose={() => setScrapeError(null)}>
                      {scrapeError}
                    </Alert>
                  ) : null}
                  {scraped ? (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
                        {scraped.logoBase64 ? (
                          <Avatar src={scraped.logoBase64} sx={{ width: 56, height: 56 }} />
                        ) : (
                          <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="caption">No logo</Typography>
                          </Box>
                        )}
                        <Stack spacing={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ✅ {scraped.businessName || 'Business found'}
                          </Typography>
                          {scraped.brandColors.primary ? (
                            <Stack direction="row" sx={{ gap: 0.5 }}>
                              <Chip label={scraped.brandColors.primary} size="small" sx={{ bgcolor: scraped.brandColors.primary, color: '#fff' }} />
                              {scraped.brandColors.secondary ? (
                                <Chip label={scraped.brandColors.secondary} size="small" sx={{ bgcolor: scraped.brandColors.secondary, color: '#000' }} />
                              ) : null}
                            </Stack>
                          ) : null}
                          {scraped.socialLinks.instagram ? (
                            <Typography variant="caption" color="text.secondary">
                              Instagram: {scraped.socialLinks.instagram}
                            </Typography>
                          ) : null}
                        </Stack>
                      </Stack>
                    </Paper>
                  ) : null}
                </Stack>
              </Paper>

              <Divider><Typography variant="caption" color="text.secondary">or enter manually</Typography></Divider>

              {/* Manual entry */}
              <TextField
                label="Business Slug"
                placeholder="my-business-name"
                value={state.slug}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  setState((p) => ({ ...p, slug: v }));
                  if (slugError) setSlugError(null);
                }}
                error={Boolean(slugError)}
                helperText={slugError ?? 'Lowercase letters, numbers, and hyphens. This becomes your subdomain.'}
                fullWidth
                autoFocus
                slotProps={{
                  input: {
                    startAdornment: <Typography variant="body2" color="text.disabled" sx={{ mr: 0.5 }}>https://</Typography>,
                    endAdornment: <Typography variant="body2" color="text.disabled">.vercel.app</Typography>,
                  },
                }}
              />
              <TextField
                label="Display Name"
                placeholder="My Business Name"
                value={state.displayName}
                onChange={(e) => setState((p) => ({ ...p, displayName: e.target.value }))}
                fullWidth
                helperText="Human-readable name shown in the header and page titles."
              />
            </Stack>
          ) : null}

          {/* Step 1: Template Selection — Single or Suite Mode */}
          {step === 1 ? (
            <Stack spacing={3}>
              {/* Suite Mode Toggle */}
              <Paper variant="outlined" sx={{ p: 2, borderColor: state.templateMode === 'suite' ? 'primary.main' : 'divider', borderWidth: state.templateMode === 'suite' ? 2 : 1 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                  <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
                    {state.templateMode === 'suite' ? (
                      <ApartmentIcon color="primary" />
                    ) : (
                      <DashboardCustomizeIcon color="action" />
                    )}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {state.templateMode === 'suite' ? 'Multi-App Suite Mode' : 'Single App Mode'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {state.templateMode === 'suite'
                          ? 'Create multiple department apps under one tenant. Each app gets its own template, schema, and separate deployment (own URL). Want all departments sharing one deployment instead? Use the Unified App Bundle tool from the tenant’s admin panel after creation.'
                          : 'Create a single application with one template. Switch to Suite Mode for multi-department operations.'}
                      </Typography>
                    </Box>
                  </Stack>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={state.templateMode === 'suite'}
                        onChange={(e) => {
                          const isSuite = e.target.checked;
                          update({
                            templateMode: isSuite ? 'suite' : 'single',
                            templates: [],
                            packMode: 'custom',
                            category: null,
                          });
                        }}
                        color="primary"
                      />
                    }
                    label="Suite Mode"
                    sx={{ flexShrink: 0 }}
                  />
                </Stack>
              </Paper>

              {/* Predefined vs Custom App Pack (only in suite mode) */}
              {state.templateMode === 'suite' ? (
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      variant={state.packMode === 'predefined' ? 'contained' : 'outlined'}
                      onClick={() => setState((p) => ({ ...p, packMode: 'predefined' }))}
                    >
                      Predefined App Pack
                    </Button>
                    <Button
                      fullWidth
                      variant={state.packMode === 'custom' ? 'contained' : 'outlined'}
                      onClick={() => setState((p) => ({ ...p, packMode: 'custom', category: null, templates: [], prompt: '' }))}
                    >
                      Custom App Pack
                    </Button>
                  </Stack>
                </Paper>
              ) : null}

              {/* Predefined: business-category "app kit" grid (only in suite + predefined mode) */}
              {state.templateMode === 'suite' && state.packMode === 'predefined' ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Choose a business category — App Kit
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    With an AI key configured, the category&apos;s description is decomposed into whichever
                    department apps fit best. Without one, you get exactly the seed templates shown below —
                    one app each.
                  </Typography>
                  <Grid container spacing={1.5}>
                    {BUSINESS_CATEGORY_PROMPTS.map((preset) => {
                      const isActive = state.category === preset.category;
                      return (
                        <Grid key={preset.category} size={{ xs: 12, sm: 4 }}>
                          <Card
                            variant="outlined"
                            sx={{
                              borderColor: isActive ? 'primary.main' : 'divider',
                              borderWidth: isActive ? 2 : 1,
                              bgcolor: isActive ? 'rgba(235,61,40,0.06)' : undefined,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              '&:hover': { boxShadow: 2 },
                            }}
                            onClick={() => applyCategory(preset.category)}
                          >
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{preset.category}</Typography>
                                {isActive ? <CheckCircleIcon color="primary" fontSize="small" /> : null}
                              </Stack>
                              <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
                                {preset.templateIds.map((tid) => (
                                  <Chip key={tid} label={getTemplate(tid).label} size="small" variant="outlined" />
                                ))}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              ) : null}

              {/* Template Grid — radio (single), checkbox (suite + custom) selection */}
              {state.templateMode === 'single' || state.packMode === 'custom' ? (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {state.templateMode === 'suite'
                    ? 'Select Templates (each becomes a department app)'
                    : 'Select a Template'}
                </Typography>
                {scraped && state.templateMode === 'single' ? (
                  <Alert severity="info" icon={<AutoFixHighIcon />} sx={{ mb: 1.5 }}>
                    AI analyzed your website and recommends: <strong>{getTemplate(selectedTemplate.id).label}</strong>
                  </Alert>
                ) : null}
                <Grid container spacing={2}>
                  {templates.filter((tpl) => tpl.id !== 'default').map((tpl) => {
                    const selected = state.templateMode === 'suite'
                      ? state.templates.includes(tpl.id)
                      : state.template === tpl.id;
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
                          <CardActionArea
                            onClick={() => {
                              if (state.templateMode === 'suite') {
                                toggleSuiteTemplate(tpl.id);
                              } else {
                                update({ template: tpl.id });
                              }
                            }}
                          >
                            <CardContent>
                              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                                {state.templateMode === 'suite' ? (
                                  <Checkbox
                                    checked={selected}
                                    size="small"
                                    color="primary"
                                    sx={{ p: 0 }}
                                    tabIndex={-1}
                                    disableRipple
                                  />
                                ) : selected ? (
                                  <CheckCircleIcon color="primary" fontSize="small" />
                                ) : null}
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                  {tpl.label}
                                </Typography>
                              </Stack>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {tpl.description}
                              </Typography>
                              <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap', mt: 0.5, minWidth: 0 }}>
                                <SchemaOrgTypeChips value={tpl.schemaOrgType} />
                                <Chip
                                  label={tpl.xsdStandard}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    '& .MuiChip-label': { whiteSpace: 'normal', wordBreak: 'break-word' },
                                  }}
                                />
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
              </Box>
              ) : null}

              {/* Suite Selection Summary */}
              {state.templateMode === 'suite' && suiteApps.length > 0 ? (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {state.packMode === 'custom'
                        ? `${suiteApps.length} apps — one per selected template (deterministic, plus CEO Overview)`
                        : `${suiteApps.length} seed app${suiteApps.length !== 1 ? 's' : ''} for "${state.category}" — with an AI key, the actual pack may cover more or fewer department apps`}
                    </Typography>
                  </Stack>
                  <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
                    {suiteApps.map((app) => (
                      <Chip key={app.id} label={app.name} size="small" color="primary" variant="outlined" />
                    ))}
                    <Chip label="CEO Overview" size="small" color="success" variant="outlined" />
                  </Stack>
                </Paper>
              ) : null}

              {state.templateMode === 'single' ? (
                <Typography variant="body2" color="text.secondary">
                  Each template includes pre-configured pages, navigation, W3C schema alignment, and schema.org structured data.
                </Typography>
              ) : null}
            </Stack>
          ) : null}
          {/* Step 2: AI Business Description */}
          {step === 2 ? (
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Describe your business in natural language. The AI will generate a complete W3C-aligned
                  schema (models, use cases, pages) based on your description and the selected template.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  💡 The more detail you provide, the better the AI can tailor the schema to your needs.
                </Typography>
              </Box>
              {scraped ? (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  AI pre-filled this description from your website. Review and edit as needed.
                </Alert>
              ) : null}
              <TextField
                label="Business Description (for AI Schema Generation)"
                placeholder="e.g., I run a restaurant in Bali with 20 tables, serving Indonesian and international cuisine..."
                value={state.prompt}
                onChange={(e) => setState((p) => ({ ...p, prompt: e.target.value }))}
                fullWidth
                multiline
                rows={6}
                helperText="This prompt is sent to the AI (via Vercel AI SDK) to generate your custom schema."
              />
              <Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoFixHighIcon />}
                  onClick={() => update({ prompt: generateDefaultPrompt() })}
                >
                  Generate Default Prompt
                </Button>
              </Box>
              {state.prompt ? (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    AI will generate:
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">🧠 Custom ZenStack models with schema.org mappings</Typography>
                    <Typography variant="body2">📋 Use cases with appropriate auth tiers</Typography>
                    <Typography variant="body2">📄 Pages with template-specific blocks</Typography>
                    <Typography variant="body2">🗄️ Neon database branch with migrations</Typography>
                    <Typography variant="body2">🚀 Vercel deployment with generated code</Typography>
                  </Stack>
                </Paper>
              ) : null}
            </Stack>
          ) : null}

          {/* Step 3: Branding with AI-extracted logo + colors */}
          {step === 3 ? (
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary">
                Customize the brand colors for your application. These are used for buttons, links, and accents.
              </Typography>

              {/* AI-extracted logo preview */}
              {state.logoBase64 ? (
                <Paper variant="outlined" sx={{ p: 2, borderColor: 'primary.main' }}>
                  <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
                    <Avatar src={state.logoBase64} sx={{ width: 64, height: 64 }} variant="rounded" />
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ✅ Logo extracted from website
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        This logo will be used in the tenant app header
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              ) : null}

              {/* AI-suggested color palette */}
              {scraped && scraped.brandColors.allColors.length > 0 ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
                    <PaletteIcon color="primary" fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      AI-Extracted Brand Colors
                    </Typography>
                  </Stack>
                  <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                    {scraped.brandColors.allColors.slice(0, 8).map((color) => (
                      <Tooltip key={color} title={color}>
                        <Box
                          onClick={() => update({ primaryColor: color })}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: color,
                            border: state.primaryColor === color ? '3px solid' : '1px solid',
                            borderColor: state.primaryColor === color ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, border-color 0.2s',
                            '&:hover': { transform: 'scale(1.1)' },
                            '&:active': { transform: 'scale(1.05)' },
                            '&:focus-visible': { transform: 'scale(1.05)' },
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Click a color to set as primary. AI extracted these from your website CSS.
                  </Typography>
                </Paper>
              ) : null}

              {/* Manual color pickers */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Primary Color"
                    value={state.primaryColor}
                    onChange={(e) => setState((p) => ({ ...p, primaryColor: e.target.value }))}
                    fullWidth
                    helperText="Used for buttons, links, and highlights"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: state.primaryColor, border: '1px solid', borderColor: 'divider', mr: 1 }} />
                        ),
                      },
                    }}
                  />
                  <Box sx={{ mt: 0.5 }}>
                    <input
                      type="color"
                      value={state.primaryColor}
                      onChange={(e) => setState((p) => ({ ...p, primaryColor: e.target.value }))}
                      style={{ width: '100%', height: 32, border: '1px solid', borderColor: 'divider', borderRadius: 6, background: 'none', cursor: 'pointer' }}
                    />
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Secondary Color"
                    value={state.secondaryColor}
                    onChange={(e) => setState((p) => ({ ...p, secondaryColor: e.target.value }))}
                    fullWidth
                    helperText="Used for accents and secondary elements"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: state.secondaryColor, border: '1px solid', borderColor: 'divider', mr: 1 }} />
                        ),
                      },
                    }}
                  />
                  <Box sx={{ mt: 0.5 }}>
                    <input
                      type="color"
                      value={state.secondaryColor}
                      onChange={(e) => setState((p) => ({ ...p, secondaryColor: e.target.value }))}
                      style={{ width: '100%', height: 32, border: '1px solid', borderColor: 'divider', borderRadius: 6, background: 'none', cursor: 'pointer' }}
                    />
                  </Box>
                </Box>
              </Stack>

              <LoadingGraphicUpload
                value={state.loadingGraphicUrl}
                onChange={async (next) => update({ loadingGraphicUrl: next })}
                onClear={async () => update({ loadingGraphicUrl: null })}
                helperText="Default loading graphic for this tenant and all inner apps unless an app overrides it."
              />

              {/* Preview */}
              <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'background.default' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                  Preview
                </Typography>
                <Stack direction="row" sx={{ gap: 1.5 }}>
                  {state.logoBase64 ? (
                    <Avatar src={state.logoBase64} sx={{ width: 32, height: 32 }} variant="rounded" />
                  ) : null}
                  <Box sx={{ px: 2, py: 1, borderRadius: 1, bgcolor: state.primaryColor, color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
                    Primary Button
                  </Box>
                  <Box sx={{ px: 2, py: 1, borderRadius: 1, border: '1px solid', borderColor: state.secondaryColor, color: state.secondaryColor, fontSize: '0.8rem', fontWeight: 700 }}>
                    Secondary
                  </Box>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: state.primaryColor }} />
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: state.secondaryColor }} />
                </Stack>
              </Paper>
            </Stack>
          ) : null}

          {/* Step 4: Database — shared tenant Neon DB for all suite / add-app flows */}
          {step === 4 ? (
            <Stack spacing={3}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <DnsIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Database Connection
                </Typography>
              </Stack>
              <Alert severity="info">
                This Neon database belongs to the <strong>tenant</strong>. Every app under{' '}
                <strong>{state.slug || '…'}</strong> (suite pack, Add App) reuses these connection
                strings via <code>tenants.db_url</code> / <code>metadata.config.database</code>.
                Provision it here before AI providers and create.
              </Alert>

              <FormControl>
                <FormLabel id="db-mode-label">How to configure</FormLabel>
                <RadioGroup
                  aria-labelledby="db-mode-label"
                  value={state.database.mode}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      database: {
                        ...s.database,
                        mode: e.target.value as 'auto' | 'manual',
                      },
                    }))
                  }
                >
                  <FormControlLabel
                    value="auto"
                    control={<Radio />}
                    label="Auto-provision Neon (recommended)"
                  />
                  <FormControlLabel
                    value="manual"
                    control={<Radio />}
                    label="Enter existing connection strings"
                  />
                </RadioGroup>
              </FormControl>

              {state.database.mode === 'auto' ? (
                <Paper variant="outlined" sx={{ p: 2.5, borderColor: 'secondary.main' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Auto-Provision Neon Database
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Creates an isolated Neon branch for <strong>{state.slug || 'this-tenant'}</strong>.
                    You can provision now (recommended) or let Create do it on submit when{' '}
                    <code>NEON_API_KEY</code> is set.
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => void handleProvisionNeonNow()}
                      disabled={provisioningDb || !state.slug}
                      startIcon={
                        provisioningDb
                          ? <CircularProgress size={18} color="inherit" />
                          : <DnsIcon />
                      }
                    >
                      {provisioningDb
                        ? 'Provisioning…'
                        : state.database.pooledUrl
                          ? 'Re-provision Neon'
                          : 'Provision Neon now'}
                    </Button>
                    <Button
                      variant="outlined"
                      href="https://console.neon.tech"
                      target="_blank"
                      endIcon={<OpenInNewIcon />}
                    >
                      Open Neon Console
                    </Button>
                  </Stack>
                  {state.database.pooledUrl ? (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <AlertTitle>Database ready</AlertTitle>
                      Connection strings are set — suite / Add App wizards will prepopulate them.
                    </Alert>
                  ) : (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Not provisioned yet. Create will attempt Neon automatically if the API key is
                      configured; otherwise Add App will show a missing-database flight-check failure.
                    </Alert>
                  )}
                </Paper>
              ) : null}

              <Divider>
                <Typography variant="caption" color="text.secondary">
                  {state.database.mode === 'manual' ? 'Connection strings' : 'or review / edit strings'}
                </Typography>
              </Divider>

              <TextField
                label="Database URL (Pooled)"
                value={state.database.pooledUrl}
                onChange={(e) => {
                  const url = e.target.value;
                  setState((s) => ({
                    ...s,
                    database: {
                      ...s.database,
                      mode: s.database.mode === 'auto' && url ? s.database.mode : 'manual',
                      pooledUrl: url,
                      directUrl: s.database.directUrl || url.replace('-pooler', ''),
                    },
                  }));
                }}
                fullWidth
                multiline
                rows={2}
                placeholder="postgresql://user:pass@ep-xxx-pooler.neon.tech/db?sslmode=verify-full"
                slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
              />
              <TextField
                label="Direct URL (Unpooled)"
                value={state.database.directUrl}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    database: { ...s.database, directUrl: e.target.value },
                  }))
                }
                fullWidth
                multiline
                rows={2}
                slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
              />
              {dbProvisionError ? (
                <Alert severity="error" onClose={() => setDbProvisionError(null)}>
                  {dbProvisionError}
                </Alert>
              ) : null}
            </Stack>
          ) : null}

          {/* Step 5: AI Rate Card */}
          {step === 5 ? (
            <Stack spacing={2}>
              {rateCardPrefillApplied ? (
                <Alert severity="success">
                  Rate-card inputs were prefilled from the AI Credits Calculator.
                </Alert>
              ) : null}
              <TenantRateCardStep
                value={state.rateCard}
                suggestedAppCount={
                  state.templateMode === 'suite' && state.templates.length > 0
                    ? state.templates.length
                    : 1
                }
                onChange={(patch) =>
                  setState((s) => ({ ...s, rateCard: { ...s.rateCard, ...patch } }))
                }
              />
            </Stack>
          ) : null}

          {/* Step 6: AI Providers */}
          {step === 6 ? (
            <TenantAiProvidersConfigStep
              value={state.aiProviders}
              onChange={(aiProviders) => setState((s) => ({ ...s, aiProviders }))}
              tenantSlug={state.slug.trim() || undefined}
            />
          ) : null}

          {/* Step 7: Review */}
          {step === REVIEW_STEP ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Review your tenant configuration before creating. The AI pipeline will run automatically.
              </Typography>
              <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Slug</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{state.slug}.vercel.app</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Display Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{state.displayName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Mode</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {state.templateMode === 'suite' ? 'Multi-App Suite' : 'Single App'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {state.templateMode === 'suite' ? 'Templates' : 'Template'}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {state.templateMode === 'suite'
                        ? state.templates.map((tid) => getTemplate(tid).label).join(', ')
                        : `${selectedTemplate.label} — ${selectedTemplate.schemaOrgType}`}
                    </Typography>
                  </Box>
                  {state.logoBase64 ? (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Logo</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Avatar src={state.logoBase64} sx={{ width: 48, height: 48 }} variant="rounded" />
                      </Box>
                    </Box>
                  ) : null}
                  {state.prompt ? (
                    <Box>
                      <Typography variant="caption" color="text.secondary">AI Prompt</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', maxHeight: 80, overflow: 'auto' }}>
                        {state.prompt}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="caption" color="text.secondary">AI Prompt</Typography>
                      <Typography variant="body2" color="text.disabled">Not provided — using template defaults</Typography>
                    </Box>
                  )}
                  <Stack direction="row" sx={{ gap: 1 }}>
                    <Chip size="small" label={`Primary: ${state.primaryColor}`} sx={{ bgcolor: state.primaryColor, color: '#fff' }} />
                    <Chip size="small" label={`Secondary: ${state.secondaryColor}`} sx={{ bgcolor: state.secondaryColor, color: '#000' }} />
                  </Stack>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Database</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {state.database.pooledUrl
                        ? `✅ ${state.database.mode === 'manual' ? 'Manual URLs' : 'Provisioned'} — shared by all apps under this tenant`
                        : state.database.mode === 'auto'
                          ? '⏳ Auto-provision on Create (requires NEON_API_KEY)'
                          : '⚠️ No pooled URL — Add App will fail flight check'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">AI Rate Card</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {state.rateCard.appCount} apps · {state.rateCard.userCount} users · $
                      {state.rateCard.annualRevenueUsd.toLocaleString()} turnover · Mac Studio $
                      {state.rateCard.macStudioCostUsd.toLocaleString()} · $
                      {state.rateCard.monthlyThirdPartyUsd.toLocaleString()}/mo 3rd-party
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Social Wallet & Crypto Billing</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={state.web3WalletEnabled}
                          onChange={(e) =>
                            setState((s) => ({ ...s, web3WalletEnabled: e.target.checked }))
                          }
                        />
                      }
                      label={
                        state.web3WalletEnabled
                          ? 'Enabled — deploys NEXT_PUBLIC_WEB3_WALLET_ENABLED and NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED'
                          : 'Disabled — wallet and crypto top-ups hidden on this tenant'
                      }
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">AI Providers</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {state.aiProviders.catalog.length} provider(s) · active:{' '}
                      {state.aiProviders.catalog.find((p) => p.id === state.aiProviders.activeProviderId)?.label
                        ?? state.aiProviders.activeProviderId}
                      {state.aiProviders.activeModel ? ` / ${state.aiProviders.activeModel}` : ''}
                      {Object.values(state.aiProviders.apiKeysBySecretName).some((k) => k.trim())
                        ? ' · keys included'
                        : ' · no keys yet'}
                    </Typography>
                  </Box>
                  {scraped ? (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Scraped Data</Typography>
                      <Stack direction="row" sx={{ gap: 0.5, flexWrap: "wrap" }}>
                        {scraped.emails.length > 0 ? <Chip label={`📧 ${scraped.emails.length} emails`} size="small" /> : null}
                        {scraped.phoneNumbers.length > 0 ? <Chip label={`📞 ${scraped.phoneNumbers.length} phones`} size="small" /> : null}
                        {scraped.images.length > 0 ? <Chip label={`🖼️ ${scraped.images.length} images`} size="small" /> : null}
                        {scraped.address ? <Chip label={`📍 Address found`} size="small" /> : null}
                        {scraped.socialLinks.instagram ? <Chip label="📷 Instagram" size="small" /> : null}
                      </Stack>
                    </Box>
                  ) : null}
                </Stack>
              </Paper>

              {/* Suite Breakdown Table (only in suite mode) */}
              {state.templateMode === 'suite' && suiteApps.length > 0 ? (
                <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Suite Breakdown — {suiteApps.length} Department Apps + CEO Overview
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>App</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Department</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Template</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {suiteApps.map((app) => {
                          const tpl = getTemplate(app.templateId);
                          return (
                            <TableRow key={app.id}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{app.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{app.summary}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={app.department} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <Chip label={tpl.label} size="small" variant="outlined" color="info" />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>CEO Overview</Typography>
                            <Typography variant="caption" color="text.secondary">Cross-department KPI dashboard with actionable items.</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label="Executive" size="small" variant="outlined" color="success" />
                          </TableCell>
                          <TableCell>
                            <Chip label="Financial Analytics" size="small" variant="outlined" color="info" />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ) : null}

              <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                  Pipeline (runs automatically after creation):
                </Typography>
                <Stack spacing={0.5}>
                  {state.templateMode === 'suite' ? (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 20 }}>1.</Typography>
                        <Typography variant="body2">AI Decompose — generate {suiteApps.length} department app definitions</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 20 }}>2.</Typography>
                        <Typography variant="body2">Per-app: Schema Generation → DB Migrations → Seed → Deploy</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 20 }}>3.</Typography>
                        <Typography variant="body2">CEO Overview aggregation — cross-department KPIs</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 20 }}>4.</Typography>
                        <Typography variant="body2">Vercel Deployment — {suiteApps.length + 1} apps deployed</Typography>
                      </Box>
                    </>
                  ) : (
                    PIPELINE_STEPS.map((ps, idx) => (
                      <Box key={ps.key} sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 20 }}>{idx + 1}.</Typography>
                        <Typography variant="body2">{ps.label}</Typography>
                      </Box>
                    ))
                  )}
                </Stack>
              </Paper>
            </Stack>
          ) : null}
          {/* Success (after Create) */}
          {step === SUCCESS_STEP ? (
            <Stack spacing={2} sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 64, mx: 'auto' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Tenant Created!</Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>{state.displayName}</strong> has been created with the <strong>{selectedTemplate.label}</strong> template.
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>Pipeline Status:</Typography>
                <Stack spacing={1}>
                  {PIPELINE_STEPS.map((ps) => (
                    <Box key={ps.key} sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center' }}>
                      {isLoading ? <CircularProgress size={16} color="inherit" /> : isSuccess ? <CheckCircleIcon color="success" fontSize="small" /> : <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid', borderColor: 'divider' }} />}
                      <Typography variant="body2" color={isSuccess ? 'text.primary' : 'text.secondary'}>{ps.label}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
              {data?.data?.tenant ? (
                <Chip label={data.data.tenant.status === 'live' ? 'Live — Ready to use' : `Status: ${data.data.tenant.status}`} size="small" color={data.data.tenant.status === 'live' ? 'success' : 'warning'} />
              ) : null}
              <Stack direction="row" sx={{ gap: 1 }}>
                <Button variant="outlined" onClick={() => { setStep(0); setState(INITIAL_STATE); setScraped(null); setDbProvisionError(null); }}>Create Another</Button>
                <Button variant="contained" onClick={handleClose}>View Tenant List</Button>
                <Button variant="contained" color="secondary" component="a" href={`https://${state.slug}.vercel.app`} target="_blank" endIcon={<OpenInNewIcon />}>Open {state.slug}.vercel.app</Button>
              </Stack>
            </Stack>
          ) : null}

          {isError && error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {'data' in error ? (error.data as { error?: string })?.error ?? 'Creation failed' : 'Creation failed'}
            </Alert>
          ) : null}
        </DialogContent>

        {step < SUCCESS_STEP ? (
          <DialogActions>
            {step > 0 ? <Button onClick={handleBack} disabled={isLoading || provisioningDb}>Back</Button> : <Button onClick={handleClose} disabled={isLoading}>Cancel</Button>}
            <Box sx={{ flex: 1 }} />
            {step < REVIEW_STEP ? (
              <Button variant="contained" onClick={handleNext} disabled={provisioningDb}>Continue</Button>
            ) : (
              <Button variant="contained" color="primary" onClick={() => void handleCreate()} disabled={isLoading} startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}>
                {isLoading ? 'Generating...' : 'Create with AI'}
              </Button>
            )}
          </DialogActions>
        ) : null}
       </Dialog>
     </>
   );
 }

export interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  currentId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  onColorsChange?: (primary: string, secondary: string) => void;
  showPreviewDelta?: boolean;
}

/**
 * Reusable MUI v9 TemplateSelector with cards, preview delta (pages/nav/colors),
 * color pickers. Used in TenantWizard and TenantDashboard for edit/deploy.
 * WCAG compliant, keyboard accessible via CardActionArea.
 */
export function TemplateSelector({
  selectedId,
  onSelect,
  currentId,
  primaryColor,
  secondaryColor,
  onColorsChange,
  showPreviewDelta = false,
}: TemplateSelectorProps) {
  // Built-ins come from the compiled catalog; custom (AI-generated) templates —
  // including any built by the chat assistant's Custom Template Build tool —
  // exist only in the platform DB, so the merged list has to be fetched.
  // listTemplates() alone silently hides every custom template from the picker.
  // Falls back to the built-ins while the request is in flight or if it fails.
  const { data: templateData } = useListAllTemplatesQuery();
  const templates = templateData?.data?.templates ?? listTemplates();
  const selected = getTemplate(selectedId);
  const current = currentId ? getTemplate(currentId) : null;
  const hasDelta = showPreviewDelta && current && current.id !== selected.id;

  const handleColorChange = (type: 'primary' | 'secondary', value: string) => {
    if (onColorsChange) {
      const p = type === 'primary' ? value : (primaryColor ?? selected.defaultColors.primary);
      const s = type === 'secondary' ? value : (secondaryColor ?? selected.defaultColors.secondary);
      onColorsChange(p, s);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Template Selector
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cards show business-specific templates with schema.org alignment. Select to preview delta in pages, nav, and colors.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {templates.map((tpl) => {
          const isSelected = selectedId === tpl.id;
          const isCurrent = currentId === tpl.id;
          return (
            <Grid key={tpl.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  borderColor: isSelected
                    ? 'primary.main'
                    : isCurrent
                    ? 'success.main'
                    : 'divider',
                  borderWidth: isSelected || isCurrent ? 2 : 1,
                  bgcolor: isSelected ? 'rgba(235,61,40,0.06)' : undefined,
                  '&:hover': { boxShadow: 3 },
                }}
              >
                <CardActionArea
                  onClick={() => onSelect(tpl.id)}
                  sx={{ height: '100%', p: 0.5 }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {tpl.label}
                      </Typography>
                      {isSelected && <CheckCircleIcon color="primary" fontSize="small" />}
                      {isCurrent && !isSelected && (
                        <Chip label="CURRENT" size="small" color="success" />
                      )}
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 48 }}
                    >
                      {tpl.description.length > 90
                        ? `${tpl.description.substring(0, 87)}...`
                        : tpl.description}
                    </Typography>
                    <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap', minWidth: 0 }}>
                      <SchemaOrgTypeChips value={tpl.schemaOrgType} firstOnly />
                      <Chip label={`${tpl.defaultPages.length}p`} size="small" variant="outlined" />
                      <Chip
                        label={tpl.xsdStandard.split(',')[0]}
                        size="small"
                        variant="outlined"
                        sx={{
                          maxWidth: '100%',
                          height: 'auto',
                          '& .MuiChip-label': { whiteSpace: 'normal', wordBreak: 'break-word' },
                        }}
                      />
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Live Preview with Delta */}
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2, minWidth: 0 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 0, wordBreak: 'break-word' }}>
            Live Preview — {selected.label}
          </Typography>
          {hasDelta && (
            <Chip
              label="TEMPLATE CHANGE — DELTA DETECTED"
              color="warning"
              size="small"
              sx={{
                maxWidth: '100%',
                height: 'auto',
                '& .MuiChip-label': { whiteSpace: 'normal', wordBreak: 'break-word' },
              }}
            />
          )}
        </Stack>

        {/* Colors Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.5 }}>
            THEME COLORS (updates uiSlice theme on save if applicable)
          </Typography>
          <Stack direction="row" sx={{ gap: 4 }}>
            <Stack spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="caption">Primary</Typography>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: primaryColor || selected.defaultColors.primary,
                  border: '3px solid',
                  borderColor: 'background.paper',
                  boxShadow: 2,
                }}
              />
              {onColorsChange && (
                <>
                  <input
                    type="color"
                    value={primaryColor || selected.defaultColors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    style={{
                      width: '80px',
                      height: '32px',
                      padding: 0,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                    {primaryColor || selected.defaultColors.primary}
                  </Typography>
                </>
              )}
            </Stack>

            <Stack spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="caption">Secondary</Typography>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: secondaryColor || selected.defaultColors.secondary,
                  border: '3px solid',
                  borderColor: 'background.paper',
                  boxShadow: 2,
                }}
              />
              {onColorsChange && (
                <>
                  <input
                    type="color"
                    value={secondaryColor || selected.defaultColors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    style={{
                      width: '80px',
                      height: '32px',
                      padding: 0,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                    {secondaryColor || selected.defaultColors.secondary}
                  </Typography>
                </>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Pages and Nav */}
        <Stack spacing={3}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
              DEFAULT PAGES ({selected.defaultPages.length})
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
              {selected.defaultPages.map((p) => (
                <Chip key={p.slug} label={p.title} size="small" variant="outlined" />
              ))}
            </Stack>
            {hasDelta && current && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Delta: Replacing {current.defaultPages.length} pages with {selected.defaultPages.length} new ones (including financial-analytics compatibility for RedRubyBali).
              </Alert>
            )}
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
              NAVIGATION ({selected.defaultNavItems.length})
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
              {selected.defaultNavItems.slice(0, 6).map((item, index) => (
                <Chip
                  key={index}
                  label={item.title}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              ))}
              {selected.defaultNavItems.length > 6 && (
                <Chip label={`+${selected.defaultNavItems.length - 6}`} size="small" />
              )}
            </Stack>
            {hasDelta && current && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Nav delta: {selected.defaultNavItems.length - current.defaultNavItems.length} items
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}

