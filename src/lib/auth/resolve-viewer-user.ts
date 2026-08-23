import { createRawClient } from '@/lib/db';

/**
 * Resolve the signed-in person's `user_accounts.id` from their session `sub`.
 *
 * Credit grants scoped to a purchaser use this id. Looked up on the tenant /
 * factory data-plane DB (createRawClient), not the billing control-plane client.
 */
export async function resolveViewerUserId(sub: string | undefined): Promise<string | null> {
  if (!sub) return null;
  try {
    const account = await createRawClient().userAccount.findFirst({
      where: { sub },
      select: { id: true },
    });
    return account?.id ?? null;
  } catch {
    return null;
  }
}
