/**
 * Thin Resend helper shared by billing dunning and teammate invites.
 * Returns false when RESEND_API_KEY is unset so callers can surface a clear error.
 */
export async function sendResendEmail(input: {
  to: string;
  subject: string;
  text: string;
  from?: string;
}): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const from =
    input.from?.trim() ||
    process.env.BILLING_FROM_EMAIL?.trim() ||
    process.env.INVITE_FROM_EMAIL?.trim() ||
    'noreply@tokenizmyapp.com';

  if (!resendKey) {
    console.warn(`[email] RESEND_API_KEY unset — skipping email to ${input.to}`);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend failed: ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] send error', err);
    return false;
  }
}
