'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddCardIcon from '@mui/icons-material/AddCard';
import BoltIcon from '@mui/icons-material/Bolt';
import { useAppDispatch } from '@/store/hooks';
import { openSettingsDialog } from '@/store/ui-slice';
import { useGetOrganizationCreditsQuery } from '@/store/apis/organization-api';
import { useBillingOrgId, useSelfServeBillingEnabled } from '@/components/billing/use-billing-org';
import { isPlatformApp } from '@shared/lib/config/tenant';

/**
 * AI credit balance and a top-up button, in the app header.
 *
 * The balance belongs here rather than only inside Settings because it is the
 * one number that decides whether the next generation will run. Burying it two
 * clicks deep meant the first sign of an empty balance was a generation
 * failing.
 *
 * Both controls open Settings → Topup rather than a top-up dialog of their
 * own. The pack picker, the plan/purchased/bonus breakdown and the "payments
 * are not configured" explanation all already live there, and a second copy
 * in the header would be a second thing to keep in step with the credit packs.
 *
 * Renders nothing when there is no balance to show — no organization resolved,
 * or a session that cannot read control-plane credits. An empty chip would
 * read as "zero credits", which is a different and much more alarming claim
 * than "not applicable here".
 */
export function HeaderCredits() {
  const dispatch = useAppDispatch();
  const orgId = useBillingOrgId();
  const onPlatform = isPlatformApp();
  const selfServeBilling = useSelfServeBillingEnabled();
  const { data } = useGetOrganizationCreditsQuery(orgId ?? '', { skip: !orgId });
  const balance = data?.data?.balance ?? null;

  if (!orgId || !balance) return null;

  const open = () => dispatch(openSettingsDialog({ section: 'topup' }));

  const canTopUp = onPlatform || selfServeBilling;

  // Debt outranks the expiry warning: an org in arrears is blocked right now,
  // which matters more than credits that lapse later. Same precedence as the
  // organization bar so the two never disagree about the state of one org.
  const inDebt = balance.debt > 0;
  const expiring = !inDebt && balance.expiringSoon > 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 0.5 }}>
      <Tooltip
        title={
          inDebt
            ? `Blocked — owes ${balance.debt} credit(s). Add ${balance.debt}+ to settle.`
            : expiring
              ? `${balance.expiringSoon} credits expiring within 7 days`
              : balance.shared !== undefined
                ? `${balance.available} spendable (${balance.shared} shared + ${balance.personal ?? 0} yours)`
                : canTopUp
                  ? 'AI credits — open billing'
                  : 'AI credits — view usage'
        }
      >
        <Chip
          icon={<BoltIcon sx={{ fontSize: 16 }} />}
          label={inDebt ? `${balance.debt} owed` : `${balance.available}`}
          size="small"
          onClick={open}
          color={inDebt ? 'error' : expiring ? 'warning' : 'default'}
          variant={inDebt || expiring ? 'filled' : 'outlined'}
          sx={{ fontVariantNumeric: 'tabular-nums', cursor: 'pointer' }}
        />
      </Tooltip>
      <Tooltip title={canTopUp ? 'Add AI credits' : 'Request more AI credits'}>
        <IconButton
          aria-label={canTopUp ? 'Add AI credits' : 'Request more AI credits'}
          onClick={open}
          sx={{ color: 'text.secondary' }}
        >
          <AddCardIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
