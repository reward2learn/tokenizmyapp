'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import Button from '@mui/material/Button';
import { useGetAdminBrandConfigQuery, useGetSeedOverviewQuery } from '@/store/apis/admin-api';
import { useGetTenantQuery, useUploadTenantFaviconMutation, useRemoveTenantFaviconMutation } from '@/store/apis/tenant-api';
import { getClientTenantConfig } from '@shared/lib/config/tenant';
import { getTemplate } from '@/domain/tenant/template-catalog';

interface TenantInfoTabProps {
  /** When provided, displays info for this tenant slug instead of the current client config */
  tenantSlug?: string;
  /** Suite-mode app id selected from the tenant's Apps list (informational only — tenant info is not per-app). */
  appId?: string | null;
}

/** Resolve tenant info — from prop or from current client config */
function resolveTenant(slug: string | undefined): { slug: string; displayName: string } {
  if (slug) return { slug, displayName: slug };
  // Fall back to current app context
  return getClientTenantConfig();
}

export function TenantInfoTab({ tenantSlug, appId }: TenantInfoTabProps = {}) {
  const tenant = resolveTenant(tenantSlug);
  // Scoped to the selected tenant/app — an unscoped query would silently return
  // whichever tenant the admin console itself is currently running under.
  const { data: brandData } = useGetAdminBrandConfigQuery(
    tenantSlug ? { tenantSlug, appId: appId ?? undefined } : undefined,
  );

  const brand = brandData?.data as
    | { tenantDisplayName?: string; tenantTemplate?: string; brandPrimaryColor?: string; brandSecondaryColor?: string }
    | undefined;
  const templateId = brand?.tenantTemplate || 'default';
  const template = getTemplate(templateId);
  const effectiveTemplate = template.label;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Tenant Information
        </Typography>

        <Stack spacing={1.5} sx={{ maxWidth: 500 }}>
          <InfoRow label="Slug" value={tenant.slug} />
          {appId ? <InfoRow label="App" value={appId} chip={appId} /> : null}
          <InfoRow label="Display Name" value={brand?.tenantDisplayName ?? tenant.displayName} />
          <InfoRow
            label="Template"
            value={effectiveTemplate}
            chip={templateId !== 'default' ? effectiveTemplate : undefined}
          />
          <InfoRow label="App URL" value={`https://${tenant.slug}.vercel.app`} link={`https://${tenant.slug}.vercel.app`} />

          {/* Favicon lives on the factory tenants table — skip on suite/tenant deploys
              whose slug is a Vercel project id (e.g. my-finance-review-pro-fin), not a tenants row. */}
          {getClientTenantConfig().slug === 'tokenizmyapp' ? (
            <FaviconSection slug={tenant.slug} />
          ) : null}

          {brand?.brandPrimaryColor ? (
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, fontWeight: 600 }}>
                Brand Colors
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: brand.brandPrimaryColor, border: '1px solid rgba(255,255,255,0.2)' }} />
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{brand.brandPrimaryColor}</Typography>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: brand.brandSecondaryColor, border: '1px solid rgba(255,255,255,0.2)' }} />
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{brand.brandSecondaryColor}</Typography>
              </Box>
            </Stack>
          ) : null}

          {template && template.defaultPages.length > 0 ? (
            <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, fontWeight: 600, pt: 0.5 }}>
                Pages
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                {template.defaultPages.map((p) => (
                  <Chip key={p.slug} label={p.title} size="small" variant="outlined" />
                ))}
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      </Stack>

      <SeededDataOverview tenantSlug={tenant.slug} />
    </Paper>
  );
}

