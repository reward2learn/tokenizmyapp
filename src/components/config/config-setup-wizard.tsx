'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ChatSettingsForm } from '@/components/config/chat-settings-form';
import { OpenAiKeyForm } from '@/components/config/openai-key-form';
import { AiProviderForm } from '@/components/config/ai-provider-form';
import { useGetAiProviderStatusQuery, useGetSeedDetailsQuery } from '@/store/apis/config-api';
import { getTemplate, type TemplateDefinition } from '@/domain/tenant/template-catalog';

const AiContentTab = dynamic(
  () => import('@/components/ops-admin/ai-content-tab').then((m) => ({ default: m.AiContentTab })),
  { ssr: false },
);
const SourceUploadForm = dynamic(
  () => import('@/components/config/source-upload-form').then((m) => ({ default: m.SourceUploadForm })),
  { ssr: false },
);
const DataViewTab = dynamic(
  () => import('@/components/config/data-view-tab').then((m) => ({ default: m.DataViewTab })),
  { ssr: false },
);

export interface ConfigWizardStepDef {
  id: string;
  label: string;
  /** Short guidance shown under the step title. */
  description: string;
  /** Optional — template-only steps. */
  templateOnly?: boolean;
}

const BASE_STEPS: ConfigWizardStepDef[] = [
  {
    id: 'ai-provider',
    label: 'AI Provider',
    description:
      'Choose and configure the AI provider used for content generation and chat. Do this first so later steps can call the model.',
  },
  {
    id: 'upload-seed',
    label: 'Upload & Seed',
    description:
      'Upload the Excel workbook (and optional Markdown). Seeding writes projections, sheet pages, and cache used by the rest of the pipeline.',
  },
  {
    id: 'review-data',
    label: 'Review Data',
    description:
      'Confirm what was seeded from the workbook — pages, projections, snippets — before generating narrative content.',
  },
  {
    id: 'generate-content',
    label: 'Generate Content',
    description:
      'Generate page content from the seeded workbook for Home, Dashboard, Summary, Review, Tasks, and sheet pages.',
  },
];

function TemplateConfigPlaceholder({ template }: { template: TemplateDefinition }) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {template.label} Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {template.description}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Template Pages:
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {template.defaultPages.map((p) => (
            <Chip key={p.slug} label={p.title} size="small" variant="outlined" />
          ))}
        </Stack>
        <Typography variant="caption" color="text.disabled">
          Template-specific options will appear here when available for this pack.
        </Typography>
      </Stack>
    </Paper>
  );
}

