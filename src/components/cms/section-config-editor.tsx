'use client';

import { useMemo, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { HeroConfigEditor } from '@/components/cms/hero-config-editor';
import { CmsAiTextField } from '@/components/cms/cms-ai-text-field';
import { AiGenerateFieldButton } from '@/components/cms/ai-field-generate-button';
import { AiGenerateDashboardSliceButton } from '@/components/cms/ai-dashboard-slice-generate-button';
import { CmsEditorProvider } from '@/components/cms/cms-editor-context';
import { hydrateBlockConfigForEdit } from '@/lib/hydrate-block-config';
import type { CmsFieldValueType } from '@/lib/cms-block-field-catalog';
import { BLOCK_TO_DASHBOARD_SLICE, type DashboardSliceKey } from '@/lib/dashboard-slices';
import { useGetCmsSourcesQuery } from '@/store/apis/admin-api';
import { useGetDashboardDataQuery } from '@/store/apis/dashboard-api';

function str(config: Record<string, unknown>, key: string): string {
  const v = config[key];
  return typeof v === 'string' ? v : '';
}

function setStr(config: Record<string, unknown>, key: string, value: string): Record<string, unknown> {
  return { ...config, [key]: value };
}

function faqItemsToText(config: Record<string, unknown>): string {
  const items = Array.isArray(config.items) ? config.items : [];
  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return '';
      const row = item as Record<string, unknown>;
      return `Q: ${row.question ?? ''}\nA: ${row.answer ?? ''}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

function textToFaqItems(text: string): Array<{ question: string; answer: string }> {
  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.trim().split('\n');
      const qLine = lines.find((l) => /^Q:\s*/i.test(l)) ?? '';
      const aLines = lines.filter((l) => !/^Q:\s*/i.test(l));
      const answer = aLines
        .map((l) => l.replace(/^A:\s*/i, ''))
        .join('\n')
        .trim();
      return {
        question: qLine.replace(/^Q:\s*/i, '').trim(),
        answer,
      };
    })
    .filter((i) => i.question || i.answer);
}

function showcaseItemsToText(config: Record<string, unknown>): string {
  const items = Array.isArray(config.items) ? config.items : [];
  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return '';
      const row = item as Record<string, unknown>;
      return `${row.title ?? ''}\n${row.body ?? ''}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

function textToShowcaseItems(text: string): Array<{ title: string; body: string }> {
  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const [title, ...rest] = block.trim().split('\n');
      return { title: (title ?? '').trim(), body: rest.join('\n').trim() };
    })
    .filter((i) => i.title || i.body);
}

export interface SectionConfigEditorProps {
  blockType: string;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  readOnly?: boolean;
  pageSlug?: string;
  pageTitle?: string;
  tenantSlug?: string;
  appId?: string;
}

function CmsAiFieldRow({
  fieldKey,
  fieldType,
  currentValue,
  readOnly,
  onGenerated,
  children,
}: {
  fieldKey: string;
  fieldType?: CmsFieldValueType;
  currentValue?: unknown;
  readOnly?: boolean;
  onGenerated: (value: unknown) => void;
  children: ReactNode;
}) {
  return (
    <Stack spacing={0.5}>
      {!readOnly ? (
        <Stack component="div" direction="row" sx={{ justifyContent: 'flex-end' }}>
          <AiGenerateFieldButton
            fieldKey={fieldKey}
            fieldType={fieldType}
            currentValue={currentValue}
            onGenerated={onGenerated}
          />
        </Stack>
      ) : null}
      {children}
    </Stack>
  );
}

function wrapWithCmsContext(
  node: ReactNode,
  opts: {
    pageSlug?: string;
    pageTitle?: string;
    blockType: string;
    config: Record<string, unknown>;
    tenantSlug?: string;
    appId?: string;
  },
) {
  if (!opts.pageSlug || !opts.pageTitle) return node;
  return (
    <CmsEditorProvider
      value={{
        pageSlug: opts.pageSlug,
        pageTitle: opts.pageTitle,
        blockType: opts.blockType,
        config: opts.config,
        tenantSlug: opts.tenantSlug,
        appId: opts.appId,
      }}
    >
      {node}
    </CmsEditorProvider>
  );
}

