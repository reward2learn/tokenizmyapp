/**
 * Maps Stripe webhook health checklist steps into Flight Check rows.
 */
export type StripeWebhookHealthStepResult = {
  label: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
};

export type StripeWebhookHealthPayload = {
  ok?: boolean;
  status?: 'pass' | 'fail' | 'warn';
  message?: string;
  steps?: StripeWebhookHealthStepResult[];
};

type AddFlightCheckResult = (
  label: string,
  status: 'pass' | 'fail' | 'warn',
  detail: string,
  fixAction?: () => Promise<void>,
  fixLabel?: string,
) => void;

export function addStripeWebhookHealthToFlightCheck(
  payload: StripeWebhookHealthPayload | null | undefined,
  addResult: AddFlightCheckResult,
  fixAction?: () => Promise<void>,
  fixLabel = 'Go to step',
): void {
  if (payload?.steps?.length) {
    for (const step of payload.steps) {
      addResult(
        step.label,
        step.status,
        step.message,
        step.status !== 'pass' ? fixAction : undefined,
        step.status !== 'pass' ? fixLabel : undefined,
      );
    }
    return;
  }

  if (payload?.ok) {
    addResult('Stripe Webhook (snapshot)', 'pass', payload.message ?? 'Webhook health check passed');
    return;
  }

  if (payload?.status === 'warn') {
    addResult('Stripe Webhook (snapshot)', 'warn', payload.message ?? 'Webhook health check incomplete', fixAction, fixLabel);
    return;
  }

  addResult(
    'Stripe Webhook (snapshot)',
    'fail',
    payload?.message ?? 'Webhook health check failed',
    fixAction,
    fixLabel,
  );
}
