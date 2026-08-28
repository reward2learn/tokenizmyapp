'use client';

import Stack from '@mui/material/Stack';
import {
  useCreateSetupIntentMutation,
  useListPaymentMethodsQuery,
  useRemovePaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
  organizationApi,
} from '@/store/apis/organization-api';
import { useAppDispatch } from '@/store/hooks';
import { PaymentMethodsPanel } from '@/components/billing/payment-methods-panel';
import { CryptoWalletPanel } from '@/components/billing/crypto-wallet-panel';

/**
 * Settings → Billing → Payment Methods (org customer).
 *
 * Used for subscription renewals and cloud auto-reload. Personal AI credit
 * top-ups use Settings → Personal → Payment Method instead.
 */
export function PaymentMethodsTab({ orgId }: { orgId: string }) {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useListPaymentMethodsQuery(orgId, { skip: !orgId });
  const [createSetup, { isLoading: isStarting }] = useCreateSetupIntentMutation();
  const [setDefault] = useSetDefaultPaymentMethodMutation();
  const [remove] = useRemovePaymentMethodMutation();

  const methods = data?.data?.methods ?? [];
  const paymentsConfigured = data?.data?.readiness?.hasSecretKey ?? false;

  return (
    <Stack spacing={3}>
      <CryptoWalletPanel
        title="Crypto wallet (USDC)"
        description="Connect with Google for decentralized plan renewals and prepaid packs. Card payments use Stripe below."
      />
      <PaymentMethodsPanel
      title="Payment Methods"
      description="Used for subscription renewals."
      emptyHint="Add one so subscriptions can renew without interrupting you."
      methods={methods}
      paymentsConfigured={paymentsConfigured}
      isLoading={isLoading}
      isStarting={isStarting}
      onStartSetup={async () => {
        const result = await createSetup(orgId).unwrap();
        const key = result.data?.publishableKey;
        const secret = result.data?.clientSecret;
        if (!key || !secret) return null;
        return { clientSecret: secret, publishableKey: key };
      }}
      onSetDefault={async (paymentMethodId) => {
        await setDefault({ orgId, paymentMethodId }).unwrap();
      }}
      onRemove={async (paymentMethodId) => {
        await remove({ orgId, paymentMethodId }).unwrap();
      }}
      onInvalidate={() => {
        dispatch(organizationApi.util.invalidateTags(['PaymentMethods']));
      }}
    />
    </Stack>
  );
}