export function SectionConfigEditor({
  blockType,
  config,
  onChange,
  readOnly = false,
  pageSlug,
  pageTitle,
  tenantSlug,
  appId,
}: SectionConfigEditorProps) {
  const displayConfig = useMemo(
    () => hydrateBlockConfigForEdit(blockType, config),
    [blockType, config],
  );

  const ctxWrap = (node: React.ReactNode) =>
    wrapWithCmsContext(node, {
      pageSlug,
      pageTitle,
      blockType,
      config: displayConfig,
      tenantSlug,
      appId,
    });

  if (blockType === 'hero') {
    return ctxWrap(
      <HeroConfigEditor config={displayConfig} onChange={onChange} readOnly={readOnly} />,
    );
  }

  if (
    blockType === 'marketing_hero' ||
    blockType === 'cta_banner' ||
    blockType === 'pricing_table' ||
    blockType === 'customer_proof' ||
    blockType === 'testimonials' ||
    blockType === 'capability_marquee'
  ) {
    const headlineKey = blockType === 'marketing_hero' ? 'headline' : 'heading';
    const subKey = blockType === 'marketing_hero' ? 'subheadline' : 'subheading';

    return ctxWrap(
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <CmsAiTextField
            label={headlineKey}
            fieldKey={headlineKey}
            size="small"
            fullWidth
            value={str(displayConfig, headlineKey)}
            onChange={(v) => onChange(setStr(config, headlineKey, v))}
            readOnly={readOnly}
          />
          <CmsAiTextField
            label={subKey}
            fieldKey={subKey}
            fieldType="multiline"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={str(displayConfig, subKey)}
            onChange={(v) => onChange(setStr(config, subKey, v))}
            readOnly={readOnly}
          />
          {blockType === 'marketing_hero' && (
            <>
              <CmsAiFieldRow
                fieldKey="audiences"
                fieldType="string_array"
                currentValue={displayConfig.audiences}
                readOnly={readOnly}
                onGenerated={(v) => {
                  if (Array.isArray(v)) {
                    onChange({ ...config, audiences: v.filter((x): x is string => typeof x === 'string') });
                  }
                }}
              >
                <TextField
                  label="audiences (comma-separated)"
                  size="small"
                  fullWidth
                  value={Array.isArray(displayConfig.audiences) ? (displayConfig.audiences as string[]).join(', ') : ''}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      audiences: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </CmsAiFieldRow>
              <CmsAiFieldRow
                fieldKey="quickStarts"
                fieldType="string_array"
                currentValue={displayConfig.quickStarts}
                readOnly={readOnly}
                onGenerated={(v) => {
                  if (Array.isArray(v)) {
                    onChange({ ...config, quickStarts: v.filter((x): x is string => typeof x === 'string') });
                  }
                }}
              >
                <TextField
                  label="quickStarts (comma-separated)"
                  size="small"
                  fullWidth
                  value={Array.isArray(displayConfig.quickStarts) ? (displayConfig.quickStarts as string[]).join(', ') : ''}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      quickStarts: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </CmsAiFieldRow>
              <CmsAiTextField
                label="placeholder"
                fieldKey="placeholder"
                size="small"
                fullWidth
                value={str(displayConfig, 'placeholder')}
                onChange={(v) => onChange(setStr(config, 'placeholder', v))}
                readOnly={readOnly}
              />
              <CmsAiTextField
                label="ctaLabel"
                fieldKey="ctaLabel"
                size="small"
                fullWidth
                value={str(displayConfig, 'ctaLabel')}
                onChange={(v) => onChange(setStr(config, 'ctaLabel', v))}
                readOnly={readOnly}
              />
              <CmsAiTextField
                label="ctaHref"
                fieldKey="ctaHref"
                fieldType="url"
                size="small"
                fullWidth
                value={str(displayConfig, 'ctaHref')}
                onChange={(v) => onChange(setStr(config, 'ctaHref', v))}
                readOnly={readOnly}
              />
            </>
          )}
          {blockType === 'pricing_table' && (
            <>
              <CmsAiTextField
                label="ctaHref"
                fieldKey="ctaHref"
                fieldType="url"
                size="small"
                fullWidth
                value={str(displayConfig, 'ctaHref')}
                onChange={(v) => onChange(setStr(config, 'ctaHref', v))}
                readOnly={readOnly}
              />
              <CmsAiTextField
                label="highlightPlanId"
                fieldKey="highlightPlanId"
                size="small"
                fullWidth
                value={str(displayConfig, 'highlightPlanId')}
                onChange={(v) => onChange(setStr(config, 'highlightPlanId', v))}
                helperText="Plan id to mark as Most popular (e.g. business)"
                readOnly={readOnly}
              />
            </>
          )}
          {blockType === 'cta_banner' && (
            <>
              <CmsAiTextField
                label="ctaLabel"
                fieldKey="ctaLabel"
                size="small"
                fullWidth
                value={str(displayConfig, 'ctaLabel')}
                onChange={(v) => onChange(setStr(config, 'ctaLabel', v))}
                readOnly={readOnly}
              />
              <CmsAiTextField
                label="ctaHref"
                fieldKey="ctaHref"
                fieldType="url"
                size="small"
                fullWidth
                value={str(displayConfig, 'ctaHref')}
                onChange={(v) => onChange(setStr(config, 'ctaHref', v))}
                readOnly={readOnly}
              />
            </>
          )}
          {blockType === 'capability_marquee' && (
            <CmsAiFieldRow
              fieldKey="rows"
              fieldType="json_rows"
              currentValue={displayConfig.rows}
              readOnly={readOnly}
              onGenerated={(v) => onChange({ ...config, rows: v })}
            >
              <TextField
                label="rows (JSON array of string arrays)"
                size="small"
                fullWidth
                multiline
                minRows={4}
                value={JSON.stringify(displayConfig.rows ?? [], null, 2)}
                onChange={(e) => {
                  try {
                    onChange({ ...config, rows: JSON.parse(e.target.value) as unknown });
                  } catch {
                    /* keep typing invalid JSON */
                  }
                }}
              />
            </CmsAiFieldRow>
          )}
        </Stack>
      </Box>,
    );
  }

  if (blockType === 'faq') {
    return ctxWrap(
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <CmsAiTextField
            label="heading"
            fieldKey="heading"
            size="small"
            fullWidth
            value={str(displayConfig, 'heading')}
            onChange={(v) => onChange(setStr(config, 'heading', v))}
            readOnly={readOnly}
          />
          <CmsAiFieldRow
            fieldKey="items"
            fieldType="faq_items"
            currentValue={displayConfig.items}
            readOnly={readOnly}
            onGenerated={(v) => onChange({ ...config, items: v })}
          >
            <TextField
              label="FAQ items (blocks of Q: / A:)"
              size="small"
              fullWidth
              multiline
              minRows={8}
              value={faqItemsToText(displayConfig)}
              onChange={(e) => onChange({ ...config, items: textToFaqItems(e.target.value) })}
              helperText="Separate Q&A pairs with a blank line. Start lines with Q: and A:."
            />
          </CmsAiFieldRow>
        </Stack>
      </Box>,
    );
  }

  if (blockType === 'product_showcase') {
    return ctxWrap(
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <CmsAiTextField
            label="heading"
            fieldKey="heading"
            size="small"
            fullWidth
            value={str(displayConfig, 'heading')}
            onChange={(v) => onChange(setStr(config, 'heading', v))}
            readOnly={readOnly}
          />
          <CmsAiTextField
            label="subheading"
            fieldKey="subheading"
            fieldType="multiline"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={str(displayConfig, 'subheading')}
            onChange={(v) => onChange(setStr(config, 'subheading', v))}
            readOnly={readOnly}
          />
          <CmsAiFieldRow
            fieldKey="items"
            fieldType="showcase_items"
            currentValue={displayConfig.items}
            readOnly={readOnly}
            onGenerated={(v) => onChange({ ...config, items: v })}
          >
            <TextField
              label="items (title then body, blank line between)"
              size="small"
              fullWidth
              multiline
              minRows={8}
              value={showcaseItemsToText(displayConfig)}
              onChange={(e) => onChange({ ...config, items: textToShowcaseItems(e.target.value) })}
            />
          </CmsAiFieldRow>
        </Stack>
      </Box>,
    );
  }

  if (blockType === 'feature_grid') {
    return ctxWrap(
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <CmsAiTextField
            label="heading"
            fieldKey="heading"
            size="small"
            fullWidth
            value={str(displayConfig, 'heading')}
            onChange={(v) => onChange(setStr(config, 'heading', v))}
            readOnly={readOnly}
          />
          <CmsAiTextField
            label="subheading"
            fieldKey="subheading"
            fieldType="multiline"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={str(displayConfig, 'subheading')}
            onChange={(v) => onChange(setStr(config, 'subheading', v))}
            readOnly={readOnly}
          />
        </Stack>
      </Box>,
    );
  }

  if (blockType === 'lever_accordion') {
    return ctxWrap(
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <CmsAiTextField
            label="title"
            fieldKey="title"
            size="small"
            fullWidth
            value={str(displayConfig, 'title')}
            onChange={(v) => onChange(setStr(config, 'title', v))}
            readOnly={readOnly}
          />
          <CmsAiTextField
            label="subheading"
            fieldKey="subheading"
            fieldType="multiline"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={str(displayConfig, 'subheading')}
            onChange={(v) => onChange(setStr(config, 'subheading', v))}
            readOnly={readOnly}
          />
          <DashboardSliceContentPanel
            slice="levers"
            readOnly={readOnly}
            emptyHint="No levers loaded yet. Regenerate from the workbook or run Generate Content."
          />
        </Stack>
      </Box>,
    );
  }

  if (blockType === 'action_checklist') {
    return ctxWrap(
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <CmsAiTextField
            label="heading"
            fieldKey="heading"
            size="small"
            fullWidth
            value={str(displayConfig, 'heading')}
            onChange={(v) => onChange(setStr(config, 'heading', v))}
            readOnly={readOnly}
          />
          <CmsAiTextField
            label="subheading"
            fieldKey="subheading"
            fieldType="multiline"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={str(displayConfig, 'subheading')}
            onChange={(v) => onChange(setStr(config, 'subheading', v))}
            readOnly={readOnly}
          />
          <DashboardSliceContentPanel
            slice="actionPhases"
            readOnly={readOnly}
            emptyHint="No action plan loaded yet. Regenerate from the workbook or run Generate Content."
          />
        </Stack>
      </Box>,
    );
  }

  if (blockType === 'doc_markdown') {
    return ctxWrap(
      <DocMarkdownConfigEditor config={displayConfig} onChange={onChange} readOnly={readOnly} />,
    );
  }

  if (blockType === 'sheet_viewer') {
    return ctxWrap(
      <SheetViewerConfigEditor config={displayConfig} onChange={onChange} readOnly={readOnly} />,
    );
  }

  if (blockType === 'pack_table') {
    return ctxWrap(
      <PackTableConfigEditor config={displayConfig} onChange={onChange} readOnly={readOnly} />,
    );
  }

  if (blockType === 'chat_panel') {
    return ctxWrap(
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <CmsAiTextField
            label="emptyStatePrompt"
            fieldKey="emptyStatePrompt"
            fieldType="multiline"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={str(displayConfig, 'emptyStatePrompt')}
            onChange={(v) => onChange(setStr(config, 'emptyStatePrompt', v))}
            readOnly={readOnly}
          />
          <CmsAiFieldRow
            fieldKey="suggestedPrompts"
            fieldType="string_array"
            currentValue={displayConfig.suggestedPrompts}
            readOnly={readOnly}
            onGenerated={(v) => {
              if (Array.isArray(v)) {
                onChange({
                  ...config,
                  suggestedPrompts: v
                    .filter((x): x is string => typeof x === 'string')
                    .slice(0, 5),
                });
              }
            }}
          >
            <TextField
              label="suggestedPrompts (one per line)"
              size="small"
              fullWidth
              multiline
              minRows={4}
              value={
                Array.isArray(displayConfig.suggestedPrompts)
                  ? (displayConfig.suggestedPrompts as string[]).join('\n')
                  : ''
              }
              onChange={(e) =>
                onChange({
                  ...config,
                  suggestedPrompts: e.target.value
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .slice(0, 5),
                })
              }
            />
          </CmsAiFieldRow>
        </Stack>
      </Box>,
    );
  }

  if (blockType === 'chart_financial') {
    return ctxWrap(
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <Stack component="div" direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="chart-scenario">scenario</InputLabel>
              <Select
                labelId="chart-scenario"
                label="scenario"
                value={str(displayConfig, 'scenario') || 'conservative'}
                onChange={(e) => onChange(setStr(config, 'scenario', e.target.value))}
              >
                {['conservative', 'realistic', 'aspirational', 'actual'].map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!readOnly ? (
              <AiGenerateFieldButton
                fieldKey="scenario"
                fieldType="enum"
                currentValue={str(displayConfig, 'scenario') || 'conservative'}
                onGenerated={(v) => {
                  if (typeof v === 'string') onChange(setStr(config, 'scenario', v));
                }}
              />
            ) : null}
          </Stack>
          <Stack component="div" direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="chart-variant">variant</InputLabel>
              <Select
                labelId="chart-variant"
                label="variant"
                value={str(displayConfig, 'variant') || 'dashboard'}
                onChange={(e) => onChange(setStr(config, 'variant', e.target.value))}
              >
                <MenuItem value="dashboard">dashboard</MenuItem>
                <MenuItem value="ops">ops</MenuItem>
              </Select>
            </FormControl>
            {!readOnly ? (
              <AiGenerateFieldButton
                fieldKey="variant"
                fieldType="enum"
                currentValue={str(displayConfig, 'variant') || 'dashboard'}
                onGenerated={(v) => {
                  if (typeof v === 'string') onChange(setStr(config, 'variant', v));
                }}
              />
            ) : null}
          </Stack>
          <CmsAiTextField
            label="height (px)"
            fieldKey="height"
            size="small"
            type="number"
            fullWidth
            value={typeof displayConfig.height === 'number' ? String(displayConfig.height) : ''}
            onChange={(v) =>
              onChange({
                ...config,
                height: v ? Number(v) : undefined,
              })
            }
            readOnly={readOnly}
          />
        </Stack>
      </Box>,
    );
  }

  if (blockType === 'kpi_cards' || blockType === 'pnl_table') {
    return ctxWrap(
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <CmsAiTextField
            label="period"
            fieldKey="period"
            size="small"
            fullWidth
            value={str(displayConfig, 'period')}
            onChange={(v) => onChange(setStr(config, 'period', v))}
            placeholder="e.g. 2025-01"
            readOnly={readOnly}
          />
          {blockType === 'kpi_cards' && (
            <Stack component="div" direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="kpi-variant">variant</InputLabel>
                <Select
                  labelId="kpi-variant"
                  label="variant"
                  value={str(displayConfig, 'variant') || 'dashboard'}
                  onChange={(e) => onChange(setStr(config, 'variant', e.target.value))}
                >
                  <MenuItem value="dashboard">dashboard</MenuItem>
                  <MenuItem value="ops">ops</MenuItem>
                </Select>
              </FormControl>
              {!readOnly ? (
                <AiGenerateFieldButton
                  fieldKey="variant"
                  fieldType="enum"
                  currentValue={str(displayConfig, 'variant') || 'dashboard'}
                  onGenerated={(v) => {
                    if (typeof v === 'string') onChange(setStr(config, 'variant', v));
                  }}
                />
              ) : null}
            </Stack>
          )}
        </Stack>
      </Box>,
    );
  }

  if (blockType === 'metric_grid') {
    return ctxWrap(
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <CmsAiTextField
            label="heading"
            fieldKey="heading"
            size="small"
            fullWidth
            value={str(displayConfig, 'heading')}
            onChange={(v) => onChange(setStr(config, 'heading', v))}
            readOnly={readOnly}
          />
          <CmsAiTextField
            label="subheading"
            fieldKey="subheading"
            fieldType="multiline"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={str(displayConfig, 'subheading')}
            onChange={(v) => onChange(setStr(config, 'subheading', v))}
            readOnly={readOnly}
          />
          <DashboardSliceContentPanel
            slice="targetRows"
            readOnly={readOnly}
            emptyHint="No target rows loaded yet. Regenerate from the workbook or run Generate Content."
          />
          <CmsAiFieldRow
            fieldKey="scenarios"
            fieldType="json_rows"
            currentValue={displayConfig.scenarios}
            readOnly={readOnly}
            onGenerated={(v) => onChange({ ...config, scenarios: v })}
          >
            <TextField
              label="scenarios (JSON, optional override)"
              size="small"
              fullWidth
              multiline
              minRows={4}
              value={JSON.stringify(displayConfig.scenarios ?? [], null, 2)}
              onChange={(e) => {
                try {
                  onChange({ ...config, scenarios: JSON.parse(e.target.value) as unknown });
                } catch {
                  /* keep typing */
                }
              }}
              helperText='Optional. Live block prefers dashboard_data.targetRows when present.'
            />
          </CmsAiFieldRow>
        </Stack>
      </Box>,
    );
  }

  const dashboardSlice = BLOCK_TO_DASHBOARD_SLICE[blockType];
  if (dashboardSlice) {
    return ctxWrap(
      <DashboardSliceContentPanel
        slice={dashboardSlice}
        readOnly={readOnly}
        emptyHint="No dashboard content for this block yet."
      />,
    );
  }

  return ctxWrap(
    <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          This block has no authored CMS copy fields. Animation and access tier live in the JSON
          below; operational content is managed elsewhere (forms, admin tools, or Generate Content).
        </Typography>
        <TextField
          label="config (JSON)"
          size="small"
          fullWidth
          multiline
          minRows={6}
          value={JSON.stringify(displayConfig, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value) as Record<string, unknown>);
            } catch {
              /* ignore while typing */
            }
          }}
        />
      </Stack>
    </Box>,
  );
}

