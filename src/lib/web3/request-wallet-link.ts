/**
 * Trigger SIWE to link the connected AppKit wallet to the factory JWT session.
 *
 * Used after social connect (Google/Apple) and as a manual retry from settings.
 */
import { waitForSiweAppReady } from '@/lib/web3/siwe-config';

export async function requestWalletLink(): Promise<void> {
  const { getAppKit } = await import('@/lib/web3/appkit-client');
  const pending = getAppKit();
  if (!pending) {
    throw new Error('Social wallet is not configured for this deployment.');
  }
  await pending;
  await waitForSiweAppReady();
  const { SIWXUtil } = await import('@reown/appkit-controllers');
  await SIWXUtil.requestSignMessage();
}
