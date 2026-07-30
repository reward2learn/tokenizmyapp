'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Button from '@mui/material/Button';
import { useGetBrandConfigQuery } from '@shared/store/apis/brand-config-api';
import { useGetTenantQuery, useUploadTenantFaviconMutation, useRemoveTenantFaviconMutation } from '@/store/apis/tenant-api';
import { getClientTenantConfig } from '@shared/lib/config/tenant';
import { getTemplate } from '@/domain/tenant/template-catalog';

export function TenantInfoTab() {
  const tenant = getClientTenantConfig();
  const template = getTemplate(tenant.slug === 'tokenizmyapp' ? 'default' : tenant.slug);
  const { data: brandData } = useGetBrandConfigQuery();

  const brand = brandData?.data;
  const effectiveTemplate = template?.label ?? brand?.tenantTemplate ?? 'default';

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Tenant Information
        </Typography>

        <Stack spacing={1.5} sx={{ maxWidth: 500 }}>
          <InfoRow label="Slug" value={tenant.slug} />
          <InfoRow label="Display Name" value={brand?.tenantDisplayName ?? tenant.displayName} />
          <InfoRow
            label="Template"
            value={effectiveTemplate}
            chip={effectiveTemplate !== 'default' ? effectiveTemplate : undefined}
          />
          <InfoRow label="App URL" value={`https://${tenant.slug}.vercel.app`} link={`https://${tenant.slug}.vercel.app`} />

          {/* Favicon */}
          <FaviconSection slug={tenant.slug} />

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
    </Paper>
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