function DashboardSliceContentPanel({
  slice,
  readOnly,
  emptyHint,
}: {
  slice: DashboardSliceKey;
  readOnly?: boolean;
  emptyHint: string;
}) {
  const { data, isLoading, isFetching } = useGetDashboardDataQuery();
  const sliceValue =
    slice === 'actionPhases'
      ? data?.data?.actionPhases
      : slice === 'levers'
        ? data?.data?.levers
        : data?.data?.targetRows;

  const preview =
    Array.isArray(sliceValue) && sliceValue.length > 0
      ? JSON.stringify(sliceValue, null, 2)
      : '';

  return (
    <Stack spacing={1}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Typography variant="subtitle2">
          Content ({slice})
          {(isLoading || isFetching) && (
            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              loading…
            </Typography>
          )}
        </Typography>
        {!readOnly ? (
          <AiGenerateDashboardSliceButton slice={slice} currentValue={sliceValue} />
        ) : null}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Stored in knowledge_snippets.dashboard_data — not in this block&apos;s config JSON. Use
        Generate with AI to refresh from the uploaded workbook, or edit via Admin → Generate Content.
      </Typography>
      {preview ? (
        <TextField
          label={`current ${slice}`}
          size="small"
          fullWidth
          multiline
          minRows={8}
          value={preview}
          slotProps={{ input: { readOnly: true } }}
          helperText="Read-only preview. Regenerate with AI to replace."
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          {emptyHint}
        </Typography>
      )}
    </Stack>
  );
}