const SEED_TABLE_LABELS: Record<string, string> = {
  app_pages: 'App Pages',
  page_sections: 'Page Sections',
  business_review_parts: 'Business Review Parts',
  knowledge_snippets: 'Knowledge Snippets',
  tasks: 'Tasks',
  task_assignments: 'Task Assignments',
  roles: 'Roles',
  monthly_targets: 'Monthly Targets',
  levers: 'Levers',
  action_items: 'Action Items',
  financial_projections: 'Financial Projections',
  daily_z_reports: 'Z-Reports',
  navigation_items: 'Navigation Items',
  daily_metrics: 'Daily Metrics',
  monthly_actual_departments: 'Monthly Actuals (Departments)',
  monthly_actual_inputs: 'Monthly Actuals (Inputs)',
};

/** Row-count overview of every seed table, for this tenant's own dedicated database. */
function SeededDataOverview({ tenantSlug }: { tenantSlug: string }) {
  const { data, isFetching, isError, refetch } = useGetSeedOverviewQuery({ tenantSlug });
  const counts = data?.data?.counts ?? {};
  const total = data?.data?.total ?? 0;
  const rows = Object.entries(counts).filter(([, n]) => n >= 0);

  return (
    <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Seeded Data Overview {total > 0 ? `— ${total} rows total` : ''}
        </Typography>
        <IconButton size="small" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh seed data counts">
          {isFetching ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
        </IconButton>
      </Stack>
      {isError ? (
        <Typography variant="caption" color="error">Failed to load seeded data counts.</Typography>
      ) : rows.length === 0 && !isFetching ? (
        <Typography variant="caption" color="text.secondary">No seed tables found in this tenant&apos;s database.</Typography>
      ) : (
        <Table size="small" sx={{ maxWidth: 500 }}>
          <TableBody>
            {rows.map(([table, count]) => (
              <TableRow key={table}>
                <TableCell sx={{ border: 0, py: 0.5, pl: 0 }}>
                  <Typography variant="caption" color="text.secondary">{SEED_TABLE_LABELS[table] ?? table}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ border: 0, py: 0.5, pr: 0 }}>
                  <Chip label={count} size="small" variant="outlined" color={count > 0 ? 'default' : undefined} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

function FaviconSection({ slug }: { slug: string }) {
  const { data: tenantData } = useGetTenantQuery(slug);
  const [uploadFavicon, { isLoading: uploading }] = useUploadTenantFaviconMutation();
  const [removeFavicon] = useRemoveTenantFaviconMutation();

  const tenant = tenantData?.data?.tenant;
  const faviconData = tenant?.faviconData ?? null;
  const faviconMimeType = tenant?.faviconMimeType ?? 'image/x-icon';

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, fontWeight: 600 }}>
        Favicon
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          component="img"
          src={faviconData ? `data:${faviconMimeType};base64,${faviconData}` : '/favicon.ico'}
          alt="Favicon"
          sx={{
            width: 28, height: 28,
            border: '1px solid', borderColor: 'divider',
            borderRadius: 0.5,
            objectFit: 'contain',
            bgcolor: 'black',
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <Button
          variant="outlined"
          size="small"
          component="label"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : faviconData ? 'Replace' : 'Upload'}
          <input
            type="file"
            hidden
            accept=".ico,.png"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 65536) return;
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                const mimeType = file.type || (file.name.endsWith('.ico') ? 'image/x-icon' : 'image/png');
                uploadFavicon({ slug, data: base64, mimeType });
              };
              reader.readAsDataURL(file);
            }}
          />
        </Button>
        {faviconData ? (
          <Button size="small" color="error" variant="text" onClick={() => removeFavicon(slug)}>
            Remove
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}

function InfoRow({ label, value, chip, link }: { label: string; value: string; chip?: string; link?: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, fontWeight: 600 }}>
        {label}
      </Typography>
      {link ? (
        <Button
          size="small"
          variant="text"
          href={link}
          target="_blank"
          endIcon={<OpenInNewIcon fontSize="small" />}
          sx={{ fontSize: '0.8rem', textTransform: 'none' }}
        >
          {value}
        </Button>
      ) : chip ? (
        <Chip label={chip} size="small" variant="outlined" color="info" />
      ) : (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
      )}
    </Stack>
  );
}
