'use client';

/**
 * Page Sections CMS — edit Neon page_sections.config for AI-generated / seeded blocks.
 * Mirrors NavigationManager auth + tenant scoping patterns.
 */

import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SaveIcon from '@mui/icons-material/Save';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  useListAdminPagesQuery,
  useGetPageSectionsQuery,
  useUpdatePageSectionsMutation,
  useCreatePageSectionMutation,
  useDeletePageSectionsMutation,
  useSetPageContentLockedMutation,
} from '@/store/apis/admin-api';
import { useSeedAppMutation, useSeedTenantMutation } from '@/store/apis/tenant-api';
import { useAppSelector } from '@/store/hooks';
import { hasPagesWrite } from '@/lib/auth/admin-access';
import { getCurrentAppId, getTenantConfig } from '@/lib/tenant-config';

const MARKETING_BLOCKS = [
  'marketing_hero',
  'faq',
  'product_showcase',
  'capability_marquee',
  'cta_banner',
  'pricing_table',
  'customer_proof',
  'testimonials',
  'hero',
] as const;

const ADDABLE_BLOCKS = [
  ...MARKETING_BLOCKS,
  'doc_markdown',
  'feature_grid',
] as const;

interface PageSectionsManagerProps {
  tenantSlug?: string;
  appId?: string;
  /** Suite tenants seed page/nav content per app — not via tenant-level seed. */
  isSuite?: boolean;
}

interface SectionDraft {
  id: string;
  sortOrder: number;
  blockType: string;
  config: Record<string, unknown>;
  dirty?: boolean;
}

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