function DocMarkdownConfigEditor({
  config,
  onChange,
  readOnly,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  readOnly?: boolean;
}) {
  const { data } = useGetCmsSourcesQuery();
  const sources = data?.data?.docSources ?? [];
  const current = str(config, 'source');

  return (
    <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
      <Stack spacing={1.5}>
        <FormControl size="small" fullWidth>
          <InputLabel id="doc-source">content source</InputLabel>
          <Select
            labelId="doc-source"
            label="content source"
            value={sources.includes(current) ? current : ''}
            onChange={(e) => onChange(setStr(config, 'source', e.target.value))}
          >
            <MenuItem value="">
              <em>Custom (type below)</em>
            </MenuItem>
            {sources.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <CmsAiTextField
          label="source"
          fieldKey="source"
          size="small"
          fullWidth
          value={current}
          onChange={(v) => onChange(setStr(config, 'source', v))}
          helperText="Snippet key or alias (e.g. executive-summary)"
          readOnly={readOnly}
        />
        <CmsAiTextField
          label="title"
          fieldKey="title"
          size="small"
          fullWidth
          value={str(config, 'title')}
          onChange={(v) => onChange(setStr(config, 'title', v))}
          readOnly={readOnly}
        />
        <CmsAiTextField
          label="markdown (inline override)"
          fieldKey="markdown"
          fieldType="markdown"
          size="small"
          fullWidth
          multiline
          minRows={6}
          value={str(config, 'markdown')}
          onChange={(v) => onChange(setStr(config, 'markdown', v))}
          helperText="Optional — overrides fetched snippet content"
          readOnly={readOnly}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={config.aiRegenerate === true}
              onChange={(e) => onChange({ ...config, aiRegenerate: e.target.checked })}
              disabled={readOnly}
            />
          }
          label="AI regenerate placeholder"
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
          When enabled, Generate Content uses this section&apos;s markdown as a structure template and
          writes fresh copy back here on the next AI run.
        </Typography>
      </Stack>
    </Box>
  );
}

