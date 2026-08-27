'use client';

import {
  useCreateMySetupIntentMutation,
  useListMyPaymentMethodsQuery,
  useRemoveMyPaymentMethodMutation,
  useSetMyDefaultPaymentMethodMutation,
  organizationApi,
} from '@/store/apis/organization-api';
import { useAppDispatch } from '@/store/hooks';
import { PaymentMethodsPanel } from '@/components/billing/payment-methods-panel';

/**
 * Settings → Personal → Payment Method (user Stripe customer).
 *
 * Used for AI credit top-ups. Org plan / cloud cards stay under Billing →
 * Payment Methods.
 */
export function PersonalPaymentMethodsPanel({ orgId }: { orgId: string }) {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useListMyPaymentMethodsQuery(orgId, { skip: !orgId });
  const [createSetup, { isLoading: isStarting }] = useCreateMySetupIntentMutation();
  const [setDefault] = useSetMyDefaultPaymentMethodMutation();
  const [remove] = useRemoveMyPaymentMethodMutation();

  const methods = data?.data?.methods ?? [];
  const paymentsConfigured = data?.data?.readiness?.hasSecretKey ?? false;

  return (
    <PaymentMethodsPanel
      title="Payment Method"
      description="Used for AI credit top-ups."
      emptyHint="Add a card so AI credit top-ups can use a saved payment method."
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
        dispatch(organizationApi.util.invalidateTags(['MyPaymentMethods']));
      }}
    />
  );
}
