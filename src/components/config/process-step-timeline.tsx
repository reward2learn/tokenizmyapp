'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export type StepState = 'pending' | 'active' | 'completed' | 'error';

export interface ProcessStepDef {
  key: string;
  label: string;
}

export interface ProcessStepTimelineProps {
  steps: ProcessStepDef[];
  /** Current step key from the backend (or local tracker). */
  currentStep: string | null;
  /** Live message for the active step. */
  activeMessage?: string | null;
  /** When true, mark all steps completed. */
  complete?: boolean;
  /** When true, mark the current step as error. */
  errored?: boolean;
}

function resolveState(
  stepKey: string,
  stepIndex: number,
  currentKey: string | null,
  indexByKey: Record<string, number>,
  complete: boolean,
  errored: boolean,
): StepState {
  if (complete) return 'completed';
  if (!currentKey) return 'pending';
  if (errored) {
    return stepKey === currentKey ? 'error' : stepIndex < (indexByKey[currentKey] ?? -1) ? 'completed' : 'pending';
  }
  const currentIdx = indexByKey[currentKey] ?? -1;
  if (stepIndex < currentIdx) return 'completed';
  if (stepIndex === currentIdx) return 'active';
  return 'pending';
}

/**
 * Shared vertical step timeline used by Config > Source (upload/reseed)
 * and Ops Admin > AI Content. Keeps progress UX consistent across pipelines.
 */
export function ProcessStepTimeline({
  steps,
  currentStep,
  activeMessage,
  complete = false,
  errored = false,
}: ProcessStepTimelineProps) {
  const indexByKey: Record<string, number> = {};
  steps.forEach((s, i) => {
    indexByKey[s.key] = i;
  });

  return (
    <Stack spacing={1} data-testid="process-step-timeline">
      {steps.map((step, idx) => {
        const state = resolveState(step.key, idx, currentStep, indexByKey, complete, errored);
        return (
          <Stack
            key={step.key}
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', opacity: state === 'pending' ? 0.45 : 1 }}
          >
            {state === 'completed' ? (
              <CheckCircleIcon fontSize="small" color="success" sx={{ flexShrink: 0 }} />
            ) : state === 'active' ? (
              <CircularProgress size={18} sx={{ flexShrink: 0 }} />
            ) : state === 'error' ? (
              <WarningAmberIcon fontSize="small" color="error" sx={{ flexShrink: 0 }} />
            ) : (
              <RadioButtonUncheckedIcon fontSize="small" color="disabled" sx={{ flexShrink: 0 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: state === 'active' ? 700 : 400,
                color:
                  state === 'active'
                    ? 'primary.main'
                    : state === 'completed'
                      ? 'success.main'
                      : state === 'error'
                        ? 'error.main'
                        : 'text.secondary',
              }}
            >
              {step.label}
            </Typography>
            {state === 'active' && activeMessage ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {activeMessage}
              </Typography>
            ) : null}
          </Stack>
        );
      })}
    </Stack>
  );
}

/** Steps emitted by workflows/workbook-ingest (SSE ProgressChunk.step). */
export const RESEED_WORKFLOW_STEPS: ProcessStepDef[] = [
  { key: 'started', label: 'Starting ingest workflow' },
  { key: 'loading', label: 'Loading workbook file(s)' },
  { key: 'extracting', label: 'Extracting individual sheets' },
  { key: 'analyzing', label: 'Analyzing sheet structure' },
  { key: 'formula-map', label: 'Mapping formulas to sheet data' },
  { key: 'comprehending', label: 'AI workbook comprehension' },
  { key: 'populating', label: 'Populating projections & sheet pages' },
  { key: 'generating', label: 'Generating review / summary / dashboard' },
  { key: 'complete', label: 'Complete' },
];

/** Local phases while the sync seed half of Upload & Reseed runs (before SSE). */
export const RESEED_SYNC_STEPS: ProcessStepDef[] = [
  { key: 'uploading', label: 'Uploading source files' },
  { key: 'seeding', label: 'Seeding database from sources' },
  { key: 'accepted', label: 'Handing off to workbook ingest' },
];