function SheetViewerConfigEditor({
  config,
  onChange,
  readOnly,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  readOnly?: boolean;
}) {
  const { data } = useGetCmsSourcesQuery();
  const sheets = data?.data?.workbookSheets ?? [];
  const current = str(config, 'sheet');

  return (
    <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
      <Stack spacing={1.5}>
        <FormControl size="small" fullWidth>
          <InputLabel id="sheet-name">workbook sheet</InputLabel>
          <Select
            labelId="sheet-name"
            label="workbook sheet"
            value={sheets.includes(current) ? current : ''}
            onChange={(e) => onChange(setStr(config, 'sheet', e.target.value))}
          >
            <MenuItem value="">
              <em>Custom (type below)</em>
            </MenuItem>
            {sheets.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <CmsAiTextField
          label="sheet"
          fieldKey="sheet"
          size="small"
          fullWidth
          value={current}
          onChange={(v) => onChange(setStr(config, 'sheet', v))}
          helperText="Excel tab name from uploaded workbook"
          readOnly={readOnly}
        />
        <CmsAiTextField
          label="title"
          fieldKey="title"
          size="small"
          fullWidth
          value={str(config, 'title')}
          onChange={(v) => onChange(setStr(config, 'title', v))}
          readOnly={readOnly}
        />
        <TextField
          label="columns (comma-separated, optional)"
          size="small"
          fullWidth
          value={Array.isArray(config.columns) ? (config.columns as string[]).join(', ') : ''}
          onChange={(e) =>
            onChange({
              ...config,
              columns: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </Stack>
    </Box>
  );
}

function PackTableConfigEditor({
  config,
  onChange,
  readOnly,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  readOnly?: boolean;
}) {
  const { data } = useGetCmsSourcesQuery();
  const tables = data?.data?.packTables ?? [];
  const current = str(config, 'table');

  return (
    <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
      <Stack spacing={1.5}>
        <FormControl size="small" fullWidth>
          <InputLabel id="pack-table">data table</InputLabel>
          <Select
            labelId="pack-table"
            label="data table"
            value={tables.includes(current) ? current : ''}
            onChange={(e) => onChange(setStr(config, 'table', e.target.value))}
          >
            <MenuItem value="">
              <em>Custom (type below)</em>
            </MenuItem>
            {tables.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <CmsAiTextField
          label="table"
          fieldKey="table"
          size="small"
          fullWidth
          required
          value={current}
          onChange={(v) => onChange(setStr(config, 'table', v))}
          helperText="Pack table name (app-pack model tableName)"
          readOnly={readOnly}
        />
        <CmsAiTextField
          label="title"
          fieldKey="title"
          size="small"
          fullWidth
          value={str(config, 'title')}
          onChange={(v) => onChange(setStr(config, 'title', v))}
          readOnly={readOnly}
        />
        <TextField
          label="pageSize"
          size="small"
          type="number"
          fullWidth
          value={typeof config.pageSize === 'number' ? config.pageSize : ''}
          onChange={(e) =>
            onChange({
              ...config,
              pageSize: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </Stack>
    </Box>
  );
}
