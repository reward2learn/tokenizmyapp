'use client';

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
import { useGetCmsSourcesQuery } from '@/store/apis/admin-api';

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
}

export function SectionConfigEditor({
  blockType,
  config,
  onChange,
  readOnly = false,
}: SectionConfigEditorProps) {
  if (
    blockType === 'marketing_hero' ||
    blockType === 'hero' ||
    blockType === 'cta_banner' ||
    blockType === 'pricing_table' ||
    blockType === 'customer_proof' ||
    blockType === 'testimonials' ||
    blockType === 'capability_marquee'
  ) {
    const headlineKey = blockType === 'marketing_hero' || blockType === 'hero' ? 'headline' : 'heading';
    const subKey =
      blockType === 'marketing_hero'
        ? 'subheadline'
        : blockType === 'hero'
          ? 'subtitle'
          : 'subheading';

    return (
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <TextField
            label={headlineKey}
            size="small"
            fullWidth
            value={str(config, headlineKey)}
            onChange={(e) => onChange(setStr(config, headlineKey, e.target.value))}
          />
          <TextField
            label={subKey}
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={str(config, subKey)}
            onChange={(e) => onChange(setStr(config, subKey, e.target.value))}
          />
          {blockType === 'marketing_hero' && (
            <>
              <TextField
                label="audiences (comma-separated)"
                size="small"
                fullWidth
                value={Array.isArray(config.audiences) ? (config.audiences as string[]).join(', ') : ''}
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
              <TextField
                label="quickStarts (comma-separated)"
                size="small"
                fullWidth
                value={Array.isArray(config.quickStarts) ? (config.quickStarts as string[]).join(', ') : ''}
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
              <TextField
                label="placeholder"
                size="small"
                fullWidth
                value={str(config, 'placeholder')}
                onChange={(e) => onChange(setStr(config, 'placeholder', e.target.value))}
              />
              <TextField
                label="ctaLabel"
                size="small"
                fullWidth
                value={str(config, 'ctaLabel')}
                onChange={(e) => onChange(setStr(config, 'ctaLabel', e.target.value))}
              />
              <TextField
                label="ctaHref"
                size="small"
                fullWidth
                value={str(config, 'ctaHref')}
                onChange={(e) => onChange(setStr(config, 'ctaHref', e.target.value))}
              />
            </>
          )}
          {blockType === 'cta_banner' && (
            <>
              <TextField
                label="ctaLabel"
                size="small"
                fullWidth
                value={str(config, 'ctaLabel')}
                onChange={(e) => onChange(setStr(config, 'ctaLabel', e.target.value))}
              />
              <TextField
                label="ctaHref"
                size="small"
                fullWidth
                value={str(config, 'ctaHref')}
                onChange={(e) => onChange(setStr(config, 'ctaHref', e.target.value))}
              />
            </>
          )}
          {blockType === 'capability_marquee' && (
            <TextField
              label="rows (JSON array of string arrays)"
              size="small"
              fullWidth
              multiline
              minRows={4}
              value={JSON.stringify(config.rows ?? [], null, 2)}
              onChange={(e) => {
                try {
                  onChange({ ...config, rows: JSON.parse(e.target.value) as unknown });
                } catch {
                  /* keep typing invalid JSON */
                }
              }}
            />
          )}
        </Stack>
      </Box>
    );
  }

  if (blockType === 'faq') {
    return (
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <TextField
            label="heading"
            size="small"
            fullWidth
            value={str(config, 'heading')}
            onChange={(e) => onChange(setStr(config, 'heading', e.target.value))}
          />
          <TextField
            label="FAQ items (blocks of Q: / A:)"
            size="small"
            fullWidth
            multiline
            minRows={8}
            value={faqItemsToText(config)}
            onChange={(e) => onChange({ ...config, items: textToFaqItems(e.target.value) })}
            helperText="Separate Q&A pairs with a blank line. Start lines with Q: and A:."
          />
        </Stack>
      </Box>
    );
  }

  if (blockType === 'product_showcase') {
    return (
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <TextField
            label="heading"
            size="small"
            fullWidth
            value={str(config, 'heading')}
            onChange={(e) => onChange(setStr(config, 'heading', e.target.value))}
          />
          <TextField
            label="items (title then body, blank line between)"
            size="small"
            fullWidth
            multiline
            minRows={8}
            value={showcaseItemsToText(config)}
            onChange={(e) => onChange({ ...config, items: textToShowcaseItems(e.target.value) })}
          />
        </Stack>
      </Box>
    );
  }

  if (blockType === 'doc_markdown') {
    return (
      <DocMarkdownConfigEditor config={config} onChange={onChange} readOnly={readOnly} />
    );
  }

  if (blockType === 'sheet_viewer') {
    return (
      <SheetViewerConfigEditor config={config} onChange={onChange} readOnly={readOnly} />
    );
  }

  if (blockType === 'pack_table') {
    return (
      <PackTableConfigEditor config={config} onChange={onChange} readOnly={readOnly} />
    );
  }

  if (blockType === 'chat_panel') {
    return (
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <TextField
            label="emptyStatePrompt"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={str(config, 'emptyStatePrompt')}
            onChange={(e) => onChange(setStr(config, 'emptyStatePrompt', e.target.value))}
          />
          <TextField
            label="suggestedPrompts (one per line)"
            size="small"
            fullWidth
            multiline
            minRows={4}
            value={
              Array.isArray(config.suggestedPrompts)
                ? (config.suggestedPrompts as string[]).join('\n')
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
        </Stack>
      </Box>
    );
  }

  if (blockType === 'chart_financial') {
    return (
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <FormControl size="small" fullWidth>
            <InputLabel id="chart-scenario">scenario</InputLabel>
            <Select
              labelId="chart-scenario"
              label="scenario"
              value={str(config, 'scenario') || 'conservative'}
              onChange={(e) => onChange(setStr(config, 'scenario', e.target.value))}
            >
              {['conservative', 'realistic', 'aspirational', 'actual'].map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel id="chart-variant">variant</InputLabel>
            <Select
              labelId="chart-variant"
              label="variant"
              value={str(config, 'variant') || 'dashboard'}
              onChange={(e) => onChange(setStr(config, 'variant', e.target.value))}
            >
              <MenuItem value="dashboard">dashboard</MenuItem>
              <MenuItem value="ops">ops</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="height (px)"
            size="small"
            type="number"
            fullWidth
            value={typeof config.height === 'number' ? config.height : ''}
            onChange={(e) =>
              onChange({
                ...config,
                height: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </Stack>
      </Box>
    );
  }

  if (blockType === 'kpi_cards' || blockType === 'pnl_table') {
    return (
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <Stack spacing={1.5}>
          <TextField
            label="period"
            size="small"
            fullWidth
            value={str(config, 'period')}
            onChange={(e) => onChange(setStr(config, 'period', e.target.value))}
            placeholder="e.g. 2025-01"
          />
          {blockType === 'kpi_cards' && (
            <FormControl size="small" fullWidth>
              <InputLabel id="kpi-variant">variant</InputLabel>
              <Select
                labelId="kpi-variant"
                label="variant"
                value={str(config, 'variant') || 'dashboard'}
                onChange={(e) => onChange(setStr(config, 'variant', e.target.value))}
              >
                <MenuItem value="dashboard">dashboard</MenuItem>
                <MenuItem value="ops">ops</MenuItem>
              </Select>
            </FormControl>
          )}
        </Stack>
      </Box>
    );
  }

  if (blockType === 'metric_grid') {
    return (
      <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
        <TextField
          label="scenarios (JSON)"
          size="small"
          fullWidth
          multiline
          minRows={6}
          value={JSON.stringify(config.scenarios ?? [], null, 2)}
          onChange={(e) => {
            try {
              onChange({ ...config, scenarios: JSON.parse(e.target.value) as unknown });
            } catch {
              /* keep typing */
            }
          }}
          helperText='Array of { "key", "label", "target"? } objects'
        />
      </Box>
    );
  }

  return (
    <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
      <TextField
        label="config (JSON)"
        size="small"
        fullWidth
        multiline
        minRows={6}
        value={JSON.stringify(config, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value) as Record<string, unknown>);
          } catch {
            /* ignore while typing */
          }
        }}
      />
    </Box>
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
        <TextField
          label="source"
          size="small"
          fullWidth
          value={current}
          onChange={(e) => onChange(setStr(config, 'source', e.target.value))}
          helperText="Snippet key or alias (e.g. executive-summary)"
        />
        <TextField
          label="title"
          size="small"
          fullWidth
          value={str(config, 'title')}
          onChange={(e) => onChange(setStr(config, 'title', e.target.value))}
        />
        <TextField
          label="markdown (inline override)"
          size="small"
          fullWidth
          multiline
          minRows={6}
          value={str(config, 'markdown')}
          onChange={(e) => onChange(setStr(config, 'markdown', e.target.value))}
          helperText="Optional — overrides fetched snippet content"
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
        <TextField
          label="sheet"
          size="small"
          fullWidth
          value={current}
          onChange={(e) => onChange(setStr(config, 'sheet', e.target.value))}
          helperText="Excel tab name from uploaded workbook"
        />
        <TextField
          label="title"
          size="small"
          fullWidth
          value={str(config, 'title')}
          onChange={(e) => onChange(setStr(config, 'title', e.target.value))}
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
        <TextField
          label="table"
          size="small"
          fullWidth
          required
          value={current}
          onChange={(e) => onChange(setStr(config, 'table', e.target.value))}
          helperText="Pack table name (app-pack model tableName)"
        />
        <TextField
          label="title"
          size="small"
          fullWidth
          value={str(config, 'title')}
          onChange={(e) => onChange(setStr(config, 'title', e.target.value))}
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