function parseStepParam(
  searchParams: URLSearchParams,
  stepCount: number,
): number {
  const stepRaw = searchParams.get('step') ?? searchParams.get('tab');
  if (!stepRaw) return 0;
  const n = parseInt(stepRaw, 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(Math.max(n, 0), stepCount - 1);
}

export function ConfigSetupWizard({
  tenantSlug,
}: {
  tenantSlug: string;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const template = getTemplate(tenantSlug === 'tokenizmyapp' ? 'default' : tenantSlug);
  const templateTabLabel =
    template.id === 'nightclub-bar'
      ? 'Nightclub Config'
      : template.id === 'restaurant'
        ? 'Restaurant Config'
        : template.id === 'hotel'
          ? 'Hotel Config'
          : null;

  const steps = useMemo((): ConfigWizardStepDef[] => {
    if (!templateTabLabel) return BASE_STEPS;
    return [
      ...BASE_STEPS,
      {
        id: 'template',
        label: templateTabLabel,
        description: `Optional ${template.label} pack settings after content is generated.`,
        templateOnly: true,
      },
    ];
  }, [template.label, templateTabLabel]);

  const [activeStep, setActiveStep] = useState(() => parseStepParam(searchParams, steps.length));

  useEffect(() => {
    setActiveStep(parseStepParam(searchParams, steps.length));
  }, [searchParams, steps.length]);

  const syncUrl = useCallback(
    (step: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('step', String(step));
      params.delete('tab');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const goToStep = useCallback(
    (step: number) => {
      const next = Math.min(Math.max(step, 0), steps.length - 1);
      setActiveStep(next);
      syncUrl(next);
    },
    [steps.length, syncUrl],
  );

  const { data: providerEnvelope } = useGetAiProviderStatusQuery();
  const { data: seedEnvelope } = useGetSeedDetailsQuery();

  const providerStatus = providerEnvelope?.data;
  // seed-details returns fields at the top level ({ success, counts, ... }), not under data.
  const seedPayload = seedEnvelope as unknown as
    | {
        success?: boolean;
        counts?: Record<string, number>;
        reviewPartDetails?: unknown[];
        executiveSummary?: string | null;
        snippetDetails?: { key: string }[];
      }
    | undefined;

  const aiConfigured = Boolean(
    providerStatus?.providers?.some(
      (p) => p.id === providerStatus.activeProviderId && p.configured,
    ) || providerStatus?.providers?.some((p) => p.configured),
  );

  const workbookSeeded = Boolean(
    seedPayload?.success &&
      ((seedPayload.counts?.knowledgeSnippets ?? 0) > 0 ||
        (seedPayload.counts?.appPages ?? 0) > 0 ||
        seedPayload.snippetDetails?.some((s) => s.key === 'workbook_data')),
  );

  const dataReviewedReady = workbookSeeded;

  const contentGenerated = Boolean(
    seedPayload?.success &&
      ((seedPayload.reviewPartDetails?.length ?? 0) > 0 ||
        Boolean(seedPayload.executiveSummary) ||
        seedPayload.snippetDetails?.some((s) => s.key === 'executive_summary')),
  );

  const stepCompleted = useMemo(
    () =>
      steps.map((s) => {
        switch (s.id) {
          case 'ai-provider':
            return aiConfigured;
          case 'upload-seed':
            return workbookSeeded;
          case 'review-data':
            return dataReviewedReady;
          case 'generate-content':
            return contentGenerated;
          case 'template':
            return contentGenerated;
          default:
            return false;
        }
      }),
    [aiConfigured, workbookSeeded, dataReviewedReady, contentGenerated, steps],
  );

  const current = steps[activeStep]!;
  const isLast = activeStep >= steps.length - 1;
  const isFirst = activeStep <= 0;

  return (
    <Stack spacing={3} data-testid="config-setup-wizard">
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Config setup
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Walk through each step in order: configure AI, upload and seed the workbook, review seeded
          data, then generate page content.
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
        >
          Template: <Chip label={template.label} size="small" variant="outlined" color="info" />
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stepper
          activeStep={activeStep}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          nonLinear
          sx={{
            ...(isMobile
              ? { '& .MuiStepConnector-root': { ml: 1.5 } }
              : { flexWrap: 'wrap', gap: 1 }),
          }}
        >
          {steps.map((step, index) => {
            const done = stepCompleted[index];
            return (
              <Step key={step.id} completed={done}>
                <StepButton
                  onClick={() => goToStep(index)}
                  optional={
                    done ? (
                      <Typography variant="caption" color="success.main">
                        Ready
                      </Typography>
                    ) : index === activeStep ? (
                      <Typography variant="caption" color="primary.main">
                        Current
                      </Typography>
                    ) : undefined
                  }
                >
                  <StepLabel
                    slots={
                      done
                        ? {
                            stepIcon: () => (
                              <CheckCircleIcon color="success" sx={{ fontSize: 22 }} />
                            ),
                          }
                        : undefined
                    }
                  >
                    {step.label}
                  </StepLabel>
                </StepButton>
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Step {activeStep + 1} of {steps.length}: {current.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {current.description}
            </Typography>
          </Box>

          {activeStep === 1 && !aiConfigured ? (
            <Alert severity="warning">
              AI provider is not configured yet. You can still upload and seed, but Generate Content
              will need a provider — go back to step 1 when ready.
            </Alert>
          ) : null}
          {activeStep === 2 && !workbookSeeded ? (
            <Alert severity="info">
              No seeded workbook inventory detected yet. Complete Upload &amp; Seed first, then refresh
              this step.
            </Alert>
          ) : null}
          {activeStep === 3 && !workbookSeeded ? (
            <Alert severity="warning">
              Generate Content needs a seeded workbook. Finish Upload &amp; Seed (and Review Data)
              before generating.
            </Alert>
          ) : null}

          {current.id === 'ai-provider' ? (
            <Stack spacing={3}>
              <AiProviderForm />
              <OpenAiKeyForm />
              <ChatSettingsForm />
            </Stack>
          ) : null}

          {current.id === 'upload-seed' ? <SourceUploadForm /> : null}

          {current.id === 'review-data' ? <DataViewTab /> : null}

          {current.id === 'generate-content' ? <AiContentTab /> : null}

          {current.id === 'template' ? <TemplateConfigPlaceholder template={template} /> : null}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'space-between', pt: 1, borderTop: 1, borderColor: 'divider' }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              disabled={isFirst}
              onClick={() => goToStep(activeStep - 1)}
            >
              Back
            </Button>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              {!isLast ? (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => goToStep(activeStep + 1)}
                >
                  Continue to {steps[activeStep + 1]?.label}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => goToStep(0)}
                  startIcon={<CheckCircleIcon />}
                >
                  Back to start
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
