'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { ChatSettingsForm } from '@/components/config/chat-settings-form';
import { OpenAiKeyForm } from '@/components/config/openai-key-form';
import { AiProviderForm } from '@/components/config/ai-provider-form';
import { getClientTenantConfig } from '@shared/lib/config/tenant';
import { getTemplate } from '@/domain/tenant/template-catalog';

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

function TemplateConfigPlaceholder({ template }: { template: { label: string; description: string; defaultPages: { title: string; slug: string }[] } }) {
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
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
          {template.defaultPages.map((p) => (
            <Chip key={p.slug} label={p.title} size="small" variant="outlined" />
          ))}
        </Stack>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 2 }}>
          Template-specific configuration will be available after implementing the stub blocks.
        </Typography>
      </Stack>
    </Paper>
  );
}

function ConfigPageInner() {
  const searchParams = useSearchParams();
  const tenant = getClientTenantConfig();
  const template = getTemplate(tenant.slug === 'tokenizmyapp' ? 'default' : tenant.slug);
  const initialTab = searchParams.get('tab');
  const [tab, setTab] = useState(initialTab ? Math.min(Math.max(parseInt(initialTab, 10) || 0, 0), 3) : 0);

  // Template-specific sections appear after the four base sections.
  const templateTabLabel =
    template.id === 'nightclub-bar' ? 'Nightclub Config'
    : template.id === 'restaurant' ? 'Restaurant Config'
    : template.id === 'hotel' ? 'Hotel Config'
    : null;
  const configTabs = templateTabLabel
    ? ['AI Chat', 'Source', 'Data View', 'AI Content Generation', templateTabLabel]
    : ['AI Chat', 'Source', 'Data View', 'AI Content Generation'];

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t) {
      setTab(Math.min(Math.max(parseInt(t, 10) || 0, 0), 3));
    }
  }, [searchParams]);

  return (
    <AuthGate requiredTier="pin" fallback={<SignInPanelGate requiredTier="pin" />}>
      <Box sx={{  mx: 'auto', px: 3, py: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Config
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
            Template: <Chip label={template.label} size="small" variant="outlined" color="info" />
          </Typography>
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel id="config-section-select-label">Section</InputLabel>
            <Select
              labelId="config-section-select-label"
              label="Section"
              value={Math.min(tab, configTabs.length - 1)}
              onChange={(e) => setTab(Number(e.target.value))}
            >
              {configTabs.map((label, i) => (
                <MenuItem key={label} value={i}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {tab === 0 ? (
            <Stack spacing={3}>
              <AiProviderForm />
              <OpenAiKeyForm />
              <ChatSettingsForm />
            </Stack>
          ) : null}

          {tab === 1 ? <SourceUploadForm /> : null}

          {tab === 2 ? <DataViewTab /> : null}

          {tab === 3 ? <AiContentTab /> : null}
          {tab === 4 && template.id === 'nightclub-bar' ? <TemplateConfigPlaceholder template={template} /> : null}
          {tab === 4 && template.id === 'restaurant' ? <TemplateConfigPlaceholder template={template} /> : null}
          {tab === 4 && template.id === 'hotel' ? <TemplateConfigPlaceholder template={template} /> : null}
        </Stack>
      </Box>
    </AuthGate>
  );
}

export default function ConfigPage() {
  return (
    <Suspense fallback={null}>
      <ConfigPageInner />
    </Suspense>
  );
}
