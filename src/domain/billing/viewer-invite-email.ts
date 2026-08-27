/**
 * Invite email copy for App users → invite-by-email.
 *
 * Product voice lives here so ops can change wording without touching
 * provisioning (user row, PIN secret, viewer group). Invites grant **app**
 * access only — not an organization billing seat.
 */
export type ViewerInviteEmailInput = {
  toEmail: string;
  inviteeName: string;
  organizationName: string;
  tenantDisplayName: string;
  pin: string;
  appBaseUrl: string | null;
};

export type ViewerInviteEmail = {
  subject: string;
  text: string;
};

/**
 * Email body for a new PIN viewer on a tenant app.
 * Always include `input.pin`. App access only — not billing-seat membership.
 */
export function buildViewerInviteEmail(input: ViewerInviteEmailInput): ViewerInviteEmail {
  const appLine = input.appBaseUrl
    ? `Sign in at: ${input.appBaseUrl}`
    : `Open the ${input.tenantDisplayName} app and choose PIN sign-in.`;

  return {
    subject: `You're invited to ${input.tenantDisplayName}`,
    text: [
      `Hi ${input.inviteeName},`,
      '',
      `You've been invited to use ${input.tenantDisplayName} as a viewer (read-only).`,
      '',
      appLine,
      `Your one-time PIN: ${input.pin}`,
      '',
      'On the sign-in screen, select your name and enter this PIN.',
      '',
      `This invitation is for app access only. Billing seats for ${input.organizationName} are managed separately.`,
      '',
      '— TokenizMyApp',
    ].join('\n'),
  };
}