export function PageSectionsManager({ tenantSlug, appId, isSuite = false }: PageSectionsManagerProps = {}) {
  const scope = useMemo(() => ({ tenantSlug, appId }), [tenantSlug, appId]);
  const { platformAdmin, permissions } = useAppSelector((s) => s.auth);
  const canWrite = hasPagesWrite(permissions, platformAdmin);
  const { data: pagesData, isLoading: pagesLoading, error: pagesError, refetch: refetchPages } =
    useListAdminPagesQuery(scope);
  const pages = pagesData?.data?.pages ?? [];

  const [slug, setSlug] = useState('');
  const [drafts, setDrafts] = useState<SectionDraft[]>([]);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [addBlockType, setAddBlockType] = useState<string>('faq');

  const {
    data: sectionsData,
    isLoading: sectionsLoading,
    error: sectionsError,
    refetch,
  } = useGetPageSectionsQuery({ slug, ...scope }, { skip: !slug });

  const [updateSections, { isLoading: saving }] = useUpdatePageSectionsMutation();
  const [createSection, { isLoading: creating }] = useCreatePageSectionMutation();
  const [deleteSections, { isLoading: deleting }] = useDeletePageSectionsMutation();
  const [setLocked, { isLoading: unlocking }] = useSetPageContentLockedMutation();
  const [seedTenant, { isLoading: seedingTenant }] = useSeedTenantMutation();
  const [seedApp, { isLoading: seedingApp }] = useSeedAppMutation();
  const seeding = seedingTenant || seedingApp;

  const resolvedSlug = tenantSlug ?? getTenantConfig().slug;
  const resolvedAppId = appId ?? getCurrentAppId() || undefined;
  const seedMode: 'app' | 'tenant' | 'blocked' = isSuite
    ? appId
      ? 'app'
      : 'blocked'
    : tenantSlug
      ? 'tenant'
      : resolvedAppId
        ? 'app'
        : 'tenant';

  const handleSeedFromTemplate = async () => {
    setMessage(null);
    try {
      if (seedMode === 'blocked') {
        setMessage({
          severity: 'info',
          text: 'Select an app in the suite list above, then seed it from its template.',
        });
        return;
      }

      if (seedMode === 'app') {
        const targetAppId = appId ?? resolvedAppId;
        if (!targetAppId) {
          setMessage({ severity: 'error', text: 'No app selected to seed.' });
          return;
        }
        const result = await seedApp({ slug: resolvedSlug, appId: targetAppId }).unwrap();
        const d = result.data;
        if (d?.dbTarget === 'root') {
          setMessage({
            severity: 'error',
            text: `Seeded to ROOT DB (no dedicated DB for this tenant) — ${d.verifiedPages ?? d.pages ?? 0} pages verified.`,
          });
        } else {
          setMessage({
            severity: 'success',
            text: `App seeded from template — ${d?.verifiedPages ?? d?.pages ?? 0} pages, ${d?.verifiedNavItems ?? d?.navItems ?? 0} nav items.`,
          });
        }
      } else {
        const result = await seedTenant(resolvedSlug).unwrap();
        const d = result.data;
        if (d?.dbTarget === 'root') {
          setMessage({
            severity: 'error',
            text: `Seeded to ROOT DB (no dedicated DB configured) — ${d.verifiedPages ?? d.pages ?? 0} pages verified.`,
          });
        } else if (d?.scope === 'tenant-wide') {
          setMessage({
            severity: 'error',
            text: 'Suite tenant: page content is seeded per app. Select an app and use Seed from template.',
          });
        } else {
          setMessage({
            severity: 'success',
            text: `Tenant seeded from template — ${d?.verifiedPages ?? d?.pages ?? 0} pages, ${d?.verifiedNavItems ?? d?.navItems ?? 0} nav items.`,
          });
        }
      }
      await refetchPages();
    } catch (err) {
      setMessage({
        severity: 'error',
        text:
          err && typeof err === 'object' && 'data' in err
            ? String((err as { data?: { error?: string } }).data?.error ?? 'Seed failed')
            : 'Seed failed',
      });
    }
  };

  useEffect(() => {
    if (!slug && pages.length > 0) {
      const preferred = pages.find((p) => p.slug === 'home') ?? pages[0];
      setSlug(preferred.slug);
    }
  }, [pages, slug]);

  useEffect(() => {
    const sections = sectionsData?.data?.sections;
    if (!sections) return;
    setDrafts(
      sections.map((s) => ({
        id: s.id,
        sortOrder: s.sortOrder,
        blockType: s.blockType,
        config: { ...(s.config ?? {}) },
        dirty: false,
      })),
    );
  }, [sectionsData]);

  const contentLocked = sectionsData?.data?.contentLocked ?? false;
  const pageTitle = sectionsData?.data?.title ?? slug;

  const updateDraft = (id: string, patch: Partial<SectionDraft>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch, dirty: true } : d)),
    );
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= drafts.length) return;
    setDrafts((prev) => {
      const copy = [...prev];
      const tmp = copy[index];
      copy[index] = copy[next];
      copy[next] = tmp;
      return copy.map((d, i) => ({ ...d, sortOrder: i, dirty: true }));
    });
  };

  const handleSave = async () => {
    if (!slug) return;
    setMessage(null);
    try {
      await updateSections({
        slug,
        tenantSlug,
        appId,
        sections: drafts.map((d, i) => ({
          id: d.id,
          blockType: d.blockType,
          config: d.config,
          sortOrder: i,
        })),
      }).unwrap();
      setMessage({ severity: 'success', text: 'Sections saved. Page is content-locked against re-seed.' });
      refetch();
    } catch (err) {
      setMessage({
        severity: 'error',
        text: err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { error?: string } }).data?.error ?? 'Save failed')
          : 'Save failed',
      });
    }
  };

  const handleAdd = async () => {
    if (!slug) return;
    setMessage(null);
    try {
      await createSection({
        slug,
        tenantSlug,
        appId,
        blockType: addBlockType,
        config:
          addBlockType === 'faq'
            ? { heading: 'Frequently asked questions', items: [] }
            : addBlockType === 'cta_banner'
              ? { heading: 'Get started', ctaLabel: 'Start', ctaHref: '/admin' }
              : {},
      }).unwrap();
      setMessage({ severity: 'success', text: `Added ${addBlockType} section.` });
      refetch();
    } catch (err) {
      setMessage({
        severity: 'error',
        text: err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { error?: string } }).data?.error ?? 'Create failed')
          : 'Create failed',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!slug || !window.confirm('Delete this section?')) return;
    setMessage(null);
    try {
      await deleteSections({ slug, ids: [id], tenantSlug, appId }).unwrap();
      setMessage({ severity: 'success', text: 'Section deleted.' });
      refetch();
    } catch (err) {
      setMessage({
        severity: 'error',
        text: err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { error?: string } }).data?.error ?? 'Delete failed')
          : 'Delete failed',
      });
    }
  };

  const handleUnlock = async () => {
    if (!slug) return;
    if (
      !window.confirm(
        'Unlock this page? The next tenant seed will replace sections from the template.',
      )
    ) {
      return;
    }
    try {
      await setLocked({ slug, contentLocked: false, tenantSlug, appId }).unwrap();
      setMessage({ severity: 'info', text: 'Page unlocked — re-seed may overwrite sections.' });
      refetch();
    } catch (err) {
      setMessage({
        severity: 'error',
        text: err && typeof err === 'object' && 'data' in err
          ? String((err as { data?: { error?: string } }).data?.error ?? 'Unlock failed')
          : 'Unlock failed',
      });
    }
  };

  if (pagesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (pagesError) {
    return <Alert severity="error">Failed to load pages.</Alert>;
  }

  if (pages.length === 0) {
    const seedBlocked = seedMode === 'blocked';
    return (
      <Stack spacing={2}>
        <Alert severity="info">
          No pages in this app database yet. Seed from the template to create default pages and unlock this CMS.
        </Alert>
        {seedBlocked && (
          <Typography variant="body2" color="text.secondary">
            Select an app in the suite list above, then seed it from its template.
          </Typography>
        )}
        <Box>
          <Button
            variant="contained"
            startIcon={seeding ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
            onClick={() => void handleSeedFromTemplate()}
            disabled={seeding || seedBlocked}
          >
            {seeding ? 'Seeding…' : seedMode === 'app' ? 'Seed app from template' : 'Seed tenant from template'}
          </Button>
        </Box>
        {message && (
          <Alert severity={message.severity} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      {!canWrite && (
        <Alert severity="info">
          You have read-only access to page content. Ask an admin to grant{' '}
          <strong>pages:write</strong> to edit sections.
        </Alert>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="page-cms-slug">Page</InputLabel>
          <Select
            labelId="page-cms-slug"
            label="Page"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          >
            {pages.map((p) => (
              <MenuItem key={p.id} value={p.slug}>
                {p.title} ({p.slug}) · {p.sectionCount} sections
                {p.contentLocked ? ' · locked' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {contentLocked ? (
            <Chip icon={<LockIcon />} label="Content locked" size="small" color="warning" />
          ) : (
            <Chip icon={<LockOpenIcon />} label="Not locked" size="small" variant="outlined" />
          )}
          {contentLocked && canWrite && (
            <Button size="small" onClick={handleUnlock} disabled={unlocking}>
              Unlock for re-seed
            </Button>
          )}
          {canWrite && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving || drafts.length === 0}
            >
              Save sections
            </Button>
          )}
        </Stack>
      </Stack>

      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {sectionsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : sectionsError ? (
        <Alert severity="error">Failed to load sections for {slug}.</Alert>
      ) : (
        <>
          <Typography variant="subtitle2" color="text.secondary">
            Editing “{pageTitle}” — marketing copy lives in each section&apos;s config (Neon JSONB).
          </Typography>

          {drafts.map((section, index) => (
            <Accordion key={section.id} defaultExpanded={section.blockType === 'faq' || section.blockType === 'marketing_hero'}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%', pr: 1 }}>
                  <Typography sx={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}>
                    {section.blockType}
                  </Typography>
                  {section.dirty && <Chip size="small" label="unsaved" color="info" />}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSection(index, -1);
                    }}
                    disabled={!canWrite || index === 0}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSection(index, 1);
                    }}
                    disabled={!canWrite || index === drafts.length - 1}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDelete(section.id);
                    }}
                    disabled={!canWrite || deleting}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <SectionConfigEditor
                  blockType={section.blockType}
                  config={section.config}
                  readOnly={!canWrite}
                  onChange={(config) => updateDraft(section.id, { config })}
                />
              </AccordionDetails>
            </Accordion>
          ))}

          {canWrite && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="add-block-type">Block type</InputLabel>
                  <Select
                    labelId="add-block-type"
                    label="Block type"
                    value={addBlockType}
                    onChange={(e) => setAddBlockType(e.target.value)}
                  >
                    {ADDABLE_BLOCKS.map((bt) => (
                      <MenuItem key={bt} value={bt}>
                        {bt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button startIcon={<AddIcon />} onClick={handleAdd} disabled={creating || !slug}>
                  Add section
                </Button>
              </Stack>
            </Paper>
          )}
        </>
      )}
    </Stack>
  );
}

function SectionConfigEditor({
  blockType,
  config,
  onChange,
  readOnly = false,
}: {
  blockType: string;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  readOnly?: boolean;
}) {
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
        {(blockType === 'cta_banner') && (
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
