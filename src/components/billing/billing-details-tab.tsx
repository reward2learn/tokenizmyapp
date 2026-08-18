'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  type Organization,
} from '@/store/apis/organization-api';
import { RADIUS } from '@/theme/design-tokens';

/**
 * Settings → Billing → Billing Details.
 *
 * What an invoice needs beyond the amount. Every field is optional and nothing
 * here gates a purchase: demanding an address before the first transaction is
 * the friction the funnel exists to avoid.
 *
 * ⚠️ The tax id is printed on invoices and nothing more. Stripe Tax is not
 * enabled, so entering a VAT/GST number does not change what is charged and
 * does not apply a reverse charge. Turning that on is a Stripe dashboard
 * decision plus a change to how line items are created — deliberately not
 * inferred from the presence of a number in this box, because silently
 * altering what a customer is billed based on an unvalidated field is the
 * worst possible way to make that change.
 */

type Field = keyof Pick<
  Organization,
  | 'billingEmail'
  | 'billingName'
  | 'billingCountry'
  | 'billingLine1'
  | 'billingLine2'
  | 'billingCity'
  | 'billingPostal'
  | 'taxId'
>;

const ADDRESS_FIELDS: { field: Field; label: string; width: number }[] = [
  { field: 'billingName', label: 'Organization name', width: 12 },
  { field: 'billingLine1', label: 'Address line 1', width: 12 },
  { field: 'billingLine2', label: 'Address line 2', width: 12 },
  { field: 'billingCity', label: 'City', width: 6 },
  { field: 'billingPostal', label: 'Postal code', width: 6 },
  { field: 'billingCountry', label: 'Country or region', width: 12 },
];

export function BillingDetailsTab({ orgId }: { orgId: string }) {
  const { data, isLoading } = useGetOrganizationQuery(orgId, { skip: !orgId });
  const [update, { isLoading: isSaving }] = useUpdateOrganizationMutation();

  // One draft map rather than a state hook per field. Held as partial so an
  // untouched field stays absent from the PATCH — the endpoint treats absent
  // as "unchanged", which is what lets this form and the General form edit the
  // same row without either clearing the other's fields.
  const [draft, setDraft] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const organization = data?.data?.organization ?? null;
  if (isLoading || !organization) return <Skeleton variant="rounded" height={420} />;

  const value = (field: Field) => draft[field] ?? organization[field] ?? '';
  const dirty = (fields: Field[]) =>
    fields.some((f) => draft[f] !== undefined && draft[f] !== (organization[f] ?? ''));

  const save = async (fields: Field[], what: string) => {
    setError(null);
    setSaved(null);
    const patch: Record<string, string> = {};
    for (const f of fields) if (draft[f] !== undefined) patch[f] = draft[f];
    try {
      await update({ orgId, ...patch }).unwrap();
      setDraft((d) => {
        const next = { ...d };
        for (const f of fields) delete next[f];
        return next;
      });
      setSaved(what);
    } catch {
      setError(`Could not save ${what.toLowerCase()}.`);
    }
  };

  const set = (field: Field) => (e: { target: { value: string } }) =>
    setDraft((d) => ({ ...d, [field]: e.target.value }));

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}
      {saved && <Alert severity="success">{saved} saved.</Alert>}

      <Section
        title="Billing Email"
        onSave={() => save(['billingEmail'], 'Billing email')}
        canSave={dirty(['billingEmail']) && !isSaving}
      >
        <TextField
          fullWidth
          size="small"
          type="email"
          value={value('billingEmail')}
          onChange={set('billingEmail')}
          placeholder={organization.ownerUserId ? 'Defaults to the account owner' : undefined}
          helperText="Where invoices are sent. Falls back to the owner's account email."
          sx={{ maxWidth: 420 }}
        />
      </Section>

      <Section
        title="Billing Address"
        onSave={() => save(ADDRESS_FIELDS.map((f) => f.field), 'Billing address')}
        canSave={dirty(ADDRESS_FIELDS.map((f) => f.field)) && !isSaving}
      >
        <Grid container spacing={2}>
          {ADDRESS_FIELDS.map(({ field, label, width }) => (
            <Grid key={field} size={{ xs: 12, sm: width }}>
              <TextField
                fullWidth
                size="small"
                label={label}
                value={value(field)}
                onChange={set(field)}
              />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section
        title="Tax ID"
        subtitle="Your tax identification number, printed on invoices. It does not change what you are charged — tax is not calculated on these invoices."
        onSave={() => save(['taxId'], 'Tax ID')}
        canSave={dirty(['taxId']) && !isSaving}
      >
        <TextField
          fullWidth
          size="small"
          value={value('taxId')}
          onChange={set('taxId')}
          placeholder="VAT / GST / NPWP"
          sx={{ maxWidth: 420 }}
        />
      </Section>
    </Stack>
  );
}

function Section({
  title,
  subtitle,
  children,
  onSave,
  canSave,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSave: () => void;
  canSave: boolean;
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: `${RADIUS.card}px`, overflow: 'hidden' }}>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" sx={{ mb: subtitle ? 0.5 : 1.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </Box>
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: 'action.hover',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button size="small" variant="contained" onClick={onSave} disabled={!canSave}>
          Save
        </Button>
      </Box>
    </Paper>
  );
}
